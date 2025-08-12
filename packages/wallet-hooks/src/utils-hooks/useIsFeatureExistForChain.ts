import { ChainInfosConfigPossibleFeatureType, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useChainInfosConfig, useGetChains, useSelectedNetwork } from '../store';

export type useIsFeatureExistForChainParams = {
  checkForExistenceType: 'comingSoon' | 'notSupported';
  feature: ChainInfosConfigPossibleFeatureType;
  platform: 'Extension' | 'Mobile' | 'Dashboard';
  forceChain?: SupportedChain;
  forceNetwork?: 'mainnet' | 'testnet';
};

function hasKey<T extends object>(obj: T | undefined, key: PropertyKey): obj is T & Record<PropertyKey, unknown> {
  return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function useIsFeatureExistForChain({
  checkForExistenceType,
  feature,
  platform,
  forceChain,
  forceNetwork,
}: useIsFeatureExistForChainParams) {
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();
  const chains = useGetChains();
  const activeChain = forceChain ?? _activeChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const chainInfosConfig = useChainInfosConfig();
  const activeChainId = useMemo(() => {
    if (selectedNetwork === 'testnet') {
      return chains[activeChain]?.testnetChainId ?? '';
    }

    return chains[activeChain]?.chainId ?? '';
  }, [chains, activeChain, selectedNetwork]);

  return useMemo(() => {
    const platformMatches = (platforms: string[]) =>
      platforms.includes('All') || platforms.includes(platform);

    if (checkForExistenceType === 'comingSoon') {
      const map = chainInfosConfig.coming_soon_features;
      if (hasKey(map, feature)) {
        const { platforms, chains } = (map as any)[feature];
        if (platformMatches(platforms)) return !!chains?.[activeChainId];
      }
      return false;
    }

    if (checkForExistenceType === 'notSupported') {
      const map = chainInfosConfig.not_supported_features;
      if (hasKey(map, feature)) {
        const { platforms, chains } = (map as any)[feature];
        if (platformMatches(platforms)) return !!chains?.[activeChainId];
      }
      return false;
    }

    return false;
  }, [checkForExistenceType, feature, platform, activeChainId, chainInfosConfig]);
}