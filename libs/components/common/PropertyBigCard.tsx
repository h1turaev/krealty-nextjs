import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface PropertyBigCardProps {
  property: Property;
  likePropertyHandler?: any;
}

const PropertyBigCard = (props: PropertyBigCardProps) => {
  const { property, likePropertyHandler } = props;
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);
  const router = useRouter();

  /** HANDLERS **/
  const goPropertyDetatilPage = (propertyId: string) => {
    router.push(`/property/detail?id=${propertyId}`);
  };

  if (device === 'mobile') {
    return <div>APARTMEND BIG CARD</div>;
  } else {
    return (
      <Stack className="property-big-card-box" onClick={() => goPropertyDetatilPage(property?._id)}>
        <Box
          component={'div'}
          className={'card-img'}
          style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages?.[0]})` }}
        >
          {property && property?.propertyRank >= topPropertyRank && (
            <div className={'status'}>
              <img src="/img/icons/electricity.svg" alt="" />
              <span>top</span>
            </div>
          )}
          <Box component={'div'} className={'image-overlay'}>
            <Stack className={'overlay-content'}>
              <Stack className={'overlay-left'}>
                <Typography className={'overlay-title'}>{property?.propertyTitle}</Typography>
                <Typography className={'overlay-location'}>
                  {property?.propertyLocation?.toUpperCase()}
                </Typography>
              </Stack>
              <Stack className={'overlay-right'}>
                <Typography className={'overlay-price-label'}>Starting Price</Typography>
                <Typography className={'overlay-price-value'}>
                  ${formatterStr(property?.propertyPrice)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Stack>
    );
  }
};

export default PropertyBigCard;
