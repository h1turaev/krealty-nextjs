import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import moment from 'moment';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Autoplay } from 'swiper';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { userVar } from '../../apollo/store';
import { CREATE_COMMENT, LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_PROPERTIES, GET_PROPERTY } from '../../apollo/user/query';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import Review from '../../libs/components/property/Review';
import { REACT_APP_API_URL } from '../../libs/config';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { showError, showSuccessTopRight } from '../../libs/toast';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { T } from '../../libs/types/common';
import { Property } from '../../libs/types/property/property';
import { formatterStr } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const PropertyDetail: NextPage = ({ initialComment, ...props }: any) => {
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [slideImage, setSlideImage] = useState<string>('');
  const [destinationProperties, setDestinationProperties] = useState<Property[]>([]);
  const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
  const [propertyComments, setPropertyComments] = useState<Comment[]>([]);
  const [commentTotal, setCommentTotal] = useState<number>(0);
  const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
    commentGroup: CommentGroup.PROPERTY,
    commentContent: '',
    commentRefId: '',
  });

  /** APOLLO REQUESTS **/
  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
  const [createComment] = useMutation(CREATE_COMMENT);

  // Bu qismda GET_PROPERTY querysi orqali bitta property ma'lumotlari olinadi.
  // useQuery hook ishlatilgan, u quyidagilarni qaytaradi:
  //  - loading: so'rov jarayonida true bo'ladi.
  //  - data: kelgan property ma'lumotlari.
  //  - error: xatolik bo'lsa shu yerga tushadi.
  //  - refetch: so'rovni yana qayta yuborish uchun funksiya.
  // options ichida:
  //  - fetchPolicy: 'cache-and-network' — kesh va tarmoqdan birga malumot olib keladi.
  //  - variables: input sifatida propertyId uzatiladi (propertyId bo'sh bo'lsa query skip qilinadi).
  //  - skip: agar propertyId bo'lmasa query ishlamaydi.
  //  - notifyOnNetworkStatusChange: so'rov statusi o'zgarsa komponent qayta render bo'ladi.
  //  - onCompleted: natija muvaffaqiyatli qaytsa:
  //    - setProperty orqali property state yangilanadi.
  //    - setSlideImage orqali asosiy rasm (birinchi rasm) state ga yoziladi.
  const {
    loading: getPropertyLoading,
    data: getPropertyData,
    error: getPropertyError,
    refetch: getPropertyRefetch,
  } = useQuery(GET_PROPERTY, {
    fetchPolicy: 'network-only',
    variables: { input: propertyId },
    skip: !propertyId,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      if (data?.getProperty) {
        setProperty(data?.getProperty);
        if (data?.getProperty?.propertyImages?.[0]) {
          setSlideImage(data?.getProperty?.propertyImages[0]);
        }
      }
    },
  });

  // GET_PROPERTIES querysi orqali propertylar ro'yxatini olish uchun useQuery hook ishlatilmoqda.
  // Quyidagi qiymatlar olinadi:
  //  - loading: So'rov jarayonida true bo'ladi.
  //  - data: Olingan propertylar ma'lumotlari shu yerga yoziladi.
  //  - error: Xatolik bo'lsa shu yerda ko'rsatiladi.
  //  - refetch: So'rovni qayta yuborish funksiyasi.
  //
  // Queryning options qismi quyidagicha:
  //  - fetchPolicy: 'cache-and-network' -> Ma'lumotlarni dastlab keshdan (agar bor bo'lsa), so'ngra tarmoqdan oladi.
  //  - variables: input obyektida sahifa, limit, sortirovka turi va tartibi, hamda search parametrlari uzatiladi.
  //      - page: 1 -> 1-sahifa olinadi.
  //      - limit: 4 -> Maksimal 4 ta property olinadi.
  //      - sort: 'createdAt' -> Yaratilgan sanaga ko'ra tartiblanadi.
  //      - direction: Direction.DESC -> Kamayish tartibida.
  //      - search.locationList: [property?.propertyLocation] -> Location bo'yicha filter.
  //  - skip: !propertyId && !property -> propertyId va property bo'lmasa query yuborilmaydi.
  //  - notifyOnNetworkStatusChange: true -> Network status o'zgarsa komponent qayta render bo'ladi.
  //  - onCompleted: data kelgach,
  //      agar data.getProperties?.list bo'lsa, destinationProperties steytini yangilaydi.
  const {
    loading: getPropertiesLoading,
    data: getPropertiesData,
    error: getPropertiesError,
    refetch: getPropertiesRefetch,
  } = useQuery(GET_PROPERTIES, {
    fetchPolicy: 'cache-and-network',
    variables: {
      input: {
        page: 1,
        limit: 4,
        sort: 'createdAt',
        direction: Direction.DESC,
        search: {
          locationList: property?.propertyLocation ? [property?.propertyLocation] : [],
        },
      },
    },
    skip: !propertyId && !property,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      if (data?.getProperties?.list) setDestinationProperties(data?.getProperties?.list);
    },
  });

  const {
    loading: getCommentsLoading,
    data: getCommentsData,
    error: getCommentsError,
    refetch: getCommentsRefetch,
  } = useQuery(GET_COMMENTS, {
    fetchPolicy: 'cache-and-network',
    variables: { input: initialComment },
    skip: !commentInquiry.search.commentRefId,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      if (data?.getComments?.list) setPropertyComments(data?.getComments?.list);
      setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
    },
  });

  /** LIFECYCLES **/
  useEffect(() => {
    if (router.query.id) {
      setPropertyId(router.query.id as string);
      setCommentInquiry({
        ...commentInquiry,
        search: {
          commentRefId: router.query.id as string,
        },
      });
      setInsertCommentData({
        ...insertCommentData,
        commentRefId: router.query.id as string,
      });
    }
  }, [router]);

  useEffect(() => {
    if (commentInquiry.search.commentRefId) {
      getCommentsRefetch({ input: commentInquiry });
    }
  }, [commentInquiry]);

  /** HANDLERS **/
  const changeImageHandler = (image: string) => {
    setSlideImage(image);
  };

  const likePropertyHandler = async (user: T, id: string) => {
    try {
      if (!id) return;
      if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

      await likeTargetProperty({
        variables: { input: id },
      });
      await getPropertyRefetch({ input: id });
      await getPropertiesRefetch({
        input: {
          page: 1,
          limit: 4,
          sort: 'createdAt',
          direction: Direction.DESC,
          search: {
            locationList: [property?.propertyLocation],
          },
        },
      });

      await showSuccessTopRight('success', 800);
    } catch (err: any) {
      console.log('ERROR, likePropertyHandler:', err.message);
      showError(err.message);
    }
  };

  const createCommentHandler = async () => {
    try {
      if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
      await createComment({ variables: { input: insertCommentData } });
      setInsertCommentData({ ...insertCommentData, commentContent: '' });
      await getCommentsRefetch({ input: commentInquiry });
    } catch (err: any) {
      await showError((err as any)?.message || 'An error occurred');
    }
  };

  if (getPropertyLoading) {
    return (
      <Stack
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '1080px',
        }}
      >
        <CircularProgress size={'4rem'} />
      </Stack>
    );
  }

  if (device === 'mobile') {
    return <div>PROPERTY DETAIL PAGE</div>;
  } else {
    return (
      <div id={'property-detail-page'}>
        <div className={'container'}>
          <Stack className={'property-detail-config'}>
            <Link href="/property" className={'back-link'}>
              <ArrowBackIcon sx={{ fontSize: 20 }} />
              <Typography>Back to All Properties</Typography>
            </Link>
            <Stack className={'property-info-config'}>
              <Stack className={'info'}>
                <Stack className={'left-box'}>
                  <Typography className={'title-main'}>{property?.propertyTitle}</Typography>
                  <Stack className={'top-box'}>
                    <Typography className={'city'}>{property?.propertyLocation}</Typography>
                    <Box component={'div'} className={'divider'}></Box>
                    <Stack className={'buy-rent-box'}>
                      {property?.propertyBarter && (
                        <>
                          <Typography className={'buy-rent'}>Barter</Typography>
                        </>
                      )}

                      {property?.propertyRent && (
                        <>
                          <Typography className={'buy-rent'}>Rent</Typography>
                        </>
                      )}
                    </Stack>
                    <Box component={'div'} className={'divider'}></Box>
                  </Stack>
                </Stack>
                <Stack className={'right-box'}>
                  <Typography>${formatterStr(property?.propertyPrice)}</Typography>
                </Stack>
              </Stack>
              <Stack className={'images'}>
                <Stack className={'main-image'}>
                  <img
                    src={
                      slideImage
                        ? `${REACT_APP_API_URL}/${slideImage}`
                        : property?.propertyImages?.[0]
                        ? `${REACT_APP_API_URL}/${property.propertyImages[0]}`
                        : '/img/banner/basiclaybanner.jpg'
                    }
                    alt={'main-image'}
                    onError={(e: any) => {
                      e.target.src = '/img/banner/basiclaybanner.jpg';
                    }}
                  />
                </Stack>
                <Stack className={'sub-images'}>
                  {property?.propertyImages
                    ?.filter((img: string) => {
                      // Main image takrorlanmasligi uchun filtrlash
                      const currentMainImage = slideImage || property?.propertyImages?.[0];
                      return img && img !== currentMainImage;
                    })
                    ?.slice(0, 4)
                    ?.map((subImg: string, index: number) => {
                      if (!subImg) return null;
                      const imagePath: string = `${REACT_APP_API_URL}/${subImg}`;
                      return (
                        <Stack
                          className={'sub-img-box'}
                          onClick={() => changeImageHandler(subImg)}
                          key={subImg || index}
                        >
                          <img
                            src={imagePath}
                            alt={'sub-image'}
                            onError={(e: any) => {
                              e.target.src = '/img/banner/basiclaybanner.jpg';
                            }}
                          />
                        </Stack>
                      );
                    })}
                </Stack>
              </Stack>
            </Stack>
            <Stack className={'property-desc-config'}>
              <Stack className={'left-config'}>
                <Stack className={'prop-desc-config'}>
                  <Stack className={'title-with-actions'}>
                    <Typography className={'main-title'}>{property?.propertyTitle}</Typography>
                    <Typography className={'property-price-title'}>
                      ${formatterStr(property?.propertyPrice)}
                    </Typography>
                  </Stack>
                  <Stack className={'view-like-section'}>
                    <Stack className={'view-like-item'}>
                      <Typography className={'view-like-text'}>
                        {property?.propertyViews} Views
                      </Typography>
                    </Stack>
                    <Stack className={'view-like-item'}>
                      {property?.meLiked && property?.meLiked[0]?.myFavorite ? (
                        <FavoriteIcon className={'view-like-icon favorite-icon'} />
                      ) : (
                        <FavoriteBorderIcon
                          className={'view-like-icon favorite-icon'}
                          // @ts-ignore
                          onClick={() => likePropertyHandler(user, property?._id)}
                        />
                      )}
                      <Typography className={'view-like-text'}>
                        {property?.propertyLikes}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box component={'div'} className={'divider'}></Box>

                  <Stack className={'description-section'}>
                    <Stack className={'section-header'}>
                      <Typography className={'section-label'}>[DESCRIPTION]</Typography>
                      <Typography className={'section-title'}>Description</Typography>
                    </Stack>
                    <Typography className={'desc'}>
                      {property?.propertyDesc ?? 'No Description!'}
                    </Typography>
                  </Stack>
                  <Box component={'div'} className={'divider'}></Box>
                  <Stack className={'details-section'}>
                    <Stack className={'section-header'}>
                      <Typography className={'section-label'}>[PROPERTY DETAILS]</Typography>
                      <Typography className={'section-title'}>Property Details</Typography>
                    </Stack>
                    <Stack className={'details-list'}>
                      <Typography className={'detail-item'}>
                        Price: ${formatterStr(property?.propertyPrice)}
                      </Typography>
                      <Typography className={'detail-item'}>
                        Property Size: {property?.propertySquare} m2
                      </Typography>
                      <Typography className={'detail-item'}>
                        Rooms: {property?.propertyRooms}
                      </Typography>
                      <Typography className={'detail-item'}>
                        Bedrooms: {property?.propertyBeds}
                      </Typography>
                      <Typography className={'detail-item'}>
                        Year Built: {moment(property?.createdAt).format('YYYY')}
                      </Typography>
                      <Typography className={'detail-item'}>
                        Property Type: {property?.propertyType}
                      </Typography>
                      <Typography className={'detail-item'}>
                        Property Options: {property?.propertyBarter && 'Barter'}
                        {property?.propertyBarter && property?.propertyRent && ' '}
                        {property?.propertyRent && 'Rent'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
                <Box component={'div'} className={'divider'}></Box>
                <Stack className={'floor-plans-config'}>
                  <Stack className={'section-header'}>
                    <Typography className={'section-label'}>[FLOOR PLANS]</Typography>
                    <Typography className={'title'}>Floor Plans</Typography>
                  </Stack>
                  <Stack className={'floor-plans-grid'}>
                    <Stack className={'floor-plan-card'}>
                      <img src={'/img/property/floorPlan.png'} alt={'floor plan'} />
                    </Stack>
                    <Stack className={'floor-plan-card'}>
                      <img src={'/img/property/floorPlan.png'} alt={'floor plan'} />
                    </Stack>
                    <Stack className={'floor-plan-card'}>
                      <img src={'/img/property/floorPlan.png'} alt={'floor plan'} />
                    </Stack>
                  </Stack>
                </Stack>
                <Box component={'div'} className={'divider'}></Box>
                {commentTotal !== 0 && (
                  <Stack className={'reviews-config'}>
                    <Stack className={'filter-box'}>
                      <Stack className={'review-cnt'}>
                        <Typography className={'section-label'}>
                          [ {commentTotal} reviews ]
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack className={'review-list'}>
                      {propertyComments?.map((comment: Comment) => {
                        return <Review comment={comment} key={comment?._id} />;
                      })}
                    </Stack>
                  </Stack>
                )}
                <Stack className={'leave-review-config'}>
                  <Stack className={'section-header'}>
                    <Typography className={'section-label'}>[REVIEWS]</Typography>
                    <Typography className={'main-title'}>Reviews</Typography>
                  </Stack>
                  <Typography className={'review-title'}> Leave a review</Typography>
                  <textarea
                    onChange={({ target: { value } }: any) => {
                      setInsertCommentData({ ...insertCommentData, commentContent: value });
                    }}
                    value={insertCommentData.commentContent}
                  ></textarea>
                  <Box className={'submit-btn'} component={'div'}>
                    <Button
                      className={'submit-review'}
                      disabled={insertCommentData.commentContent === '' || user?._id === ''}
                      onClick={createCommentHandler}
                    >
                      <Typography className={'title'}>Comment</Typography>
                    </Button>
                  </Box>
                </Stack>
              </Stack>
              <Stack className={'right-config'}>
                <Stack className={'info-box'}>
                  <Stack className={'section-header'}>
                    <Typography className={'section-label'}>[AGENT INFORMATION]</Typography>
                    <Typography className={'main-title'}>Agent Information</Typography>
                  </Stack>
                  <Stack className={'image-info'}>
                    <img
                      className={'member-image'}
                      src={
                        property?.memberData?.memberImage
                          ? `${REACT_APP_API_URL}/${property?.memberData?.memberImage}`
                          : '/img/profile/defaultUser.svg'
                      }
                    />
                    <Stack className={'name-phone-listings'}>
                      <Link href={`/member?memberId=${property?.memberData?._id}`}>
                        <Typography className={'name'}>
                          {property?.memberData?.memberNick}
                        </Typography>
                      </Link>
                      <Stack className={'phone-number'}>
                        <Typography className={'number'}>
                          {property?.memberData?.memberPhone}
                        </Typography>
                      </Stack>
                      <Link
                        href={`/member?memberId=${property?.memberData?._id}&category=properties`}
                      >
                        <Typography className={'listings'}>Agent Properties</Typography>
                      </Link>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
            {destinationProperties.length !== 0 && (
              <Stack className={'similar-properties-config'}>
                <Stack className={'title-box'}>
                  <Stack className={'section-header'}>
                    <Typography className={'section-label'}>[DESTINATION PROPERTY]</Typography>
                    <Typography className={'main-title'}>One Destination</Typography>
                  </Stack>
                </Stack>
                <Stack className={'cards-box'}>
                  <Swiper
                    className={'similar-homes-swiper'}
                    slidesPerView={'auto'}
                    spaceBetween={24}
                    modules={[Autoplay]}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    loop={true}
                    grabCursor={true}
                  >
                    {destinationProperties.map((property: Property) => {
                      return (
                        <SwiperSlide className={'similar-homes-slide'} key={property.propertyTitle}>
                          <PropertyBigCard
                            property={property}
                            likePropertyHandler={likePropertyHandler}
                            key={property?._id}
                          />
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </Stack>
              </Stack>
            )}
          </Stack>
        </div>
      </div>
    );
  }
};

PropertyDetail.defaultProps = {
  initialComment: {
    page: 1,
    limit: 1000,
    sort: 'createdAt',
    direction: 'DESC',
    search: {
      commentRefId: '',
    },
  },
};

export default withLayoutFull(PropertyDetail);
