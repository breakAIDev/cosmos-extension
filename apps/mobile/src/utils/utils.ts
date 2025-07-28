import { getChains } from '@leapwallet/cosmos-wallet-hooks';
import {
  chainIdToChain,
  ChainInfo,
  isAptosChain,
  isSuiChain,
  sleep,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { KeyChain } from '@leapwallet/leap-keychain';
import { initStorage } from '@leapwallet/leap-keychain';
import { base58 } from '@scure/base';
import { COMPASS_CHAINS } from '../services/config/config';
import { ACTIVE_CHAIN, ACTIVE_WALLET_ID, BETA_CHAINS, SELECTED_NETWORK, CONNECTIONS, ACTIVE_WALLET } from '../services/config/storage-keys';
import CryptoJs from 'crypto-js';
import * as sol from 'micro-sol-signer';
import { addToConnections } from '../screens/ApproveConnection/utils';
import { getStorageAdapter } from './storageAdapter';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Util: Compare two Uint8Arrays for equality
 */
function arrayEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// --------- STORAGE HELPERS (React Native with AsyncStorage) ----------

export const getExperimentalChains = async (): Promise<Record<string, ChainInfo> | undefined> => {
  const betaChainsRaw = await AsyncStorage.getItem(BETA_CHAINS);
  if (!betaChainsRaw) return undefined;
  return JSON.parse(betaChainsRaw);
};

export const decodeChainIdToChain = async (): Promise<Record<string, string>> => {
  const experimentalChains = (await getExperimentalChains()) ?? {};
  return Object.assign(
    chainIdToChain,
    Object.keys(experimentalChains).reduce((acc: Record<string, string>, cur) => {
      acc[experimentalChains[cur].chainId] = cur;
      return acc;
    }, {}),
    { 'elgafar-1': 'stargaze' },
  );
};

export const validateChains = async (chainIds: Array<string>) => {
  const chainInfos = await getChains();
  const compassChainIds = (COMPASS_CHAINS as SupportedChain[])
    .map((chain: SupportedChain) => {
      if (chainInfos[chain]) {
        return [chainInfos[chain].chainId, chainInfos[chain].testnetChainId];
      }
      return [];
    })
    .flat()
    .filter(Boolean);

  const supportedChains = Object.values(chainInfos)
    .filter((chain) => chain.enabled)
    .map((chain) => chain.chainId);
  const supportedTestnetChains = Object.values(chainInfos)
    .filter((chain) => chain.enabled)
    .map((chain) => chain.testnetChainId);
  const experimentalChains = (await getExperimentalChains()) ?? {};
  const supportedExperimentalChains = Object.values(experimentalChains)
    .filter((chain: ChainInfo) => chain.enabled)
    .map((chain: ChainInfo) => chain.chainId);
  const supportedChainsIds = [...supportedChains, ...supportedTestnetChains, ...supportedExperimentalChains]?.filter(
    (chainId) => {
      if (!chainId) return false;
      // Compass check: ignore if not compass, otherwise must be compass chain
      if (process.env.APP?.includes('compass')) {
        if (compassChainIds.includes(chainId)) {
          return true;
        }
        return false;
      }
      return true;
    },
  );

  return chainIds.reduce((result: Record<string, boolean>, chainId) => {
    result[chainId] = supportedChainsIds.indexOf(chainId) !== -1;
    return result;
  }, {});
};

// ---- CONNECTIONS --- For React Native, you must model this as you wish! -----

export const getConnections = async () => {
  const connectionsRaw = await AsyncStorage.getItem(CONNECTIONS);
  return connectionsRaw ? JSON.parse(connectionsRaw) : {};
};

export const getActiveWallet = async () => {
  const activeWalletRaw = await AsyncStorage.getItem(ACTIVE_WALLET);
  return activeWalletRaw ? JSON.parse(activeWalletRaw) : {};
};

export const getActiveWalletId = async () => {
  const storeRaw = await AsyncStorage.getItem(ACTIVE_WALLET_ID);
  return storeRaw ?? '';
};

// This is just a stub in RN. You must model your own connection approval workflow in the UI.
export async function checkChainConnections(
  chainIds: string[],
  connections: any,
  msg: any,
  activeWalletId: string,
) {
  let isNewChainPresent = !activeWalletId;
  const chainsIds = await validateChains(chainIds);
  const validChainIds = Object.keys(chainsIds).filter((chainId) => !!chainsIds[chainId]);
  if (activeWalletId) {
    validChainIds.forEach((chainId: string) => {
      const sites: [string] = connections?.[activeWalletId]?.[chainId] || [];
      if (!sites.includes(msg?.origin)) {
        isNewChainPresent = true;
      }
    });
  }
  // No auto addToConnections in RN: user must approve in-app!
  return {
    validChainIds,
    isNewChainPresent,
  };
}

export async function checkConnection(chainIds: string[], msg: any) {
  const [activeWalletId, connections] = await Promise.all([getActiveWalletId(), getConnections()]);
  return await checkChainConnections(chainIds, connections, msg, activeWalletId);
}

export async function isConnected(msg: { chainId: string; origin: string }) {
  const [activeWallet, connections] = await Promise.all([getActiveWallet(), getConnections()]);
  const sites: [string] = connections?.[activeWallet.id]?.[msg?.chainId] || [];
  return sites.includes(msg.origin);
}

export const getChainOriginStorageKey = (origin: string, prefix?: string) =>
  `${prefix ?? ''}origin-active-key-${origin}`;

export async function disconnect(msg: { chainId?: string | string[]; origin: string }) {
  if (!msg.chainId) return false;
  const isAptos = Array.isArray(msg.chainId)
    ? !!msg?.chainId?.every((_chainId) => isAptosChain(_chainId))
    : isAptosChain(msg.chainId);
  const isSui = Array.isArray(msg.chainId)
    ? !!msg?.chainId?.every((_chainId) => isSuiChain(_chainId))
    : isSuiChain(msg.chainId);

  const [activeWallet, connections] = await Promise.all([
    getActiveWallet(),
    getConnections(),
    AsyncStorage.removeItem(getChainOriginStorageKey(msg.origin, isAptos ? 'aptos-' : isSui ? 'sui-' : '')),
  ]);

  if (Array.isArray(msg.chainId)) {
    let foundOneChainIdWithOrigin = false;
    for (const chainId of msg.chainId) {
      let sites = connections[activeWallet.id]?.[chainId] || [];
      if (sites.includes(msg.origin)) {
        sites = sites.filter((site: string) => site !== msg.origin);
        connections[activeWallet.id][chainId] = sites;
        foundOneChainIdWithOrigin = true;
      }
    }
    await AsyncStorage.setItem(CONNECTIONS, JSON.stringify(connections));
    return foundOneChainIdWithOrigin;
  } else {
    let sites = connections[activeWallet.id]?.[msg?.chainId] || [];
    if (sites.includes(msg.origin)) {
      sites = sites.filter((site: string) => site !== msg.origin);
      connections[activeWallet.id][msg.chainId] = sites;
      await AsyncStorage.setItem(CONNECTIONS, JSON.stringify(connections));
      return true;
    }
  }
  return false;
}

export async function getSupportedChains(): Promise<Record<SupportedChain, ChainInfo>> {
  const chainInfos = await getChains();

  let allChains = chainInfos;
  try {
    const betaChains = (await getExperimentalChains()) ?? {};
    allChains = { ...chainInfos, ...betaChains };
  } catch (_) {}
  // If you want to filter for Compass, you can add the logic here.
  return allChains;
}

export async function getActiveNetworkInfo() {
  const activeChain = await AsyncStorage.getItem(ACTIVE_CHAIN);
  const selectedNetwork = await AsyncStorage.getItem(SELECTED_NETWORK);
  const allSupportedChains = await getSupportedChains();
  const chainInfo = allSupportedChains?.[(activeChain ?? '') as SupportedChain];
  const chainId = selectedNetwork === 'testnet' ? chainInfo?.testnetChainId : chainInfo?.chainId;
  const restUrl = selectedNetwork === 'testnet' ? chainInfo?.apis?.restTest : chainInfo?.apis?.rest;
  const rpcUrl = selectedNetwork === 'testnet' ? chainInfo?.apis?.rpcTest : chainInfo?.apis?.rpc;
  return {
    chainId,
    restUrl,
    rpcUrl,
    selectedNetwork,
  };
}

export async function getWalletAddress(chainId: string) {
  const activeWalletRaw = await AsyncStorage.getItem(ACTIVE_WALLET);
  const activeWallet = activeWalletRaw ? JSON.parse(activeWalletRaw) : {};
  const _chainIdToChain = await decodeChainIdToChain();
  let chain = _chainIdToChain[chainId];
  chain = chain === 'cosmoshub' ? 'cosmos' : chain;
  return activeWallet.addresses[chain];
}

// --- SEED HANDLING, only for Secret Network! ---
export async function getSeed(password: Uint8Array) {
  const activeWallet = await getActiveWallet();
  const key = `seed-phrase/${activeWallet.id}`;
  const cachedKey = await AsyncStorage.getItem(key);
  if (cachedKey) {
    const cachedKeyBytes = Buffer.from(cachedKey, 'hex');
    if (cachedKeyBytes.length === 32) {
      return cachedKeyBytes;
    }
  }

  const address = await getWalletAddress('secret-4');
  const storageAdapter = getStorageAdapter();
  initStorage(storageAdapter);
  const signer = await KeyChain.getSigner(activeWallet.id, password, {
    addressPrefix: 'secret',
    coinType: '529',
  });

  // @ts-ignore
  const signature = await signer.signAmino(
    address,
    // @ts-ignore
    Buffer.from(
      JSON.stringify({
        account_number: 0,
        chain_id: 'secret-4',
        fee: [],
        memo: 'Create leap Secret encryption key. Only approve requests by Leap.',
        msgs: [],
        sequence: 0,
      }),
    ),
  );

  const seed = CryptoJs.SHA256(signature);

  await AsyncStorage.setItem(key, seed.toString());
  return Buffer.from(seed.toString());
}

export function validateNewChainInfo(chainInfo: any) {
  const validUrl = new RegExp(/^(http|https):\/\/[^ "]+$/);
  const validBip44 = new RegExp(/^\d+$/);
  if (!validUrl.test(chainInfo.rpc)) {
    throw new Error('Invalid RPC URL');
  }
  if (!validUrl.test(chainInfo.rest)) {
    throw new Error('Invalid REST URL');
  }
  if (!validBip44.test(chainInfo.bip44.coinType)) {
    throw new Error('Invalid bip44 coin type');
  }
  if (chainInfo.feeCurrencies?.length < 1) {
    throw new Error('Invalid fee currencies');
  }
}

// ----------------- SOLANA PRIVATE KEY VALIDATION (UNIVERSAL) ----------------

export function validateSolanaPrivateKey(
  privateKey: string | number[] | Uint8Array,
): { isValid: boolean; publicAddress: string; privateKey: Uint8Array | string } {
  try {
    let privateKeyBytes: Uint8Array;

    if (typeof privateKey === 'string') {
      // If hex string
      if (/^[0-9a-fA-F]+$/.test(privateKey)) {
        const bytes = new Uint8Array(privateKey.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
        privateKey = base58.encode(bytes);
      }
      privateKeyBytes = base58.decode(privateKey);
    } else if (Array.isArray(privateKey)) {
      privateKeyBytes = new Uint8Array(privateKey);
    } else if (privateKey instanceof Uint8Array) {
      privateKeyBytes = privateKey;
    } else {
      return { isValid: false, publicAddress: '', privateKey: '' };
    }

    // 64 bytes: combined private + public
    if (privateKeyBytes.length === 64) {
      const originalPublicKey = privateKeyBytes.slice(32);
      privateKeyBytes = privateKeyBytes.slice(0, 32);
      const derivedPublicKey = sol.getPublicKey(privateKeyBytes);
      if (!arrayEqual(derivedPublicKey, originalPublicKey)) {
        return { isValid: false, publicAddress: '', privateKey: '' };
      }
    }

    if (privateKeyBytes.length !== 32) {
      return { isValid: false, publicAddress: '', privateKey: '' };
    }

    const derivedPublicKey = sol.getPublicKey(privateKeyBytes);
    const derivedAddress = sol.getAddress(privateKeyBytes);

    return {
      isValid: true,
      publicAddress: derivedAddress,
      privateKey: privateKeyBytes,
    };
  } catch (error) {
    return { isValid: false, publicAddress: '', privateKey: '' };
  }
}
