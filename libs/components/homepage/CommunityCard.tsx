import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { BoardArticle } from '../../types/board-article/board-article';

interface CommunityCardProps {
  article: BoardArticle;
}

const CommunityCard = (props: CommunityCardProps) => {
  const { article } = props;
  const device = useDeviceDetect();
  const [isHovering, setIsHovering] = useState(false);

  const articleImage = article?.articleImage
    ? `${REACT_APP_API_URL}/${article?.articleImage}`
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
  const plainTextContent = article?.articleContent ? stripHtml(article.articleContent) : '';

  if (device === 'mobile') {
    return <div>COMMUNITY CARD (MOBILE)</div>;
  } else {
    return (
      <Link
        href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}
      >
        <Box
          component={'div'}
          className={'blog-card'}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {article?.articleImage && (
            <Box className={`article-image-container ${isHovering ? 'visible' : 'hidden'}`}>
              <img src={articleImage} alt={article?.articleTitle} className="article-image" />
            </Box>
          )}
          <Box className={`article-content-container ${isHovering ? 'hidden' : 'visible'}`}>
            <Box className={'article-header'}>
              <Typography className={'article-category'}>
                {getCategoryLabel(article?.articleCategory)}
              </Typography>
              <Typography className={'article-date'}>
                <Moment format="MMMM DD, YYYY">{article?.createdAt}</Moment>
              </Typography>
            </Box>
            <Typography className={'article-title'}>{article?.articleTitle}</Typography>
            <Typography className={'article-description'}>{plainTextContent}</Typography>
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
          </Box>
        </Box>
      </Link>
    );
  }
};

export default CommunityCard;
