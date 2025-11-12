import React, { use, useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import TrendPropertyCard from './TrendPropertyCard';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';

interface TrendPropertiesProps {
  initialInput: PropertiesInquiry;
}

const TrendProperties = (props: TrendPropertiesProps) => {
  const { initialInput } = props;
  const device = useDeviceDetect();
  const [trendProperties, setTrendProperties] = useState<Property[]>([]);

  /** APOLLO REQUESTS **/
  // Simulating fetching trend properties
  // Bu yerda likeTargetProperty mutation hooki yordamida property-ni like qilish uchun funksiya olinadi
  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

  // Bu qismda esa, trend (trenddagi) propertylar ro'yxati olish uchun Apollo useQuery hooki ishlatiladi.
  // useQuery GET_PROPERTIES query-sini serverga yuboradi va natijada trenndagi propertylar olinadi.
  // fetchPolicy: 'cache-and-network' – ma'lumotni keshdan va tarmoqdan birga olib keladi.
  // variables – query uchun kerakli kirish parametrlari (initialInput orqali yuboriladi).
  // notifyOnNetworkStatusChange true bo'lsa, tarmoq statusi o'zgarganda komponent qayta render qilinadi.
  // onCompleted – query muvaffaqiyatli tugagach, kelgan trend propertylar setTrendProperties orqali local state-ga yozib olinadi.
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
      setTrendProperties(data?.getProperties?.list);
    },
  });
  /** HANDLERS **/
  /**
   * likePropertyHandler funksiyasi foydalanuvchi (user) va property ID sini oladi.
   * Avval property ID tekshiradi (agar yo'q bo'lsa, hech narsa qilmaydi).
   * So‘ng foydalanuvchi tizimga kirganini tekshiradi (user._id mavjudmi, aks holda xatolik chiqaradi).
   * Agar hammasi joyida bo‘lsa, LIKE_TARGET_PROPERTY mutation ni ishga tushiradi va ko‘rsatilgan property ni like qiladi.
   * So‘ng property lar ro‘yxatini qayta yuklaydi (getPropertiesRefetch orqali).
   * Keyin "success" alertini ko‘rsatadi.
   * Agar xatolik bo‘lsa, xabarni konsolga chiqaradi va alert orqali foydalanuvchiga namoyon qiladi.
   */
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

  if (trendProperties) console.log('trendProperties: +++', trendProperties);
  if (!trendProperties) return null;

  if (device === 'mobile') {
    return (
      <Stack className={'trend-properties'}>
        <Stack className={'container'}>
          <Stack className={'info-box'}>
            <span>Trend Properties</span>
          </Stack>
          <Stack className={'card-box'}>
            {trendProperties.length === 0 ? (
              <Box component={'div'} className={'empty-list'}>
                Trends Empty
              </Box>
            ) : (
              <Swiper
                className={'trend-property-swiper'}
                slidesPerView={'auto'}
                centeredSlides={true}
                spaceBetween={15}
                modules={[Autoplay]}
              >
                {trendProperties.map((property: Property) => {
                  return (
                    <SwiperSlide key={property._id} className={'trend-property-slide'}>
                      <TrendPropertyCard
                        property={property}
                        likePropertyHandler={likePropertyHandler}
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}
          </Stack>
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack className={'trend-properties'}>
        <Stack className={'container'}>
          <Stack className={'info-box'}>
            <Box component={'div'} className={'left'}>
              <span>Trend Properties</span>
              <p>Trend is based on likes</p>
            </Box>
            <Box component={'div'} className={'right'}>
              <div className={'pagination-box'}>
                <WestIcon className={'swiper-trend-prev'} />
                <div className={'swiper-trend-pagination'}></div>
                <EastIcon className={'swiper-trend-next'} />
              </div>
            </Box>
          </Stack>
          <Stack className={'card-box'}>
            {trendProperties.length === 0 ? (
              <Box component={'div'} className={'empty-list'}>
                Trends Empty
              </Box>
            ) : (
              <Swiper
                className={'trend-property-swiper'}
                slidesPerView={'auto'}
                spaceBetween={15}
                modules={[Autoplay, Navigation, Pagination]}
                navigation={{
                  nextEl: '.swiper-trend-next',
                  prevEl: '.swiper-trend-prev',
                }}
                pagination={{
                  el: '.swiper-trend-pagination',
                }}
              >
                {trendProperties.map((property: Property) => {
                  return (
                    <SwiperSlide key={property._id} className={'trend-property-slide'}>
                      <TrendPropertyCard
                        property={property}
                        likePropertyHandler={likePropertyHandler}
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

TrendProperties.defaultProps = {
  initialInput: {
    page: 1,
    limit: 8,
    sort: 'propertyLikes',
    direction: 'DESC',
    search: {},
  },
};

export default TrendProperties;
