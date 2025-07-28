import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonContent from 'react-native-skeleton-content';

const width = Dimensions.get('window').width;
const minWidth = Math.min(width - 32, 344);

export default function ChartSkeleton() {
  return (
    <View style={[styles.container, { minWidth }]}>
      <View style={styles.divider} />
      <View style={styles.row}>
        <SkeletonContent
          isLoading={true}
          containerStyle={{ flexDirection: 'row', gap: 12, flex: 1, justifyContent: 'space-between' }}
          layout={[
            { width: 82, height: 32, borderRadius: 8 },
            { width: 82, height: 32, borderRadius: 8 },
            { width: 82, height: 32, borderRadius: 8 },
          ]}
        />
      </View>
      <View style={styles.row}>
        <SkeletonContent
          isLoading={true}
          containerStyle={{ flexDirection: 'row', gap: 12, flex: 1, justifyContent: 'space-between' }}
          layout={[
            { width: 82, height: 32, borderRadius: 8 },
            { width: 82, height: 32, borderRadius: 8 },
            { width: 82, height: 32, borderRadius: 8 },
          ]}
        />
      </View>
      <View style={styles.divider} />
      <View style={styles.chartArea}>
        <SkeletonContent
          isLoading={true}
          layout={[
            { width: '100%', height: 180, borderRadius: 16 },
            { width: '80%', height: 20, marginTop: 12, borderRadius: 6 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 300,
    minWidth: 344,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 8,
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 32,
    alignItems: 'center',
  },
  chartArea: {
    marginTop: 8,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
