import { useQuery } from '@apollo/client';
import { Pagination, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import CommunityCard from '../../libs/components/homepage/CommunityCard';
import CTASection from '../../libs/components/homepage/CTASection';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
  const device = useDeviceDetect();
  const router = useRouter();
  const { query } = router;
  const articleCategory = query?.articleCategory as string;
  const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>(initialInput);
  const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  if (articleCategory) initialInput.search.articleCategory = articleCategory;

  const {
    loading: boardArticlesLoading,
    data: boardArticlesData,
    error: getBoardArticlesError,
    refetch: boardArticlesRefetch,
  } = useQuery(GET_BOARD_ARTICLES, {
    fetchPolicy: 'cache-and-network',
    variables: {
      input: searchCommunity,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setBoardArticles(data?.getBoardArticles?.list);
      setTotalCount(data?.getBoardArticles?.metaCounter?.[0]?.total);
    },
  });

  /** LIFECYCLES **/
  useEffect(() => {
    if (articleCategory) {
      setSearchCommunity({
        ...searchCommunity,
        page: 1,
        search: { articleCategory: articleCategory as BoardArticleCategory },
      });
    } else {
      // If no category in URL, show all articles
      setSearchCommunity({
        ...searchCommunity,
        page: 1,
        search: {} as any,
      });
    }
  }, [articleCategory]);

  /** HANDLERS **/
  const paginationHandler = (e: T, value: number) => {
    setSearchCommunity({ ...searchCommunity, page: value });
  };

  const getCategoryValue = (label: string) => {
    switch (label) {
      case 'Trends':
        return BoardArticleCategory.NEWS;
      case 'Community':
        return BoardArticleCategory.FREE;
      case 'Living Tips':
        return BoardArticleCategory.RECOMMEND;
      case 'Neighborhood':
        return BoardArticleCategory.HUMOR;
      default:
        return null;
    }
  };

  const handleCategoryClick = (category: string) => {
    if (category === 'All') {
      // For "All", remove category filter to show all articles
      setSearchCommunity({
        ...searchCommunity,
        page: 1,
        search: {} as any, // Bypass type check to allow empty search for "All"
      });
      router.push(
        {
          pathname: '/community',
        },
        router.pathname,
        { shallow: true },
      );
    } else {
      const categoryValue = getCategoryValue(category);
      if (categoryValue) {
        setSearchCommunity({
          ...searchCommunity,
          page: 1,
          search: { articleCategory: categoryValue },
        });
        router.push(
          {
            pathname: '/community',
            query: { articleCategory: categoryValue },
          },
          router.pathname,
          { shallow: true },
        );
      }
    }
  };

  if (device === 'mobile') {
    return <h1>COMMUNITY PAGE MOBILE</h1>;
  } else {
    return (
      <div id="community-list-page">
        <div className="container">
          <Stack className="community-content">
            <Stack className="filter-nav">
              <Typography
                className={`filter-tab ${!articleCategory ? 'active' : ''}`}
                onClick={() => handleCategoryClick('All')}
              >
                All
              </Typography>
              <Typography
                className={`filter-tab ${
                  searchCommunity.search.articleCategory === BoardArticleCategory.RECOMMEND
                    ? 'active'
                    : ''
                }`}
                onClick={() => handleCategoryClick('Living Tips')}
              >
                Living Tips
              </Typography>
              <Typography
                className={`filter-tab ${
                  searchCommunity.search.articleCategory === BoardArticleCategory.FREE
                    ? 'active'
                    : ''
                }`}
                onClick={() => handleCategoryClick('Community')}
              >
                Community
              </Typography>
              <Typography
                className={`filter-tab ${
                  searchCommunity.search.articleCategory === BoardArticleCategory.NEWS
                    ? 'active'
                    : ''
                }`}
                onClick={() => handleCategoryClick('Trends')}
              >
                Trends
              </Typography>

              <Typography
                className={`filter-tab ${
                  searchCommunity.search.articleCategory === BoardArticleCategory.HUMOR
                    ? 'active'
                    : ''
                }`}
                onClick={() => handleCategoryClick('Neighborhood')}
              >
                Neighborhood
              </Typography>
            </Stack>

            <Stack className="card-wrapper">
              {totalCount > 0 ? (
                boardArticles?.map((boardArticle: BoardArticle) => {
                  return <CommunityCard article={boardArticle} key={boardArticle?._id} />;
                })
              ) : (
                <Stack className={'no-data'}>
                  <img src="/img/icons/icoAlert.svg" alt="" />
                  <p>No Article found!</p>
                </Stack>
              )}
            </Stack>

            {totalCount > 0 && (
              <Stack className="pagination-config">
                <Stack className="pagination-box">
                  <Pagination
                    count={Math.ceil(totalCount / searchCommunity.limit)}
                    page={searchCommunity.page}
                    shape="circular"
                    color="primary"
                    onChange={paginationHandler}
                  />
                </Stack>
                <Stack className="total-result">
                  <Typography>
                    Total {totalCount} article{totalCount > 1 ? 's' : ''} available
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>

          <CTASection />
        </div>
      </div>
    );
  }
};

Community.defaultProps = {
  initialInput: {
    page: 1,
    limit: 6,
    sort: 'createdAt',
    direction: 'ASC',
    search: {} as any, // Default to "All" - no category filter
  },
};

export default withLayoutBasic(Community);
