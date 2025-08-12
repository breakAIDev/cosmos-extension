import { Token, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { isAptosChain } from '@leapwallet/cosmos-wallet-sdk';
import { generateRandomString } from '@leapwallet/cosmos-wallet-store';
import { AGGREGATED_CHAIN_KEY } from '../../../services/config/constants';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { percentageChangeDataStore } from '../../../context/balance-store';
import { chainInfoStore } from '../../../context/chain-infos-store';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { AggregatedSupportedChain } from '../../../types/utility';

import { AssetCard } from './AssetCard';
import { View, StyleSheet } from 'react-native';

export const NativeTokenPlaceholder = observer(() => {
  const chains = useGetChains();
  const activeChain = useActiveChain() as AggregatedSupportedChain;

  const emptyNativeTokens = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY || !chains) {
      return null;
    }

    const chainInfo = chains[activeChain];

    const nativeDenoms = Object.keys(chainInfo.nativeDenoms);
    if (isAptosChain(activeChain)) {
      const nativeDenom = nativeDenoms?.[0];
      const denom = rootDenomsStore.allDenoms[nativeDenom];
      if (!denom) {
        return null;
      }
      return [
        {
          ...denom,
          amount: '0',
          symbol: denom.coinDenom,
          img: denom.icon,
          chain: activeChain,
          tokenBalanceOnChain: activeChain,
          id: generateRandomString(10),
        },
      ];
    }

    return nativeDenoms.map((item): Token & { id: string } => {
      const denom = rootDenomsStore.allDenoms[item];
      return {
        ...denom,
        amount: '0',
        symbol: denom.coinDenom ?? denom.name,
        img: denom.icon,
        chain: denom.chain ?? chainInfo.key,
        tokenBalanceOnChain: chainInfo.key,
        id: generateRandomString(10),
      };
    });
  }, [activeChain, chains]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.cardContainer}>
        {emptyNativeTokens?.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            percentageChangeDataStore={percentageChangeDataStore}
            chainInfosStore={chainInfoStore}
            isPlaceholder
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  cardContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // Add spacing here if you want:
    // gap: 12, // Not supported in RN
  },
});
