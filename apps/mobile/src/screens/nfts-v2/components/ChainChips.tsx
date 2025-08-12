import { NftStore } from '@leapwallet/cosmos-wallet-store';
import { observer } from 'mobx-react-lite';
import React, { useLayoutEffect, useMemo } from 'react';
import { favNftStore, hiddenNftStore } from '../../../context/manage-nft-store';
import { nftStore } from '../../../context/nft-store';
import { useNftContext } from '../context';
import { Chip } from './Chip';
import { ScrollView, StyleSheet, View } from 'react-native';

type ChainChipProps = {
  title: string;
  isActive: boolean;
  onPress: (selectedTab: string) => void;
  children?: React.ReactNode;
};

function ChainChip({ isActive, title, children, onPress }: ChainChipProps) {
  return (
    <Chip
      style={[
        styles.chip,
        isActive && styles.chipActive,
        !!children && styles.chipWithChildren,
      ]}
    >
      {React.isValidElement(children) ? children : <View/>}
      <Chip.Text
        style={[
          styles.chipText,
          isActive ? styles.chipTextActive : styles.chipTextInactive,
        ]}
        onChangeText={onPress}
      >
        {title}
      </Chip.Text>
    </Chip>
  );
}

type ChainChipsProps = {
  handleTabClick: (selectedTab: string) => void;
  nftStore: NftStore;
};

export const ChainChips = observer(({ handleTabClick }: ChainChipsProps) => {
  const { activeTab, setActiveTab } = useNftContext();
  const _collectionData = nftStore.getVisibleCollectionData(hiddenNftStore.hiddenNfts);

  const chips = useMemo(() => {
    const _chips = ['All'];
    if (_collectionData?.collections?.length) {
      if (favNftStore.favNfts.length) _chips.push('Favorites');
      _chips.push('Collections');
      if (hiddenNftStore.hiddenNfts.length) _chips.push('Hidden');
    }
    return _chips;
  }, [_collectionData?.collections]);

  useLayoutEffect(() => {
    if (!chips.includes(activeTab)) {
      setActiveTab('All');
    }
  }, [activeTab, chips, setActiveTab]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsScrollView}
      contentContainerStyle={styles.chipsContainer}
    >
      {chips.map((title) => (
        <ChainChip
          key={title}
          isActive={activeTab === title}
          title={title}
          onPress={() => handleTabClick(title)}
        />
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  chipsScrollView: {
    marginBottom: 16,
    flexGrow: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#f3f4f6', // border-gray-100
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 12,
  },
  chipActive: {
    backgroundColor: '#f3f4f6', // bg-gray-100
    borderColor: '#fff', // white-100
  },
  chipWithChildren: {
    paddingHorizontal: 18,
  },
  chipText: {
    fontSize: 14,
    color: '#1f2937', // text-gray-800
  },
  chipTextActive: {
    color: '#111', // text-black-100
  },
  chipTextInactive: {
    color: '#9ca3af', // text-gray-300
  },
});
