import { useMutation, useQuery } from '@apollo/client';
import { Box, Stack } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { Message } from '../../enums/common.enum';
import { PropertyType } from '../../enums/property.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { showError, showSuccessTopRight } from '../../toast';
import { T } from '../../types/common';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import TrendPropertyCard from './TrendPropertyCard';

interface TrendPropertiesProps {
  initialInput: PropertiesInquiry;
}

const TrendProperties = (props: TrendPropertiesProps) => {
  const { initialInput } = props;
  const device = useDeviceDetect();
  const [trendProperties, setTrendProperties] = useState<Property[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(initialInput);

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
    variables: { input: searchFilter },
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
      await getPropertiesRefetch({ input: searchFilter });

      await showSuccessTopRight('success', 800);
    } catch (err: any) {
      console.log('ERROR, likePropertyHandler:', err.message);
      showError(err.message || 'An error occurred');
    }
  };

  const filterHandler = (filterType: string) => {
    setActiveFilter(filterType);
    const newFilter: PropertiesInquiry = {
      ...initialInput,
      search: {
        ...initialInput.search,
        typeList: filterType === 'all' ? undefined : [filterType as PropertyType],
      },
    };
    setSearchFilter(newFilter);
  };

  const propertyTypeFilters = [
    { id: 'all', name: 'All' },
    { id: PropertyType.APARTMENT, name: 'Apartments' },
    { id: PropertyType.VILLA, name: 'Villa' },
    { id: PropertyType.HOUSE, name: 'House' },
  ];

  if (!trendProperties) return null;

  if (device === 'mobile') {
    return (
      <Stack className={'trend-properties'}>
        <Stack className={'container'}>
          <Stack className={'info-box'}>
            <span>Trend Properties</span>
          </Stack>
          <Stack className={'filter-tabs-container'}>
            {propertyTypeFilters.map((filter) => (
              <Box
                key={filter.id}
                className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => filterHandler(filter.id)}
              >
                {filter.name}
              </Box>
            ))}
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
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
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
  } else {
    const heroProperty = trendProperties[0];
    const smallProperties = trendProperties.slice(1, 4);

    return (
      <Stack className={'trend-properties'}>
        <Stack className={'container'}>
          <Stack className={'info-box'}>
            <Box component={'div'} className={'left'}>
              <span className={'label'}>[FEATURED PROPERTIES]</span>
              <span className={'title'}>Discover Our Featured Properties</span>
            </Box>
            <Box component={'div'} className={'right'}>
              <Link href={'/property'}>
                <button className={'all-properties-btn'}>All Properties</button>
              </Link>
            </Box>
          </Stack>
          <Stack className={'filter-tabs-container'}>
            {propertyTypeFilters.map((filter) => (
              <Box
                key={filter.id}
                className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => filterHandler(filter.id)}
              >
                {filter.name}
              </Box>
            ))}
          </Stack>
          <Stack className={'card-box'}>
            {trendProperties.length === 0 ? (
              <Box component={'div'} className={'empty-list'}>
                Trends Empty
              </Box>
            ) : (
              <>
                {heroProperty && (
                  <Box className={'hero-card-wrapper'}>
                    <TrendPropertyCard
                      property={heroProperty}
                      likePropertyHandler={likePropertyHandler}
                      isHero={true}
                    />
                  </Box>
                )}
                {smallProperties.length > 0 && (
                  <Stack className={'small-cards-wrapper'}>
                    {smallProperties.map((property: Property) => {
                      return (
                        <TrendPropertyCard
                          key={property._id}
                          property={property}
                          likePropertyHandler={likePropertyHandler}
                          isHero={false}
                        />
                      );
                    })}
                  </Stack>
                )}
              </>
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
