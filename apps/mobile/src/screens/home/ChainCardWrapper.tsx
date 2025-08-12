import { useCustomChains } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useChainInfos } from '../../hooks/useChainInfos';
import { GenericLight } from '../../../assets/images/logos';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ManageChainSettings } from '../../context/manage-chains-store';
import { AggregatedSupportedChain } from '../../types/utility';

import { ChainCard } from './components';

export function ChainCardWrapper({
  chain,
  handleClick,
  handleDeleteClick,
  selectedChain,
  onPage,
  index,
}: {
  chain: ManageChainSettings;
  handleClick: (chainName: AggregatedSupportedChain, beta?: boolean) => void;
  handleDeleteClick?: (chainKey: SupportedChain) => void;
  selectedChain: SupportedChain;
  onPage: 'AddCollection' | undefined;
  showStars: boolean;
  index: number;
}) {
  const chainInfos = useChainInfos();
  const customChains = useCustomChains();

  if (!chain) {
    return null;
  }

  let chainInfo: ChainInfo | undefined = chainInfos[chain.chainName];
  if (!chainInfo) {
    chainInfo = customChains.find((d) => d.key === chain.chainName);
  }

  const img = chainInfo?.chainSymbolImageUrl ?? GenericLight;
  const chainName = chainInfo?.chainName ?? chain.formattedName ?? chain.chainName;

  return (
    <View key={chain.chainName + index} style={styles.cardContainer}>
      <ChainCard
        handleClick={handleClick}
        handleDeleteClick={handleDeleteClick}
        beta={chain.beta}
        formattedChainName={chainName}
        chainName={chain.chainName}
        selectedChain={selectedChain}
        img={img}
        onPage={onPage}
        showStars
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F3F4F6', // bg-secondary-100
    borderRadius: 16,           // rounded-xl
    width: '100%',
    marginBottom: 12,           // mb-3
    // Use a "pressable" or hover style for bg-secondary-200 if desired
  },
});
