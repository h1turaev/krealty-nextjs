import { useQuery } from '@apollo/client';
import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import { Autoplay } from 'swiper';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { GET_AGENTS } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { T } from '../../types/common';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import TopAgentCard from './TopAgentCard';

interface TopAgentsProps {
  initialInput: AgentsInquiry;
}

const TopAgents = (props: TopAgentsProps) => {
  const { initialInput } = props;
  const device = useDeviceDetect();
  const [topAgents, setTopAgents] = useState<Member[]>([]);

  /** APOLLO REQUESTS **/
  useQuery(GET_AGENTS, {
    fetchPolicy: 'cache-and-network',
    variables: { input: initialInput },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setTopAgents(data?.getAgents?.list);
    },
  });

  if (device === 'mobile') {
    return (
      <Stack className={'top-agents'}>
        <Stack className={'container'}>
          <Stack className={'info-box'}>
            <Box component={'div'} className={'left'}>
              <span className={'label'}>[Testimonials]</span>
              <span className={'title'}>Trusted by Our Community</span>
            </Box>
          </Stack>
          <Stack className={'wrapper'}>
            <Box component={'div'} className={'card-wrapper'}>
              <Swiper
                className={'top-agents-swiper'}
                slidesPerView={1}
                spaceBetween={0}
                loop={topAgents.length > 1}
                modules={topAgents.length > 1 ? [Autoplay] : []}
                {...(topAgents.length > 1 && {
                  autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                  },
                })}
              >
                {topAgents.map((agent: Member) => {
                  return (
                    <SwiperSlide className={'top-agents-slide'} key={agent?._id}>
                      <TopAgentCard agent={agent} />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack className={'top-agents'}>
        <Stack className={'container'}>
          <Stack className={'info-box'}>
            <Box component={'div'} className={'left'}>
              <span className={'label'}>[Testimonials]</span>
              <span className={'title'}>Trusted by Our Community</span>
            </Box>
          </Stack>
          <Stack className={'wrapper'}>
            <Box component={'div'} className={'card-wrapper'}>
              <Swiper
                className={'top-agents-swiper'}
                slidesPerView={1}
                spaceBetween={0}
                loop={topAgents.length > 1}
                modules={topAgents.length > 1 ? [Autoplay] : []}
                {...(topAgents.length > 1 && {
                  autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                  },
                })}
              >
                {topAgents.map((agent: Member) => {
                  return (
                    <SwiperSlide className={'top-agents-slide'} key={agent?._id}>
                      <TopAgentCard agent={agent} />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

TopAgents.defaultProps = {
  initialInput: {
    page: 1,
    limit: 10,
    sort: 'memberRank',
    direction: 'DESC',
    search: {},
  },
};

export default TopAgents;
