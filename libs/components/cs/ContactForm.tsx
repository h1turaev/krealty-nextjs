import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { userVar } from '../../../apollo/store';
import { CREATE_NOTIFICATION } from '../../../apollo/user/mutation';
import { GET_ADMIN } from '../../../apollo/user/query';
import { MemberType } from '../../enums/member.enum';
import { NotificationGroup, NotificationType } from '../../enums/notification.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { showError, showSuccess } from '../../toast';

const ContactForm: React.FC = () => {
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only allow logged in users (USER or AGENT) to send messages
  const canSendMessage =
    user?._id && (user.memberType === MemberType.USER || user.memberType === MemberType.AGENT);

  // Get admin to send notification
  // Admin bitta bo'lgani uchun GET_ADMIN query ishlatamiz
  const { data: adminData } = useQuery(GET_ADMIN, {
    skip: !canSendMessage, // Only fetch if user can send message
  });

  const [createNotification] = useMutation(CREATE_NOTIFICATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSendMessage) {
      showError('Please login to send a message');
      return;
    }

    if (!message.trim()) {
      showError('Please enter your message');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get admin
      const admin = adminData?.getAdmin;

      if (!admin || !admin._id) {
        showError('No admin found to send your inquiry. Please contact support directly.');
        setIsSubmitting(false);
        return;
      }

      // Send notification to admin
      // Note: authorId is automatically set from authenticated user in backend
      const notificationInput = {
        notificationType: NotificationType.INQUIRY,
        notificationGroup: NotificationGroup.MEMBER,
        notificationTitle: `New Contact Inquiry from ${
          user?.memberFullName || user?.memberNick || 'User'
        }`,
        notificationDesc: `From: ${user?.memberFullName || user?.memberNick || 'User'}\nPhone: ${
          user?.memberPhone || 'N/A'
        }\n\nMessage: ${message}`,
        receiverId: admin._id,
      };

      await createNotification({
        variables: { input: notificationInput },
      });

      showSuccess('Your message has been sent successfully! We will contact you soon.');
      setMessage('');
    } catch (error: any) {
      console.error('Error sending inquiry:', error);
      showError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (device === 'mobile') {
    return <div>Contact Form Mobile</div>;
  }

  if (!canSendMessage) {
    return null; // Don't show form if user is not logged in or not USER/AGENT
  }

  return (
    <Box className={'contact-form-section'}>
      <Typography className={'contact-form-title'}>Contact Us</Typography>
      <Typography className={'contact-form-subtitle'}>
        Have questions? Send us a message and we'll get back to you as soon as possible.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} className={'contact-form'}>
        <Stack className={'form-fields'}>
          <TextField
            label="Message"
            variant="outlined"
            multiline
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            fullWidth
            className={'form-field message-field'}
            placeholder="Tell us how we can help you..."
          />
        </Stack>

        <Button
          type="submit"
          variant="contained"
          className={'submit-button'}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </Box>
    </Box>
  );
};

export default ContactForm;
