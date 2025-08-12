import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import SkeletonContent from 'react-native-skeleton-content';
import { RightArrow } from '../../../assets/images/misc';

export default function GovCardSkeleton({ isLast, aggregatedView }: { isLast: boolean; aggregatedView?: boolean }) {
  // Replace with your actual image asset
  if (aggregatedView) {
    return (
      <View style={styles.aggregatedContainer}>
        <SkeletonContent
          isLoading
          layout={[
            { key: 'line1', width: 70, height: 12, borderRadius: 4, marginBottom: 6 },
            { key: 'line2', width: '100%', height: 20, borderRadius: 4, marginBottom: 6 },
            { key: 'line3', width: '100%', height: 20, borderRadius: 4, marginBottom: 6 },
            { key: 'line4', width: 100, height: 14, borderRadius: 4 },
          ]}
          containerStyle={{ width: '100%' }}
        />
      </View>
    );
  }

  return (
    <>
      <View style={styles.rowContainer}>
        <View style={styles.leftCol}>
          <SkeletonContent
            isLoading
            layout={[
              { key: 'row1', width: 270, height: 18, borderRadius: 4, marginBottom: 4 },
              { key: 'row2', width: 270, height: 18, borderRadius: 4, marginBottom: 4 },
              { key: 'row3', width: 100, height: 14, borderRadius: 4, marginTop: 4 },
            ]}
            containerStyle={{ width: 270 }}
          />
        </View>
        <Image
          source={{uri: RightArrow}}
          style={styles.arrow}
          resizeMode="contain"
        />
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  aggregatedContainer: {
    width: '100%',
    minWidth: 344,
    minHeight: 112,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff', // You can use dark mode logic here if needed
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 344,
    padding: 16,
    justifyContent: 'space-between',
    flex: 1,
    backgroundColor: '#fff', // You can use dark mode logic here if needed
  },
  leftCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  arrow: {
    marginLeft: 20,
    width: 24,
    height: 24,
    tintColor: '#C5C5C5', // optional: adapt as you like
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
});
