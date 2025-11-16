import { useQuery } from '@apollo/client';
import { Box, Stack } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { BoardArticle } from '../../types/board-article/board-article';
import { T } from '../../types/common';
import CommunityCard from './CommunityCard';

const CommunityBoards = () => {
  const device = useDeviceDetect();
  const [blogArticles, setBlogArticles] = useState<BoardArticle[]>([]);

  /** APOLLO REQUESTS **/
  useQuery(GET_BOARD_ARTICLES, {
    fetchPolicy: 'network-only',
    variables: {
      input: {
        page: 1,
        sort: 'createdAt',
        direction: 'DESC',
        limit: 2,
        search: {},
      },
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setBlogArticles(data?.getBoardArticles?.list || []);
    },
  });

  if (device === 'mobile') {
    return <div>COMMUNITY BOARDS (MOBILE)</div>;
  } else {
    return (
      <Stack className={'community-board'}>
        <Stack className={'container'}>
          <Stack className={'info-box'}>
            <Box component={'div'} className={'left'}>
              <span className={'label'}>[BLOG]</span>
              <span className={'title'}>Updates, Tips & Living Well</span>
            </Box>
            <Box component={'div'} className={'right'}>
              <Link href={'/community'}>
                <Box component={'div'} className={'view-blog-btn'}>
                  <span>View Blog</span>
                </Box>
              </Link>
            </Box>
          </Stack>
          <Stack className={'card-wrapper'}>
            {blogArticles.map((article: BoardArticle) => {
              return <CommunityCard key={article?._id} article={article} />;
            })}
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

export default CommunityBoards;
