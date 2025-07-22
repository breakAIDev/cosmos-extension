import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../ui/skeleton';

type AggregatedLoadingProps = {
  style?: any;
};

export const AggregatedLoadingCard: React.FC<AggregatedLoadingProps> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <Skeleton style={styles.avatar} />
      <View style={styles.centerCol}>
        <Skeleton style={styles.lineShort} />
        <Skeleton style={styles.lineSmaller} />
      </View>
      <View style={styles.endCol}>
        <Skeleton style={styles.lineShortEnd} />
        <Skeleton style={styles.lineSmallerEnd} />
      </View>
    </View>
  );
};

type AggregatedLoadingListProps = {
  style?: any;
  count?: number;
};

export const AggregatedLoadingList: React.FC<AggregatedLoadingListProps> = ({ style, count = 7 }) => (
  <View style={[styles.list, style]}>
    {Array.from({ length: count }).map((_, idx) => (
      <AggregatedLoadingCard key={idx} />
    ))}
  </View>
);

// ---- Styles ----
const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6', // Secondary-100 fallback
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Only works in RN 0.71+, otherwise use marginRight/left
    marginBottom: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB', // Secondary-300 fallback
  },
  centerCol: {
    flexDirection: 'column',
    marginLeft: 8,
  },
  endCol: {
    flexDirection: 'column',
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  lineShort: {
    height: 12,
    marginVertical: 3,
    width: 109,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  lineSmaller: {
    height: 8,
    marginVertical: 2,
    width: 87,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  lineShortEnd: {
    height: 12,
    marginVertical: 3,
    width: 60,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  lineSmallerEnd: {
    height: 8,
    marginVertical: 2,
    width: 35,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  list: {
    flexDirection: 'column',
    gap: 12, // Same as above: use marginBottom for compatibility
    width: '100%',
  },
});
