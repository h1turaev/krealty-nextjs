import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { logIn, signUp } from '../../libs/auth';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useDarkMode } from '../../libs/hooks/useDarkMode';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { showError } from '../../libs/toast';

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
});

const Join: NextPage = () => {
  const router = useRouter();
  const device = useDeviceDetect();
  const { isDarkMode } = useDarkMode();
  const [isMounted, setIsMounted] = useState(false);
  const [shouldUseDarkMode, setShouldUseDarkMode] = useState(false);
  const [input, setInput] = useState({
    email: '',
    nick: '',
    password: '',
    phone: '',
    type: 'USER',
  });
  const [loginView, setLoginView] = useState<boolean>(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Real-time dark mode tracking
  useEffect(() => {
    if (!isMounted) return;

    const checkDarkMode = () => {
      const hasDarkClass =
        document.documentElement.classList.contains('dark-mode') ||
        document.body.classList.contains('dark-mode');
      setShouldUseDarkMode(hasDarkClass);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const timeoutId = setTimeout(checkDarkMode, 0);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isDarkMode, isMounted]);

  /** HANDLERS **/
  const viewChangeHandler = (state: boolean) => {
    setLoginView(state);
  };

  const checkUserTypeHandler = (e: any) => {
    const checked = e.target.checked;
    if (checked) {
      const value = e.target.name;
      handleInput('type', value);
    } else {
      handleInput('type', 'USER');
    }
  };

  const handleInput = useCallback((name: any, value: any) => {
    setInput((prev) => {
      return { ...prev, [name]: value };
    });
  }, []);

  const doLogin = useCallback(async () => {
    console.warn(input);
    try {
      // Use email if provided, otherwise use nick
      const loginIdentifier = input.email || input.nick;
      await logIn(loginIdentifier, input.password);
      await router.push(`${router.query.referrer ?? '/'}`);
    } catch (err: any) {
      await showError(err.message);
    }
  }, [input]);

  const doSignUp = useCallback(async () => {
    console.warn(input);
    try {
      // Use email if provided, otherwise use nick
      const signUpIdentifier = input.email || input.nick;
      await signUp(signUpIdentifier, input.password, input.phone, input.type);
      await router.push(`${router.query.referrer ?? '/'}`);
    } catch (err: any) {
      await showError(err.message);
    }
  }, [input]);

  const handleGoogleLogin = useCallback(async () => {
    // TODO: Implement Google OAuth login
    console.log('Google login clicked');
    await showError('Google login is not yet implemented');
  }, []);

  console.log('+input: ', input);

  if (device === 'mobile') {
    return <div>LOGIN MOBILE</div>;
  } else {
    return (
      <Stack className={'join-page'}>
        <Stack className={'container'}>
          <Stack className={'main'}>
            <Stack className={'center'}>
              <Box className={'header-section'}>
                <span className={'label'}>[SIGN IN]</span>
                <h1 className={'title'}>Welcome Home</h1>
                <p className={'description'}>
                  Sign in to access your resident portal and manage everything in one place—rent,
                  services, requests, and more.
                </p>
              </Box>
              <Box className={'input-wrap'}>
                <div className={'input-box'}>
                  <input
                    type="email"
                    placeholder={'Username or Email Address'}
                    value={input.email}
                    onChange={(e) => handleInput('email', e.target.value)}
                    required={true}
                    onKeyDown={(event) => {
                      if (event.key == 'Enter' && loginView) doLogin();
                      if (event.key == 'Enter' && !loginView) doSignUp();
                    }}
                  />
                </div>
                <div className={'input-box'}>
                  <input
                    type="password"
                    placeholder={'Password'}
                    value={input.password}
                    onChange={(e) => handleInput('password', e.target.value)}
                    required={true}
                    onKeyDown={(event) => {
                      if (event.key == 'Enter' && loginView) doLogin();
                      if (event.key == 'Enter' && !loginView) doSignUp();
                    }}
                  />
                </div>
                {loginView && <a className={'forgot-password'}>Forgot Password?</a>}
                {!loginView && (
                  <>
                    <div className={'input-box'}>
                      <input
                        type="text"
                        placeholder={'Enter Username'}
                        value={input.nick}
                        onChange={(e) => handleInput('nick', e.target.value)}
                        required={true}
                        onKeyDown={(event) => {
                          if (event.key == 'Enter') doSignUp();
                        }}
                      />
                    </div>
                    <div className={'input-box'}>
                      <input
                        type="text"
                        placeholder={'Enter Phone'}
                        value={input.phone}
                        onChange={(e) => handleInput('phone', e.target.value)}
                        required={true}
                        onKeyDown={(event) => {
                          if (event.key == 'Enter') doSignUp();
                        }}
                      />
                    </div>
                  </>
                )}
              </Box>
              <Box className={'register'}>
                {loginView ? (
                  <Button
                    className={'sign-in-button'}
                    variant="contained"
                    disabled={(!input.email && !input.nick) || input.password == ''}
                    onClick={doLogin}
                  >
                    Sign In
                  </Button>
                ) : (
                  <Button
                    className={'sign-in-button'}
                    variant="contained"
                    disabled={
                      (!input.email && !input.nick) ||
                      input.password == '' ||
                      input.phone == '' ||
                      input.type == ''
                    }
                    onClick={doSignUp}
                  >
                    Sign Up
                  </Button>
                )}

                {loginView && (
                  <>
                    <div className={'divider'}>
                      <span>or</span>
                    </div>
                    <Button
                      className={'google-button'}
                      variant="outlined"
                      onClick={handleGoogleLogin}
                      startIcon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M19.6 10.2273C19.6 9.51818 19.5364 8.83636 19.4182 8.18182H10V12.05H15.3818C15.15 13.3 14.4455 14.3591 13.3864 15.0682V17.5773H16.6182C18.5091 15.8364 19.6 13.2727 19.6 10.2273Z"
                            fill="#4285F4"
                          />
                          <path
                            d="M10 20C12.7 20 14.9636 19.1045 16.6182 17.5773L13.3864 15.0682C12.4909 15.6682 11.3455 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.2636 4.40455 11.9H1.06364V14.4909C2.70909 17.7591 6.09091 20 10 20Z"
                            fill="#34A853"
                          />
                          <path
                            d="M4.40455 11.9C4.20455 11.3 4.09091 10.6591 4.09091 10C4.09091 9.34091 4.20455 8.7 4.40455 8.1V5.50909H1.06364C0.386364 6.85909 0 8.38636 0 10C0 11.6136 0.386364 13.1409 1.06364 14.4909L4.40455 11.9Z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M10 3.97727C11.4682 3.97727 12.7864 4.46818 13.8227 5.42273L16.6909 2.55455C14.9591 0.936364 12.6955 0 10 0C6.09091 0 2.70909 2.24091 1.06364 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z"
                            fill="#EA4335"
                          />
                        </svg>
                      }
                    >
                      Continue with Google
                    </Button>
                  </>
                )}

                {!loginView && (
                  <div className={'type-option'}>
                    <span className={'text'}>I want to be registered as:</span>
                    <div>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              name={'USER'}
                              onChange={checkUserTypeHandler}
                              checked={input?.type == 'USER'}
                              sx={{
                                color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#999',
                                '&:hover': {
                                  backgroundColor: shouldUseDarkMode
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(0, 0, 0, 0.04)',
                                },
                                '&.Mui-checked': {
                                  color: '#3b82f6',
                                  '&:hover': {
                                    backgroundColor: shouldUseDarkMode
                                      ? 'rgba(59, 130, 246, 0.1)'
                                      : 'rgba(59, 130, 246, 0.08)',
                                  },
                                },
                                '&.Mui-focusVisible': {
                                  outline: shouldUseDarkMode
                                    ? '2px solid rgba(59, 130, 246, 0.5)'
                                    : '2px solid rgba(59, 130, 246, 0.3)',
                                  outlineOffset: '2px',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            />
                          }
                          label="User"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
                              fontSize: '14px',
                              transition: 'color 0.3s ease',
                              '&:hover': {
                                color: shouldUseDarkMode ? 'rgba(255, 255, 255, 1)' : '#181a20',
                              },
                            },
                          }}
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              name={'AGENT'}
                              onChange={checkUserTypeHandler}
                              checked={input?.type == 'AGENT'}
                              sx={{
                                color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#999',
                                '&:hover': {
                                  backgroundColor: shouldUseDarkMode
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(0, 0, 0, 0.04)',
                                },
                                '&.Mui-checked': {
                                  color: '#3b82f6',
                                  '&:hover': {
                                    backgroundColor: shouldUseDarkMode
                                      ? 'rgba(59, 130, 246, 0.1)'
                                      : 'rgba(59, 130, 246, 0.08)',
                                  },
                                },
                                '&.Mui-focusVisible': {
                                  outline: shouldUseDarkMode
                                    ? '2px solid rgba(59, 130, 246, 0.5)'
                                    : '2px solid rgba(59, 130, 246, 0.3)',
                                  outlineOffset: '2px',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            />
                          }
                          label="Agent"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
                              fontSize: '14px',
                              transition: 'color 0.3s ease',
                              '&:hover': {
                                color: shouldUseDarkMode ? 'rgba(255, 255, 255, 1)' : '#181a20',
                              },
                            },
                          }}
                        />
                      </FormGroup>
                    </div>
                  </div>
                )}
              </Box>
              <Box className={'ask-info'}>
                {loginView ? (
                  <p>
                    New here? <a onClick={() => viewChangeHandler(false)}>Create an account</a>
                  </p>
                ) : (
                  <p>
                    Have account? <a onClick={() => viewChangeHandler(true)}>Sign In</a>
                  </p>
                )}
              </Box>
              <Box className={'security-features'}>
                <svg
                  className={'lock-icon'}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.6667 7.33333H12V5.33333C12 2.94 10.06 1 7.66667 1C5.27333 1 3.33333 2.94 3.33333 5.33333V7.33333H2.66667C1.93333 7.33333 1.33333 7.93333 1.33333 8.66667V13.3333C1.33333 14.0667 1.93333 14.6667 2.66667 14.6667H12.6667C13.4 14.6667 14 14.0667 14 13.3333V8.66667C14 7.93333 13.4 7.33333 12.6667 7.33333ZM8.66667 11.3333V12.6667H6.66667V11.3333C6.3 11.0667 6 10.6 6 10C6 9.26667 6.6 8.66667 7.33333 8.66667C8.06667 8.66667 8.66667 9.26667 8.66667 10C8.66667 10.6 8.36667 11.0667 8.66667 11.3333ZM10.6667 7.33333H4.66667V5.33333C4.66667 3.86 5.86 2.66667 7.33333 2.66667C8.80667 2.66667 10 3.86 10 5.33333V7.33333H10.6667Z"
                    fill="currentColor"
                  />
                </svg>
                <span>2FA Enabled • SOC 2 • GDPR • SSL Secure</span>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

export default withLayoutBasic(Join);
