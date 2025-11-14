import { Stack } from '@mui/material';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { initializeApollo } from '../apollo/client';
import { GET_PROPERTIES } from '../apollo/user/query';
import ScrollAnimation from '../libs/components/common/ScrollAnimation';
import Advertisement from '../libs/components/homepage/Advertisement';
import CommitmentSection from '../libs/components/homepage/CommitmentSection';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import Events from '../libs/components/homepage/Events';
import PopularProperties from '../libs/components/homepage/PopularProperties';
import TopAgents from '../libs/components/homepage/TopAgents';
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
        <ScrollAnimation animationType="fadeIn" delay={0.1}>
          <TrendProperties initialInput={initialInput} />
        </ScrollAnimation>
        <ScrollAnimation animationType="slideUp" delay={0.2}>
          <PopularProperties initialInput={initialInput} />
        </ScrollAnimation>
        <ScrollAnimation animationType="scale" delay={0.1}>
          <Advertisement />
        </ScrollAnimation>
        <ScrollAnimation animationType="slideUp" delay={0.2}>
          <CommitmentSection />
        </ScrollAnimation>
        <ScrollAnimation animationType="fadeIn" delay={0.1}>
          <TopAgents />
        </ScrollAnimation>
      </Stack>
    );
  } else {
    return (
      <Stack className={'home-page'}>
        <ScrollAnimation animationType="fadeIn" delay={0.1}>
          <TrendProperties initialInput={initialInput} />
        </ScrollAnimation>
        <ScrollAnimation animationType="scale" delay={0.1}>
          <Advertisement />
        </ScrollAnimation>
        <ScrollAnimation animationType="slideUp" delay={0.2}>
          <PopularProperties initialInput={initialInput} />
        </ScrollAnimation>
        <ScrollAnimation animationType="slideUp" delay={0.2}>
          <CommitmentSection />
        </ScrollAnimation>
        <ScrollAnimation animationType="fadeIn" delay={0.1}>
          <TopAgents />
        </ScrollAnimation>
        <ScrollAnimation animationType="slideLeft" delay={0.2}>
          <Events />
        </ScrollAnimation>
        <ScrollAnimation animationType="slideRight" delay={0.2}>
          <CommunityBoards />
        </ScrollAnimation>
      </Stack>
    );
  }
};

export default withLayoutMain(Home);
