import { Box, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { REACT_APP_API_URL } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Property } from '../../types/property/property';

interface PopularPropertyCardProps {
  property: Property;
}

const PopularPropertyCard = (props: PopularPropertyCardProps) => {
  const { property } = props;
  const device = useDeviceDetect();
  const router = useRouter();

  /** HANDLERS **/
  const pushDetailHandler = async (propertyId: string) => {
    console.log('propertyId:', propertyId);
    await router.push({ pathname: '/property/detail', query: { id: propertyId } });
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
