import {
  APP_NAME,
  PLATFORM_TYPE,
  setAppName,
  setLeapapiBaseUrl,
  setNumiaBannerBearer,
  setPlatformType,
  setStorageLayer,
} from '@leapwallet/cosmos-wallet-hooks';
import { setAppType, setBaseURL, setIsCompass } from '@leapwallet/cosmos-wallet-store';
import { initCachingLayer, setCustomHeaders, setLeapIntegratorID } from '@leapwallet/elements-hooks';
import { initCrypto, initStorage } from '@leapwallet/leap-keychain';
import axios from 'axios';
import { AsyncIDBStorage } from 'utils/asyncIDBStorage';

import { isCompassWallet } from './utils/isCompassWallet';
import { getStorageAdapter } from './utils/storageAdapter';

// Axios config
axios.defaults.headers.common['x-app-type'] = 'compass-extension';
axios.defaults.headers.common['x-requested-with'] = 'leap-client';
axios.defaults.timeout = 5000;

// wallet sdk config
setAppType('extension');
setBaseURL(process.env.LEAP_WALLET_BACKEND_API_URL as string);
setIsCompass(isCompassWallet());
const storageAdapter = getStorageAdapter();
setStorageLayer(storageAdapter);

// wallet hooks config
setLeapapiBaseUrl(process.env.LEAP_WALLET_BACKEND_API_URL as string);
setNumiaBannerBearer(process.env.NUMIA_BANNER_BEARER ?? '');
setPlatformType(PLATFORM_TYPE.Extension);
setAppName(isCompassWallet() ? APP_NAME.Compass : APP_NAME.Cosmos); // setAppName is for tx logging

// elements config
setCustomHeaders({
  'x-app-type': 'compass-extension',
});
initCachingLayer(AsyncIDBStorage);
setLeapIntegratorID(process.env.ELEMENTS_INTEGRATOR_ID as string);

// keychain config
initStorage(storageAdapter);
initCrypto();

export { fetchIbcTraceData } from '@leapwallet/cosmos-wallet-store';
