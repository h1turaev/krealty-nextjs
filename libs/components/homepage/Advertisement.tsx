import { Box, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface PropertyTypeCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// SVG Icon Components
const MultiFamilyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="20" width="8" height="20" fill="#181a20" />
    <rect x="10" y="22" width="2" height="2" fill="#f6f6f6" />
    <rect x="12" y="22" width="2" height="2" fill="#f6f6f6" />
    <rect x="10" y="25" width="2" height="2" fill="#f6f6f6" />
    <rect x="12" y="25" width="2" height="2" fill="#f6f6f6" />
    <rect x="20" y="12" width="8" height="28" fill="#181a20" />
    <rect x="22" y="14" width="2" height="2" fill="#f6f6f6" />
    <rect x="24" y="14" width="2" height="2" fill="#f6f6f6" />
    <rect x="22" y="17" width="2" height="2" fill="#f6f6f6" />
    <rect x="24" y="17" width="2" height="2" fill="#f6f6f6" />
    <rect x="22" y="20" width="2" height="2" fill="#f6f6f6" />
    <rect x="24" y="20" width="2" height="2" fill="#f6f6f6" />
    <rect x="32" y="16" width="8" height="24" fill="#181a20" />
    <rect x="34" y="18" width="2" height="2" fill="#f6f6f6" />
    <rect x="36" y="18" width="2" height="2" fill="#f6f6f6" />
    <rect x="34" y="21" width="2" height="2" fill="#f6f6f6" />
    <rect x="36" y="21" width="2" height="2" fill="#f6f6f6" />
    <rect x="6" y="38" width="36" height="2" fill="#181a20" />
  </svg>
);

const StudentIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 8L12 14V20L24 26L36 20V14L24 8Z" fill="#181a20" />
    <rect x="20" y="26" width="8" height="14" fill="#181a20" />
    <rect x="18" y="28" width="12" height="2" fill="#181a20" />
    <circle cx="24" cy="34" r="2" fill="#f6f6f6" />
    <rect x="22" y="36" width="4" height="4" fill="#181a20" />
    <rect x="16" y="38" width="16" height="2" fill="#181a20" />
  </svg>
);

const HOAIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 8L12 18V36H20V28H28V36H36V18L24 8Z" fill="#181a20" />
    <rect x="20" y="24" width="8" height="4" fill="#f6f6f6" />
    <rect x="6" y="36" width="36" height="2" fill="#181a20" />
    <rect x="8" y="38" width="2" height="8" fill="#181a20" />
    <rect x="14" y="38" width="2" height="8" fill="#181a20" />
    <rect x="20" y="38" width="2" height="8" fill="#181a20" />
    <rect x="26" y="38" width="2" height="8" fill="#181a20" />
    <rect x="32" y="38" width="2" height="8" fill="#181a20" />
    <rect x="38" y="38" width="2" height="8" fill="#181a20" />
  </svg>
);

const CommercialIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="12" width="28" height="28" fill="#181a20" />
    <rect x="12" y="14" width="8" height="6" fill="#f6f6f6" />
    <rect x="22" y="14" width="8" height="6" fill="#f6f6f6" />
    <rect x="32" y="14" width="4" height="6" fill="#f6f6f6" />
    <rect x="12" y="22" width="8" height="6" fill="#f6f6f6" />
    <rect x="22" y="22" width="8" height="6" fill="#f6f6f6" />
    <rect x="32" y="22" width="4" height="6" fill="#f6f6f6" />
    <rect x="12" y="30" width="8" height="6" fill="#f6f6f6" />
    <rect x="22" y="30" width="8" height="6" fill="#f6f6f6" />
    <rect x="32" y="30" width="4" height="6" fill="#f6f6f6" />
    <rect x="8" y="38" width="32" height="2" fill="#181a20" />
  </svg>
);

const ActiveAdultIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="14" r="4" fill="#181a20" />
    <rect x="22" y="18" width="4" height="12" fill="#181a20" />
    <path
      d="M16 30L20 34L16 38"
      stroke="#181a20"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M32 30L28 34L32 38"
      stroke="#181a20"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <line x1="20" y1="24" x2="16" y2="28" stroke="#181a20" strokeWidth="2" strokeLinecap="round" />
    <line x1="28" y1="24" x2="32" y2="28" stroke="#181a20" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="30" x2="24" y2="38" stroke="#181a20" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="38" x2="28" y2="38" stroke="#181a20" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Advertisement = () => {
  const device = useDeviceDetect();

  const propertyTypes: PropertyTypeCard[] = [
    {
      icon: <MultiFamilyIcon />,
      title: 'Multi-Family',
      description: 'Find well-designed multi-family residences ideal for communities of all sizes',
    },
    {
      icon: <StudentIcon />,
      title: 'Student',
      description: 'Affordable, convenient housing tailored for student lifestyles near campuses',
    },
    {
      icon: <HOAIcon />,
      title: 'HOA',
      description:
        'Professional homeowners association management services that keep communities thriving',
    },
    {
      icon: <CommercialIcon />,
      title: 'Commercial',
      description:
        'Versatile commercial spaces designed to support your business growth and success',
    },
    {
      icon: <ActiveAdultIcon />,
      title: 'Active Adult',
      description: 'Vibrant living spaces created specifically for active adults and retirees',
    },
  ];

  if (device == 'mobile') {
    return (
      <Stack className={'property-types-section'}>
        <Stack className={'container'}>
          <Stack className={'header'}>
            <Typography className={'label'}>[PROPERTY TYPE]</Typography>
            <Typography className={'title'}>Explore Our Diverse Portfolio</Typography>
          </Stack>
          <Stack className={'cards-grid'}>
            {propertyTypes.map((type, index) => (
              <Box key={index} className={'property-type-card'}>
                <Box className={'icon'}>{type.icon}</Box>
                <Typography className={'card-title'}>{type.title}</Typography>
                <Typography className={'card-description'}>{type.description}</Typography>
              </Box>
            ))}
            <Box className={'property-type-card dark-card'}>
              <Typography className={'dark-text-top'}>Proudly managing over</Typography>
              <Typography className={'dark-number'}>1,655</Typography>
              <Typography className={'dark-text-bottom'}>communities</Typography>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack className={'property-types-section'}>
        <Stack className={'container'}>
          <Stack className={'header'}>
            <Typography className={'label'}>[PROPERTY TYPE]</Typography>
            <Typography className={'title'}>Explore Our Diverse Portfolio</Typography>
          </Stack>
          <Stack className={'cards-grid'}>
            {propertyTypes.slice(0, 3).map((type, index) => (
              <Box key={index} className={'property-type-card'}>
                <Box className={'icon'}>{type.icon}</Box>
                <Typography className={'card-title'}>{type.title}</Typography>
                <Typography className={'card-description'}>{type.description}</Typography>
              </Box>
            ))}
          </Stack>
          <Stack className={'cards-grid second-row'}>
            {propertyTypes.slice(3, 5).map((type, index) => (
              <Box key={index + 3} className={'property-type-card'}>
                <Box className={'icon'}>{type.icon}</Box>
                <Typography className={'card-title'}>{type.title}</Typography>
                <Typography className={'card-description'}>{type.description}</Typography>
              </Box>
            ))}
            <Box className={'property-type-card dark-card'}>
              <Typography className={'dark-text-top'}>Proudly managing over</Typography>
              <Typography className={'dark-number'}>1,655</Typography>
              <Typography className={'dark-text-bottom'}>communities</Typography>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

export default Advertisement;
