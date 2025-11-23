import { Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import useDeviceDetect from '../../hooks/useDeviceDetect';
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
  const device = useDeviceDetect();
  const { isDarkMode } = useDarkMode();
  const [isMounted, setIsMounted] = useState(false);
  const [shouldUseDarkMode, setShouldUseDarkMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Real-time dark mode tracking
  useEffect(() => {
    if (!isMounted) return;

    const checkDarkMode = () => {
      // Always check DOM first, as it's the source of truth
      const hasDarkClass =
        document.documentElement.classList.contains('dark-mode') ||
        document.body.classList.contains('dark-mode');
      setShouldUseDarkMode(hasDarkClass);
    };

    // Check immediately
    checkDarkMode();

    // Watch for dark mode class changes on document (real-time)
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also listen to isDarkMode changes from hook
    const timeoutId = setTimeout(checkDarkMode, 0);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isDarkMode, isMounted]);

  const mainTitleStyles = React.useMemo(() => {
    return {
      color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
      fontFamily: 'inherit',
      fontSize: '30px',
      fontStyle: 'normal',
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: '0.6px',
      textTransform: 'capitalize',
      transition: 'color 0.3s ease',
    };
  }, [shouldUseDarkMode, isDarkMode]);

  const subTitleStyles = React.useMemo(() => {
    return {
      color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#181a20',
      fontFamily: 'inherit',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '26px',
      transition: 'color 0.3s ease',
    };
  }, [shouldUseDarkMode, isDarkMode]);

  if (device === 'mobile') {
    return <>ARTICLE PAGE MOBILE</>;
  } else
    return (
      <div id="write-article-page">
        <Stack className="main-title-box">
          <Stack className="right-box">
            <Typography className="main-title" sx={mainTitleStyles}>
              Write an Article
            </Typography>
            <Typography className="sub-title" sx={subTitleStyles}>
              Feel free to write your ideas!
            </Typography>
          </Stack>
        </Stack>
        <TuiEditor />
      </div>
    );
};

export default WriteArticle;
