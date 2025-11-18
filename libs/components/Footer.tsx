import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Box, Stack } from '@mui/material';
import moment from 'moment';
import Link from 'next/link';
import useDeviceDetect from '../hooks/useDeviceDetect';

const Footer = () => {
  const device = useDeviceDetect();

  if (device == 'mobile') {
    return (
      <Stack className={'footer-container'}>
        <Stack className={'main'}>
          <Stack className={'left'}>
            <Box component={'div'} className={'footer-box'}>
              <img src="/img/logo/favicon.svg" alt="" className={'logo'} />
            </Box>
            <Box component={'div'} className={'footer-box'}>
              <span>total free customer care</span>
              <p>+82 10 4867 2909</p>
            </Box>
            <Box component={'div'} className={'footer-box'}>
              <span>nee live</span>
              <p>+82 10 4867 2909</p>
              <span>Support?</span>
            </Box>
            <Box component={'div'} className={'footer-box'}>
              <p>follow us on social media</p>
              <div className={'media-box'}>
                <LinkedInIcon />
                <InstagramIcon />
                <TwitterIcon />
              </div>
            </Box>
          </Stack>
          <Stack className={'right'}>
            <Box component={'div'} className={'bottom'}>
              <div>
                <strong>Popular Search</strong>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Property for Rent</span>
                </Link>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Property Low to hide</span>
                </Link>
              </div>
              <div>
                <strong>Quick Links</strong>
                <Link href={'/cs'} className={'footer-link'}>
                  <span>Terms of Use</span>
                </Link>
                <Link href={'/cs'} className={'footer-link'}>
                  <span>Privacy Policy</span>
                </Link>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Pricing Plans</span>
                </Link>
                <Link href={'/cs'} className={'footer-link'}>
                  <span>Our Services</span>
                </Link>
                <Link href={'/cs'} className={'footer-link'}>
                  <span>Contact Support</span>
                </Link>
                <Link href={'/cs'} className={'footer-link'}>
                  <span>FAQs</span>
                </Link>
              </div>
              <div>
                <strong>Discover</strong>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Seoul</span>
                </Link>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Gyeongido</span>
                </Link>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Busan</span>
                </Link>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Jejudo</span>
                </Link>
              </div>
            </Box>
          </Stack>
        </Stack>
        <Stack className={'second'}>
          <span>© HIGHLAND - All rights reserved. HIGHLAND {moment().year()}</span>
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack className={'footer-container'}>
        {/* Stacked Images Section */}
        <Stack className={'stacked-images-section'}>
          <Stack className={'section-header'}>
            <span className={'label'}>[Featured Spaces]</span>
            <span className={'title'}>Contact Informations</span>
          </Stack>
          <Box className={'cards-container'}>
            <Box className={'image-card'}>
              <img src="/img/interior/bathroom.jpg" alt="Luxury Interior" />
            </Box>
            <Box className={'text-card'}>
              <h2>Let's find your next property together.</h2>
              <Link href={'/agent'} className={'buy-button'}>
                Contact Us
              </Link>
            </Box>
          </Box>
        </Stack>

        <Stack className={'main'}>
          <Stack className={'left'}>
            <Box component={'div'} className={'footer-box'}>
              <strong>COMPANY</strong>
              <Link href={'/property'} className={'footer-link'}>
                Property Details
              </Link>
              <Link href={'/about'} className={'footer-link'}>
                About
              </Link>
              <Link href={'/community'} className={'footer-link'}>
                Blog
              </Link>
              <Link href={'/community'} className={'footer-link'}>
                Blog Post
              </Link>
              <Link href={'/property'} className={'footer-link'}>
                Leasing Info
              </Link>
              <Link href={'/cs'} className={'footer-link'}>
                Shop Services
              </Link>
              <Link href={'/cs'} className={'footer-link'}>
                Service Details
              </Link>
            </Box>
            <Box component={'div'} className={'footer-box'}>
              <strong>ACCOUNT & UTILITY</strong>
              <Link href={'/cs'} className={'footer-link'}>
                Terms & Conditions
              </Link>
              <Link href={'/account/join'} className={'footer-link'}>
                Sign in
              </Link>
              <Link href={'/account/join'} className={'footer-link'}>
                Sign up
              </Link>
              <Link href={'/account/join'} className={'footer-link'}>
                Forgot Password
              </Link>
              <Link href={'/account/join'} className={'footer-link'}>
                Apply Now
              </Link>
              <Link href={'/cs'} className={'footer-link'}>
                404
              </Link>
              <Link href={'/cs'} className={'footer-link'}>
                Password Protected
              </Link>
            </Box>
          </Stack>
          <Stack className={'right'}>
            <Box component={'div'} className={'top'}>
              <strong>Subscribe to our newsletter</strong>
              <div>
                <input type="text" placeholder={'Email Address'} />
                <span>Send</span>
              </div>
            </Box>
            <Box component={'div'} className={'bottom'}>
              <div>
                <strong>Popular Search</strong>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Property for Rent</span>
                </Link>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Property Low to hide</span>
                </Link>
              </div>
              <div>
                <strong>Quick Links</strong>
                <Link href={'/cs'} className={'footer-link'}>
                  <span>Terms of Use</span>
                </Link>
                <Link href={'/cs'} className={'footer-link'}>
                  <span>Privacy Policy</span>
                </Link>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Pricing Plans</span>
                </Link>
                <Link href={'/cs'} className={'footer-link'}>
                  <span>Our Services</span>
                </Link>
                <Link href={'/cs'} className={'footer-link'}>
                  <span>Contact Support</span>
                </Link>
                <Link href={'/cs'} className={'footer-link'}>
                  <span>FAQs</span>
                </Link>
              </div>
              <div>
                <strong>Discover</strong>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Seoul</span>
                </Link>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Busan</span>
                </Link>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Incheon</span>
                </Link>
                <Link href={'/property'} className={'footer-link'}>
                  <span>Jejudo</span>
                </Link>
              </div>
            </Box>
          </Stack>
        </Stack>
        <Stack className={'second'}>
          <span>© Copyright {moment().year()} Designs by HIGHLAND, powered by React</span>
          <div className={'social-icons'}>
            <LinkedInIcon />
            <InstagramIcon />
            <TwitterIcon />
          </div>
        </Stack>
      </Stack>
    );
  }
};

export default Footer;
