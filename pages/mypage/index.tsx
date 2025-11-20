import { useMutation, useReactiveVar } from '@apollo/client';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { userVar } from '../../apollo/store';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { getJwtToken, updateUserInfo } from '../../libs/auth';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import AddProperty from '../../libs/components/mypage/AddNewProperty';
import MyArticles from '../../libs/components/mypage/MyArticles';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyProperties from '../../libs/components/mypage/MyProperties';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import { REACT_APP_API_URL } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import {
  sweetErrorHandling,
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from '../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const MyPage: NextPage = () => {
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);
  const router = useRouter();
  const queryCategory = router.query?.category as string;
  const [category, setCategory] = useState<string>(queryCategory || 'myProfile');
  const [isLoading, setIsLoading] = useState(true);

  // Update category when query changes
  useEffect(() => {
    if (queryCategory) {
      setCategory(queryCategory);
    }
  }, [queryCategory]);

  /** APOLLO REQUESTS **/
  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

  /** LIFECYCLES **/
  useEffect(() => {
    // Check if user info needs to be loaded from token
    const token = getJwtToken();
    if (token && !user._id) {
      updateUserInfo(token);
    }

    // Wait a bit for userVar to update, then check
    const timer = setTimeout(() => {
      if (!user._id && !token) {
        router.push('/').then();
      } else {
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user._id, router]);

  // Update loading state when user is loaded
  useEffect(() => {
    if (user._id) {
      setIsLoading(false);
    }
  }, [user._id]);

  /** HANDLERS **/
  const subscribeHandler = async (id: string, refetch: any, query: any) => {
    try {
      if (!id) throw new Error(Message.CREATE_FAILED);
      if (!user._id) throw new Error(Message.CREATE_FAILED);

      await subscribe({
        variables: {
          input: id,
        },
      });
      await sweetTopSmallSuccessAlert('Subscribed!', 800);
      await refetch({ input: query });
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
    try {
      if (!id) throw new Error(Message.CREATE_FAILED);
      if (!user._id) throw new Error(Message.CREATE_FAILED);

      await unsubscribe({
        variables: {
          input: id,
        },
      });
      await sweetTopSmallSuccessAlert('Unsubscribed!', 800);
      await refetch({ input: query });
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const likeMemberHandler = async (id: string, refetch: any, query: any) => {
    try {
      if (!id) return;
      if (!user._id) throw new Error(Message.CREATE_FAILED);

      await likeTargetMember({
        variables: {
          input: id,
        },
      });
      await sweetTopSmallSuccessAlert('Success', 800);
      await refetch({ input: query });
    } catch (err: any) {
      console.log('ERROR, likeMemberHandler:', err.message);
      sweetMixinErrorAlert(err.message).then();
    }
  };

  const redirectToMemberPageHandler = async (memberId: string) => {
    try {
      if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
      else await router.push(`/member?memberId=${memberId}`);
    } catch (error) {
      await sweetErrorHandling(error);
    }
  };

  if (device === 'mobile') {
    return <div>MY PAGE</div>;
  } else {
    if (isLoading) {
      return (
        <div id="my-page" style={{ position: 'relative', minHeight: '100vh' }}>
          <div className="container">
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
              <CircularProgress />
            </Box>
          </div>
        </div>
      );
    }

    return (
      <div id="my-page" style={{ position: 'relative' }}>
        <div className="container">
          <Stack className={'my-page'}>
            {/* Top Profile Header */}
            <Stack className={'profile-header'}>
              <Stack className={'profile-header-content'}>
                <Stack className={'profile-info'}>
                  <Box className={'profile-img-wrapper'}>
                    <img
                      src={
                        user?.memberImage
                          ? `${REACT_APP_API_URL}/${user?.memberImage}`
                          : '/img/profile/defaultUser.svg'
                      }
                      alt="profile"
                      className={'profile-img'}
                    />
                  </Box>
                  <Stack className={'profile-details'}>
                    <Typography className={'profile-name'}>
                      {user?.memberFullName || user?.memberNick || 'User'}
                    </Typography>
                    {/* <Typography className={'profile-email'}>
                      {user?.memberPhone ? `${user.memberPhone}@email.com` : 'No email'}
                    </Typography> */}
                    <Typography className={'profile-phone'}>
                      {user?.memberPhone
                        ? user.memberPhone.length >= 10
                          ? `(${user.memberPhone.slice(0, 3)}) ${user.memberPhone.slice(
                              3,
                              6,
                            )}-${user.memberPhone.slice(6)}`
                          : user.memberPhone
                        : 'No phone'}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            {/* Navigation Tabs */}
            <Stack className={'nav-tabs-container'}>
              <Stack className={'nav-tabs'}>
                <Typography
                  className={`nav-tab ${category === 'myProfile' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('myProfile');
                    router.push('/mypage?category=myProfile', undefined, { scroll: false });
                  }}
                >
                  Account settings
                </Typography>
                {user?.memberType === 'AGENT' && (
                  <>
                    <Typography
                      className={`nav-tab ${category === 'addProperty' ? 'active' : ''}`}
                      onClick={() => {
                        setCategory('addProperty');
                        router.push('/mypage?category=addProperty', undefined, { scroll: false });
                      }}
                    >
                      Add Property
                    </Typography>
                    <Typography
                      className={`nav-tab ${category === 'myProperties' ? 'active' : ''}`}
                      onClick={() => {
                        setCategory('myProperties');
                        router.push('/mypage?category=myProperties', undefined, { scroll: false });
                      }}
                    >
                      My Properties
                    </Typography>
                  </>
                )}
                {/* <Typography
                  className={`nav-tab ${category === 'myFavorites' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('myFavorites');
                    router.push('/mypage?category=myFavorites', undefined, { scroll: false });
                  }}
                >
                  My Favorites
                </Typography>
                <Typography
                  className={`nav-tab ${category === 'recentlyVisited' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('recentlyVisited');
                    router.push('/mypage?category=recentlyVisited', undefined, { scroll: false });
                  }}
                >
                  Recently Visited
                </Typography> */}
                <Typography
                  className={`nav-tab ${category === 'myArticles' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('myArticles');
                    router.push('/mypage?category=myArticles', undefined, { scroll: false });
                  }}
                >
                  Articles
                </Typography>
                <Typography
                  className={`nav-tab ${category === 'writeArticle' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('writeArticle');
                    router.push('/mypage?category=writeArticle', undefined, { scroll: false });
                  }}
                >
                  Write Article
                </Typography>
                <Typography
                  className={`nav-tab ${category === 'followers' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('followers');
                    router.push('/mypage?category=followers', undefined, { scroll: false });
                  }}
                >
                  My Followers
                </Typography>
                <Typography
                  className={`nav-tab ${category === 'followings' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('followings');
                    router.push('/mypage?category=followings', undefined, { scroll: false });
                  }}
                >
                  My Followings
                </Typography>
              </Stack>
            </Stack>

            {/* Main Content */}
            <Stack className={'main-content'}>
              <Stack className={'list-config'}>
                {category === 'addProperty' && <AddProperty />}
                {category === 'myProperties' && <MyProperties />}
                {/* {category === 'myFavorites' && <MyFavorites />} */}
                {/* {category === 'recentlyVisited' && <RecentlyVisited />} */}
                {category === 'myArticles' && <MyArticles />}
                {category === 'writeArticle' && <WriteArticle />}
                {category === 'myProfile' && <MyProfile />}
                {category === 'followers' && (
                  <MemberFollowers
                    subscribeHandler={subscribeHandler}
                    unsubscribeHandler={unsubscribeHandler}
                    likeMemberHandler={likeMemberHandler}
                    redirectToMemberPageHandler={redirectToMemberPageHandler}
                  />
                )}
                {category === 'followings' && (
                  <MemberFollowings
                    subscribeHandler={subscribeHandler}
                    unsubscribeHandler={unsubscribeHandler}
                    likeMemberHandler={likeMemberHandler}
                    redirectToMemberPageHandler={redirectToMemberPageHandler}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        </div>
      </div>
    );
  }
};

export default withLayoutBasic(MyPage);
