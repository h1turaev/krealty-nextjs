import { useMutation, useQuery } from '@apollo/client';
import { Pagination, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { GET_PROPERTIES } from '../../apollo/user/query';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyCard from '../../libs/components/property/PropertyCard';
import PropertyFilterPanel from '../../libs/components/property/PropertyFilterPanel';
import PropertySearchFilter from '../../libs/components/property/PropertySearchFilter';
import { Direction, Message } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { showError, showSuccessTopRight } from '../../libs/toast';
import { T } from '../../libs/types/common';
import { Property } from '../../libs/types/property/property';
import { PropertiesInquiry } from '../../libs/types/property/property.input';

const getDefaultFilter = (): PropertiesInquiry => ({
  page: 1,
  limit: 12,
  sort: 'createdAt',
  direction: Direction.DESC,
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
});

export const getServerSideProps = async ({ locale, query }: any) => {
  let initialInput = getDefaultFilter();

  // Only use query.input if it exists and is valid
  if (query.input) {
    try {
      initialInput = JSON.parse(query.input as string);
    } catch (err) {
      console.log('ERROR parsing query input:', err);
      // If parsing fails, use default
      initialInput = getDefaultFilter();
    }
  }

  return {
    props: {
      initialInput,
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
  const device = useDeviceDetect();
  const router = useRouter();
  const defaultFilter = getDefaultFilter();

  const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(
    router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortingOpen, setSortingOpen] = useState(false);
  const [filterSortName, setFilterSortName] = useState('New');
  const [isPageReload, setIsPageReload] = useState(false);

  /** APOLLO REQUESTS **/
  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

  const {
    loading: getPropertiesLoading,
    data: getPropertiesData,
    error: getPropertiesError,
    refetch: getPropertiesRefetch,
  } = useQuery(GET_PROPERTIES, {
    fetchPolicy: 'network-only',
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setProperties(data?.getProperties?.list || []);
      setTotal(data?.getProperties?.metaCounter?.[0]?.total || 0);
    },
  });

  /** LIFECYCLES **/
  // Reset filters on page reload (when there's no query.input)
  useEffect(() => {
    if (!router.query.input && !isPageReload) {
      setIsPageReload(true);
      setSearchFilter(defaultFilter);
      setCurrentPage(1);
      // Clear URL query params
      router.replace('/property', undefined, { shallow: true });
      // Refetch with default filter
      getPropertiesRefetch({ input: defaultFilter }).catch((err) => {
        console.log('ERROR refetching properties:', err);
      });
    }
  }, []);

  useEffect(() => {
    if (router.query.input) {
      try {
        const inputObj = JSON.parse(router?.query?.input as string);
        const filterString = JSON.stringify(inputObj);
        const currentFilterString = JSON.stringify(searchFilter);

        // Only update if filter actually changed
        if (filterString !== currentFilterString) {
          setSearchFilter(inputObj);
          setCurrentPage(inputObj.page === undefined ? 1 : inputObj.page);
          // Refetch with new filter
          getPropertiesRefetch({ input: inputObj }).catch((err) => {
            console.log('ERROR refetching properties:', err);
          });
        } else {
          setCurrentPage(inputObj.page === undefined ? 1 : inputObj.page);
        }
      } catch (err) {
        console.log('ERROR parsing router query:', err);
        // On error, reset to default
        setSearchFilter(defaultFilter);
        setCurrentPage(1);
        router.replace('/property', undefined, { shallow: true });
      }
    }
  }, [router.query.input]);

  const handleSearch = async (filter?: PropertiesInquiry) => {
    try {
      const filterToUse = filter || searchFilter;
      setCurrentPage(1);
      setSearchFilter(filterToUse);
      await router.push(
        `/property?input=${JSON.stringify(filterToUse)}`,
        `/property?input=${JSON.stringify(filterToUse)}`,
        {
          scroll: false,
        },
      );
      // Refetch immediately after setting filter
      await getPropertiesRefetch({ input: filterToUse });
    } catch (err: any) {
      console.log('ERROR, handleSearch:', err);
    }
  };

  /** HANDLERS **/
  const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
    searchFilter.page = value;
    await router.push(
      `/property?input=${JSON.stringify(searchFilter)}`,
      `/property?input=${JSON.stringify(searchFilter)}`,
      {
        scroll: false,
      },
    );
    setCurrentPage(value);
  };

  const likePropertyHandler = async (user: T, id: string) => {
    try {
      if (!id) return;
      if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

      await likeTargetProperty({
        variables: { input: id },
      });
      await getPropertiesRefetch({ input: initialInput });

      await showSuccessTopRight('success', 800);
    } catch (err: any) {
      console.log('ERROR, likePropertyHandler:', err.message);
      showError(err.message);
    }
  };

  const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setSortingOpen(true);
  };

  const sortingCloseHandler = () => {
    setSortingOpen(false);
    setAnchorEl(null);
  };

  const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
    switch (e.currentTarget.id) {
      case 'new':
        setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC });
        setFilterSortName('New');
        break;
      case 'lowest':
        setSearchFilter({ ...searchFilter, sort: 'propertyPrice', direction: Direction.ASC });
        setFilterSortName('Lowest Price');
        break;
      case 'highest':
        setSearchFilter({ ...searchFilter, sort: 'propertyPrice', direction: Direction.DESC });
        setFilterSortName('Highest Price');
    }
    setSortingOpen(false);
    setAnchorEl(null);
  };

  if (device === 'mobile') {
    return <h1>PROPERTIES MOBILE</h1>;
  } else {
    return (
      <div id="property-list-page" style={{ position: 'relative' }}>
        <div className="container">
          <Stack className={'property-page'}>
            {/* Search Bar - Top */}
            <Stack className={'filter-config'} mb={3}>
              <PropertySearchFilter
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                onSearch={handleSearch}
              />
            </Stack>

            {/* Main Content - Filter Panel (Left) + Property Listings (Right) */}
            <Stack className="main-config" direction="row" spacing={3} mb={'76px'}>
              {/* Filter Panel - Left Side */}
              <Stack className="filter-panel-wrapper" sx={{ minWidth: '280px', maxWidth: '280px' }}>
                <PropertyFilterPanel
                  searchFilter={searchFilter}
                  setSearchFilter={setSearchFilter}
                  onSearch={handleSearch}
                />
              </Stack>

              {/* Property Listings - Right Side */}
              <Stack className="listings-wrapper" sx={{ flex: 1 }}>
                <Stack className={'list-config'}>
                  {properties?.length === 0 ? (
                    <div className={'no-data'}>
                      <img src="/img/icons/icoAlert.svg" alt="" />
                      <p>No Properties found!</p>
                    </div>
                  ) : (
                    properties.map((property: Property) => {
                      return (
                        <PropertyCard
                          property={property}
                          likePropertyHandler={likePropertyHandler}
                          key={property?._id}
                        />
                      );
                    })
                  )}
                </Stack>
                {properties.length !== 0 && (
                  <Stack className="pagination-config">
                    <Stack className="pagination-box">
                      <Pagination
                        page={currentPage}
                        count={Math.ceil(total / searchFilter.limit)}
                        onChange={handlePaginationChange}
                        shape="circular"
                        color="primary"
                      />
                    </Stack>
                    <Stack className="total-result">
                      <Typography>
                        [ Total propert{total > 1 ? 'ies' : 'y'}: {total} ]
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Stack>
        </div>
      </div>
    );
  }
};

PropertyList.defaultProps = {
  initialInput: {
    page: 1,
    limit: 12,
    sort: 'createdAt',
    direction: 'DESC',
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
  },
};

export default withLayoutBasic(PropertyList);
