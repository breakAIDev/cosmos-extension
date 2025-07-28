import { PopularChainsStore } from '@leapwallet/cosmos-wallet-store';
import DeviceInfo from 'react-native-device-info';

import { chainFeatureFlagsStore } from './balance-store';

const app = 'mobile'; // or 'react-native'
const version = DeviceInfo.getVersion(); // returns version from package.json
export const popularChainsStore = new PopularChainsStore(app, version, chainFeatureFlagsStore);
