import React from 'react';
import { Text } from 'react-native';

export function showOrHideBalances(balancesHidden: boolean, percentChange: number) {
  if (balancesHidden) {
    return <Text style={{ letterSpacing: 2 }}>••••••••</Text>;
  } else {
    const color = percentChange > 0 ? '#16A34A' : '#F87171'; // green-600 / red-300 (tailwind hex codes)
    return (
      <Text style={{ fontSize: 10, fontWeight: '500', color }}>
        {percentChange > 0 ? '+' : ''}
        {(percentChange ?? 0).toFixed(2)}%
      </Text>
    );
  }
}
