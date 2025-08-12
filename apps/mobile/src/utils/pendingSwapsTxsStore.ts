// React Native version (uses AsyncStorage instead of Browser.storage.local)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GasOptions } from '@leapwallet/cosmos-wallet-hooks';
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import { TXN_STATUS } from '@leapwallet/elements-core';
import { CURRENT_SWAP_TXS, PENDING_SWAP_TXS } from '../services/config/storage-keys';
import { RoutingInfo } from '../screens/swaps-v2/hooks';
import { SourceChain, SourceToken } from '../types/swap';

// ---------- helpers ----------
async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setJSON(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ---------- core ----------
export function generateObjectKey(routingInfo: RoutingInfo) {
  const message = routingInfo?.messages?.[0];
  if (!message) return undefined;

  const { customTxHash: txHash, customMessageChainId: msgChainId } = message;
  const key = `${msgChainId}-${txHash}`;
  return key;
}

export type TxStoreObject = {
  routingInfo: RoutingInfo;
  state?: TXN_STATUS;
  sourceChain: SourceChain | undefined;
  sourceToken: SourceToken | null;
  destinationChain: SourceChain | undefined;
  destinationToken: SourceToken | null;
  feeDenom: NativeDenom & {
    ibcDenom?: string | undefined;
  };
  gasEstimate: number;
  gasOption: GasOptions;
  userPreferredGasLimit: number | undefined;
  userPreferredGasPrice: GasPrice | undefined;
  inAmount: string;
  amountOut: string;
  feeAmount: string;
};

export type TxStoreRecord = Record<string, TxStoreObject>;

// Ideally should never be more than one tx
export async function addTxToCurrentTxList(tx: TxStoreObject, override: boolean = true) {
  const previousCurrentTxs = await getJSON<TxStoreRecord>(CURRENT_SWAP_TXS, {});
  const { routingInfo } = tx;

  const key = generateObjectKey(routingInfo);
  if (!key) return;

  if (!override && previousCurrentTxs?.[key]) {
    return;
  }

  previousCurrentTxs[key] = tx;
  await setJSON(CURRENT_SWAP_TXS, previousCurrentTxs);
}

export async function moveTxsFromCurrentToPending() {
  const [currentTxs, pendingTxs] = await Promise.all([
    getJSON<TxStoreRecord>(CURRENT_SWAP_TXS, {}),
    getJSON<TxStoreRecord>(PENDING_SWAP_TXS, {}),
  ]);

  const currentTxsKeys = Object.keys(currentTxs ?? {});
  if (currentTxsKeys.length === 0) return;

  let pendingTxsUpdated = false;

  // Avoid async inside forEach; keep order deterministic
  for (const key of currentTxsKeys) {
    const current = currentTxs[key];
    const pending = pendingTxs[key];

    if (!!current?.state && !!pending?.state && pending.state === current.state) {
      continue;
    }
    pendingTxs[key] = current;
    pendingTxsUpdated = true;
  }

  if (!pendingTxsUpdated) {
    await setJSON(CURRENT_SWAP_TXS, {});
    return;
  }

  await AsyncStorage.multiSet([
    [PENDING_SWAP_TXS, JSON.stringify(pendingTxs)],
    [CURRENT_SWAP_TXS, JSON.stringify({})],
  ]);
}

export async function removeCurrentSwapTxs(txKey: string) {
  const previousCurrentTxs = await getJSON<TxStoreRecord>(CURRENT_SWAP_TXS, {});
  if (previousCurrentTxs?.[txKey]) {
    delete previousCurrentTxs[txKey];
    await setJSON(CURRENT_SWAP_TXS, previousCurrentTxs);
  }
}

export async function addTxToPendingTxList(tx: TxStoreObject, override: boolean = true) {
  const previousPendingTxs = await getJSON<TxStoreRecord>(PENDING_SWAP_TXS, {});
  const { routingInfo } = tx;

  const key = generateObjectKey(routingInfo);
  if (!key) return;

  if (!override && previousPendingTxs?.[key]) {
    return;
  }

  previousPendingTxs[key] = tx;
  await setJSON(PENDING_SWAP_TXS, previousPendingTxs);
}

export async function removePendingSwapTxs(txKey: string) {
  const previousPendingTxs = await getJSON<TxStoreRecord>(PENDING_SWAP_TXS, {});
  if (previousPendingTxs?.[txKey]) {
    delete previousPendingTxs[txKey];
    await setJSON(PENDING_SWAP_TXS, previousPendingTxs);
  }
}
