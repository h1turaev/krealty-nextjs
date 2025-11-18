import { useReactiveVar } from '@apollo/client';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Property } from '../../types/property/property';
import { formatterStr } from '../../utils';

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
    : '/img/banner/basiclaybanner.jpg';

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
          <Stack className="card-content-wrapper">
            <Stack className="card-image-section">
              <img src={imagePath} alt={property.propertyTitle} className="card-image" />
              {property && property?.propertyRank > topPropertyRank && (
                <Box component={'div'} className={'top-badge'}>
                  <img src="/img/icons/electricity.svg" alt="" />
                  <Typography>TOP</Typography>
                </Box>
              )}
            </Stack>
            <Stack className="card-text-section">
              <Typography className="card-title">{property.propertyTitle}</Typography>
              <Typography className="card-location">
                {property.propertyLocation.toUpperCase()}
              </Typography>
              <Box className="card-divider"></Box>
              <Typography className="card-description">
                {property.propertyDesc ||
                  'Sleek, contemporary apartments offering modern living with premium amenities.'}
              </Typography>
              <Box className="card-divider"></Box>
              <Stack className="card-price-section">
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
