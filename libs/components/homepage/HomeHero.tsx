import { Box, Button, Stack, TextField } from '@mui/material';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { PropertyLocation } from '../../enums/property.enum';

const HomeHero = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    // Normalize search value (case-insensitive)
    const normalizedSearch = searchValue.trim();

    // Check if search matches any PropertyLocation (case-insensitive)
    const locationMatch = Object.values(PropertyLocation).find(
      (location) => location.toLowerCase() === normalizedSearch.toLowerCase(),
    );

    if (locationMatch) {
      // Navigate to property page with location filter
      const searchFilter = {
        page: 1,
        limit: 9,
        search: {
          locationList: [locationMatch],
        },
      };

      await router.push(
        `/property?input=${JSON.stringify(searchFilter)}`,
        `/property?input=${JSON.stringify(searchFilter)}`,
      );
    } else {
      // If no exact match, try partial match or use text search
      const partialMatch = Object.values(PropertyLocation).find(
        (location) =>
          location.toLowerCase().includes(normalizedSearch.toLowerCase()) ||
          normalizedSearch.toLowerCase().includes(location.toLowerCase()),
      );

      if (partialMatch) {
        const searchFilter = {
          page: 1,
          limit: 9,
          search: {
            locationList: [partialMatch],
          },
        };

        await router.push(
          `/property?input=${JSON.stringify(searchFilter)}`,
          `/property?input=${JSON.stringify(searchFilter)}`,
        );
      } else {
        // Use text search as fallback
        const searchFilter = {
          page: 1,
          limit: 9,
          search: {
            text: normalizedSearch,
          },
        };

        await router.push(
          `/property?input=${JSON.stringify(searchFilter)}`,
          `/property?input=${JSON.stringify(searchFilter)}`,
        );
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Stack className="home-hero">
      <Stack className="hero-content">
        <Box className="welcome-text">[WELCOME TO HIGHLAND]</Box>
        <Box className="hero-title">Find Your Next Great Space</Box>
        <Box className="hero-subtitle">
          Premium properties for rent or sale — managed with professionalism and care
        </Box>
        <Link href="/property" passHref>
          <Button className="browse-button" variant="outlined">
            Browse Properties
          </Button>
        </Link>
      </Stack>

      <Stack className="hero-search">
        <TextField
          className="search-input"
          placeholder="Search by City, Zip Code, Community Name"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          fullWidth
        />
        <Button className="search-button" onClick={handleSearch}>
          Find Home
        </Button>
      </Stack>
    </Stack>
  );
};

export default HomeHero;
