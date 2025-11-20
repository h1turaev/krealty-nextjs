import { useReactiveVar } from '@apollo/client';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { Box, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, styled } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter, withRouter } from 'next/router';
import { CaretDown, Moon, Sun } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import { userVar } from '../../apollo/store';
import { getJwtToken, updateUserInfo } from '../auth';

import { REACT_APP_API_URL } from '../config';
import { useDarkMode } from '../hooks/useDarkMode';
import useDeviceDetect from '../hooks/useDeviceDetect';
import HighlandLogo from './common/HighlandLogo';
import NotificationComponent from './Notification';

const Top = () => {
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
  const [lang, setLang] = useState<string | null>('en');
  const drop = Boolean(anchorEl2);
  const [colorChange, setColorChange] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
  let open = Boolean(anchorEl);
  const [bgColor, setBgColor] = useState<boolean>(false);

  /** LIFECYCLES **/
  useEffect(() => {
    if (localStorage.getItem('locale') === null) {
      localStorage.setItem('locale', 'en');
      setLang('en');
    } else {
      setLang(localStorage.getItem('locale'));
    }
  }, [router]);

  useEffect(() => {
    switch (router.pathname) {
      case '/property/detail':
        setBgColor(true);
        break;
      default:
        break;
    }
  }, [router]);

  useEffect(() => {
    const jwt = getJwtToken();
    if (jwt) updateUserInfo(jwt);
  }, []);

  /** HANDLERS **/
  const langClick = (e: any) => {
    setAnchorEl2(e.currentTarget);
  };

  const langClose = () => {
    setAnchorEl2(null);
  };

  const langChoice = useCallback(
    async (e: any) => {
      setLang(e.target.id);
      localStorage.setItem('locale', e.target.id);
      setAnchorEl2(null);
      await router.push(router.asPath, router.asPath, { locale: e.target.id });
    },
    [router],
  );

  const changeNavbarColor = () => {
    if (window.scrollY >= 50) {
      setColorChange(true);
    } else {
      setColorChange(false);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleHover = (event: any) => {
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget);
    } else {
      setAnchorEl(null);
    }
  };

  const StyledMenu = styled((props: MenuProps) => (
    <Menu
      elevation={0}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}
    />
  ))(({ theme }) => ({
    '& .MuiPaper-root': {
      top: '109px',
      borderRadius: 6,
      marginTop: theme.spacing(1),
      minWidth: 160,
      backgroundColor: isDarkMode ? '#1e2128' : '#ffffff',
      color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgb(55, 65, 81)',
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: isDarkMode
        ? '0px 10px 15px -3px rgba(0, 0, 0, 0.3), 0px 4px 6px -2px rgba(0, 0, 0, 0.2)'
        : 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
      '& .MuiMenu-list': {
        padding: '4px 0',
      },
      '& .MuiMenuItem-root': {
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgb(55, 65, 81)',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        '& .MuiSvgIcon-root': {
          fontSize: 18,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : theme.palette.text.secondary,
          marginRight: theme.spacing(1.5),
        },
        '&:hover': {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        '&:active': {
          backgroundColor: isDarkMode
            ? 'rgba(255, 255, 255, 0.15)'
            : alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        },
      },
    },
  }));

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', changeNavbarColor);
  }

  if (device == 'mobile') {
    return (
      <Stack className={'top'}>
        <Link href={'/'}>
          <div>{t('Home')}</div>
        </Link>
        <Link href={'/about'}>
          <div>{t('About')}</div>
        </Link>
        <Link href={'/property'}>
          <div>{t('Properties')}</div>
        </Link>
        <Link href={'/agent'}>
          <div> {t('Agents')} </div>
        </Link>
        <Link href={'/community'}>
          <div> {t('Community')} </div>
        </Link>
        <Link href={'/cs'}>
          <div> {t('CS')} </div>
        </Link>
      </Stack>
    );
  } else {
    return (
      <Stack className={'navbar'}>
        <Stack
          className={`navbar-main ${colorChange ? 'transparent' : ''} ${
            bgColor ? 'transparent' : ''
          }`}
        >
          <Stack className={'container'}>
            <Box component={'div'} className={'logo-box'}>
              <Link href={'/'}>
                <HighlandLogo />
              </Link>
            </Box>
            <Box component={'div'} className={'router-box'}>
              <Link href={'/'}>
                <div>{t('Home')}</div>
              </Link>

              <Link href={'/property'}>
                <div>{t('Properties')}</div>
              </Link>
              <Link href={'/amenities'}>
                <div>Amenities</div>
              </Link>
              <Link href={'/agent'}>
                <div> {t('Agents')} </div>
              </Link>
              <Link href={'/community'}>
                <div> {t('Community')} </div>
              </Link>
              <Link href={'/cs'}>
                <div> {t('CS')} </div>
              </Link>
              <Link href={'/about'}>
                <div>{t('About')}</div>
              </Link>
            </Box>
            <Box component={'div'} className={'user-box'}>
              {user?._id ? (
                <>
                  <div
                    className={'login-user'}
                    onClick={() => router.push('/mypage')}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={
                        user?.memberImage
                          ? `${REACT_APP_API_URL}/${user?.memberImage}`
                          : '/img/profile/defaultUser.svg'
                      }
                      alt=""
                    />
                  </div>
                </>
              ) : (
                <Link href={'/account/join'}>
                  <div className={'join-box'}>
                    <AccountCircleOutlinedIcon />
                    <span>{t('Login')} / Apply</span>
                  </div>
                </Link>
              )}

              <div className={'lan-box'}>
                {user?._id && <NotificationComponent />}
                <button
                  className="btn-dark-mode"
                  onClick={toggleDarkMode}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun size={18} weight="fill" /> : <Moon size={18} weight="fill" />}
                </button>
                <Button
                  disableRipple
                  className="btn-lang"
                  onClick={langClick}
                  endIcon={<CaretDown size={14} color="#616161" weight="fill" />}
                >
                  <Box component={'div'} className={'lang-text'}>
                    {lang !== null ? lang.toUpperCase() : 'EN'}
                  </Box>
                </Button>

                <StyledMenu
                  anchorEl={anchorEl2}
                  open={drop}
                  onClose={langClose}
                  sx={{ position: 'absolute' }}
                >
                  <MenuItem disableRipple onClick={langChoice} id="en">
                    EN
                  </MenuItem>
                  <MenuItem disableRipple onClick={langChoice} id="kr">
                    KR
                  </MenuItem>
                  <MenuItem disableRipple onClick={langChoice} id="ru">
                    RU
                  </MenuItem>
                </StyledMenu>
              </div>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

export default withRouter(Top);
