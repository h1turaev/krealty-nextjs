import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';

const CTASection = () => {
  return (
    <Stack className="community-cta-section">
      <Stack className="cta-content">
        <Typography className="cta-headline">[START YOUR LIVING JOURNEY]</Typography>
        <Typography className="cta-title">Let's Find Your Ideal Space</Typography>
        <Typography className="cta-subtitle">
          Premium properties for rent or sale — managed with professionalism and care
        </Typography>
        <Link href="/property" passHref style={{ textDecoration: 'none' }}>
          <Button className="cta-browse-button" component="div">
            Browse Properties
          </Button>
        </Link>
        <Link href="/agent" passHref style={{ textDecoration: 'none' }}>
          <Stack className="cta-agent-card" component="div">
            <Box className="cta-agent-avatar">
              <img src="/img/profile/agent-sofy.avif" alt="Agent" />
            </Box>
            <Typography className="cta-agent-text">Talk to an Agent</Typography>
            <Box className="cta-agent-arrow">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
          </Stack>
        </Link>
      </Stack>
      <Box className="cta-image">
        <img src="/img/banner/basicbanner-2.webp" alt="Modern Building" />
      </Box>
    </Stack>
  );
};

export default CTASection;
