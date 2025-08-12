import { AggregatedLoadingList } from '../../components/aggregated/AggregatedLoading';
import { useActiveChain } from '../../hooks/settings/useActiveChain';
import { useChainInfos } from '../../hooks/useChainInfos';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AggregatedSupportedChain } from '../../types/utility';

import { ActivityHeader } from './components/activity-header';

export const ActivityPageLoader = () => {
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const chains = useChainInfos();

  const selectedChain = activeChain === 'aggregated' ? chains?.cosmos?.key : activeChain;

  return (
    <>
      <ActivityHeader />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>Activity</Text>
            <Text style={styles.headerSubtitle}>
              {chains[selectedChain]?.chainName ?? 'Unknown Chain'}
            </Text>
          </View>
        </View>

        <AggregatedLoadingList style={{ marginTop: 16 }}/>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginBottom: 64,
    flex: 1,
    backgroundColor: '#fff', // Or use your theme background
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#222', // Or use theme color
    marginBottom: 8,
  },
  headerTitleCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222', // Or use theme color
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A94A6', // Or theme gray
    marginTop: 2,
  },
});
