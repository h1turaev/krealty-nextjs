import { useMutation, useQuery } from '@apollo/client';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { DELETE_NOTIFICATION, MARK_NOTIFICATION_AS_READ } from '../../../apollo/user/mutation';
import { GET_NOTIFICATIONS } from '../../../apollo/user/query';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { NotificationStatus, NotificationType } from '../../../libs/enums/notification.enum';
import { showConfirm, showError, showSuccess } from '../../../libs/toast';
import { T } from '../../../libs/types/common';
import { Notification } from '../../../libs/types/notification/notification';
import { NotificationInquiry } from '../../../libs/types/notification/notification.input';

const AdminInquiries: NextPage = ({ initialInquiry, ...props }: any) => {
  const router = useRouter();
  const [inquiriesInquiry, setInquiriesInquiry] = useState<NotificationInquiry>(
    initialInquiry || {
      page: 1,
      limit: 10,
      search: {
        notificationType: NotificationType.INQUIRY,
      },
    },
  );
  const [inquiries, setInquiries] = useState<Notification[]>([]);
  const [inquiriesTotal, setInquiriesTotal] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Notification | null>(null);

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

  /** APOLLO REQUESTS **/
  const {
    loading: getInquiriesLoading,
    data: getInquiriesData,
    error: getInquiriesError,
    refetch: getInquiriesRefetch,
  } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: 'network-only',
    variables: { input: inquiriesInquiry },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      if (data?.getNotifications) {
        setInquiries(data.getNotifications.list || []);
        setInquiriesTotal(data.getNotifications.metaCounter?.[0]?.total || 0);
      }
    },
  });

  /** LIFECYCLES **/
  useEffect(() => {
    getInquiriesRefetch({ input: inquiriesInquiry }).then();
  }, [inquiriesInquiry]);

  /** HANDLERS **/
  const changePageHandler = async (event: unknown, newPage: number) => {
    inquiriesInquiry.page = newPage + 1;
    await getInquiriesRefetch({ input: inquiriesInquiry });
    setInquiriesInquiry({ ...inquiriesInquiry });
  };

  const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
    inquiriesInquiry.limit = parseInt(event.target.value, 10);
    inquiriesInquiry.page = 1;
    await getInquiriesRefetch({ input: inquiriesInquiry });
    setInquiriesInquiry({ ...inquiriesInquiry });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, inquiry: Notification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedInquiry(inquiry);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInquiry(null);
  };

  const handleViewDetails = (inquiry: Notification) => {
    router.push(`/_admin/inquiries/${inquiry._id}`);
    handleMenuClose();
  };

  const handleMarkAsRead = async (inquiry: Notification) => {
    try {
      await markAsRead({
        variables: { notificationId: inquiry._id },
      });
      showSuccess('Inquiry marked as read');
      getInquiriesRefetch();
      handleMenuClose();
    } catch (error: any) {
      showError(error.message || 'Failed to mark as read');
    }
  };

  const handleDelete = async (inquiry: Notification) => {
    try {
      await deleteNotification({
        variables: { notificationId: inquiry._id },
      });
      showSuccess('Inquiry deleted successfully');
      getInquiriesRefetch();
      handleMenuClose();
    } catch (error: any) {
      showError(error.message || 'Failed to delete inquiry');
    }
  };

  const handleDeleteClick = async (inquiry: Notification) => {
    handleMenuClose();
    const confirmed = await showConfirm('Are you sure you want to delete this inquiry?');
    if (confirmed) {
      handleDelete(inquiry);
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const parseInquiryMessage = (desc: string) => {
    try {
      const lines = desc.split('\n');
      const fromMatch = lines[0]?.match(/From: (.+)/);
      const phoneMatch = lines[1]?.match(/Phone: (.+)/);
      const messageStart = desc.indexOf('Message:');
      const message = messageStart !== -1 ? desc.substring(messageStart + 8).trim() : '';

      return {
        from: fromMatch ? fromMatch[1] : 'Unknown',
        phone: phoneMatch ? phoneMatch[1] : 'N/A',
        message: message || 'No message',
      };
    } catch {
      return {
        from: 'Unknown',
        phone: 'N/A',
        message: desc || 'No message',
      };
    }
  };

  return (
    <Box component={'div'} className={'content'}>
      <Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
        Contact Inquiries
      </Typography>
      <Box component={'div'} className={'table-wrap'}>
        {getInquiriesLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Loading inquiries...</Typography>
          </Box>
        ) : inquiries.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No inquiries yet</Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>From</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inquiries.map((inquiry) => {
                    const parsed = parseInquiryMessage(inquiry.notificationDesc || '');
                    const isUnread = inquiry.notificationStatus === NotificationStatus.WAIT;

                    return (
                      <TableRow
                        key={inquiry._id}
                        onClick={() => handleViewDetails(inquiry)}
                        sx={{
                          backgroundColor: isUnread ? 'rgba(114, 92, 232, 0.05)' : 'transparent',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          },
                        }}
                      >
                        <TableCell>{parsed.from}</TableCell>
                        <TableCell>{parsed.phone}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {parsed.message}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isUnread ? 'Unread' : 'Read'}
                            color={isUnread ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <IconButton size="small" onClick={(e) => handleMenuClick(e, inquiry)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={inquiriesTotal}
              page={inquiriesInquiry.page - 1}
              onPageChange={changePageHandler}
              rowsPerPage={inquiriesInquiry.limit}
              onRowsPerPageChange={changeRowsPerPageHandler}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => selectedInquiry && handleViewDetails(selectedInquiry)}>
          View Details
        </MenuItem>
        {selectedInquiry?.notificationStatus === NotificationStatus.WAIT && (
          <MenuItem onClick={() => selectedInquiry && handleMarkAsRead(selectedInquiry)}>
            Mark as Read
          </MenuItem>
        )}
        <MenuItem
          onClick={() => selectedInquiry && handleDeleteClick(selectedInquiry)}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default withAdminLayout(AdminInquiries);
