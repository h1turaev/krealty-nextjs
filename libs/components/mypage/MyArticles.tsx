import { LIKE_TARGET_BOARD_ARTICLE, REMOVE_BOARD_ARTICLE } from '@/apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '@/apollo/user/query';
import { Messages } from '@/libs/config';
import { showConfirm, showError, showSuccessTopRight } from '@/libs/toast';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Pagination, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import { useState } from 'react';
import { userVar } from '../../../apollo/store';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { BoardArticle } from '../../types/board-article/board-article';
import { T } from '../../types/common';
import CommunityCard from '../common/CommunityCard';

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);
  const [searchCommunity, setSearchCommunity] = useState({
    ...initialInput,
    search: { memberId: user._id },
  });
  const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  /** APOLLO REQUESTS **/
  const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
  const [removeBoardArticle] = useMutation(REMOVE_BOARD_ARTICLE);

  const {
    loading: boardArticlesLoading,
    data: boardArticlesData,
    error: boardArticlesError,
    refetch: boardArticlesRefetch,
  } = useQuery(GET_BOARD_ARTICLES, {
    fetchPolicy: 'network-only',
    variables: { input: searchCommunity },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setBoardArticles(data?.getBoardArticles?.list);
      setTotalCount(data?.getBoardArticles?.metaCounter?.[0]?.total);
    },
  });

  /** HANDLERS **/
  const paginationHandler = (e: T, value: number) => {
    setSearchCommunity({ ...searchCommunity, page: value });
  };

  const likeBoardArticleHandler = async (e: any, user: any, id: string) => {
    try {
      e.stopPropagation();
      if (!id) return;
      if (!user?._id) throw new Error(Messages.error2);

      await likeTargetBoardArticle({
        variables: { input: id },
      });

      await boardArticlesRefetch({ input: searchCommunity });
      await showSuccessTopRight('Success!', 750);
    } catch (err: any) {
      console.log('ERROR_likeBoArticleHandler:', err.message);
      await showError(err.message || 'An error occurred');
    }
  };

  const deleteArticleHandler = async (e: any, articleId: string) => {
    try {
      e.stopPropagation();
      if (!articleId) return;
      if (!user?._id) throw new Error(Messages.error2);

      const confirmed = await showConfirm('Are you sure you want to delete this article?');
      if (!confirmed) return;

      await removeBoardArticle({
        variables: { articleId: articleId },
      });

      await boardArticlesRefetch({ input: searchCommunity });
      await showSuccessTopRight('Article deleted successfully!', 750);
    } catch (err: any) {
      console.log('ERROR_deleteArticleHandler:', err.message);
      await showError(err.message || 'An error occurred');
    }
  };

  if (device === 'mobile') {
    return <>ARTICLE PAGE MOBILE</>;
  } else
    return (
      <div id="my-articles-page">
        <Stack className="main-title-box">
          <Stack className="right-box">
            <Typography className="main-title">Article</Typography>
            <Typography className="sub-title">We are glad to see you again!</Typography>
          </Stack>
        </Stack>
        <Stack className="article-list-box">
          {boardArticles?.length > 0 ? (
            boardArticles?.map((boardArticle: BoardArticle) => {
              const isOwner = boardArticle?.memberId === user?._id;
              return (
                <CommunityCard
                  boardArticle={boardArticle}
                  key={boardArticle?._id}
                  size={'small'}
                  likeArticleHandler={likeBoardArticleHandler}
                  deleteArticleHandler={deleteArticleHandler}
                  showDeleteButton={isOwner}
                />
              );
            })
          ) : (
            <div className={'no-data'}>
              <img src="/img/icons/icoAlert.svg" alt="" />
              <p>No Articles found!</p>
            </div>
          )}
        </Stack>

        {boardArticles?.length > 0 && (
          <Stack className="pagination-conf">
            <Stack className="pagination-box">
              <Pagination
                count={Math.ceil(totalCount / searchCommunity.limit)}
                page={searchCommunity.page}
                shape="circular"
                onChange={paginationHandler}
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
            <Stack className="total">
              <Typography>Total {totalCount ?? 0} article(s) available</Typography>
            </Stack>
          </Stack>
        )}
      </div>
    );
};

MyArticles.defaultProps = {
  initialInput: {
    page: 1,
    limit: 6,
    sort: 'createdAt',
    direction: 'DESC',
    search: {},
  },
};

export default MyArticles;
