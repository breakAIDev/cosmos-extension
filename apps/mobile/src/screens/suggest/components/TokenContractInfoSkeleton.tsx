import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Divider, Key } from '../../../components/dapp';
import { Colors } from '../../../theme/colors';

export function TokenContractInfoSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Key>Coin Name</Key>
        <SkeletonPlaceholder
          backgroundColor={Colors.gray300}
          highlightColor={Colors.gray200}
          borderRadius={4}
        >
          <SkeletonPlaceholder.Item width={80} height={16} />
        </SkeletonPlaceholder>
      </View>

      {Divider}

      <View style={styles.field}>
        <Key>Coin Symbol</Key>
        <SkeletonPlaceholder
          backgroundColor={Colors.gray300}
          highlightColor={Colors.gray200}
          borderRadius={4}
        >
          <SkeletonPlaceholder.Item width={50} height={16} />
        </SkeletonPlaceholder>
      </View>

      {Divider}

      <View style={styles.field}>
        <Key>Coin Decimals</Key>
        <SkeletonPlaceholder
          backgroundColor={Colors.gray300}
          highlightColor={Colors.gray200}
          borderRadius={4}
        >
          <SkeletonPlaceholder.Item width={25} height={16} />
        </SkeletonPlaceholder>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.white100, // swap to dark color if needed
    borderRadius: 16, // rounded-2xl
    padding: 16, // p-4
  },
  field: {
    width: '100%',
    marginTop: 10, // gap-y-[10px] between sections
    gap: 6,
  },
});
