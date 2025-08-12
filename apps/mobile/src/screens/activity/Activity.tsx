import React from 'react';
import { useActiveChain, useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks';
import { BottomNavLabel } from '../../components/bottom-nav/BottomNav'; // Assume this is RN compatible or swap if not
import { ComingSoon } from '../../components/coming-soon';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { aggregatedChainsStore, ibcTraceFetcher } from '../../context/balance-store';
import { ankrChainMapStore } from '../../context/balance-store';
import { chainTagsStore } from '../../context/chain-infos-store';
import { AggregatedSupportedChain } from '../../types/utility';

import { AggregatedActivity, ChainActivity } from './components';

export default function Activity() {
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const isActivityComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'activity',
    platform: 'Extension',
  });

  if (activeChain === AGGREGATED_CHAIN_KEY) {
    return (
      <AggregatedActivity
        chainTagsStore={chainTagsStore}
        ibcTraceFetcher={ibcTraceFetcher}
        aggregatedChainsStore={aggregatedChainsStore}
      />
    );
  }

  if (isActivityComingSoon) {
    return (
      <ComingSoon
        title="Activity"
        bottomNavLabel={BottomNavLabel.Activity}
        chainTagsStore={chainTagsStore}
      />
    );
  }

  return (
    <ChainActivity
      chainTagsStore={chainTagsStore}
      ankrChainMapStore={ankrChainMapStore}
      ibcTraceFetcher={ibcTraceFetcher}
    />
  );
}
