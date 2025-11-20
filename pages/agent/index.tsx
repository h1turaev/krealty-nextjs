import { useMutation, useQuery } from '@apollo/client';
import { Box, Stack } from '@mui/material';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { GET_AGENTS } from '../../apollo/user/query';
import AgentCard from '../../libs/components/common/AgentCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Messages } from '../../libs/config';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/types/member/member';

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const AgentList: NextPage = ({ initialInput, ...props }: any) => {
  const device = useDeviceDetect();
  const router = useRouter();
  const [searchFilter, setSearchFilter] = useState<any>(
    router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
  );
  const [agents, setAgents] = useState<Member[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>('');

  /** APOLLO REQUESTS **/
  const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

  const {
    loading: getAgentsLoading,
    data: getAgentsData,
    error: getAgentsError,
    refetch: getAgentsRefetch,
  } = useQuery(GET_AGENTS, {
    fetchPolicy: 'network-only',
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setAgents(data?.getAgents?.list);
      setTotal(data?.getAgents?.metaCounter?.[0]?.total);
    },
  });

  /** LIFECYCLES **/
  useEffect(() => {
    if (router.query.input) {
      const input_obj = JSON.parse(router?.query?.input as string);
      setSearchFilter(input_obj);
    } else
      router.replace(
        `/agent?input=${JSON.stringify(searchFilter)}`,
        `/agent?input=${JSON.stringify(searchFilter)}`,
      );

    setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
  }, [router]);

  /** HANDLERS **/
  const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
    searchFilter.page = value;
    await router.push(
      `/agent?input=${JSON.stringify(searchFilter)}`,
      `/agent?input=${JSON.stringify(searchFilter)}`,
      {
        scroll: false,
      },
    );
    setCurrentPage(value);
  };

  /** LIKE LOGIC   */
  const likeMemberHandler = async (user: any, id: string) => {
    try {
      if (!id) return;
      if (!user._id) throw new Error(Messages.error2);

      await likeTargetMember({
        variables: {
          input: id,
        },
      });

      await getAgentsRefetch({ input: searchFilter });
      await sweetTopSmallSuccessAlert('success', 800);
    } catch (err: any) {
      console.log('ERROR, likePropertyHandler:', err.message);
      sweetMixinErrorAlert(err.message).then();
    }
  };

  if (device === 'mobile') {
    return <h1>AGENTS PAGE MOBILE</h1>;
  } else {
    return (
      <Stack className={'agent-list-page'}>
        <Stack className={'container'}>
          <Stack className={'filter'}>
            <Box component={'div'} className={'left'}>
              <input
                type="text"
                placeholder={'Search for an agent'}
                value={searchText}
                onChange={(e: any) => setSearchText(e.target.value)}
                onKeyDown={(event: any) => {
                  if (event.key == 'Enter') {
                    setSearchFilter({
                      ...searchFilter,
                      search: { ...searchFilter.search, text: searchText },
                    });
                  }
                }}
              />
            </Box>
          </Stack>
          <Stack className={'card-wrap'}>
            {agents?.length === 0 ? (
              <div className={'no-data'}>
                <img src="/img/icons/icoAlert.svg" alt="" />
                <p>No Agents found!</p>
              </div>
            ) : (
              agents.map((agent: Member) => {
                return (
                  <AgentCard agent={agent} key={agent._id} likeMemberHandler={likeMemberHandler} />
                );
              })
            )}
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

AgentList.defaultProps = {
  initialInput: {
    page: 1,
    limit: 10,
    sort: 'createdAt',
    direction: 'DESC',
    search: {},
  },
};

export default withLayoutBasic(AgentList);
