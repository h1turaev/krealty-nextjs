import React from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography, Box } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface CommunityCardProps {
  boardArticle: BoardArticle;
  size?: string;
  likeArticleHandler: any;
}

const CommunityCard = (props: CommunityCardProps) => {
  const { boardArticle, size = 'normal', likeArticleHandler } = props;
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const imagePath: string = boardArticle?.articleImage
    ? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
    : '/img/community/communityImg.png';

  /** HANDLERS **/
  const chooseArticleHandler = (e: React.SyntheticEvent, boardArticle: BoardArticle) => {
    router.push(
      {
        pathname: '/community/detail',
        query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
      },
      undefined,
      { shallow: true },
    );
  };

  const goMemberPage = (id: string) => {
    if (id === user?._id) router.push('/mypage');
    else router.push(`/member?memberId=${id}`);
  };

  if (device === 'mobile') {
    return <div>COMMUNITY CARD MOBILE</div>;
  } else {
    return (
      <Stack
        sx={{ width: size === 'small' ? '285px' : '317px' }}
        className="community-general-card-config"
        onClick={(e: React.MouseEvent<HTMLElement>) => chooseArticleHandler(e, boardArticle)}
      >
        <Stack className="image-box">
          <img src={imagePath} alt="" className="card-img" />
          <Stack className="overlay-box">
            <Stack className="overlay-content">
              <Stack className="left-content">
                <Typography className="article-title">{boardArticle?.articleTitle}</Typography>
                <Typography className="article-location">
                  {boardArticle?.memberData?.memberNick?.toUpperCase() || 'LOCATION'}
                </Typography>
              </Stack>
              <Stack className="right-content">
                <Typography className="price-label">Starting Price</Typography>
                <Typography className="article-price">
                  {boardArticle?.articleViews || 0} views
                </Typography>
              </Stack>
            </Stack>
            <Stack className="overlay-actions">
              <Box
                component="div"
                className="action-btn"
                onClick={(e: any) => {
                  e.stopPropagation();
                }}
              >
                <RemoveRedEyeIcon />
                <Typography className="action-count">{boardArticle?.articleViews || 0}</Typography>
              </Box>
              <Box
                component="div"
                className="action-btn"
                onClick={(e: any) => {
                  e.stopPropagation();
                  likeArticleHandler(e, user, boardArticle?._id);
                }}
              >
                {boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
                  <FavoriteIcon className="favorite-icon liked" />
                ) : (
                  <FavoriteBorderIcon className="favorite-icon" />
                )}
                <Typography className="action-count">{boardArticle?.articleLikes || 0}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

export default CommunityCard;
