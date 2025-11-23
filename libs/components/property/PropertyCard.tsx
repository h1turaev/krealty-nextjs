import { useReactiveVar } from '@apollo/client';
import BedIcon from '@mui/icons-material/Bed';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { useDarkMode } from '../../hooks/useDarkMode';
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
  const { isDarkMode } = useDarkMode();
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
              <Stack
                className="card-details-section"
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                {/* Left side - Property details with icons */}
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  className="card-details-left"
                >
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    className="card-detail-item"
                  >
                    <MeetingRoomIcon
                      className="card-detail-icon"
                      sx={{
                        fontSize: '18px',
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        transition: 'color 0.3s ease',
                      }}
                    />
                    <Typography
                      className="card-detail-text"
                      sx={{
                        fontSize: '14px',
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        fontWeight: 500,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {property?.propertyRooms || 0}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    className="card-detail-item"
                  >
                    <BedIcon
                      className="card-detail-icon"
                      sx={{
                        fontSize: '18px',
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        transition: 'color 0.3s ease',
                      }}
                    />
                    <Typography
                      className="card-detail-text"
                      sx={{
                        fontSize: '14px',
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        fontWeight: 500,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {property?.propertyBeds || 0}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    className="card-detail-item"
                  >
                    <SquareFootIcon
                      className="card-detail-icon"
                      sx={{
                        fontSize: '18px',
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        transition: 'color 0.3s ease',
                      }}
                    />
                    <Typography
                      className="card-detail-text"
                      sx={{
                        fontSize: '14px',
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        fontWeight: 500,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {property?.propertySquare || 0} m²
                    </Typography>
                  </Stack>
                </Stack>
                {/* Right side - Price */}
                <Stack className="card-price-section" alignItems="flex-end">
                  <Typography className="card-price-label">Starting Price</Typography>
                  <Typography className="card-price-value">
                    ${formatterStr(property?.propertyPrice)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Link>
      </Stack>
    );
  }
};

export default PropertyCard;
