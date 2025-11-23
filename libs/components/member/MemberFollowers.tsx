import { useQuery, useReactiveVar } from '@apollo/client';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { T } from '../../types/common';
import { Follower } from '../../types/follow/follow';
import { FollowInquiry } from '../../types/follow/follow.input';

interface MemberFollowsProps {
  initialInput: FollowInquiry;
  subscribeHandler: any;
  unsubscribeHandler: any;
  likeMemberHandler: any;
  redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
  const {
    initialInput,
    subscribeHandler,
    unsubscribeHandler,
    likeMemberHandler,
    redirectToMemberPageHandler,
  } = props;
  const device = useDeviceDetect();
  const router = useRouter();
  const [total, setTotal] = useState<number>(0);
  const category: any = router.query?.category ?? 'properties';
  const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
  const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
  const user = useReactiveVar(userVar);

  /** APOLLO REQUESTS **/
  const {
    loading: getMemberFollowersLoading,
    data: getMemberFollowersData,
    error: getMemberFollowersError,
    refetch: getMemberFollowersRefetch,
  } = useQuery(GET_MEMBER_FOLLOWERS, {
    fetchPolicy: 'network-only',
    variables: { input: followInquiry },
    skip: !followInquiry?.search?.followingId,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setMemberFollowers(data?.getMemberFollowers?.list);
      setTotal(data?.getMemberFollowers?.metaCounter[0]?.total);
    },
  });

  /** LIFECYCLES **/
  useEffect(() => {
    if (router.query.memberId) {
      setFollowInquiry({
        ...initialInput,
        page: 1,
        search: { followingId: router.query.memberId as string },
      });
    } else if (user?._id) {
      setFollowInquiry({ ...initialInput, page: 1, search: { followingId: user._id } });
    }
  }, [router.query.memberId, user?._id]);

  useEffect(() => {
    if (followInquiry?.search?.followingId) {
      getMemberFollowersRefetch().then();
    }
  }, [followInquiry]);

  /** HANDLERS **/
  const paginationHandler = (event: ChangeEvent<unknown>, value: number) => {
    setFollowInquiry({
      ...followInquiry,
      page: value,
    });
  };

  if (device === 'mobile') {
    return <div>HIGHLAND FOLLOWS MOBILE</div>;
  } else {
    return (
      <div id="member-follows-page">
        <Stack className="main-title-box">
          <Stack className="right-box">
            <Typography className="main-title">
              {category === 'followers' ? 'Followers' : 'Followings'}
            </Typography>
          </Stack>
        </Stack>
        <Stack className="follows-list-box">
          <Stack className="listing-title-box">
            <Typography className="title-text">Name</Typography>
            <Typography className="title-text">Details</Typography>
            <Typography className="title-text">Subscription</Typography>
          </Stack>
          {memberFollowers?.length === 0 && (
            <div className={'no-data'}>
              <img src="/img/icons/icoAlert.svg" alt="" />
              <p>No Followers yet!</p>
            </div>
          )}
          {memberFollowers.map((follower: Follower) => {
            const imagePath: string = follower?.followerData?.memberImage
              ? `${REACT_APP_API_URL}/${follower?.followerData?.memberImage}`
              : '/img/profile/defaultUser.svg';
            return (
              <Stack className="follows-card-box" key={follower._id}>
                <Stack
                  className={'info'}
                  onClick={() => redirectToMemberPageHandler(follower?.followerData?._id)}
                >
                  <Stack className="image-box">
                    <img src={imagePath} alt="" />
                  </Stack>
                  <Stack className="information-box">
                    <Typography className="name">{follower?.followerData?.memberNick}</Typography>
                  </Stack>
                </Stack>
                <Stack className={'details-box'}>
                  <Box className={'info-box'} component={'div'}>
                    <p>Followers</p>
                    <span>({follower?.followerData?.memberFollowers})</span>
                  </Box>
                  <Box className={'info-box'} component={'div'}>
                    <p>Followings</p>
                    <span>({follower?.followerData?.memberFollowings})</span>
                  </Box>
                  <Box className={'info-box'} component={'div'}>
                    {follower?.meLiked && follower?.meLiked[0]?.myFavorite ? (
                      <FavoriteIcon
                        sx={{
                          color: '#e92C28',
                          cursor: 'pointer',
                        }}
                        onClick={() =>
                          likeMemberHandler(
                            follower?.followerData?._id,
                            getMemberFollowersRefetch,
                            followInquiry,
                          )
                        }
                      />
                    ) : (
                      <FavoriteBorderIcon
                        sx={{
                          color: '#181a20',
                          '.dark-mode &': { color: 'rgba(255, 255, 255, 0.9)' },
                          cursor: 'pointer',
                        }}
                        onClick={() =>
                          likeMemberHandler(
                            follower?.followerData?._id,
                            getMemberFollowersRefetch,
                            followInquiry,
                          )
                        }
                      />
                    )}
                    <span>({follower?.followerData?.memberLikes})</span>
                  </Box>
                </Stack>
                {user?._id !== follower?.followerId && (
                  <Stack className="action-box">
                    {follower.meFollowed && follower.meFollowed[0]?.myFollowing ? (
                      <Button
                        className="all-properties-btn"
                        variant="outlined"
                        sx={{
                          padding: '10px 20px',
                          borderRadius: '20px',
                          background: '#f5f5f5',
                          border: 'none',
                          color: '#181a20',
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: 'normal',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          minWidth: 'auto',
                          height: 'auto',
                          width: 'auto',
                          textTransform: 'none',
                          ':hover': {
                            background: '#e8e8e8',
                            border: 'none',
                          },
                        }}
                        onClick={() =>
                          unsubscribeHandler(
                            follower?.followerData?._id,
                            getMemberFollowersRefetch,
                            followInquiry,
                          )
                        }
                      >
                        Unfollow
                      </Button>
                    ) : (
                      <Button
                        className="all-properties-btn"
                        variant="contained"
                        sx={{
                          padding: '10px 20px',
                          borderRadius: '20px',
                          background: '#f5f5f5',
                          border: 'none',
                          color: '#181a20',
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: 'normal',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          minWidth: 'auto',
                          height: 'auto',
                          width: 'auto',
                          textTransform: 'none',
                          boxShadow: 'none',
                          ':hover': {
                            background: '#e8e8e8',
                            boxShadow: 'none',
                          },
                        }}
                        onClick={() =>
                          subscribeHandler(
                            follower?.followerData?._id,
                            getMemberFollowersRefetch,
                            followInquiry,
                          )
                        }
                      >
                        Follow
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
            );
          })}
        </Stack>
        {memberFollowers.length !== 0 && (
          <Stack className="pagination-config">
            <Stack className="pagination-box">
              <Pagination
                page={followInquiry.page}
                count={Math.ceil(total / followInquiry.limit)}
                onChange={paginationHandler}
                shape="circular"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#181a20',
                    '&.Mui-selected': {
                      backgroundColor: '#181a20',
                      color: '#ffffff',
                    },
                  },
                }}
              />
            </Stack>
            <Stack className="total-result">
              <Typography>{total} followers</Typography>
            </Stack>
          </Stack>
        )}
      </div>
    );
  }
};

MemberFollowers.defaultProps = {
  initialInput: {
    page: 1,
    limit: 5,
    search: {
      followingId: '',
    },
  },
};

export default MemberFollowers;
