import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import SkeletonContent from 'react-native-skeleton-content';

// Single skeleton item (one row)
export function TokenItemSkeleton() {
  return (
    <View style={styles.itemContainer}>
      <SkeletonContent
        isLoading={true}
        containerStyle={styles.avatar}
        layout={[
          { key: 'avatar', width: 36, height: 36, borderRadius: 18 }
        ]}
      />
      <View style={styles.textColumn}>
        <SkeletonContent
          isLoading={true}
          layout={[
            { key: 'label1', width: 56, height: 18, borderRadius: 5, marginBottom: 8 },
            { key: 'label2', width: 77, height: 14, borderRadius: 5 }
          ]}
        />
      </View>
    </View>
  );
}

// Skeleton list with 5 items
export default function TokenListSkeleton() {
  return (
    <FlatList
      data={[1, 2, 3, 4, 5]}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={() => <TokenItemSkeleton />}
      contentContainerStyle={{ paddingBottom: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F4F6FB', // equivalent to secondary-100
    borderRadius: 16,
    marginTop: 16,
    width: '100%',
  },
  avatar: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  textColumn: {
    height: 40,
    justifyContent: 'space-between',
    flex: 1,
  },
});
