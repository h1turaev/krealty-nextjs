import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Box, Stack } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { userVar } from '../../../apollo/store';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { Message } from '../../enums/common.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import PopularPropertyCard from './PopularPropertyCard';

interface PopularPropertiesProps {
  initialInput: PropertiesInquiry;
}

const PopularProperties = (props: PopularPropertiesProps) => {
  const { initialInput } = props;
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);
  const [popularProperties, setPopularProperties] = useState<Property[]>([]);

  /** APOLLO REQUESTS **/
  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

  const {
    loading: getPropertiesLoading,
    data: getPropertiesData,
    error: getPropertiesError,
    refetch: getPropertiesRefetch,
  } = useQuery(GET_PROPERTIES, {
    fetchPolicy: 'cache-and-network',
    variables: { input: initialInput },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setPopularProperties(data?.getProperties?.list);
    },
  });

  /** HANDLERS **/
  const likePropertyHandler = async (user: T, id: string) => {
    try {
      if (!id) return;
      if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

      await likeTargetProperty({
        variables: { input: id },
      });
      await getPropertiesRefetch({ input: initialInput });

      await sweetTopSmallSuccessAlert('success', 800);
    } catch (err: any) {
      console.log('ERROR, likePropertyHandler:', err.message);
      sweetMixinErrorAlert(err.message).then();
    }
  };

  if (!popularProperties) return null;

  if (device === 'mobile') {
    return (
      <Stack className={'featured-properties'}>
        <Stack className={'container'}>
          <Stack className={'header-box'}>
            <span className={'label'}>[FEATURED PROPERTIES]</span>
            <span className={'title'}>Discover Our Most Featured Properties</span>
          </Stack>
          <Stack className={'card-box'}>
            <Swiper
              className={'featured-property-swiper'}
              slidesPerView={'auto'}
              centeredSlides={true}
              spaceBetween={25}
              modules={[Autoplay]}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                stopOnLastSlide: false,
              }}
            >
              {popularProperties.map((property: Property) => {
                return (
                  <SwiperSlide key={property._id} className={'featured-property-slide'}>
                    <PopularPropertyCard
                      property={property}
                      likePropertyHandler={likePropertyHandler}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </Stack>
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack className={'featured-properties'}>
        <Stack className={'container'}>
          <Stack className={'header-box'}>
            <Box component={'div'} className={'left'}>
              <span className={'label'}>[FEATURED PROPERTIES]</span>
              <span className={'title'}>Discover Our Most Featured Properties</span>
            </Box>
            <Box component={'div'} className={'right'}>
              <Link href={'/property'}>
                <button className={'all-properties-btn'}>All Properties</button>
              </Link>
            </Box>
          </Stack>
          <Stack className={'card-box'}>
            <Swiper
              className={'featured-property-swiper'}
              slidesPerView={'auto'}
              spaceBetween={25}
              modules={[Autoplay]}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                stopOnLastSlide: false,
              }}
            >
              {popularProperties.map((property: Property) => {
                return (
                  <SwiperSlide key={property._id} className={'featured-property-slide'}>
                    <PopularPropertyCard
                      property={property}
                      likePropertyHandler={likePropertyHandler}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

PopularProperties.defaultProps = {
  initialInput: {
    page: 1,
    limit: 7,
    sort: 'propertyViews',
    direction: 'DESC',
    search: {},
  },
};

export default PopularProperties;
