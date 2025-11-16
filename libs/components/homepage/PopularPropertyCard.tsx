import { useReactiveVar } from '@apollo/client';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { T } from '../../types/common';
import { Property } from '../../types/property/property';

interface PopularPropertyCardProps {
  property: Property;
  likePropertyHandler?: (user: T, id: string) => void;
}

const PopularPropertyCard = (props: PopularPropertyCardProps) => {
  const { property, likePropertyHandler } = props;
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);

  /** HANDLERS **/
  const pushDetailHandler = async (propertyId: string) => {
    await router.push({ pathname: '/property/detail', query: { id: propertyId } });
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?._id && likePropertyHandler) {
      likePropertyHandler(user, property._id);
    }
  };

  if (device === 'mobile') {
    return (
      <Stack className="featured-card-box">
        <Box
          component={'div'}
          className={'card-img'}
          style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages[0]})` }}
          onClick={() => {
            pushDetailHandler(property._id);
          }}
        >
          <div className={'overlay'}>
            <div className={'overlay-content'}>
              <div className={'left-info'}>
                <h3 className={'property-name'}>{property.propertyTitle}</h3>
                <p className={'location'}>{property.propertyAddress}</p>
              </div>
              <div className={'right-info'}>
                <p className={'price-label'}>Starting Price</p>
                <p className={'price'}>
                  ${property.propertyPrice}
                  {property?.propertyRent ? '/mo' : ''}
                </p>
              </div>
            </div>
          </div>
        </Box>
      </Stack>
    );
  } else {
    return (
      <Stack className="featured-card-box">
        <Box
          component={'div'}
          className={'card-img'}
          style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages[0]})` }}
          onClick={() => {
            pushDetailHandler(property._id);
          }}
        >
          {/* Hover view and like icons */}
          <Box className={'hover-icons'}>
            <Box className={'hover-icon-item'}>
              <Typography className={'hover-icon-count'}>{property?.propertyViews || 0}</Typography>
              <Typography className={'hover-icon-text'}>Views</Typography>
            </Box>
            <Box className={'hover-icon-item'}>
              <IconButton
                className={'hover-icon-button'}
                onClick={handleLikeClick}
                sx={{
                  color:
                    property?.meLiked && property?.meLiked[0]?.myFavorite ? '#ff0000' : '#ffffff',
                  padding: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {property?.meLiked && property?.meLiked[0]?.myFavorite ? (
                  <FavoriteIcon sx={{ fontSize: 16 }} />
                ) : (
                  <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
              <Typography className={'hover-icon-count'}>{property?.propertyLikes || 0}</Typography>
            </Box>
          </Box>
          <div className={'overlay'}>
            <div className={'overlay-content'}>
              <div className={'left-info'}>
                <h3 className={'property-name'}>{property.propertyTitle}</h3>
                <p className={'location'}>{property.propertyAddress}</p>
              </div>
              <div className={'right-info'}>
                <p className={'price-label'}>Starting Price</p>
                <p className={'price'}>
                  ${property.propertyPrice}
                  {property?.propertyRent ? '/mo' : ''}
                </p>
              </div>
            </div>
          </div>
        </Box>
      </Stack>
    );
  }
};

export default PopularPropertyCard;
