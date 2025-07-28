import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import SkeletonContent from 'react-native-skeleton-content';

// Single validator skeleton item
export function ValidatorListItemSkeleton() {
  return (
    <View style={styles.itemContainer}>
      <SkeletonContent
        isLoading={true}
        containerStyle={styles.avatar}
        layout={[{ key: 'avatar', width: 28, height: 28, borderRadius: 14 }]}
      />
      <View style={styles.textColumn}>
        <SkeletonContent
          isLoading={true}
          layout={[
            { key: 'line1', width: 80, height: 14, borderRadius: 4, marginBottom: 8 },
            { key: 'line2', width: 100, height: 12, borderRadius: 4 }
          ]}
        />
      </View>
    </View>
  );
}

// List of 5 skeleton items
export default function ValidatorListSkeleton() {
  return (
    <FlatList
      data={[1, 2, 3, 4, 5]}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={() => <ValidatorListItemSkeleton />}
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
    backgroundColor: '#fff', // or '#21242A' for dark mode
    borderRadius: 16,
    marginVertical: 8,
    width: '100%',
  },
  avatar: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  textColumn: {
    justifyContent: 'space-between',
    height: 32,
    marginLeft: 8,
    flex: 1,
  },
});
