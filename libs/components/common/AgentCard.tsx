import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';

interface AgentCardProps {
  agent: any;
  likeMemberHandler: any;
}

const AgentCard = (props: AgentCardProps) => {
  const { agent } = props;
  const device = useDeviceDetect();
  const imagePath: string = agent?.memberImage
    ? `${REACT_APP_API_URL}/${agent?.memberImage}`
    : '/img/profile/defaultUser.svg';

  if (device === 'mobile') {
    return <div>AGENT CARD</div>;
  } else {
    return (
      <Stack className="agent-general-card">
        <Link
          href={{
            pathname: '/member',
            query: { memberId: agent?._id, category: 'properties' },
          }}
        >
          <Box
            component={'div'}
            className={'agent-img'}
            style={{
              backgroundImage: `url(${imagePath})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </Link>

        <Stack className={'agent-content'}>
          <Box component={'div'} className={'agent-info'}>
            <Link
              href={{
                pathname: '/member',
                query: { memberId: agent?._id, category: 'properties' },
              }}
            >
              <Typography className={'agent-name'}>
                {agent?.memberFullName ?? agent?.memberNick}
              </Typography>
            </Link>
            <Typography className={'agent-title'}>
              Real Estate Agent
            </Typography>
          </Box>
          <Typography className={'agent-quote'}>
            {agent?.memberDesc || `With ${agent?.memberProperties || 0} properties and years of experience, I help clients find their perfect home.`}
          </Typography>
        </Stack>
      </Stack>
    );
  }
};

export default AgentCard;
