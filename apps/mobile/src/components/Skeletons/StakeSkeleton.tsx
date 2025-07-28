import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonContent from 'react-native-skeleton-content';

export function AmountCardSkeleton() {
  return (
    <View style={styles.amountCard}>
      <SkeletonContent
        isLoading={true}
        containerStyle={styles.fullWidth}
        layout={[
          { key: 'label', width: 100, height: 16, marginBottom: 8, borderRadius: 8 },
          { key: 'amount', width: 50, height: 30, marginBottom: 6, borderRadius: 6 },
          { key: 'subtitle', width: 75, height: 20, marginBottom: 14, borderRadius: 6 },
          { key: 'chart', width: '100%', height: 70, borderRadius: 16 },
        ]}
      />
    </View>
  );
}

export function StakeCardSkeleton() {
  return (
    <View style={styles.stakeCard}>
      <SkeletonContent isLoading={true} containerStyle={styles.fullWidth}
        layout={[
          { key: 'main', width: '100%', height: 16, marginBottom: 8 },
          { key: 'sub1', width: '100%', height: 14, marginBottom: 8 },
          { key: 'sub2', width: '100%', height: 14, marginBottom: 8 },
          { key: 'extra1', width: '100%', height: 10, marginBottom: 4 },
          { key: 'extra2', width: '100%', height: 10, marginBottom: 4 },
          { key: 'extra3', width: '100%', height: 10, marginBottom: 4 },
          { key: 'extra4', width: '100%', height: 10, marginBottom: 4 },
        ]}
      />
    </View>
  );
}

export function YouStakeSkeleton() {
  return (
    <View style={styles.youStakeCard}>
      <SkeletonContent
        isLoading={true}
        containerStyle={styles.fullWidth}
        layout={[
          { key: 'line1', width: 96, height: 20, marginBottom: 8 },
          { key: 'line2', width: 320, height: 40, marginBottom: 8 },
          { key: 'line3', width: 96, height: 24 },
        ]}
      />
    </View>
  );
}

export function ValidatorItemSkeleton({ count = 1 }) {
  return (
    <View style={{ gap: 16 }}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.validatorRow}>
          <SkeletonContent
            isLoading={true}
            containerStyle={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}
            layout={[
              { key: 'icon', width: 36, height: 36, borderRadius: 18, marginRight: 12 },
              { key: 'label', width: 100, height: 12, borderRadius: 8, marginRight: 12 },
              {
                key: 'rightBlock',
                flexDirection: 'column',
                marginLeft: 'auto',
                children: [
                  { key: 'right1', width: 40, height: 8, borderRadius: 4, marginBottom: 6 },
                  { key: 'right2', width: 48, height: 6, borderRadius: 3 },
                ],
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  amountCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    // Optionally add dark mode here
  },
  stakeCard: {
    flex: 1,
    padding: 28,
    minWidth: 344,
    gap: 16,
  },
  youStakeCard: {
    borderRadius: 16,
    backgroundColor: '#f1f1f1',
    padding: 16,
    marginBottom: 16,
    // Add dark mode handling if needed
  },
  validatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    marginBottom: 12,
  },
});
