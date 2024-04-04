import { useRouter } from 'next/router';
import React from 'react';

import type { RoutedTab } from 'ui/shared/Tabs/types';

import config from 'configs/app';
import useHasAccount from 'lib/hooks/useHasAccount';
import useIsMobile from 'lib/hooks/useIsMobile';
import useNewTxsSocket from 'lib/hooks/useNewTxsSocket';
import getQueryParamString from 'lib/router/getQueryParamString';
import { TX } from 'stubs/tx';
import { generateListStub } from 'stubs/utils';
import PageTitle from 'ui/shared/Page/PageTitle';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import RoutedTabs from 'ui/shared/Tabs/RoutedTabs';
import TxsWatchlist from 'ui/txs/TxsWatchlist';
import TxsWithFrontendSorting from 'ui/txs/TxsWithFrontendSorting';

const TAB_LIST_PROPS = {
  marginBottom: 0,
  py: 5,
  marginTop: -5,
};

const Transactions = () => {
  const verifiedTitle = config.chain.verificationType === 'validation' ? 'Validated' : 'Mined';
  const router = useRouter();
  const isMobile = useIsMobile();
  const tab = getQueryParamString(router.query.tab);

  React.useEffect(() => {
    if (tab === 'blob_txs' && !config.features.dataAvailability.isEnabled) {
      router.replace({ pathname: '/txs' }, undefined, { shallow: true });
    }
  }, [ router, tab ]);

  const txsValidatedQuery = useQueryWithPages({
    resourceName: 'txs_validated',
    filters: { filter: 'validated' },
    options: {
      enabled: !tab || tab === 'validated',
      placeholderData: generateListStub<'txs_validated'>(TX, 50, { next_page_params: {
        block_number: 9005713,
        index: 5,
        items_count: 50,
        filter: 'validated',
      } }),
    },
  });

  const txsPendingQuery = useQueryWithPages({
    resourceName: 'txs_pending',
    filters: { filter: 'pending' },
    options: {
      enabled: tab === 'pending',
      placeholderData: generateListStub<'txs_pending'>(TX, 50, { next_page_params: {
        inserted_at: '2024-02-05T07:04:47.749818Z',
        hash: '0x00',
        filter: 'pending',
      } }),
    },
  });

  const txsWithBlobsQuery = useQueryWithPages({
    resourceName: 'txs_with_blobs',
    filters: { type: 'blob_transaction' },
    options: {
      enabled: config.features.dataAvailability.isEnabled && tab === 'blob_txs',
      placeholderData: generateListStub<'txs_with_blobs'>(TX, 50, { next_page_params: {
        block_number: 10602877,
        index: 8,
        items_count: 50,
      } }),
    },
  });

  const txsWatchlistQuery = useQueryWithPages({
    resourceName: 'txs_watchlist',
    options: {
      enabled: tab === 'watchlist',
      placeholderData: generateListStub<'txs_watchlist'>(TX, 50, { next_page_params: {
        block_number: 9005713,
        index: 5,
        items_count: 50,
      } }),
    },
  });

  const { num, socketAlert } = useNewTxsSocket();

  const hasAccount = useHasAccount();

  const tabs: Array<RoutedTab> = [
    {
      id: 'validated',
      title: verifiedTitle,
      component:
        <TxsWithFrontendSorting
          query={ txsValidatedQuery }
          showSocketInfo={ txsValidatedQuery.pagination.page === 1 }
          socketInfoNum={ num }
          socketInfoAlert={ socketAlert }
        /> },
    {
      id: 'pending',
      title: 'Pending',
      component: (
        <TxsWithFrontendSorting
          query={ txsPendingQuery }
          showBlockInfo={ false }
          showSocketInfo={ txsPendingQuery.pagination.page === 1 }
          socketInfoNum={ num }
          socketInfoAlert={ socketAlert }
        />
      ),
    },
    config.features.dataAvailability.isEnabled && {
      id: 'blob_txs',
      title: 'Blob txns',
      component: (
        <TxsWithFrontendSorting
          query={ txsWithBlobsQuery }
          showSocketInfo={ txsWithBlobsQuery.pagination.page === 1 }
          socketInfoNum={ num }
          socketInfoAlert={ socketAlert }
        />
      ),
    },
    hasAccount ? {
      id: 'watchlist',
      title: 'Watch list',
      component: <TxsWatchlist query={ txsWatchlistQuery }/>,
    } : undefined,
  ].filter(Boolean);

  const pagination = (() => {
    switch (tab) {
      case 'pending': return txsPendingQuery.pagination;
      case 'watchlist': return txsWatchlistQuery.pagination;
      case 'blob_txs': return txsWithBlobsQuery.pagination;
      default: return txsValidatedQuery.pagination;
    }
  })();

  return (
    <>
      <PageTitle title="Transactions" withTextAd/>
      <RoutedTabs
        tabs={ tabs }
        tabListProps={ isMobile ? undefined : TAB_LIST_PROPS }
        rightSlot={ (
          pagination.isVisible && !isMobile ? <Pagination my={ 1 } { ...pagination }/> : null
        ) }
        stickyEnabled={ !isMobile }
      />
    </>
  );
};

export default Transactions;
