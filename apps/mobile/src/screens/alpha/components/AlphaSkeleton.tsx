import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export default function AlphaSkeleton() {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SkeletonPlaceholder.Item width={80} height={20} borderRadius={20} />
          <View style={{ width: 8 }} />
          <SkeletonPlaceholder.Item width={96} height={20} borderRadius={20} />
        </View>
        <SkeletonPlaceholder.Item width={64} height={16} borderRadius={20} />
      </View>

      {/* Description */}
      <View style={styles.description}>
        <SkeletonPlaceholder.Item width="100%" height={16} borderRadius={4} />
        <View style={{ height: 8 }} />
        <SkeletonPlaceholder.Item width="75%" height={16} borderRadius={4} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <SkeletonPlaceholder.Item width={16} height={16} borderRadius={8} />
          <View style={{ width: 8 }} />
          <SkeletonPlaceholder.Item width={64} height={16} borderRadius={8} />
        </View>
        <SkeletonPlaceholder.Item width={16} height={16} borderRadius={8} />
      </View>
    </View>
  );
}

export function AlphaSkeletonList() {
  return (
    <View>
      <AlphaSkeleton />
      <AlphaSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
