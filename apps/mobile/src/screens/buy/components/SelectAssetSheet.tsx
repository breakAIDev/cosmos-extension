import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MagnifyingGlassMinus } from 'phosphor-react-native';
import BottomModal from '../../../components/new-bottom-modal';
import TokenListSkeleton from '../../../components/Skeletons/TokenListSkeleton';
import { SearchInput } from '../../../components/ui/input/search-input'; // Make sure this is a RN input!
import { AssetProps, useGetSupportedAssets } from '../../../hooks/swapped/useGetSupportedAssets';
import { observer } from 'mobx-react-lite';

import AssetCard from './AssetCard';
import { TextInput } from 'react-native-gesture-handler';

type SelectAssetSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  onAssetSelect: (asset: AssetProps) => void;
  selectedAsset?: AssetProps;
};

const SelectAssetSheet = observer(({
  isVisible,
  onClose,
  onAssetSelect,
  selectedAsset,
}: SelectAssetSheetProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { isLoading, data: supportedAssets = [] } = useGetSupportedAssets();
  const searchInputRef = useRef<TextInput>(null);

  const assetList = useMemo<AssetProps[]>(
    () =>
      supportedAssets.filter(
        (asset: AssetProps) =>
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.chainName.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [supportedAssets, searchTerm],
  );

  useEffect(() => {
    if (isVisible) {
      setSearchTerm('');
      setTimeout(() => {
        searchInputRef.current?.focus && searchInputRef.current.focus();
      }, 200);
    }
  }, [isVisible]);

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      fullScreen
      title="Select token to buy"
      style={{ padding: 24 }}
    >
      <View style={styles.searchWrapper}>
        <SearchInput
          ref={searchInputRef}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search Token"
          onClear={() => setSearchTerm('')}
        />
      </View>
      {isLoading ? (
        <TokenListSkeleton />
      ) : (
        <ScrollView>
          {assetList.length === 0 ? (
            <View style={styles.noResultContainer}>
              <View style={styles.iconWrap}>
                <MagnifyingGlassMinus size={64} color="#1E293B" style={styles.icon} />
              </View>
              <Text style={styles.noResultTitle}>No tokens found</Text>
              <Text style={styles.noResultDesc}>
                We couldn’t find a match. Try searching again or use a different keyword.
              </Text>
            </View>
          ) : (
            assetList.map((asset) => (
              <AssetCard
                key={asset.id}
                symbol={asset.symbol}
                chainName={asset.chainName}
                assetImg={asset.assetImg}
                chainSymbolImageUrl={asset.chainSymbolImageUrl}
                onClick={() => onAssetSelect(asset)}
                isSelected={
                  asset.symbol === selectedAsset?.symbol && asset.chainId === selectedAsset?.chainId
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </BottomModal>
  );
});

export default SelectAssetSheet;

const styles = StyleSheet.create({
  searchWrapper: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 8,
  },
  noResultContainer: {
    paddingVertical: 80,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconWrap: {
    backgroundColor: '#E0E7EF', // bg-secondary-200
    borderRadius: 40,
    padding: 8,
    marginBottom: 16,
  },
  icon: {
    alignSelf: 'center',
  },
  noResultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222B45',
    textAlign: 'center',
    marginTop: 8,
  },
  noResultDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
