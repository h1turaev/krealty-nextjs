import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { Box, Typography, Menu, MenuItem, Badge, Avatar, IconButton, Button } from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useRouter } from 'next/router';
import { userVar } from '../../apollo/store';
import { GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATIONS_COUNT } from '../../apollo/user/query';
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ, DELETE_NOTIFICATION } from '../../apollo/user/mutation';
import { Notification } from '../types/notification/notification';
import { NotificationStatus, NotificationType } from '../types/notification/notification';
import { NotificationInquiry } from '../types/notification/notification.input';
import { REACT_APP_API_URL } from '../config';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { useDarkMode } from '../hooks/useDarkMode';

// Simple date formatter without external dependency
const formatNotificationTime = (date: Date | string) => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    const weeks = Math.floor(diffDays / 7);
    if (weeks < 4) return `${weeks}w ago`;

    const months = Math.floor(diffDays / 30);
    return `${months}mo ago`;
  } catch {
    return 'Just now';
  }
};

const NotificationComponent = () => {
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const { isDarkMode } = useDarkMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [notificationInquiry, setNotificationInquiry] = useState<NotificationInquiry>({
    page: 1,
    limit: 10,
    search: {
      // Backend automatically filters by receiverId from authenticated user
      // We can filter by status, type, or group if needed
    },
  });

  const open = Boolean(anchorEl);

  /** APOLLO REQUESTS **/
  const {
    loading: getNotificationsLoading,
    data: getNotificationsData,
    error: getNotificationsError,
    refetch: getNotificationsRefetch,
  } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: 'network-only',
    variables: { input: notificationInquiry },
    skip: !user?._id,
    onCompleted: (data: any) => {
      if (data?.getNotifications) {
        setNotifications(data.getNotifications.list || []);
        setTotal(data.getNotifications.metaCounter?.[0]?.total || 0);
        // Count unread (WAIT) notifications from the list itself
        const unreadNotifications = (data.getNotifications.list || []).filter(
          (n: Notification) => n.notificationStatus === NotificationStatus.WAIT
        );
        setUnreadCount(unreadNotifications.length);
      }
    },
  });

  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
  } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT, {
    fetchPolicy: 'network-only',
    skip: !user?._id,
    pollInterval: 30000, // Poll every 30 seconds for new notifications
    onCompleted: (data: any) => {
      // Support both scalar Int and object { count } formats
      const count = data?.getUnreadNotificationsCount?.count ?? data?.getUnreadNotificationsCount;
      if (count !== undefined && count !== null) {
        setUnreadCount(count);
      }
    },
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

  /** HANDLERS **/
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (user?._id) {
      getNotificationsRefetch();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    try {
      // Mark as read if unread (WAIT)
      if (notification.notificationStatus === NotificationStatus.WAIT) {
        await markAsRead({
          variables: { notificationId: notification._id },
        });
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id
              ? { ...n, notificationStatus: NotificationStatus.READ }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        refetchUnreadCount();
      }

      // Navigate to property if applicable
      if (notification.propertyId) {
        router.push({
          pathname: '/property/detail',
          query: { id: notification.propertyId },
        });
      } else if (notification.authorId) {
        router.push({
          pathname: '/agent/detail',
          query: { memberId: notification.authorId },
        });
      }

      handleClose();
    } catch (err: any) {
      console.error('Error handling notification click:', err);
    }
  }, [markAsRead, router, refetchUnreadCount]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, notificationStatus: NotificationStatus.READ }))
      );
      setUnreadCount(0);
      refetchUnreadCount();
      getNotificationsRefetch(); // Refresh notifications list
    } catch (err: any) {
      console.error('Error marking all as read:', err);
    }
  }, [markAllAsRead, refetchUnreadCount, getNotificationsRefetch]);

  const handleDeleteNotification = useCallback(async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification({
        variables: { notificationId: notificationId },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setTotal((prev) => Math.max(0, prev - 1));
      // Check if deleted notification was unread
      const deletedNotification = notifications.find((n) => n._id === notificationId);
      if (deletedNotification?.notificationStatus === NotificationStatus.WAIT) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      refetchUnreadCount();
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  }, [deleteNotification, notifications, refetchUnreadCount]);


  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.PROPERTY:
        return '🏠';
      case NotificationType.LIKE:
        return '❤️';
      case NotificationType.COMMENT:
        return '💬';
      default:
        return '🔔';
    }
  };

  if (!user?._id) {
    return null;
  }

  return (
    <Box component="div" className="notification-container">
      <IconButton
        onClick={handleClick}
        className="notification-icon-button"
        aria-label="notifications"
        sx={{
          color: isDarkMode ? '#ffffff' : '#000000',
          '&:hover': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        <Badge badgeContent={unreadCount > 0 ? unreadCount : 0} color="error" max={99}>
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: device === 'mobile' ? '90vw' : 400,
            maxHeight: 500,
            mt: 1,
            backgroundColor: isDarkMode ? '#1e2128' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          },
        }}
        MenuListProps={{
          sx: {
            padding: 0,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{
                fontSize: 12,
                textTransform: 'none',
                color: isDarkMode ? '#667eea' : '#667eea',
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {getNotificationsLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Loading notifications...</Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => {
              const isUnread = notification.notificationStatus === NotificationStatus.WAIT;
              const author = (notification as any).authorData;
              const property = notification.propertyData;

              return (
                <MenuItem
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    p: 2,
                    borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                    backgroundColor: isUnread
                      ? isDarkMode
                        ? 'rgba(102, 126, 234, 0.1)'
                        : 'rgba(102, 126, 234, 0.05)'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    },
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                  }}
                >
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar
                      src={
                        author?.memberImage
                          ? `${REACT_APP_API_URL}/${author.memberImage}`
                          : '/img/profile/defaultUser.svg'
                      }
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isUnread ? 600 : 400,
                          color: isDarkMode ? '#ffffff' : '#000000',
                          mb: 0.5,
                        }}
                      >
                        {notification.notificationTitle}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 13,
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                          mb: 0.5,
                        }}
                      >
                        {notification.notificationDesc || notification.notificationTitle}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 11,
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        {formatNotificationTime(notification.createdAt)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteNotification(notification._id, e)}
                      sx={{
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        '&:hover': {
                          color: isDarkMode ? '#ffffff' : '#000000',
                        },
                      }}
                    >
                      ×
                    </IconButton>
                  </Box>
                  {isUnread && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#667eea',
                      }}
                    />
                  )}
                </MenuItem>
              );
            })
          )}
        </Box>

        {notifications.length > 0 && total > notifications.length && (
          <Box
            sx={{
              p: 1.5,
              textAlign: 'center',
              borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <Button
              size="small"
              onClick={() => {
                setNotificationInquiry({ ...notificationInquiry, limit: notificationInquiry.limit + 10 });
                getNotificationsRefetch();
              }}
              sx={{
                fontSize: 12,
                textTransform: 'none',
                color: isDarkMode ? '#667eea' : '#667eea',
              }}
            >
              Load more
            </Button>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default NotificationComponent;
