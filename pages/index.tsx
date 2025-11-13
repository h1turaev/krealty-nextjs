import { Stack } from '@mui/material';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { initializeApollo } from '../apollo/client';
import { GET_PROPERTIES } from '../apollo/user/query';
import Advertisement from '../libs/components/homepage/Advertisement';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import Events from '../libs/components/homepage/Events';
import PopularProperties from '../libs/components/homepage/PopularProperties';
import TopAgents from '../libs/components/homepage/TopAgents';
import TopProperties from '../libs/components/homepage/TopProperties';
import TrendProperties from '../libs/components/homepage/TrendProperties';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import { Direction } from '../libs/enums/common.enum';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import { PropertiesInquiry } from '../libs/types/property/property.input';

export const getServerSideProps = async ({ locale }: any) => {
  const apolloClient = initializeApollo();

  // Default initial input for properties
  const initialInput: PropertiesInquiry = {
    page: 1,
    limit: 50,
    sort: 'createdAt',
    direction: Direction.DESC,
    search: {
      squaresRange: {
        start: 0,
        end: 500,
      },
      pricesRange: {
        start: 0,
        end: 2000000,
      },
    },
  };

  // Fetch properties on server side
  try {
    await apolloClient.query({
      query: GET_PROPERTIES,
      variables: { input: initialInput },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
  }

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      initialInput,
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

const Home: NextPage = ({ initialInput }: any) => {
  const device = useDeviceDetect();

  if (device === 'mobile') {
    return (
      <Stack className={'home-page'}>
        <TrendProperties initialInput={initialInput} />
        <PopularProperties />
        <Advertisement />
        <TopProperties initialInput={initialInput} />
        <TopAgents />
      </Stack>
    );
  } else {
    return (
      <Stack className={'home-page'}>
        <TrendProperties initialInput={initialInput} />
        <PopularProperties />
        <Advertisement />
        <TopProperties initialInput={initialInput} />
        <TopAgents />
        <Events />
        <CommunityBoards />
      </Stack>
    );
  }
};

export default withLayoutMain(Home);
