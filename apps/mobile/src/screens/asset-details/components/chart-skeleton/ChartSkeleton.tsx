import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ChartSkeleton({ style }: { style?: any }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.inner}>
        <View style={styles.chartBar} />
        <View style={styles.infoBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  inner: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20, // RN >=0.71, otherwise use margin
    overflow: 'hidden',
  },
  chartBar: {
    height: 128,
    width: 320,
    borderRadius: 16,
    backgroundColor: '#e5e7eb', // gray-200
    marginBottom: 20,
  },
  infoBar: {
    height: 28,
    width: 260,
    borderRadius: 8,
    backgroundColor: '#f3f4f6', // gray-100
  },
});
