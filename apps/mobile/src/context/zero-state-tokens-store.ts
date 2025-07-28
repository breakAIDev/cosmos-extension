import { ZeroStateTokensStore } from '@leapwallet/cosmos-wallet-store';

import { activeChainStore } from './active-chain-store';
import { chainFeatureFlagsStore, percentageChangeDataStore, priceStore } from './balance-store';
import { chainInfoStore } from './chain-infos-store';
import { denomsStore } from './denoms-store-instance';
import DeviceInfo from 'react-native-device-info';

const app = 'mobile';
const version = DeviceInfo.getVersion();

export const zeroStateTokensStore = new ZeroStateTokensStore(
  app,
  version,
  chainFeatureFlagsStore,
  chainInfoStore,
  denomsStore,
  priceStore,
  percentageChangeDataStore,
  activeChainStore,
);
