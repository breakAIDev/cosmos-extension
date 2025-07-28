import { ZeroStateBannerStore } from '@leapwallet/cosmos-wallet-store';
import DeviceInfo from 'react-native-device-info';

import { getStorageAdapter } from '../utils/storageAdapter';

const app = 'mobile';
const version = DeviceInfo.getVersion();
const storageAdapter = getStorageAdapter();

export const zeroStateBannerStore = new ZeroStateBannerStore(app, version, storageAdapter);
