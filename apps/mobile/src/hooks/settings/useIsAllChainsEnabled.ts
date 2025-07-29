import { FeatureFlags, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks';
import semver from 'semver';
import DeviceInfo from 'react-native-device-info';

export function isAllChainsEnabled(featureFlags: FeatureFlags | undefined) {
  const version = DeviceInfo.getVersion();

  return (
    semver.satisfies(version, featureFlags?.give_all_chains_option_in_wallet?.extension_v2 || '=0.0.1') ||
    featureFlags?.give_all_chains_option_in_wallet?.extension === 'active'
  );
}

export function useIsAllChainsEnabled() {
  const { data: featureFlags } = useFeatureFlags();

  return isAllChainsEnabled(featureFlags);
}
