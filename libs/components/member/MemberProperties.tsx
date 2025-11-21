import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Pagination, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { userVar } from '../../../apollo/store';
import { UPDATE_PROPERTY } from '../../../apollo/user/mutation';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { showConfirm, showError } from '../../toast';
import { T } from '../../types/common';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { PropertyCard } from '../mypage/PropertyCard';

const MyProperties: NextPage = ({ initialInput, ...props }: any) => {
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const { memberId } = router.query;
  const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>({ ...initialInput });
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);

  /** APOLLO REQUESTS **/
  const [updateProperty] = useMutation(UPDATE_PROPERTY);

  const {
    loading: getPropertiesLoading,
    data: getPropertiesData,
    error: getPropertiesError,
    refetch: getPropertiesRefetch,
  } = useQuery(GET_PROPERTIES, {
    fetchPolicy: 'network-only',
    variables: { input: searchFilter },
    skip: !searchFilter?.search?.memberId,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setAgentProperties(data?.getProperties?.list);
      setTotal(data?.getProperties?.metaCounter[0]?.total ?? 0);
    },
  });

  /** LIFECYCLES **/
  useEffect(() => {
    getPropertiesRefetch().then();
  }, [searchFilter]);

  useEffect(() => {
    if (memberId)
      setSearchFilter({
        ...initialInput,
        search: { ...initialInput.search, memberId: memberId as string },
      });
  }, [memberId]);

  /** HANDLERS **/
  const paginationHandler = (e: T, value: number) => {
    setSearchFilter({ ...searchFilter, page: value });
  };

  const updatePropertyHandler = async (status: string, id: string) => {
    try {
      if (await showConfirm(`Are you sure change to ${status} status?`)) {
        await updateProperty({
          variables: {
            input: {
              _id: id,
              propertyStatus: status,
            },
          },
        });

        await getPropertiesRefetch({ input: searchFilter });
      }
    } catch (err: any) {
      await showError(err.message || 'An error occurred');
    }
  };

  if (device === 'mobile') {
    return <div>HIGHLAND PROPERTIES MOBILE</div>;
  } else {
    return (
      <div id="member-properties-page">
        <Stack className="main-title-box">
          <Stack className="right-box">
            <Typography className="main-title">Properties</Typography>
          </Stack>
        </Stack>
        <Stack className="properties-list-box">
          <Stack className="list-box">
            {agentProperties?.length > 0 && (
              <Stack className="listing-title-box">
                <Typography className="title-text">Listing title</Typography>
                <Typography className="title-text">Date Published</Typography>
                <Typography className="title-text">Status</Typography>
                <Typography className="title-text">View</Typography>
              </Stack>
            )}
            {agentProperties?.length === 0 && (
              <div className={'no-data'}>
                <img src="/img/icons/icoAlert.svg" alt="" />
                <p>No Property found!</p>
              </div>
            )}
            {agentProperties?.map((property: Property) => {
              // Faqat property egasi statusni o'zgartira oladi
              const isOwner = user?._id && property?.memberId === user._id;
              return (
                <PropertyCard
                  property={property}
                  memberPage={true}
                  key={property?._id}
                  updatePropertyHandler={isOwner ? updatePropertyHandler : undefined}
                />
              );
            })}

            {agentProperties.length !== 0 && (
              <Stack className="pagination-config">
                <Stack className="pagination-box">
                  <Pagination
                    count={Math.ceil(total / searchFilter.limit)}
                    page={searchFilter.page}
                    shape="circular"
                    onChange={paginationHandler}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#181a20',
                        '&.Mui-selected': {
                          backgroundColor: '#181a20',
                          color: '#ffffff',
                        },
                      },
                    }}
                  />
                </Stack>
                <Stack className="total-result">
                  <Typography>{total} property available</Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>
      </div>
    );
  }
};

MyProperties.defaultProps = {
  initialInput: {
    page: 1,
    limit: 5,
    sort: 'createdAt',
    search: {
      memberId: '',
    },
  },
};

export default MyProperties;
