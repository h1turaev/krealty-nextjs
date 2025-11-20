import { useQuery } from '@apollo/client';
import { Box, Button, List, ListItem, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { GET_MEMBER } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { T } from '../../types/common';
import { Member } from '../../types/member/member';

interface MemberMenuProps {
  subscribeHandler: any;
  unsubscribeHandler: any;
}

const MemberMenu = (props: MemberMenuProps) => {
  const { subscribeHandler, unsubscribeHandler } = props;
  const device = useDeviceDetect();
  const router = useRouter();
  const category: any = router.query?.category;
  const [member, setMember] = useState<Member | null>(null);
  const { memberId } = router.query;

  /** APOLLO REQUESTS **/
  const {
    loading: getMemberLoading,
    data: getMemberData,
    error: getMemberError,
    refetch: getMemberRefetch,
  } = useQuery(GET_MEMBER, {
    fetchPolicy: 'network-only',
    variables: { input: memberId },
    skip: !memberId,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setMember(data?.getMember);
    },
  });

  if (device === 'mobile') {
    return <div>MEMBER MENU MOBILE</div>;
  } else {
    return (
      <Stack width={'100%'} padding={'30px 24px'}>
        <Stack className={'profile'}>
          <Box component={'div'} className={'profile-img'}>
            <img
              src={
                member?.memberImage
                  ? `${REACT_APP_API_URL}/${member?.memberImage}`
                  : '/img/profile/defaultUser.svg'
              }
              alt={'member-photo'}
            />
          </Box>
          <Stack className={'user-info'}>
            <Typography className={'user-name'}>{member?.memberNick}</Typography>
            <Box component={'div'} className={'user-phone'}>
              <Typography className={'p-number'}>{member?.memberPhone}</Typography>
            </Box>
            <Typography className={'view-list'}>{member?.memberType}</Typography>
          </Stack>
        </Stack>
        <Stack className="follow-button-box">
          {member?.meFollowed && member?.meFollowed[0]?.myFollowing ? (
            <>
              <Button
                className="all-properties-btn"
                variant="outlined"
                sx={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  background: '#181a20 !important',
                  border: 'none',
                  color: '#ffffff !important',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  height: 'auto',
                  textTransform: 'none',
                  ':hover': {
                    background: '#2a2d35 !important',
                    border: 'none',
                  },
                }}
                onClick={() => unsubscribeHandler(member?._id, getMemberRefetch, memberId)}
              >
                Unfollow
              </Button>{' '}
            </>
          ) : (
            <Button
              className="all-properties-btn"
              variant="contained"
              sx={{
                padding: '10px 20px',
                borderRadius: '20px',
                background: '#181a20 !important',
                border: 'none',
                color: '#ffffff !important',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 'normal',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
                height: 'auto',
                textTransform: 'none',
                boxShadow: 'none',
                ':hover': {
                  background: '#2a2d35 !important',
                  boxShadow: 'none',
                },
              }}
              onClick={() => subscribeHandler(member?._id, getMemberRefetch, memberId)}
            >
              Follow
            </Button>
          )}
        </Stack>
        <Stack className={'sections'}>
          <Stack className={'section'}>
            <Typography className="title" variant={'h5'}>
              Details
            </Typography>
            <List className={'sub-section'}>
              {member?.memberType === 'AGENT' && (
                <ListItem className={category === 'properties' ? 'focus' : ''}>
                  <Link
                    href={{
                      pathname: '/member',
                      query: { ...router.query, category: 'properties' },
                    }}
                    scroll={false}
                    style={{ width: '100%' }}
                  >
                    <div className={'flex-box'}>
                      <Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
                        Properties
                      </Typography>
                      <Typography className="count-title" variant="subtitle1">
                        {member?.memberProperties}
                      </Typography>
                    </div>
                  </Link>
                </ListItem>
              )}
              <ListItem className={category === 'followers' ? 'focus' : ''}>
                <Link
                  href={{
                    pathname: '/member',
                    query: { ...router.query, category: 'followers' },
                  }}
                  scroll={false}
                  style={{ width: '100%' }}
                >
                  <div className={'flex-box'}>
                    <Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
                      Followers
                    </Typography>
                    <Typography className="count-title" variant="subtitle1">
                      {member?.memberFollowers}
                    </Typography>
                  </div>
                </Link>
              </ListItem>
              <ListItem className={category === 'followings' ? 'focus' : ''}>
                <Link
                  href={{
                    pathname: '/member',
                    query: { ...router.query, category: 'followings' },
                  }}
                  scroll={false}
                  style={{ width: '100%' }}
                >
                  <div className={'flex-box'}>
                    <Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
                      Followings
                    </Typography>
                    <Typography className="count-title" variant="subtitle1">
                      {member?.memberFollowings}
                    </Typography>
                  </div>
                </Link>
              </ListItem>
            </List>
          </Stack>
          <Stack className={'section'} sx={{ marginTop: '10px' }}>
            <div>
              <Typography className="title" variant={'h5'}>
                Community
              </Typography>
              <List className={'sub-section'}>
                <ListItem className={category === 'articles' ? 'focus' : ''}>
                  <Link
                    href={{
                      pathname: '/member',
                      query: { ...router.query, category: 'articles' },
                    }}
                    scroll={false}
                    style={{ width: '100%' }}
                  >
                    <div className={'flex-box'}>
                      <Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
                        Articles
                      </Typography>
                      <Typography className="count-title" variant="subtitle1">
                        {member?.memberArticles}
                      </Typography>
                    </div>
                  </Link>
                </ListItem>
              </List>
            </div>
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

export default MemberMenu;
