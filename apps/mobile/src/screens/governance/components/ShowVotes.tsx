import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Text from '../../../components/text';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { chainDecimals } from '../utils';
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk';

type IShowVotes = {
  dataMock: {
    title: string;
    value: number;
    color: string;
    percent: string;
  }[];
  chain: ChainInfo;
};

export function ShowVotes({ dataMock, chain }: IShowVotes) {
  const decimals =
    Object.values(chain.nativeDenoms ?? {})?.[0]?.coinDecimals ??
    (chainDecimals as any)[chain?.bip44?.coinType];

  return (
    <View style={styles.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {dataMock.map((item) => {
          const isLoading = item.title === 'loading';
          return (
            <View
              key={item.color}
              style={[
                styles.chip,
                isLoading && styles.chipLoading,
                { backgroundColor: '#fff' },
              ]}
            >
              {isLoading ? (
                <SkeletonPlaceholder borderRadius={12}>
                  <SkeletonPlaceholder.Item flexDirection="column">
                    <SkeletonPlaceholder.Item width={80} height={16} marginBottom={6} />
                    <SkeletonPlaceholder.Item width={60} height={12} />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              ) : (
                <>
                  <View style={styles.chipTopRow}>
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                    <Text style={styles.chipTopText}>{`${item.title} - ${item.percent}`}</Text>
                  </View>
                  <Text style={styles.chipBottomText}>
                    {`${new Intl.NumberFormat('en-US').format(
                      +Number(item.value / Math.pow(10, decimals)).toFixed(2),
                    )} ${chain.denom ?? ''}`}
                  </Text>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 52,
    marginTop: 2,
    marginBottom: 2,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
    minWidth: 90,
  },
  chipLoading: {
    width: 120,
  },
  chipTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 5,
  },
  chipTopText: {
    color: '#8e99af', // text-gray-400
    fontWeight: 'bold',
    fontSize: 12,
  },
  chipBottomText: {
    color: '#8e99af', // text-gray-400
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 20,
  },
});
