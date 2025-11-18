import { Box, Button, FormControl, MenuItem, Select, Stack, TextField } from '@mui/material';
import React, { useState } from 'react';
import { Direction } from '../../enums/common.enum';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { useDarkMode } from '../../hooks/useDarkMode';
import { PropertiesInquiry } from '../../types/property/property.input';

const darkMenuProps = {
  PaperProps: {
    sx: {
      backgroundColor: '#1e2128',
      border: '1px solid #2d2d2d',
      '& .MuiMenuItem-root': {
        color: 'rgba(255, 255, 255, 0.9)',
        '&:hover': {
          backgroundColor: '#252830',
        },
        '&.Mui-selected': {
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: '#252830',
          },
        },
      },
    },
  },
};

const lightMenuProps = {
  PaperProps: {
    sx: {
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      '& .MuiMenuItem-root': {
        color: '#333',
        '&:hover': {
          backgroundColor: '#f5f5f5',
        },
        '&.Mui-selected': {
          backgroundColor: 'transparent',
          color: '#333',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
  },
};

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

  // Initialize states with empty values - will be synced via useEffect
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [room, setRoom] = useState<string>('');

  // Sync filter inputs with searchFilter prop changes
  React.useEffect(() => {
    // Check if searchFilter has custom filters or is default
    const hasLocation =
      searchFilter?.search?.locationList && searchFilter.search.locationList.length > 0;
    const hasType = searchFilter?.search?.typeList && searchFilter.search.typeList.length > 0;
    const hasRoom = searchFilter?.search?.roomsList && searchFilter.search.roomsList.length > 0;
    const hasCustomPrice =
      (searchFilter?.search?.pricesRange?.start && searchFilter.search.pricesRange.start > 0) ||
      (searchFilter?.search?.pricesRange?.end && searchFilter.search.pricesRange.end < 2000000);

    // Update city input from searchFilter - always reset if no location
    setCity(
      hasLocation && searchFilter.search.locationList ? searchFilter.search.locationList[0] : '',
    );

    // Update type input from searchFilter - always reset if no type
    setType(hasType && searchFilter.search.typeList ? searchFilter.search.typeList[0] : '');

    // Update room input from searchFilter - always reset if no room
    setRoom(
      hasRoom && searchFilter.search.roomsList ? String(searchFilter.search.roomsList[0]) : '',
    );

    // Update price inputs from searchFilter
    setMinPrice(
      searchFilter?.search?.pricesRange?.start && searchFilter.search.pricesRange.start > 0
        ? String(searchFilter.search.pricesRange.start)
        : '',
    );

    setMaxPrice(
      searchFilter?.search?.pricesRange?.end && searchFilter.search.pricesRange.end < 2000000
        ? String(searchFilter.search.pricesRange.end)
        : '',
    );
  }, [searchFilter]);

  const handleSearch = () => {
    const newFilter: PropertiesInquiry = {
      ...searchFilter,
      page: 1,
      limit: searchFilter.limit || 12,
      sort: searchFilter.sort || 'createdAt',
      direction: searchFilter.direction || Direction.DESC,
      search: {
        squaresRange: searchFilter.search?.squaresRange || {
          start: 0,
          end: 500,
        },
        pricesRange: {
          start: minPrice && minPrice.trim() ? Number(minPrice) : 0,
          end: maxPrice && maxPrice.trim() ? Number(maxPrice) : 2000000,
        },
      },
    };

    // Add filters only if they have values
    if (city && city.trim()) {
      // Normalize city input (case-insensitive matching)
      const normalizedCity = city.trim().toUpperCase();
      // Find matching PropertyLocation enum value
      const locationMatch = Object.values(PropertyLocation).find(
        (location) => location.toUpperCase() === normalizedCity,
      );

      if (locationMatch) {
        newFilter.search.locationList = [locationMatch];
      } else {
        // If no exact match, try partial match
        const partialMatch = Object.values(PropertyLocation).find(
          (location) =>
            location.toUpperCase().includes(normalizedCity) ||
            normalizedCity.includes(location.toUpperCase()),
        );

        if (partialMatch) {
          newFilter.search.locationList = [partialMatch];
        } else {
          // If still no match, use the normalized input as-is (might work with backend)
          newFilter.search.locationList = [normalizedCity as PropertyLocation];
        }
      }
    }

    if (type && type.trim()) {
      newFilter.search.typeList = [type.trim() as PropertyType];
    }

    if (room && room.trim() !== '') {
      newFilter.search.roomsList = [Number(room)];
    }

    setSearchFilter(newFilter);
    onSearch(newFilter);
  };

  const commonTextFieldStyles = {
    flex: 1,
    minWidth: 120,
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: isDarkMode ? '#1e2128' : '#f5f5f5',
      height: '48px',
      border: isDarkMode ? '1px solid #2d2d2d' : '1px solid #e0e0e0',
      transition: 'border-color 0.3s ease',
      '& fieldset': {
        border: 'none',
      },
      '&:hover': {
        backgroundColor: isDarkMode ? '#252830' : '#f5f5f5',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #d0d0d0',
      },
      '&.Mui-focused': {
        backgroundColor: isDarkMode ? '#1e2128' : '#f5f5f5',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #e0e0e0',
      },
    },
    '& .MuiInputBase-input': {
      color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#333',
      fontSize: '14px',
      transition: 'color 0.3s ease',
      '&::placeholder': {
        color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#666',
        opacity: 1,
      },
    },
  };

  const commonFormControlStyles = {
    flex: 1,
    minWidth: 120,
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: isDarkMode ? '#1e2128' : '#f5f5f5',
      height: '48px',
      border: isDarkMode ? '1px solid #2d2d2d' : '1px solid #e0e0e0',
      transition: 'border-color 0.3s ease',
      '& fieldset': {
        border: 'none',
      },
      '&:hover': {
        backgroundColor: isDarkMode ? '#252830' : '#f5f5f5',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #d0d0d0',
      },
      '&.Mui-focused': {
        backgroundColor: isDarkMode ? '#1e2128' : '#f5f5f5',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #e0e0e0',
      },
    },
  };

  return (
    <Box className="property-search-filter">
      <Stack
        className="filter-top-section"
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ width: '100%', flexWrap: 'nowrap' }}
      >
        <TextField
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          sx={commonTextFieldStyles}
        />
        <FormControl sx={commonFormControlStyles}>
          <Select
            value={type}
            displayEmpty
            onChange={(e) => setType(e.target.value)}
            sx={{
              color: isDarkMode ? '#fff' : '#333',
              fontSize: '14px',
              transition: 'color 0.3s ease',
              '& .MuiSelect-icon': {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#666',
                transition: 'color 0.3s ease',
              },
            }}
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <span style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#666' }}>
                    Type
                  </span>
                );
              }
              const capitalizeFirst = (str: string) =>
                str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
              return capitalizeFirst(selected);
            }}
            MenuProps={isDarkMode ? darkMenuProps : lightMenuProps}
          >
            <MenuItem value="">
              <span style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#666' }}>Any</span>
            </MenuItem>
            {Object.values(PropertyType).map((propertyType) => {
              const capitalizeFirst = (str: string) =>
                str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
              return (
                <MenuItem key={propertyType} value={propertyType}>
                  <span style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#666' }}>
                    {capitalizeFirst(propertyType)}
                  </span>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <TextField
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          type="number"
          sx={{
            ...commonTextFieldStyles,
            '& input[type=number]': {
              MozAppearance: 'textfield',
              '&::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '&::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            },
          }}
        />
        <TextField
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          type="number"
          sx={{
            ...commonTextFieldStyles,
            '& input[type=number]': {
              MozAppearance: 'textfield',
              '&::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '&::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            },
          }}
        />
        <TextField
          placeholder="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          type="number"
          sx={{
            ...commonTextFieldStyles,
            '& input[type=number]': {
              MozAppearance: 'textfield',
              '&::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '&::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            },
          }}
        />
        <Button className="search-button" variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Stack>
    </Box>
  );
};

export default PropertySearchFilter;
