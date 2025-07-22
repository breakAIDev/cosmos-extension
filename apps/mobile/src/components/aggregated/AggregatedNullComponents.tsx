import React, { useMemo } from 'react';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';

import { useActiveWallet, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { AggregatedChainsStore } from '@leapwallet/cosmos-wallet-store';

import { ManageChainSettings, manageChainsStore } from '../../context/manage-chains-store';
import { isLedgerEnabled } from '../../utils/isLedgerEnabled';

type AggregatedNullComponentsProps = {
  setAggregatedStore: any;
  aggregatedChainsStore: AggregatedChainsStore;
  render: ({
    key,
    chain,
    setAggregatedStore,
  }: {
    key: string;
    chain: SupportedChain;
    setAggregatedStore: any;
  }) => JSX.Element;
  reset?: ({
    key,
    chain,
    setAggregatedStore,
  }: {
    key: string;
    chain: SupportedChain;
    setAggregatedStore: any;
  }) => JSX.Element;
};

export const AggregatedNullComponents = observer(function ({
  setAggregatedStore,
  aggregatedChainsStore,
  render,
  reset,
}: AggregatedNullComponentsProps) {
  const chains = useGetChains();
  const aggregatedChains = aggregatedChainsStore.aggregatedChainsData as SupportedChain[];
  const activeWallet = useActiveWallet();
  const managedChains = manageChainsStore.chains;

  const chainsToFetch = useMemo(() => {
    return aggregatedChains.reduce((acc: ManageChainSettings[], chain) => {
      const chainInfo = chains[chain];
      const noAddress = !activeWallet?.addresses[chain];

      // Skip chain if no address, or if testnet, or if API is down
      if (
        noAddress ||
        chainInfo?.chainId === chainInfo?.testnetChainId ||
        chainInfo?.apiStatus === false
      ) {
        return acc;
      }

      // If Ledger and chain is not supported, skip
      if (
        activeWallet?.walletType === WALLETTYPE.LEDGER &&
        !isLedgerEnabled(chain, chainInfo?.bip44?.coinType, Object.values(chains))
      ) {
        return acc;
      }

      // Skip if chain not active
      const managedChain = managedChains.find((managedChain) => managedChain.chainName === chain);
      if (managedChain && managedChain.active) {
        return [...acc, managedChain];
      }

      return acc;
    }, []);
  }, [activeWallet?.addresses, activeWallet?.walletType, aggregatedChains, managedChains, chains]);

  const chainsToReset = useMemo(() => {
    const _chainsToReset: ManageChainSettings[] = [];
    aggregatedChains.forEach((chain) => {
      const manageChain = manageChainsStore.chains.find((manageChain) => manageChain.chainName === chain);
      if (manageChain && !chainsToFetch.includes(manageChain)) {
        _chainsToReset.push(manageChain);
      }
    });
    return _chainsToReset;
  }, [aggregatedChains, chainsToFetch]);

  return (
    <View>
      {chainsToFetch.map((chain) =>
        React.cloneElement(
          render({
            key: chain.chainName,
            chain: chain.chainName,
            setAggregatedStore,
          }),
          { key: chain.chainName },
        ),
      )}
      {reset &&
        chainsToReset.map((chain) =>
          React.cloneElement(
            reset({
              key: chain.chainName,
              chain: chain.chainName,
              setAggregatedStore,
            }),
            { key: chain.chainName },
          ),
        )}
    </View>
  );
});

AggregatedNullComponents.displayName = 'AggregatedNullComponents';
