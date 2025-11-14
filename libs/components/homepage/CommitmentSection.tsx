import { Box, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const CommitmentSection = () => {
  const device = useDeviceDetect();

  const services = [
    {
      title: 'Expert Management',
      description: 'From leasing to maintenance, we handle it all with precision and care',
    },
    {
      title: 'Trusted Agents',
      description: 'Experienced, responsive, and dedicated to guiding you every step of the way.',
    },
    {
      title: 'Tailored Listings',
      description: 'Properties curated to fit every lifestyle and budget',
    },
    {
      title: 'Innovative Technology',
      description: 'Leveraging cutting-edge tools to simplify property management',
    },
  ];

  if (device === 'mobile') {
    return (
      <Stack className={'commitment-section'}>
        <Stack className={'container'}>
          <Stack className={'header-box'}>
            <span className={'label'}>[WHY HIGHLAND]</span>
            <span className={'title'}>Our Commitment to You</span>
          </Stack>
          <Stack className={'stats-box'}>
            <Box className={'stat-card dark-card'}>
              <Typography className={'stat-description'}>
                Managing a diverse portfolio of over 300 properties with care and expertise
              </Typography>
              <Typography className={'stat-number'}>300+</Typography>
              <Typography className={'stat-label'}>Properties Managed</Typography>
            </Box>
            <Box className={'stat-card light-card'}>
              <Typography className={'stat-description'}>
                Bringing 25 years of trusted experience to every client and property we serve
              </Typography>
              <Typography className={'stat-number'}>25</Typography>
              <Typography className={'stat-label'}>Years in Real Estate</Typography>
            </Box>
          </Stack>
          <Stack className={'services-grid'}>
            {services.map((service, index) => (
              <Box key={index} className={'service-item'}>
                <Typography className={'service-title'}>{service.title}</Typography>
                <Typography className={'service-description'}>{service.description}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack className={'commitment-section'}>
        <Stack className={'container'}>
          <Stack className={'header-box'}>
            <Box component={'div'} className={'left'}>
              <span className={'label'}>[WHY HIGHLAND]</span>
              <span className={'title'}>Our Commitment to You</span>
            </Box>
          </Stack>
          <Stack className={'stats-box'}>
            <Box className={'stat-card dark-card'}>
              <Typography className={'stat-description'}>
                Managing a diverse portfolio of over 300 properties with care and expertise
              </Typography>
              <Typography className={'stat-number'}>300+</Typography>
              <Typography className={'stat-label'}>Properties Managed</Typography>
            </Box>
            <Box className={'stat-card light-card'}>
              <Typography className={'stat-description'}>
                Bringing 25 years of trusted experience to every client and property we serve
              </Typography>
              <Typography className={'stat-number'}>25</Typography>
              <Typography className={'stat-label'}>Years in Real Estate</Typography>
            </Box>
          </Stack>
          <Stack className={'services-grid'}>
            {services.map((service, index) => (
              <Box key={index} className={'service-item'}>
                <Typography className={'service-title'}>{service.title}</Typography>
                <Typography className={'service-description'}>{service.description}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

export default CommitmentSection;
