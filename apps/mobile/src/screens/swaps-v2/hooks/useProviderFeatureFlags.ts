import { useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks';
import { useMemo } from 'react';
import DeviceInfo from 'react-native-device-info';
import semver from 'semver';

export function useProviderFeatureFlags() {
  const { data: featureFlags } = useFeatureFlags();

  const isSkipEnabled = useMemo(() => {
    if (!featureFlags?.swaps?.providers?.skip?.disabled_on_versions) {
      return true;
    }
    const version = DeviceInfo.getVersion();
    return !featureFlags.swaps.providers.skip.disabled_on_versions?.some((disabledVersions) => {
      return semver.satisfies(version, disabledVersions);
    });
  }, [featureFlags]);

  const isEvmSwapEnabled = useMemo(() => {
    if (!featureFlags?.swaps?.evm?.disabled_on_versions) {
      return true;
    }
    const version = DeviceInfo.getVersion();
    return !featureFlags.swaps.evm.disabled_on_versions?.some((disabledVersions) => {
      return semver.satisfies(version, disabledVersions);
    });
  }, [featureFlags]);

  return {
    isSkipEnabled,
    isEvmSwapEnabled,
  };
}
