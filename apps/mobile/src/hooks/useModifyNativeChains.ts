import { useChainFeatureFlagsStore, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfos, modifyChains } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';

import { chainInfoStore } from '../context/chain-infos-store';
import { getStorageAdapter } from '../utils/storageAdapter';

const app = 'mobile';
const version = DeviceInfo.getVersion();
const storage = getStorageAdapter(); // Ensure this uses AsyncStorage or similar

export function useModifyNativeChains() {
  const [isModificationsComplete, setIsModificationsComplete] = useState(false);
  const setChains = useChainsStore((state) => state.setChains);
  const fetchChainFeatureFlags = useChainFeatureFlagsStore((state) => state.fetchChainFeatureFlags);
  const setChainFeatureFlags = useChainFeatureFlagsStore((state) => state.setChainFeatureFlags);

  const { data: chainFeatureFlags, isLoading: isChainFeatureFlagsLoading } = useQuery(
    ['fetch-chain-feature-flags', app, version],
    async () => {
      return await fetchChainFeatureFlags(storage, app);
    },
    {
      staleTime: 3 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Error fetching chain feature flags', error);
        setIsModificationsComplete(true);
      },
    },
  );

  useEffect(() => {
    if (isModificationsComplete || isChainFeatureFlagsLoading || !chainFeatureFlags) return;

    const { anyChainModified, modifiedChains } = modifyChains(ChainInfos, chainFeatureFlags, app, version);
    if (anyChainModified) {
      const updatedChains = { ...ChainInfos, ...modifiedChains };
      setChains(updatedChains);
      chainInfoStore.setChainInfos(updatedChains);
    }

    setIsModificationsComplete(true);
  }, [isModificationsComplete, chainFeatureFlags, isChainFeatureFlagsLoading, setChains]);

  useEffect(() => {
    if (!chainFeatureFlags) return;
    setChainFeatureFlags(chainFeatureFlags);
  }, [chainFeatureFlags, setChainFeatureFlags]);

  return { isModificationsComplete };
}
