import { useMutation, useQuery } from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Chip, Divider, IconButton, Paper, Stack, Typography } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DELETE_NOTIFICATION, MARK_NOTIFICATION_AS_READ } from '../../../apollo/user/mutation';
import { GET_NOTIFICATIONS } from '../../../apollo/user/query';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { NotificationStatus, NotificationType } from '../../../libs/enums/notification.enum';
import { showConfirm, showError, showSuccess } from '../../../libs/toast';
import { T } from '../../../libs/types/common';
import { Notification } from '../../../libs/types/notification/notification';
import { NotificationInquiry } from '../../../libs/types/notification/notification.input';

const InquiryDetail: NextPage = ({ ...props }: any) => {
  const router = useRouter();
  const { id } = router.query;
  const [inquiry, setInquiry] = useState<Notification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get single inquiry by fetching all and filtering
  const inquiryInquiry: NotificationInquiry = {
    page: 1,
    limit: 1000, // Get all to find the one we need
    search: {
      notificationType: NotificationType.INQUIRY,
    },
  };

  const {
    loading: getInquiryLoading,
    data: getInquiryData,
    error: getInquiryError,
    refetch: getInquiryRefetch,
  } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: 'network-only',
    variables: { input: inquiryInquiry },
    skip: !id,
    onCompleted: (data: T) => {
      if (data?.getNotifications) {
        const inquiries = data.getNotifications.list || [];
        const foundInquiry = inquiries.find((inq: Notification) => inq._id === id);
        if (foundInquiry) {
          setInquiry(foundInquiry);
        } else {
          showError('Inquiry not found');
          router.push('/_admin/inquiries');
        }
      }
      setLoading(false);
    },
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

  useEffect(() => {
    if (id && !getInquiryLoading) {
      getInquiryRefetch();
    }
  }, [id]);

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

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const handleMarkAsRead = async () => {
    if (!inquiry || inquiry.notificationStatus === NotificationStatus.READ) return;

    try {
      await markAsRead({
        variables: { notificationId: inquiry._id },
      });
      setInquiry({ ...inquiry, notificationStatus: NotificationStatus.READ });
      showSuccess('Inquiry marked as read');
      getInquiryRefetch();
    } catch (error: any) {
      showError(error.message || 'Failed to mark as read');
    }
  };

  const handleDelete = async () => {
    if (!inquiry) return;

    try {
      await deleteNotification({
        variables: { notificationId: inquiry._id },
      });
      showSuccess('Inquiry deleted successfully');
      router.push('/_admin/inquiries');
    } catch (error: any) {
      showError(error.message || 'Failed to delete inquiry');
    }
  };

  const handleDeleteClick = async () => {
    const confirmed = await showConfirm('Are you sure you want to delete this inquiry?');
    if (confirmed) {
      handleDelete();
    }
  };

  if (loading || getInquiryLoading) {
    return (
      <Box component={'div'} className={'content'}>
        <Typography>Loading inquiry...</Typography>
      </Box>
    );
  }

  if (!inquiry) {
    return (
      <Box component={'div'} className={'content'}>
        <Typography>Inquiry not found</Typography>
        <Button onClick={() => router.push('/_admin/inquiries')} sx={{ mt: 2 }}>
          Back to Inquiries
        </Button>
      </Box>
    );
  }

  const parsed = parseInquiryMessage(inquiry.notificationDesc || '');
  const isUnread = inquiry.notificationStatus === NotificationStatus.WAIT;

  return (
    <Box component={'div'} className={'content'}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => router.push('/_admin/inquiries')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={'h2'} className={'tit'}>
            Inquiry Details
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          {isUnread && (
            <Button variant="outlined" startIcon={<CheckCircleIcon />} onClick={handleMarkAsRead}>
              Mark as Read
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          {/* Status */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Status
            </Typography>
            <Chip
              label={isUnread ? 'Unread' : 'Read'}
              color={isUnread ? 'warning' : 'default'}
              size="small"
            />
          </Box>

          <Divider />

          {/* From */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              From
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                cursor: inquiry.authorId ? 'pointer' : 'default',
                color: inquiry.authorId ? 'primary.main' : 'inherit',
                '&:hover': inquiry.authorId
                  ? {
                      textDecoration: 'underline',
                    }
                  : {},
              }}
              onClick={() => {
                if (inquiry.authorId) {
                  router.push(`/member?memberId=${inquiry.authorId}&category=properties`);
                }
              }}
            >
              {parsed.from}
            </Typography>
          </Box>

          <Divider />

          {/* Phone */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Phone
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {parsed.phone}
            </Typography>
          </Box>

          <Divider />

          {/* Message */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Message
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.7,
                p: 2,
                bgcolor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 1,
                minHeight: 100,
              }}
            >
              {parsed.message}
            </Typography>
          </Box>

          <Divider />

          {/* Date */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Received Date
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatDate(inquiry.createdAt)}
            </Typography>
          </Box>

          {inquiry.updatedAt && inquiry.updatedAt !== inquiry.createdAt && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(inquiry.updatedAt)}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default withAdminLayout(InquiryDetail);
