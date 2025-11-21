import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box, Typography } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { BoardArticleCategory } from '../../enums/board-article.enum';

interface CommunityCardProps {
  boardArticle: BoardArticle;
  size?: string;
  likeArticleHandler: any;
  deleteArticleHandler?: any;
  showDeleteButton?: boolean;
}

const CommunityCard = (props: CommunityCardProps) => {
  const { boardArticle, size = 'normal', likeArticleHandler, deleteArticleHandler, showDeleteButton = false } = props;
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [isHovering, setIsHovering] = useState(false);

  const imagePath: string = boardArticle?.articleImage
    ? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
    : '/img/event.svg';

  const getCategoryLabel = (category: BoardArticleCategory) => {
    switch (category) {
      case BoardArticleCategory.NEWS:
        return 'TRENDS';
      case BoardArticleCategory.FREE:
        return 'COMMUNITY';
      case BoardArticleCategory.RECOMMEND:
        return 'LIVING TIPS';
      case BoardArticleCategory.HUMOR:
        return 'HUMOR';
      default:
        return category;
    }
  };

  // Strip HTML tags and get plain text
  const stripHtml = (html: string) => {
    if (typeof window !== 'undefined') {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    }
    // Server-side: simple regex to remove HTML tags
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  };

  // Get plain text content
  const plainTextContent = boardArticle?.articleContent ? stripHtml(boardArticle.articleContent) : '';

  // Truncate text to a reasonable length for card display
  const maxDescriptionLength = 150;
  const truncatedText =
    plainTextContent.length > maxDescriptionLength
      ? plainTextContent.substring(0, maxDescriptionLength) + '...'
      : plainTextContent;

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

  if (device === 'mobile') {
    return <div>COMMUNITY CARD MOBILE</div>;
  } else {
    return (
      <Box
        component={'div'}
        className={'blog-card'}
        sx={{
          width: 'calc((100% - 50px) / 3)',
          flex: '0 0 calc((100% - 50px) / 3)',
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={(e: React.MouseEvent<HTMLElement>) => chooseArticleHandler(e, boardArticle)}
      >
        {boardArticle?.articleImage && (
          <Box className={`article-image-container ${isHovering ? 'visible' : 'hidden'}`}>
            <img src={imagePath} alt={boardArticle?.articleTitle} className="article-image" />
          </Box>
        )}
        <Box className={`article-content-container ${isHovering ? 'hidden' : 'visible'}`}>
          <Box className={'article-header'}>
            <Typography className={'article-category'}>
              {getCategoryLabel(boardArticle?.articleCategory)}
            </Typography>
            <Typography className={'article-date'}>
              <Moment format="MMMM DD, YYYY">{boardArticle?.createdAt}</Moment>
            </Typography>
          </Box>
          <Typography className={'article-title'}>{boardArticle?.articleTitle}</Typography>
          <Typography className={'article-description'}>{truncatedText}</Typography>
          <Box className={'article-actions'}>
            <Box
              component="div"
              className="action-btn"
              onClick={(e: any) => {
                e.stopPropagation();
              }}
            >
              <Typography className="action-text">Views</Typography>
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
          </Box>
          <Box className={'read-more-container'}>
            <Box className={'read-more'}>
              <span>Read More</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
            {showDeleteButton && deleteArticleHandler && (
              <Box
                className={'delete-button'}
                onClick={(e: any) => {
                  e.stopPropagation();
                  deleteArticleHandler(e, boardArticle?._id);
                }}
              >
                <span>Delete</span>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }
};

export default CommunityCard;
