import { NftStore } from '@leapwallet/cosmos-wallet-store';
import { useChainPageInfo } from '../../../hooks';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

import { CantSeeNfts, NoCollectionCard } from './index';

type NoNftProps = {
  title?: string;
  description?: string;
  openManageCollectionsSheet: () => void;
  openAddCollectionSheet: () => void;
  nftStore: NftStore;
};

export function NoNft({
  title,
  description,
  openManageCollectionsSheet,
  openAddCollectionSheet,
  nftStore,
}: NoNftProps) {
  const { topChainColor } = useChainPageInfo();

  return (
    <View style={styles.container}>
      <NoCollectionCard
        title={title ?? 'No NFTs collected'}
        subTitle={description ?? 'Your assets will appear here'}
      />

      <TouchableOpacity
        style={[styles.manageButton, { backgroundColor: topChainColor }]}
        activeOpacity={0.8}
        onPress={openManageCollectionsSheet}
      >
        <Text style={[styles.manageButtonText, { color: topChainColor }]}>
          Manage collections
        </Text>
      </TouchableOpacity>

      <CantSeeNfts openAddCollectionSheet={openAddCollectionSheet} nftStore={nftStore} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  manageButton: {
    marginTop: 8,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
    // color is set inline with topChainColor
  },
  manageButtonText: {
    fontWeight: '600',
    fontSize: 18,
  },
});
