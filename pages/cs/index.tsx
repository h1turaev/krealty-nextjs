import { Box, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ContactForm from '../../libs/components/cs/ContactForm';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const CS: NextPage = () => {
  const device = useDeviceDetect();

  if (device === 'mobile') {
    return <h1>CS PAGE MOBILE</h1>;
  } else {
    return (
      <Stack className={'cs-services-page'}>
        <Box className={'container'}>
          <Box className={'services-header'}>
            <Typography className={'how-it-works-label'}>[HOW IT WORKS]</Typography>
            <Typography className={'services-title'}>How to Purchase Our Services</Typography>
            <Typography className={'services-subtitle'}>
              Adding services to your lease is simple and transparent. Choose what fits your
              lifestyle and manage everything through your resident portal.
            </Typography>
          </Box>

          {/* How to Purchase Section */}
          <Box className={'how-to-purchase-section'}>
            <Stack className={'steps-container'}>
              <Box className={'step-item'}>
                <Typography className={'step-number'}>/ 01</Typography>
                <Box className={'step-content'}>
                  <Typography className={'step-title'}>Browse Services</Typography>
                  <Typography className={'step-description'}>
                    View available resident services, from maintenance to upgrades, all in one
                    convenient place.
                  </Typography>
                </Box>
              </Box>
              <Box className={'step-item'}>
                <Typography className={'step-number'}>/ 02</Typography>
                <Box className={'step-content'}>
                  <Typography className={'step-title'}>Submit Request</Typography>
                  <Typography className={'step-description'}>
                    Fill out a quick form with your details and service needs—no calls or emails
                    required.
                  </Typography>
                </Box>
              </Box>
              <Box className={'step-item'}>
                <Typography className={'step-number'}>/ 03</Typography>
                <Box className={'step-content'}>
                  <Typography className={'step-title'}>Confirm Schedule</Typography>
                  <Typography className={'step-description'}>
                    Choose a time that works best for you, and we'll confirm your service
                    appointment.
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Service Description Section */}
          <Stack className={'service-description-section'}>
            <Typography className={'service-description-text'}>
              Enjoy a comprehensive evaluation of your property with our expert Property Inspection
              service. Our certified inspectors carefully assess every critical component—from
              foundation to fixtures—to provide you with a detailed report you can trust. Whether
              you're buying, selling, or maintaining a property, this service helps identify
              potential issues early and supports informed decision-making.
            </Typography>
            <Typography className={'service-description-text'}>
              Our inspectors use the latest tools and industry standards to deliver fast, accurate
              results. Expect clear communication throughout the process and a report that's easy to
              understand, complete with photos and actionable insights. Perfect for homeowners,
              investors, and property managers who prioritize safety, value, and longevity.
            </Typography>
          </Stack>

          {/* Contact Form Section */}
          <ContactForm />
        </Box>
      </Stack>
    );
  }
};

export default withLayoutBasic(CS);
