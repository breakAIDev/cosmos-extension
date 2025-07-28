import { BigNumber } from 'bignumber.js';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import { hideAssetsStore } from '../../context/hide-assets-store';
import { useFormatCurrency } from '../../hooks/settings/useCurrency';
import { Colors } from '../../theme/colors';
import TokenCardSkeleton from '../Skeletons/TokenCardSkeleton';
import Text from '../text';

function _PortfolioDistribution({
  stakeBalance,
  walletBalance,
  loading,
}: {
  stakeBalance: BigNumber | null;
  walletBalance: BigNumber | null;
  loading: boolean;
}) {
  const totalBalance = useMemo(
    () => walletBalance?.plus(stakeBalance ?? 0),
    [stakeBalance, walletBalance]
  );
  const threshold = 3;
  const [formatCurrency] = useFormatCurrency();

  const walletBalancePct = walletBalance && totalBalance && !totalBalance.isZero()
    ? walletBalance.times(100).div(totalBalance)
    : new BigNumber(0);

  const showLoader = walletBalance === null || loading === true;

  if (
    stakeBalance?.lte(0) &&
    walletBalance?.lte(0) &&
    !showLoader
  ) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text size="sm" style={styles.title}>
          Portfolio Distribution
        </Text>
      </View>
      {showLoader ? (
        <TokenCardSkeleton />
      ) : (
        <View style={styles.body}>
          {/* Progress Bar */}
          <View style={styles.progressRow}>
            <View
              style={[
                styles.progressBg,
                { backgroundColor: Colors.Indigo300 }
              ]}
            >
              {walletBalancePct.gte(threshold) && (
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${
                        walletBalancePct.plus(threshold).gte(100)
                          ? 100
                          : walletBalancePct.toNumber()
                      }%`,
                      backgroundColor: Colors.juno,
                    },
                  ]}
                />
              )}
            </View>
          </View>

          {/* Labels and Amounts */}
          <View style={styles.balancesRow}>
            <View style={styles.legend}>
              <View style={[styles.legendDot, { backgroundColor: Colors.juno }]} />
              <View style={styles.legendText}>
                <Text size="sm" style={styles.legendLabel}>
                  Wallet Balance
                </Text>
                <Text size="sm" style={styles.legendValue}>
                  {hideAssetsStore.formatHideBalance(formatCurrency(walletBalance))}
                </Text>
              </View>
            </View>
            {stakeBalance ? (
              <View style={styles.legend}>
                <View style={[styles.legendDot, { backgroundColor: Colors.Indigo300 }]} />
                <View style={styles.legendText}>
                  <Text size="sm" style={styles.legendLabel}>
                    Stake Balance
                  </Text>
                  <Text size="sm" style={styles.legendValue}>
                    {hideAssetsStore.formatHideBalance(formatCurrency(stakeBalance))}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#fff', // Light mode, use a dark color for dark mode if needed
    marginBottom: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#6B7280', // text-gray-600
    fontWeight: '500',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 16,
  },
  body: {
    width: 344,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  progressRow: {
    paddingTop: 16,
    marginBottom: 12,
  },
  progressBg: {
    width: '100%',
    height: 8,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: Colors.Indigo300,
    justifyContent: 'flex-start',
  },
  progressBar: {
    height: 8,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  balancesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    marginLeft: 8,
  },
  legendLabel: {
    color: '#9CA3AF', // text-gray-400
    fontWeight: '400',
  },
  legendValue: {
    fontWeight: 'bold',
  },
});

export const PortfolioDistribution = observer(_PortfolioDistribution);
