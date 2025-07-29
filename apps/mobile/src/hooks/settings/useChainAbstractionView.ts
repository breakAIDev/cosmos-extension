import { useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { useEffect, useState } from 'react';
import { nmsStore } from '../../context/balance-store';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';
import { AggregatedSupportedChain } from '../../types/utility';

import { useActiveChain } from './useActiveChain';

export function useChainAbstractionView() {
  const [isEnabled, setIsEnabled] = useState(false);
  const { data: featureFlags } = useFeatureFlags();
  const activeChain = useActiveChain();

  useEffect(() => {
    if (isEnabled || !featureFlags) return;
    const isChainAbstractionEnabled = featureFlags?.swaps?.chain_abstraction === 'active';
    if (isChainAbstractionEnabled && (activeChain as AggregatedSupportedChain) !== AGGREGATED_CHAIN_KEY) {
      const fn = async () => {
        await Promise.allSettled([rootDenomsStore.readyPromise, nmsStore.readyPromise]);
        rootBalanceStore.loadBalances('aggregated', 'mainnet');
      };
      fn();
    }
    setIsEnabled(isChainAbstractionEnabled);
  }, [isEnabled, featureFlags, activeChain]);
}
