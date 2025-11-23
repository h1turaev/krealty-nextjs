import { Box, Checkbox, FormControlLabel, Link, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { useDarkMode } from '../../hooks/useDarkMode';
import { PropertiesInquiry } from '../../types/property/property.input';

interface PropertyFilterPanelProps {
  searchFilter: PropertiesInquiry;
  setSearchFilter: (filter: PropertiesInquiry) => void;
  onSearch: (filter: PropertiesInquiry) => void;
}

// Property type options mapping - using enum values
const propertyTypeOptions = [
  { label: PropertyType.APARTMENT, value: PropertyType.APARTMENT },
  { label: PropertyType.VILLA, value: PropertyType.VILLA },
  { label: PropertyType.HOUSE, value: PropertyType.HOUSE },
];

// Helper function to format enum value for display
const formatPropertyTypeLabel = (value: string): string => {
  return value.charAt(0) + value.slice(1).toLowerCase();
};

// Transaction type options
const transactionTypeOptions = [
  { label: 'Rent', value: 'rent' },
  { label: 'Barter', value: 'barter' },
];

// Location options - using PropertyLocation enum
const locationOptions = [
  { label: 'Seoul', value: PropertyLocation.SEOUL },
  { label: 'Busan', value: PropertyLocation.BUSAN },
  { label: 'Incheon', value: PropertyLocation.INCHEON },
  { label: 'Daegu', value: PropertyLocation.DAEGU },
  { label: 'Daejon', value: PropertyLocation.DAEJON },
  { label: 'Jeju', value: PropertyLocation.JEJU },
];

// Price range options
const priceRangeOptions = [
  { label: 'Under $100,000', value: { start: 0, end: 100000 } },
  { label: '$100,000 - $200,000', value: { start: 100000, end: 200000 } },
  { label: '$200,000 - $300,000', value: { start: 200000, end: 300000 } },
  { label: '$300,000 - $500,000', value: { start: 300000, end: 500000 } },
  { label: '$500,000 - $1,000,000', value: { start: 500000, end: 1000000 } },
  { label: 'Over $1,000,000', value: { start: 1000000, end: 2000000 } },
];

// Square meters range options
const squareRangeOptions = [
  { label: 'Under 50 m²', value: { start: 0, end: 50 } },
  { label: '50 - 100 m²', value: { start: 50, end: 100 } },
  { label: '100 - 150 m²', value: { start: 100, end: 150 } },
  { label: '150 - 200 m²', value: { start: 150, end: 200 } },
  { label: '200 - 300 m²', value: { start: 200, end: 300 } },
  { label: 'Over 300 m²', value: { start: 300, end: 500 } },
];

// Room options
const roomOptions = [
  { label: '1 Room', value: 1 },
  { label: '2 Rooms', value: 2 },
  { label: '3 Rooms', value: 3 },
  { label: '4 Rooms', value: 4 },
  { label: '5+ Rooms', value: 5 },
];

// Helper function to format location for display
const formatLocationLabel = (value: string): string => {
  return value.charAt(0) + value.slice(1).toLowerCase();
};

const PropertyFilterPanel: React.FC<PropertyFilterPanelProps> = ({
  searchFilter,
  setSearchFilter,
  onSearch,
}) => {
  const { isDarkMode } = useDarkMode();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<any[]>([]);
  const [selectedSquareRanges, setSelectedSquareRanges] = useState<any[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [shouldUseDarkMode, setShouldUseDarkMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync with searchFilter
  useEffect(() => {
    if (searchFilter?.search?.typeList) {
      setSelectedPropertyTypes(searchFilter.search.typeList);
    }
    if (searchFilter?.search?.locationList) {
      setSelectedLocations(searchFilter.search.locationList);
    }
    if (searchFilter?.search?.roomsList) {
      setSelectedRooms(searchFilter.search.roomsList.map((r) => Number(r)));
    }
    // Note: pricesRange and squaresRange are single objects, not arrays
    // We'll handle them differently
  }, [searchFilter]);

  // Real-time dark mode tracking
  useEffect(() => {
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

  // Helper: Build base search object with defaults
  const buildBaseSearchObject = () => ({
    squaresRange: searchFilter.search?.squaresRange || { start: 0, end: 500 },
    pricesRange: searchFilter.search?.pricesRange || { start: 0, end: 2000000 },
  });

  // Helper: Preserve all other filters
  const preserveFilters = (searchObject: any) => {
    const { search } = searchFilter;
    if (search?.typeList?.length) searchObject.typeList = search.typeList;
    if (search?.locationList?.length) searchObject.locationList = search.locationList;
    if (search?.roomsList?.length) searchObject.roomsList = search.roomsList;
    if (search?.bedsList?.length) searchObject.bedsList = search.bedsList;
    if (search?.pricesRange) searchObject.pricesRange = search.pricesRange;
    if (search?.squaresRange) searchObject.squaresRange = search.squaresRange;
    if (search?.text) searchObject.text = search.text;
  };

  // Helper: Update filter and trigger search
  const updateAndSearch = (searchObject: any) => {
    const newFilter: PropertiesInquiry = {
      ...searchFilter,
      page: 1,
      search: searchObject,
    };
    setSearchFilter(newFilter);
    onSearch(newFilter);
  };

  const handlePropertyTypeChange = (value: string, checked: boolean) => {
    const newTypes = checked
      ? [...selectedPropertyTypes, ...(selectedPropertyTypes.includes(value) ? [] : [value])]
      : selectedPropertyTypes.filter((t) => t !== value);
    setSelectedPropertyTypes(newTypes);

    const searchObject: any = buildBaseSearchObject();
    if (newTypes.length > 0) searchObject.typeList = newTypes as PropertyType[];
    preserveFilters(searchObject);
    updateAndSearch(searchObject);
  };

  const handleTransactionTypeChange = (value: string, checked: boolean) => {
    const newTypes = checked
      ? [...selectedTransactionTypes, ...(selectedTransactionTypes.includes(value) ? [] : [value])]
      : selectedTransactionTypes.filter((t) => t !== value);
    setSelectedTransactionTypes(newTypes);

    const searchObject: any = buildBaseSearchObject();
    preserveFilters(searchObject);

    // Transaction type'lar uchun text search
    const currentTextSearchTerms = searchFilter.search?.text
      ? searchFilter.search.text
          .split(' ')
          .filter(
            (term) =>
              !transactionTypeOptions.some(
                (opt) => opt.value === term || opt.label.toLowerCase().includes(term.toLowerCase()),
              ),
          )
      : [];

    if (newTypes.length > 0) {
      const transactionTexts = newTypes.map((t) =>
        t === 'rent' ? 'rent' : t === 'barter' ? 'charter' : t,
      );
      searchObject.text = [...currentTextSearchTerms, ...transactionTexts].join(' ').trim();
    } else {
      searchObject.text = currentTextSearchTerms.join(' ').trim();
      if (!searchObject.text) delete searchObject.text;
    }

    updateAndSearch(searchObject);
  };

  const handleLocationChange = (value: string, checked: boolean) => {
    const newLocations = checked
      ? [...selectedLocations, ...(selectedLocations.includes(value) ? [] : [value])]
      : selectedLocations.filter((l) => l !== value);
    setSelectedLocations(newLocations);

    const searchObject: any = buildBaseSearchObject();
    if (newLocations.length > 0) searchObject.locationList = newLocations as PropertyLocation[];
    preserveFilters(searchObject);
    updateAndSearch(searchObject);
  };

  const handlePriceRangeChange = (range: any, checked: boolean) => {
    const isRangeExists = (r: any) => r.start === range.start && r.end === range.end;
    const newRanges = checked
      ? [...selectedPriceRanges, ...(selectedPriceRanges.some(isRangeExists) ? [] : [range])]
      : selectedPriceRanges.filter((r) => !isRangeExists(r));
    setSelectedPriceRanges(newRanges);

    const searchObject: any = buildBaseSearchObject();
    if (newRanges.length > 0) {
      searchObject.pricesRange = {
        start: Math.min(...newRanges.map((r) => r.start)),
        end: Math.max(...newRanges.map((r) => r.end)),
      };
    } else {
      searchObject.pricesRange = { start: 0, end: 2000000 };
    }
    preserveFilters(searchObject);
    updateAndSearch(searchObject);
  };

  const handleSquareRangeChange = (range: any, checked: boolean) => {
    const isRangeExists = (r: any) => r.start === range.start && r.end === range.end;
    const newRanges = checked
      ? [...selectedSquareRanges, ...(selectedSquareRanges.some(isRangeExists) ? [] : [range])]
      : selectedSquareRanges.filter((r) => !isRangeExists(r));
    setSelectedSquareRanges(newRanges);

    const searchObject: any = buildBaseSearchObject();
    if (newRanges.length > 0) {
      searchObject.squaresRange = {
        start: Math.min(...newRanges.map((r) => r.start)),
        end: Math.max(...newRanges.map((r) => r.end)),
      };
    } else {
      searchObject.squaresRange = { start: 0, end: 500 };
    }
    preserveFilters(searchObject);
    updateAndSearch(searchObject);
  };

  const handleRoomChange = (roomCount: number, checked: boolean) => {
    const newRooms = checked
      ? [...selectedRooms, ...(selectedRooms.includes(roomCount) ? [] : [roomCount])]
      : selectedRooms.filter((r) => r !== roomCount);
    setSelectedRooms(newRooms);

    const searchObject: any = buildBaseSearchObject();
    if (newRooms.length > 0) searchObject.roomsList = newRooms;
    preserveFilters(searchObject);
    updateAndSearch(searchObject);
  };

  const handleReset = () => {
    setSelectedPropertyTypes([]);
    setSelectedTransactionTypes([]);
    setSelectedLocations([]);
    setSelectedPriceRanges([]);
    setSelectedSquareRanges([]);
    setSelectedRooms([]);
    const defaultFilter: PropertiesInquiry = {
      ...searchFilter,
      page: 1,
      search: {
        squaresRange: {
          start: 0,
          end: 500,
        },
        pricesRange: {
          start: 0,
          end: 2000000,
        },
      },
    };
    setSearchFilter(defaultFilter);
    onSearch(defaultFilter);
  };

  const containerStyles = React.useMemo(() => {
    return {
      width: '100%',
      backgroundColor: shouldUseDarkMode ? '#1e2128' : '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      border: shouldUseDarkMode ? '1px solid #2d2d2d' : '1px solid #e0e0e0',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    };
  }, [shouldUseDarkMode, isDarkMode]);

  const headerStyles = React.useMemo(() => {
    return {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    };
  }, []);

  const titleStyles = React.useMemo(() => {
    return {
      fontSize: '18px',
      fontWeight: 600,
      color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
      transition: 'color 0.3s ease',
    };
  }, [shouldUseDarkMode, isDarkMode]);

  const resetLinkStyles = React.useMemo(() => {
    return {
      fontSize: '14px',
      color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#666',
      textDecoration: 'underline',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
      '&:hover': {
        color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
      },
    };
  }, [shouldUseDarkMode, isDarkMode]);

  const sectionTitleStyles = React.useMemo(() => {
    return {
      fontSize: '16px',
      fontWeight: 600,
      color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
      marginBottom: '16px',
      transition: 'color 0.3s ease',
    };
  }, [shouldUseDarkMode, isDarkMode]);

  const checkboxStyles = React.useMemo(() => {
    return {
      '& .MuiCheckbox-root': {
        color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#999',
        transition: 'color 0.3s ease',
        '&:hover': {
          backgroundColor: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
        },
        '&.Mui-checked': {
          color: '#3b82f6',
          '&:hover': {
            backgroundColor: shouldUseDarkMode
              ? 'rgba(59, 130, 246, 0.1)'
              : 'rgba(59, 130, 246, 0.08)',
          },
        },
        '&.Mui-focusVisible': {
          outline: shouldUseDarkMode
            ? '2px solid rgba(59, 130, 246, 0.5)'
            : '2px solid rgba(59, 130, 246, 0.3)',
          outlineOffset: '2px',
        },
      },
      '& .MuiFormControlLabel-label': {
        color: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
        fontSize: '14px',
        transition: 'color 0.3s ease',
        '&:hover': {
          color: shouldUseDarkMode ? 'rgba(255, 255, 255, 1)' : '#181a20',
        },
      },
      '&:hover': {
        '& .MuiFormControlLabel-label': {
          color: shouldUseDarkMode ? 'rgba(255, 255, 255, 1)' : '#181a20',
        },
      },
    };
  }, [shouldUseDarkMode, isDarkMode]);

  const dividerStyles = React.useMemo(() => {
    return {
      width: '100%',
      height: '1px',
      backgroundColor: shouldUseDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
      margin: '24px 0',
      transition: 'background-color 0.3s ease',
    };
  }, [shouldUseDarkMode, isDarkMode]);

  return (
    <Box className="property-filter-panel" sx={containerStyles}>
      <Stack className="filter-header" sx={headerStyles}>
        <Typography sx={titleStyles}>Filter</Typography>
        <Link onClick={handleReset} sx={resetLinkStyles}>
          Reset
        </Link>
      </Stack>

      <Stack className="filter-content" spacing={3}>
        {/* Property Type Section */}
        <Box>
          <Typography sx={sectionTitleStyles}>Property type</Typography>
          <Stack spacing={1}>
            {propertyTypeOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={selectedPropertyTypes.includes(option.value)}
                    onChange={(e) => handlePropertyTypeChange(option.value, e.target.checked)}
                  />
                }
                label={formatPropertyTypeLabel(option.label)}
                sx={checkboxStyles}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={dividerStyles} />

        {/* Location Section */}
        <Box>
          <Typography sx={sectionTitleStyles}>Location</Typography>
          <Stack spacing={1}>
            {locationOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={selectedLocations.includes(option.value)}
                    onChange={(e) => handleLocationChange(option.value, e.target.checked)}
                  />
                }
                label={formatLocationLabel(option.label)}
                sx={checkboxStyles}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={dividerStyles} />

        {/* Price Range Section */}
        <Box>
          <Typography sx={sectionTitleStyles}>Price</Typography>
          <Stack spacing={1}>
            {priceRangeOptions.map((option) => (
              <FormControlLabel
                key={option.label}
                control={
                  <Checkbox
                    checked={selectedPriceRanges.some(
                      (r) => r.start === option.value.start && r.end === option.value.end,
                    )}
                    onChange={(e) => handlePriceRangeChange(option.value, e.target.checked)}
                  />
                }
                label={option.label}
                sx={checkboxStyles}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={dividerStyles} />

        {/* Square Meters Section */}
        <Box>
          <Typography sx={sectionTitleStyles}>Square Meters</Typography>
          <Stack spacing={1}>
            {squareRangeOptions.map((option) => (
              <FormControlLabel
                key={option.label}
                control={
                  <Checkbox
                    checked={selectedSquareRanges.some(
                      (r) => r.start === option.value.start && r.end === option.value.end,
                    )}
                    onChange={(e) => handleSquareRangeChange(option.value, e.target.checked)}
                  />
                }
                label={option.label}
                sx={checkboxStyles}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={dividerStyles} />

        {/* Rooms Section */}
        <Box>
          <Typography sx={sectionTitleStyles}>Rooms</Typography>
          <Stack spacing={1}>
            {roomOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={selectedRooms.includes(option.value)}
                    onChange={(e) => handleRoomChange(option.value, e.target.checked)}
                  />
                }
                label={option.label}
                sx={checkboxStyles}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={dividerStyles} />

        {/* Transaction Type/Price Section */}
        <Box>
          <Typography sx={sectionTitleStyles}>Transaction Type/Price</Typography>
          <Stack spacing={1}>
            {transactionTypeOptions.map((option) => (
              <FormControlLabel
                key={option.label}
                control={
                  <Checkbox
                    checked={selectedTransactionTypes.includes(option.value)}
                    onChange={(e) => handleTransactionTypeChange(option.value, e.target.checked)}
                  />
                }
                label={option.label}
                sx={checkboxStyles}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default PropertyFilterPanel;
