import { useReactiveVar } from '@apollo/client';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Box, Divider, Stack, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Property } from '../../types/property/property';

interface TrendPropertyCardProps {
  property: Property;
  likePropertyHandler: any;
  isHero?: boolean;
}

const TrendPropertyCard = (props: TrendPropertyCardProps) => {
  const { property, likePropertyHandler, isHero = false } = props;
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);

  /** HANDLERS **/
  const pushDetailHandler = async (propertyId: string) => {
    console.log('propertyId:', propertyId);
    await router.push({ pathname: '/property/detail', query: { id: propertyId } });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const getLocation = () => {
    // Extract city from propertyAddress or use propertyLocation
    if (property.propertyAddress) {
      const parts = property.propertyAddress.split(',');
      return parts[parts.length - 1]?.trim() || property.propertyAddress;
    }
    return property.propertyLocation || 'Location';
  };

  if (device === 'mobile') {
    return (
      <Stack className="trend-card-box" key={property._id}>
        <Box
          component={'div'}
          className={'card-img'}
          style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages[0]})` }}
          onClick={() => {
            pushDetailHandler(property._id);
          }}
        >
          <div>${property.propertyPrice}</div>
        </Box>
        <Box component={'div'} className={'info'}>
          <strong
            className={'title'}
            onClick={() => {
              pushDetailHandler(property._id);
            }}
          >
            {property.propertyTitle}
          </strong>
          <p className={'desc'}>{property.propertyDesc ?? 'no description'}</p>
          <div className={'options'}>
            <div>
              <img src="/img/icons/bed.svg" alt="" />
              <span>{property.propertyBeds} bed</span>
            </div>
            <div>
              <img src="/img/icons/room.svg" alt="" />
              <span>{property.propertyRooms} rooms</span>
            </div>
            <div>
              <img src="/img/icons/expand.svg" alt="" />
              <span>{property.propertySquare} m2</span>
            </div>
          </div>
          <Divider sx={{ mt: '15px', mb: '17px' }} />
          <div className={'bott'}>
            <p>
              {property.propertyRent ? 'Rent' : ''}{' '}
              {property.propertyRent && property.propertyBarter && '/'}{' '}
              {property.propertyBarter ? 'Barter' : ''}
            </p>
            <div className="view-like-box">
              <IconButton color={'default'}>
                <RemoveRedEyeIcon />
              </IconButton>
              <Typography className="view-cnt">{property?.propertyViews}</Typography>
              <IconButton color={'default'} onClick={() => likePropertyHandler(user, property._id)}>
                {property?.meLiked && property?.meLiked[0]?.myFavorite ? (
                  <FavoriteIcon style={{ color: 'red' }} />
                ) : (
                  <FavoriteIcon />
                )}
              </IconButton>
              <Typography className="view-cnt">{property?.propertyLikes}</Typography>
            </div>
          </div>
        </Box>
      </Stack>
    );
  } else {
    if (isHero) {
      return (
        <Box className="trend-card-box hero-card" onClick={() => pushDetailHandler(property._id)}>
          <Box
            component={'div'}
            className={'card-img'}
            style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages[0]})` }}
          >
            <Box className={'glass-overlay'}>
              <Box className={'overlay-content'}>
                <Box className={'property-info'}>
                  <Typography className={'property-name'}>{property.propertyTitle}</Typography>
                  <Typography className={'property-location'}>{getLocation()}</Typography>
                </Box>
                <Box className={'price-info'}>
                  <Typography className={'price-label'}>Starting Price</Typography>
                  <Typography className={'price-value'}>
                    ${formatPrice(property.propertyPrice)}/mo
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box className="trend-card-box small-card" onClick={() => pushDetailHandler(property._id)}>
          <Box
            component={'div'}
            className={'card-img'}
            style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages[0]})` }}
          >
            <Box className={'glass-overlay'}>
              <Box className={'overlay-content'}>
                <Box className={'property-info'}>
                  <Typography className={'property-name'}>{property.propertyTitle}</Typography>
                  <Typography className={'property-location'}>{getLocation()}</Typography>
                </Box>
                <Box className={'price-info'}>
                  <Typography className={'price-label'}>Starting Price</Typography>
                  <Typography className={'price-value'}>
                    ${formatPrice(property.propertyPrice)}/mo
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }
  }
};

export default TrendPropertyCard;
