import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Box, Button, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { userVar } from '../../apollo/store';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_MEMBER } from '../../apollo/user/query';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MemberArticles from '../../libs/components/member/MemberArticles';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import MemberProperties from '../../libs/components/member/MemberProperties';
import { REACT_APP_API_URL } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { showError, showSuccessTopRight } from '../../libs/toast';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/types/member/member';

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const AgentDetail: NextPage = () => {
  const device = useDeviceDetect();
  const router = useRouter();
  const [category, setCategory] = useState<string>('properties');
  // Support both memberId and agentId query params for backward compatibility
  const { memberId, agentId } = router.query;
  const actualMemberId = (memberId || agentId) as string;
  const user = useReactiveVar(userVar);
  const [member, setMember] = useState<Member | null>(null);

  /** APOLLO REQUESTS **/
  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

  const {
    loading: getMemberLoading,
    data: getMemberData,
    error: getMemberError,
    refetch: getMemberRefetch,
  } = useQuery(GET_MEMBER, {
    fetchPolicy: 'network-only',
    variables: { input: actualMemberId },
    skip: !actualMemberId,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setMember(data?.getMember);
    },
  });

  /** LIFECYCLES **/
  useEffect(() => {
    if (!router.isReady) return;
    const queryCategory = router.query?.category as string;
    if (queryCategory) {
      setCategory(queryCategory);
    } else {
      setCategory('properties');
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, category: 'properties' },
        },
        undefined,
        { shallow: true },
      );
    }
  }, [router.isReady, router.query?.category]);

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
      await showSuccessTopRight('Subscribed!', 800);
      await refetch({ input: query });
      await getMemberRefetch();
    } catch (err: any) {
      showError(err.message || 'An error occurred');
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
      await showSuccessTopRight('Unsubscribed!', 800);
      await refetch({ input: query });
      await getMemberRefetch();
    } catch (err: any) {
      showError(err.message || 'An error occurred');
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
      await showSuccessTopRight('Success', 800);
      await refetch({ input: query });
    } catch (err: any) {
      console.log('ERROR, likeMemberHandler:', err.message);
      showError(err.message || 'An error occurred');
    }
  };

  const redirectToMemberPageHandler = async (memberId: string) => {
    try {
      if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
      else await router.push(`/member?memberId=${memberId}&category=properties`);
    } catch (error) {
      await showError((error as any)?.message || 'An error occurred');
    }
  };

  if (device === 'mobile') {
    return <>AGENT DETAIL PAGE MOBILE</>;
  } else {
    return (
      <div id="member-page">
        <div className="container">
          <Stack className={'member-page'}>
            {/* Top Profile Header */}
            <Stack className={'profile-header'}>
              <Stack className={'profile-header-content'}>
                <Stack className={'profile-info'}>
                  <Box className={'profile-img-wrapper'}>
                    <img
                      src={
                        member?.memberImage
                          ? `${REACT_APP_API_URL}/${member?.memberImage}`
                          : '/img/profile/defaultUser.svg'
                      }
                      alt="profile"
                      className={'profile-img'}
                    />
                  </Box>
                  <Stack className={'profile-details'}>
                    <Typography className={'profile-name'}>
                      {member?.memberNick || member?.memberFullName || 'Member'}
                    </Typography>
                    <Typography className={'profile-phone'}>
                      {member?.memberPhone
                        ? member.memberPhone.length >= 10
                          ? `(${member.memberPhone.slice(0, 3)}) ${member.memberPhone.slice(
                              3,
                              6,
                            )}-${member.memberPhone.slice(6)}`
                          : member.memberPhone
                        : 'No phone'}
                    </Typography>
                    <Typography className={'profile-type'}>{member?.memberType || ''}</Typography>
                  </Stack>
                </Stack>
                {member && member?._id !== user?._id && (
                  <Stack
                    className={'follow-button-wrapper'}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    {member?.meFollowed && member?.meFollowed[0]?.myFollowing ? (
                      <Button
                        className="follow-button"
                        variant="outlined"
                        onClick={() =>
                          unsubscribeHandler(member?._id, getMemberRefetch, actualMemberId)
                        }
                      >
                        Unfollow
                      </Button>
                    ) : (
                      <Button
                        className="follow-button"
                        variant="contained"
                        onClick={() =>
                          subscribeHandler(member?._id, getMemberRefetch, actualMemberId)
                        }
                      >
                        Follow
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
            </Stack>

            {/* Navigation Tabs */}
            <Stack className={'nav-tabs-container'}>
              <Stack className={'nav-tabs'}>
                {member?.memberType === 'AGENT' && (
                  <Typography
                    className={`nav-tab ${category === 'properties' ? 'active' : ''}`}
                    onClick={() => {
                      setCategory('properties');
                      router.push(
                        {
                          pathname: router.pathname,
                          query: { ...router.query, category: 'properties' },
                        },
                        undefined,
                        { scroll: false },
                      );
                    }}
                  >
                    Properties
                  </Typography>
                )}
                <Typography
                  className={`nav-tab ${category === 'followers' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('followers');
                    router.push(
                      {
                        pathname: router.pathname,
                        query: { ...router.query, category: 'followers' },
                      },
                      undefined,
                      { scroll: false },
                    );
                  }}
                >
                  Followers
                </Typography>
                <Typography
                  className={`nav-tab ${category === 'followings' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('followings');
                    router.push(
                      {
                        pathname: router.pathname,
                        query: { ...router.query, category: 'followings' },
                      },
                      undefined,
                      { scroll: false },
                    );
                  }}
                >
                  Followings
                </Typography>
                <Typography
                  className={`nav-tab ${category === 'articles' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('articles');
                    router.push(
                      {
                        pathname: router.pathname,
                        query: { ...router.query, category: 'articles' },
                      },
                      undefined,
                      { scroll: false },
                    );
                  }}
                >
                  Articles
                </Typography>
              </Stack>
            </Stack>

            {/* Main Content */}
            <Stack className={'main-content'}>
              {category === 'properties' && <MemberProperties />}
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
              {category === 'articles' && <MemberArticles />}
            </Stack>
          </Stack>
        </div>
      </div>
    );
  }
};

export default withLayoutBasic(AgentDetail);
