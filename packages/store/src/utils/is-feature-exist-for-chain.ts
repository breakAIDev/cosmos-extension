import { ChainInfosConfigPossibleFeatureType, ChainInfosConfigPossibleFeatureValueType, ChainInfosConfigType } from '../types';

function hasKey<T extends object>(obj: T, key: PropertyKey): key is keyof T {
  return key in obj;
}

export function isFeatureExistForChain(
  checkForExistenceType: 'comingSoon' | 'notSupported',
  feature: ChainInfosConfigPossibleFeatureType,
  platform: 'Extension' | 'Mobile' | 'Dashboard',
  activeChainId: string | undefined,
  chainInfosConfig: ChainInfosConfigType,
) {
  if (!activeChainId) return false;

  const test = (map?: Record<string, ChainInfosConfigPossibleFeatureValueType>) => {
    if (!map || !hasKey(map, feature)) return false; // ✅ narrows feature to keyof map
    const { platforms, chains } = map[feature];
    if (platforms.includes('All') || platforms.includes(platform)) {
      return !!chains[activeChainId];
    }
    return false;
  };

  if (checkForExistenceType === 'comingSoon') {
    return test(chainInfosConfig.coming_soon_features);
  }
  if (checkForExistenceType === 'notSupported') {
    return test(chainInfosConfig.not_supported_features);
  }
  return false;
}
