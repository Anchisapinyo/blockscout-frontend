import { Box, Flex, Skeleton, chakra } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import dayjs from 'lib/date/dayjs';
import { HOMEPAGE_STATS } from 'stubs/stats';
import GasTrackerChart from 'ui/gasTracker/GasTrackerChart';
import GasTrackerNetworkUtilization from 'ui/gasTracker/GasTrackerNetworkUtilization';
import GasTrackerPrices from 'ui/gasTracker/GasTrackerPrices';
import GasInfoUpdateTimer from 'ui/shared/gas/GasInfoUpdateTimer';
import PageTitle from 'ui/shared/Page/PageTitle';

const GasTracker = () => {
  const { data, isPlaceholderData, isError, error, dataUpdatedAt } = useApiQuery('stats', {
    queryOptions: {
      placeholderData: HOMEPAGE_STATS,
      refetchOnMount: false,
    },
  });

  if (isError) {
    throw new Error(undefined, { cause: error });
  }

  const isLoading = isPlaceholderData;

  const titleSecondRow = (
    <Flex
      alignItems={{ base: 'flex-start', lg: 'center' }}
      fontFamily="heading"
      fontSize="lg"
      fontWeight={ 500 }
      w="100%"
      columnGap={ 3 }
      rowGap={ 1 }
      flexDir={{ base: 'column', lg: 'row' }}
    >
      { data?.network_utilization_percentage && <GasTrackerNetworkUtilization percentage={ data.network_utilization_percentage } isLoading={ isLoading }/> }
      { data?.gas_price_updated_at && (
        <Skeleton isLoaded={ !isLoading } whiteSpace="pre" display="flex" alignItems="center">
          <span>Last updated </span>
          <chakra.span color="text_secondary">{ dayjs(data.gas_price_updated_at).format('DD MMM, HH:mm:ss') }</chakra.span>
          { data.gas_prices_update_in !== 0 && (
            <GasInfoUpdateTimer
              key={ dataUpdatedAt }
              startTime={ dataUpdatedAt }
              duration={ data.gas_prices_update_in }
              size={ 5 }
              ml={ 2 }
            />
          ) }
        </Skeleton>
      ) }
      { data?.coin_price && (
        <Skeleton isLoaded={ !isLoading } ml={{ base: 0, lg: 'auto' }} whiteSpace="pre">
          <chakra.span color="text_secondary">{ config.chain.currency.symbol }</chakra.span>
          <span> ${ Number(data.coin_price).toLocaleString(undefined, { maximumFractionDigits: 2 }) }</span>
        </Skeleton>
      ) }
    </Flex>
  );

  return (
    <>
      <PageTitle
        title="Gas tracker"
        secondRow={ titleSecondRow }
        withTextAd
      />
      { data?.gas_prices && <GasTrackerPrices prices={ data.gas_prices } isLoading={ isLoading }/> }
      <Box mt={ 12 }>
        <GasTrackerChart/>
      </Box>
    </>
  );
};

export default GasTracker;
