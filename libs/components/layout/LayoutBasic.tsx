import { useReactiveVar } from '@apollo/client';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateUserInfo } from '../../auth';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Chat from '../Chat';
import Footer from '../Footer';
import Top from '../Top';

const withLayoutBasic = (Component: any) => {
  return (props: any) => {
    const router = useRouter();
    const { t, i18n } = useTranslation('common');
    const device = useDeviceDetect();
    const [authHeader, setAuthHeader] = useState<boolean>(false);
    const user = useReactiveVar(userVar);

    const memoizedValues = useMemo(() => {
      let title = '',
        titleHighlight = '',
        desc = '',
        bgImage = '';

      switch (router.pathname) {
        case '/property':
          title = 'Explore Our';
          titleHighlight = 'Properties';
          desc = 'PROPERTIES';
          bgImage = '/img/banner/basiclaybanner.jpg';
          break;
        case '/agent':
          title = 'Meet Our';
          titleHighlight = 'Agents';
          desc = 'AGENTS';
          bgImage = '/img/banner/basiclaybanner.jpg';
          break;
        case '/agent/detail':
          title = 'Agent';
          titleHighlight = 'Profile';
          desc = 'AGENT';
          bgImage = '/img/banner/basiclaybanner.jpg';
          break;
        case '/mypage':
          title = 'My';
          titleHighlight = 'Page';
          desc = 'MY PAGE';
          bgImage = '/img/banner/basiclaybanner.jpg';
          break;
        case '/community':
          title = 'Community';
          titleHighlight = 'Boards';
          desc = 'COMMUNITY';
          bgImage = '/img/banner/basiclaybanner.jpg';
          break;
        case '/community/detail':
          title = 'Community';
          titleHighlight = 'Detail';
          desc = 'COMMUNITY';
          bgImage = '/img/banner/basiclaybanner.jpg';
          break;
        case '/cs':
          title = 'Customer';
          titleHighlight = 'Service';
          desc = 'CS';
          bgImage = '/img/banner/basiclaybanner.jpg';
          break;
        case '/account/join':
          title = 'Login /';
          titleHighlight = 'Signup';
          desc = 'AUTHENTICATION';
          bgImage = '/img/banner/basiclaybanner.jpg';
          setAuthHeader(true);
          break;
        case '/member':
          title = 'Member';
          titleHighlight = 'Page';
          desc = 'MEMBER';
          bgImage = '/img/banner/basiclaybanner.jpg';
          break;
        case '/about':
          title = 'About';
          titleHighlight = 'Us';
          desc = 'ABOUT';
          bgImage = '/img/banner/basiclaybanner.jpg';
          break;
        default:
          break;
      }

      return { title, titleHighlight, desc, bgImage };
    }, [router.pathname]);

    /** LIFECYCLES **/
    useEffect(() => {
      const jwt = getJwtToken();
      if (jwt) updateUserInfo(jwt);
    }, []);

    /** HANDLERS **/

    if (device == 'mobile') {
      return (
        <>
          <Head>
            <title>HIGHLAND</title>
            <meta name={'title'} content={`HIGHLAND`} />
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
          </Head>
          <Stack id="pc-wrap">
            <Stack id={'top'}>
              <Top />
            </Stack>

            <Stack
              className={`header-basic ${authHeader && 'auth'}`}
              style={{
                backgroundImage: `url(${memoizedValues.bgImage})`,
                backgroundSize: 'cover',
                boxShadow: 'inset 10px 40px 150px 40px rgb(24 22 36)',
              }}
            >
              <Stack className={'container'}>
                <div className="header-badge">[ {memoizedValues.desc} ]</div>
                <div className="header-title">
                  {memoizedValues.title}{' '}
                  <span className="header-title-highlight">{memoizedValues.titleHighlight}</span>
                </div>
              </Stack>
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

export default withLayoutBasic;
