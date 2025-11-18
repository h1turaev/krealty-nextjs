import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Property } from '../../types/property/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface PropertyCardType {
  property: Property;
  likePropertyHandler?: any;
  myFavorites?: boolean;
  recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
  const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);
  const imagePath: string = property?.propertyImages[0]
    ? `${REACT_APP_API_URL}/${property?.propertyImages[0]}`
    : '/img/banner/header1.svg';

  if (device === 'mobile') {
    return <div>PROPERTY CARD</div>;
  } else {
    return (
      <Stack className="card-config">
        <Link
          href={{
            pathname: '/property/detail',
            query: { id: property?._id },
          }}
          className="card-link"
        >
          <Stack className="card-image-container">
            <img src={imagePath} alt={property.propertyTitle} className="card-image" />
            {property && property?.propertyRank > topPropertyRank && (
              <Box component={'div'} className={'top-badge'}>
                <img src="/img/icons/electricity.svg" alt="" />
                <Typography>TOP</Typography>
              </Box>
            )}
            <Stack className="card-overlay">
              <Stack className="card-overlay-left">
                <Typography className="card-title">{property.propertyTitle}</Typography>
                <Typography className="card-location">
                  {property.propertyLocation.toUpperCase()}
                </Typography>
              </Stack>
              <Stack className="card-overlay-right">
                <Typography className="card-price-label">Starting Price</Typography>
                <Typography className="card-price-value">
                  ${formatterStr(property?.propertyPrice)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Link>
      </Stack>
    );
  }
};

export default PropertyCard;
