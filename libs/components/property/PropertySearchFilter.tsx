import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import React, { useState } from 'react';
import { Direction } from '../../enums/common.enum';
import { PropertyLocation } from '../../enums/property.enum';
import { useDarkMode } from '../../hooks/useDarkMode';
import { PropertiesInquiry } from '../../types/property/property.input';

interface PropertySearchFilterProps {
  searchFilter: PropertiesInquiry;
  setSearchFilter: (filter: PropertiesInquiry) => void;
  onSearch: (filter: PropertiesInquiry) => void;
}

const PropertySearchFilter: React.FC<PropertySearchFilterProps> = ({
  searchFilter,
  setSearchFilter,
  onSearch,
}) => {
  const { isDarkMode } = useDarkMode();
  const [isMounted, setIsMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [shouldUseDarkMode, setShouldUseDarkMode] = React.useState(false);

  // Ensure component is mounted before applying dark mode styles
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync search term from searchFilter
  React.useEffect(() => {
    if (searchFilter?.search?.text) {
      setSearchTerm(searchFilter.search.text);
    } else {
      setSearchTerm('');
    }
  }, [searchFilter]);

  // Real-time dark mode tracking
  React.useEffect(() => {
    if (!isMounted) return;

    const checkDarkMode = () => {
      // Always check DOM first, as it's the source of truth
      const hasDarkClass =
        document.documentElement.classList.contains('dark-mode') ||
        document.body.classList.contains('dark-mode');
      setShouldUseDarkMode(hasDarkClass);
    };

    // Check immediately
    checkDarkMode();

    // Watch for dark mode class changes on document (real-time)
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also listen to isDarkMode changes from hook
    const timeoutId = setTimeout(checkDarkMode, 0);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isDarkMode, isMounted]);

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm?.trim();

    // Build search object
    const searchObject: any = {
      squaresRange: searchFilter.search?.squaresRange || {
        start: 0,
        end: 500,
      },
      pricesRange: searchFilter.search?.pricesRange || {
        start: 0,
        end: 2000000,
      },
    };

    // Check if search term matches a city name from PropertyLocation enum
    if (trimmedSearchTerm && trimmedSearchTerm.length > 0) {
      const normalizedSearch = trimmedSearchTerm.toUpperCase();

      // Try to find matching location
      const locationMatch = Object.values(PropertyLocation).find(
        (location) => location.toUpperCase() === normalizedSearch,
      );

      if (locationMatch) {
        // If it's a city name, add to locationList
        searchObject.locationList = [locationMatch];
      } else {
        // Try partial match for city names
        const partialLocationMatch = Object.values(PropertyLocation).find(
          (location) =>
            location.toUpperCase().includes(normalizedSearch) ||
            normalizedSearch.includes(location.toUpperCase()),
        );

        if (partialLocationMatch) {
          searchObject.locationList = [partialLocationMatch];
        } else {
          // If not a city, use text search for property title/name
          searchObject.text = trimmedSearchTerm;
        }
      }
    }

    // Preserve other search filters if they exist
    if (searchFilter.search?.typeList && searchFilter.search.typeList.length > 0) {
      searchObject.typeList = searchFilter.search.typeList;
    }
    if (searchFilter.search?.roomsList && searchFilter.search.roomsList.length > 0) {
      searchObject.roomsList = searchFilter.search.roomsList;
    }
    if (searchFilter.search?.bedsList && searchFilter.search.bedsList.length > 0) {
      searchObject.bedsList = searchFilter.search.bedsList;
    }

    const newFilter: PropertiesInquiry = {
      ...searchFilter,
      page: 1,
      limit: searchFilter.limit || 12,
      sort: searchFilter.sort || 'createdAt',
      direction: searchFilter.direction || Direction.DESC,
      search: searchObject,
    };

    setSearchFilter(newFilter);
    onSearch(newFilter);
  };

  const searchBarStyles = React.useMemo(() => {
    return {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      backgroundColor: shouldUseDarkMode ? '#2a2d35' : '#f5f5f5',
      borderRadius: '12px',
      padding: '4px',
      border: shouldUseDarkMode ? '1px solid #2d2d2d' : '1px solid #e0e0e0',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
      overflow: 'hidden',
    };
  }, [shouldUseDarkMode, isDarkMode]);

  const inputStyles = React.useMemo(() => {
    return {
      flex: 1,
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '12px',
        height: '40px',
        paddingRight: '8px',
        '& fieldset': {
          border: 'none',
        },
        '&:hover fieldset': {
          border: 'none',
        },
        '&.Mui-focused fieldset': {
          border: 'none',
        },
        '& .MuiInputBase-input': {
          color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
          fontSize: '16px',
          padding: '0 15px',
          lineHeight: '1.5',
          transition: 'color 0.3s ease',
          '&::placeholder': {
            color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#999',
            opacity: 1,
            fontSize: '16px',
            transition: 'color 0.3s ease',
          },
        },
      },
    };
  }, [shouldUseDarkMode, isDarkMode]);

  const iconButtonStyles = React.useMemo(() => {
    return {
      width: '45px',
      height: '45px',
      borderRadius: '50%',
      backgroundColor: '#000000',
      color: '#ffffff',
      padding: 0,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      outline: 'none',
      border: 'none',
      '&:hover': {
        backgroundColor: '#1a1a1a',
      },
      '&:focus': {
        outline: 'none',
        border: 'none',
        boxShadow: 'none',
      },
      '&:focus-visible': {
        outline: 'none',
        border: 'none',
        boxShadow: 'none',
      },
      '& .MuiSvgIcon-root': {
        width: '24px',
        height: '24px',
        fontSize: '24px',
        transition: 'transform 0.2s ease',
      },
      '&:hover .MuiSvgIcon-root': {
        transform: 'translateX(2px)',
      },
    };
  }, []);

  return (
    <Box className="property-search-filter">
      <Stack className="search-bar-container" sx={searchBarStyles}>
        <TextField
          placeholder="Search by City, Zip Code, or Address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          sx={inputStyles}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} sx={iconButtonStyles} edge="end">
                  <ArrowForwardIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Box>
  );
};

export default PropertySearchFilter;
