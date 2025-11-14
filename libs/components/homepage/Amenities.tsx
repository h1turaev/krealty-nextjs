import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface AmenityTab {
  id: string;
  name: string;
  image: string;
}

const Amenities = () => {
  const device = useDeviceDetect();
  const [activeTab, setActiveTab] = useState<string>('bedroom-interior');

  const amenityTabs: AmenityTab[] = [
    { id: 'bedroom-interior', name: 'Bedroom Interior', image: '/img/interior/bedroom.jpg' },
    {
      id: 'living-room-interior',
      name: 'Living Room Interior',
      image: '/img/interior/livingroom.jpg',
    },
    { id: 'kitchen-interior', name: 'Kitchen Interior', image: '/img/interior/kitchen.jpg' },
    { id: 'bathroom-interior', name: 'Bathroom Interior', image: '/img/interior/bathroom.jpg' },
  ];

  const allAmenities = [
    'Bedroom Interior',
    'Living Room Interior',
    'Kitchen Interior',
    'Bathroom Interior',
    'Custom Design Consultation',
    'Material Selection',
    '3D Visualization',
    'Project Management',
    'Space Planning',
    'Color Consultation',
    'Furniture Selection',
    'Lighting Design',
    'Storage Solutions',
    'Final Styling',
  ];

  const activeAmenity = amenityTabs.find((tab) => tab.id === activeTab) || amenityTabs[0];

  if (device === 'mobile') {
    return (
      <Stack className={'amenities-section'}>
        <Stack className={'container'}>
          <Stack className={'header-box'}>
            <span className={'label'}>[INTERIOR DESIGN SERVICES]</span>
            <span className={'title'}>Interior Design Services</span>
            <Typography className={'description'}>
              Transform your living spaces with our expert interior design services. From modern
              kitchens to serene bedrooms, we create beautiful, functional interiors tailored to
              your lifestyle and preferences.
            </Typography>
          </Stack>
          <Stack className={'amenities-content'}>
            <Stack className={'left-section'}>
              <Stack className={'tabs-container'}>
                {amenityTabs.map((tab) => (
                  <Box
                    key={tab.id}
                    className={`amenity-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.name}
                  </Box>
                ))}
              </Stack>
              <Box className={'image-container'}>
                <img src={activeAmenity.image} alt={activeAmenity.name} />
              </Box>
            </Stack>
            <Stack className={'right-section'}>
              <Typography className={'amenities-title'}>All Services</Typography>
              <Stack className={'amenities-list'}>
                {allAmenities.map((amenity, index) => (
                  <Typography key={index} className={'amenity-item'}>
                    {amenity}
                  </Typography>
                ))}
              </Stack>
              <Link href={'/amenities'}>
                <button className={'more-details-btn'}>More Details</button>
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack className={'amenities-section'}>
        <Stack className={'container'}>
          <Stack className={'header-box'}>
            <Box component={'div'} className={'left'}>
              <span className={'label'}>[INTERIOR DESIGN SERVICES]</span>
              <span className={'title'}>Interior Design Services</span>
              <Typography className={'description'}>
                Transform your living spaces with our expert interior design services. From modern
                kitchens to serene bedrooms, we create beautiful, functional interiors tailored to
                your lifestyle and preferences.
              </Typography>
            </Box>
          </Stack>
          <Stack className={'amenities-content'}>
            <Stack className={'left-section'}>
              <Stack className={'tabs-container'}>
                {amenityTabs.map((tab) => (
                  <Box
                    key={tab.id}
                    className={`amenity-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.name}
                  </Box>
                ))}
              </Stack>
              <Box className={'image-container'}>
                <img src={activeAmenity.image} alt={activeAmenity.name} />
              </Box>
            </Stack>
            <Stack className={'right-section'}>
              <Typography className={'amenities-title'}>All Services</Typography>
              <Stack className={'amenities-list'}>
                {allAmenities.map((amenity, index) => (
                  <Typography key={index} className={'amenity-item'}>
                    {amenity}
                  </Typography>
                ))}
              </Stack>
              <Link href={'/amenities'}>
                <button className={'more-details-btn'}>More Details</button>
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

export default Amenities;
