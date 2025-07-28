import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import SkeletonContent from 'react-native-skeleton-content';

// One skeleton row (NFT item)
const NFTItemSkeleton = () => (
  <View style={styles.nftItemContainer}>
    <SkeletonContent
      isLoading={true}
      containerStyle={styles.skeletonRow}
      layout={[
        { key: 'thumb', width: 40, height: 40, borderRadius: 8, marginRight: 12 },
        { key: 'line', width: 200, height: 12, borderRadius: 6 },
      ]}
    />
  </View>
);

// The gallery (list of skeleton rows)
export default function NFTGallerySkeleton() {
  // Show 4 skeleton rows (you can change the number as needed)
  return (
    <FlatList
      data={[1, 2, 3, 4]}
      keyExtractor={(_, i) => 'nft-skeleton-' + i}
      renderItem={() => <NFTItemSkeleton />}
      contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8 }}
    />
  );
}

const styles = StyleSheet.create({
  nftItemContainer: {
    backgroundColor: '#E5E7EB', // light gray, adjust for dark mode if needed
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 344,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
});
