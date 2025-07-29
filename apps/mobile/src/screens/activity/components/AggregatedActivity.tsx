import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useActiveWallet, useActivity, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { AggregatedChainsStore, ChainTagsStore, IbcTraceFetcher } from '@leapwallet/cosmos-wallet-store';
import { QueryStatus } from '@tanstack/react-query';
import { usePerformanceMonitor } from '../../../hooks/perf-monitoring/usePerformanceMonitor';
import { useAggregatedChainsToFetch } from '../../../hooks/useAggregatedChainsToFetch';
import { ankrChainMapStore } from '../../../context/balance-store';
import { manageChainsStore } from '../../../context/manage-chains-store';
import { GeneralActivity } from './index'; // Ensure this is RN-compatible

const defaultTxResponse = {
  activity: [],
  loading: true,
  error: false,
};

const AggregatedActivity = observer(
  ({
    chainTagsStore,
    aggregatedChainsStore,
    ibcTraceFetcher,
  }: {
    chainTagsStore: ChainTagsStore;
    aggregatedChainsStore: AggregatedChainsStore;
    ibcTraceFetcher: IbcTraceFetcher;
  }) => {
    const chains = useGetChains();
    const activeWallet = useActiveWallet();
    const chainsToFetch = useAggregatedChainsToFetch(aggregatedChainsStore, manageChainsStore);
    const [selectedChain, setSelectedChain] = useState(chains.cosmos.key);

    const txResponse = useActivity(
      ankrChainMapStore.ankrChainMap,
      ibcTraceFetcher,
      selectedChain,
      activeWallet?.addresses[selectedChain],
    );

    const filteredChains = useMemo(() => {
      return chainsToFetch.map((chain) => chains[chain.chainName].chainRegistryPath);
    }, [chains, chainsToFetch]);

    const queryStatus: QueryStatus = useMemo(() => {
      if (txResponse.error) return 'error';
      if (txResponse.loading) return 'loading';
      return 'success';
    }, [txResponse]);

    usePerformanceMonitor({
      page: `activity-${selectedChain}`,
      queryStatus,
      op: 'activityPageLoad',
      description: 'loading state on activity page',
    });

    return (
      <GeneralActivity
        txResponse={txResponse || defaultTxResponse}
        filteredChains={filteredChains}
        forceNetwork="mainnet"
        forceChain={selectedChain}
        setSelectedChain={setSelectedChain}
        chainTagsStore={chainTagsStore}
      />
    );
  },
);

AggregatedActivity.displayName = 'AggregatedActivity';
export { AggregatedActivity };
