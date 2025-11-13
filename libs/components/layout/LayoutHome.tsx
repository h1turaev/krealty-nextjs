import { useReactiveVar } from '@apollo/client';
import { Stack } from '@mui/material';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateUserInfo } from '../../auth';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Chat from '../Chat';
import Footer from '../Footer';
import Top from '../Top';
import HomeHero from '../homepage/HomeHero';

const withLayoutMain = (Component: any) => {
  return (props: any) => {
    const device = useDeviceDetect();
    const user = useReactiveVar(userVar);
    const [currentVideo, setCurrentVideo] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const videos = ['/video/banner5.mp4', '/video/banner4.mp4', '/video/dubai.mp4'];

    /** LIFECYCLES **/
    useEffect(() => {
      const jwt = getJwtToken();
      if (jwt) updateUserInfo(jwt);
    }, []);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentVideo((prev) => {
          const nextVideo = (prev + 1) % videos.length;
          console.log('Switching to video:', nextVideo);
          return nextVideo;
        });
      }, 4000); // 4 seconds

      return () => clearInterval(interval);
    }, [videos]);

    /** HANDLERS **/

    if (device == 'mobile') {
      return (
        <>
          <Head>
            <title>HIGHLAND</title>
            <meta name={'title'} content={`HIGHLAND`} />
            <link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />
          </Head>
          <Stack id="mobile-wrap">
            <Stack id={'top'}>
              <Top />
            </Stack>

            <Stack id={'main'}>
              <Component {...props} />
            </Stack>

            <Stack id={'footer'}>
              <Footer />
            </Stack>
          </Stack>
        </>
      );
    } else {
      return (
        <>
          <Head>
            <title>HIGHLAND</title>
            <meta name={'title'} content={`HIGHLAND`} />
            <link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />
          </Head>
          <Stack id="pc-wrap">
            <Stack id={'top'}>
              <Top />
            </Stack>

            <Stack className={'header-main'}>
              <div className="video-container">
                <video
                  className={`header-video video-1 ${currentVideo === 0 ? 'active' : ''}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                >
                  <source src={videos[0]} type="video/mp4" />
                </video>
                <video
                  className={`header-video video-2 ${currentVideo === 1 ? 'active' : ''}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                >
                  <source src={videos[1]} type="video/mp4" />
                </video>
                <video
                  className={`header-video video-3 ${currentVideo === 2 ? 'active' : ''}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                >
                  <source src={videos[2]} type="video/mp4" />
                </video>
              </div>
              <HomeHero />
            </Stack>

            <Stack id={'main'}>
              <Component {...props} />
            </Stack>

            <Chat />

            <Stack id={'footer'}>
              <Footer />
            </Stack>
          </Stack>
        </>
      );
    }
  };
};

export default withLayoutMain;
