import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonContent from 'react-native-skeleton-content';

export default function TokenCardSkeleton() {
  return (
    <View style={styles.row}>
      {/* Token Icon */}
      <SkeletonContent
        isLoading={true}
        containerStyle={styles.iconContainer}
        layout={[
          { key: 'icon', width: 40, height: 40, borderRadius: 20 },
        ]}
      />

      {/* Token Name/Info */}
      <View style={styles.infoContainer}>
        <SkeletonContent
          isLoading={true}
          layout={[
            { key: 'label1', width: 100, height: 12, marginBottom: 8, borderRadius: 6 },
            { key: 'label2', width: 80, height: 12, borderRadius: 6 },
          ]}
        />
      </View>

      {/* Token Balance/Value */}
      <View style={styles.valueContainer}>
        <SkeletonContent
          isLoading={true}
          layout={[
            { key: 'amount1', width: 50, height: 12, marginBottom: 8, borderRadius: 6 },
            { key: 'amount2', width: 40, height: 12, borderRadius: 6 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 344,
    alignItems: 'center',
    zIndex: 0,
  },
  iconContainer: {
    width: 40,
    marginRight: 8,
    zIndex: 0,
  },
  infoContainer: {
    width: 120,
    marginRight: 8,
    zIndex: 0,
  },
  valueContainer: {
    width: 60,
    marginLeft: 'auto',
    zIndex: 0,
  },
});
