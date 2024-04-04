import { useRouter } from 'next/router';
import React from 'react';
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';

import type { SmartContractWriteMethod } from 'types/api/contract';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import getQueryParamString from 'lib/router/getQueryParamString';
import ContractMethodsAccordion from 'ui/address/contract/ContractMethodsAccordion';
import ContentLoader from 'ui/shared/ContentLoader';
import DataFetchAlert from 'ui/shared/DataFetchAlert';

import ContractConnectWallet from './ContractConnectWallet';
import ContractCustomAbiAlert from './ContractCustomAbiAlert';
import ContractImplementationAddress from './ContractImplementationAddress';
import ContractWriteResult from './ContractWriteResult';
import ContractMethodForm from './methodForm/ContractMethodForm';
import useContractAbi from './useContractAbi';
import { getNativeCoinValue, prepareAbi } from './utils';

const ContractWrite = () => {
  const { data: walletClient } = useWalletClient();
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const router = useRouter();

  const tab = getQueryParamString(router.query.tab);
  const addressHash = getQueryParamString(router.query.hash);
  const isProxy = tab === 'write_proxy';
  const isCustomAbi = tab === 'write_custom_methods';

  const { data, isPending, isError } = useApiQuery(isProxy ? 'contract_methods_write_proxy' : 'contract_methods_write', {
    pathParams: { hash: addressHash },
    queryParams: {
      is_custom_abi: isCustomAbi ? 'true' : 'false',
    },
    queryOptions: {
      enabled: Boolean(addressHash),
      refetchOnMount: false,
    },
  });

  const contractAbi = useContractAbi({ addressHash, isProxy, isCustomAbi });

  const handleMethodFormSubmit = React.useCallback(async(item: SmartContractWriteMethod, args: Array<unknown>) => {
    if (!isConnected) {
      throw new Error('Wallet is not connected');
    }

    if (chainId && String(chainId) !== config.chain.id) {
      await switchChainAsync?.({ chainId: Number(config.chain.id) });
    }

    if (!contractAbi) {
      throw new Error('Something went wrong. Try again later.');
    }

    if (item.type === 'receive' || item.type === 'fallback') {
      const value = getNativeCoinValue(args[0]);
      const hash = await walletClient?.sendTransaction({
        to: addressHash as `0x${ string }` | undefined,
        value,
      });
      return { hash };
    }

    const methodName = item.name;

    if (!methodName) {
      throw new Error('Method name is not defined');
    }

    const _args = args.slice(0, item.inputs.length);
    const value = getNativeCoinValue(args[item.inputs.length]);
    const abi = prepareAbi(contractAbi, item);

    const hash = await walletClient?.writeContract({
      args: _args,
      abi,
      functionName: methodName,
      address: addressHash as `0x${ string }`,
      value,
    });

    return { hash };
  }, [ isConnected, chainId, contractAbi, walletClient, addressHash, switchChainAsync ]);

  const renderItemContent = React.useCallback((item: SmartContractWriteMethod, index: number, id: number) => {
    return (
      <ContractMethodForm
        key={ id + '_' + index }
        data={ item }
        onSubmit={ handleMethodFormSubmit }
        resultComponent={ ContractWriteResult }
        methodType="write"
      />
    );
  }, [ handleMethodFormSubmit ]);

  if (isError) {
    return <DataFetchAlert/>;
  }

  if (isPending) {
    return <ContentLoader/>;
  }

  if (data.length === 0 && !isProxy) {
    return <span>No public write functions were found for this contract.</span>;
  }

  return (
    <>
      { isCustomAbi && <ContractCustomAbiAlert/> }
      <ContractConnectWallet/>
      { isProxy && <ContractImplementationAddress hash={ addressHash }/> }
      <ContractMethodsAccordion data={ data } addressHash={ addressHash } renderItemContent={ renderItemContent } tab={ tab }/>
    </>
  );
};

export default React.memo(ContractWrite);
