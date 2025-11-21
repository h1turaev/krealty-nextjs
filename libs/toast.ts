import React from 'react';
import toast, { Toast } from 'react-hot-toast';
import { Messages } from './config';

// Error handling
export const showError = (message: string, duration: number = 3000) => {
  toast.error(message || 'An error occurred', {
    duration,
    position: 'top-center',
  });
};

// Success messages
export const showSuccess = (message: string, duration: number = 3000) => {
  toast.success(message.replace('Definer: ', ''), {
    duration,
    position: 'top-center',
  });
};

export const showSuccessTopRight = (message: string, duration: number = 3000) => {
  toast.success(message, {
    duration,
    position: 'top-center',
  });
};

// Contact alert
export const showContactAlert = (message: string, duration: number = 3000) => {
  toast(message, {
    duration,
    position: 'top-center',
    icon: '📧',
  });
};

// Confirm dialog
export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast(
      (t: Toast) => {
        return React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '300px' } },
          React.createElement('p', { style: { margin: 0, fontSize: '14px' } }, message),
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
            React.createElement(
              'button',
              {
                onClick: () => {
                  toast.dismiss(t.id);
                  resolve(true);
                },
                style: {
                  padding: '8px 16px',
                  backgroundColor: '#e92C28',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                },
              },
              'Confirm',
            ),
            React.createElement(
              'button',
              {
                onClick: () => {
                  toast.dismiss(t.id);
                  resolve(false);
                },
                style: {
                  padding: '8px 16px',
                  backgroundColor: '#bdbdbd',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                },
              },
              'Cancel',
            ),
          ),
        );
      },
      {
        duration: Infinity,
        position: 'top-center',
      },
    );
  });
};

// Login confirm
export const showLoginConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast(
      (t: Toast) => {
        return React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '300px' } },
          React.createElement(
            'p',
            { style: { margin: 0, fontSize: '14px', color: '#212121' } },
            message,
          ),
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
            React.createElement(
              'button',
              {
                onClick: () => {
                  toast.dismiss(t.id);
                  resolve(true);
                },
                style: {
                  padding: '8px 16px',
                  backgroundColor: '#e92C28',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                },
              },
              'Login',
            ),
            React.createElement(
              'button',
              {
                onClick: () => {
                  toast.dismiss(t.id);
                  resolve(false);
                },
                style: {
                  padding: '8px 16px',
                  backgroundColor: '#bdbdbd',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                },
              },
              'Cancel',
            ),
          ),
        );
      },
      {
        duration: Infinity,
        position: 'top-center',
      },
    );
  });
};

// Basic alert
export const showBasic = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'top-center',
  });
};

// Error handling for admin
export const showErrorForAdmin = (err: any) => {
  const errorMessage = err.message ?? Messages.error1;
  toast.error(errorMessage, {
    duration: 3000,
    position: 'top-center',
  });
};

// Success with reload option
export const showSuccessWithReload = (
  message: string,
  duration: number = 3000,
  enableReload: boolean = false,
) => {
  toast.success(message, {
    duration,
    position: 'top-center',
  });

  if (enableReload) {
    setTimeout(() => {
      window.location.reload();
    }, duration);
  }
};
