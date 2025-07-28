import {
  Key,
  SelectedNetworkType,
  useActiveChain as useActiveChainWalletHooks,
  useGetChains,
  useInitSelectedNetwork,
  usePendingTxState,
  useSetActiveChain as useSetActiveChainWalletHooks,
  useSetLastEvmActiveChain,
} from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import {
  ACTIVE_CHAIN,
  KEYSTORE,
  LAST_EVM_ACTIVE_CHAIN,
} from '../../services/config/storage-keys';
import { useSetNetwork } from './useNetwork';
import { useChainInfos } from '../useChainInfos';
import { useEffect, useState } from 'react';
import { rootStore } from '../../context/root-store';
import { AggregatedSupportedChain } from '../../types/utility';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useActiveWallet, { useUpdateKeyStore } from './useActiveWallet';
import { useHandleWatchWalletChainSwitch } from './useHandleWWChainSwitch';
import { useIsAllChainsEnabled } from './useIsAllChainsEnabled';

/**
 * Use the current active chain (from global wallet hooks).
 */
export function useActiveChain(): SupportedChain {
  return useActiveChainWalletHooks();
}

/**
 * Returns a function that sets the active chain and does all needed updates.
 */
export function useSetActiveChain() {
  const chainInfos = useGetChains();
  const { setPendingTx } = usePendingTxState();
  const setNetwork = useSetNetwork();

  const updateKeyStore = useUpdateKeyStore();
  const { activeWallet, setActiveWallet } = useActiveWallet();
  const setActiveChain = useSetActiveChainWalletHooks();
  const setLastEvmActiveChain = useSetLastEvmActiveChain();
  const queryClient = useQueryClient();

  return async (
    chain: AggregatedSupportedChain,
    chainInfo?: ChainInfo,
    forceNetwork?: 'mainnet' | 'testnet',
  ) => {
    // Read from AsyncStorage in parallel
    const [
      networkMapRaw,
      keystoreRaw,
      activeChainRaw,
    ] = await Promise.all([
      AsyncStorage.getItem('networkMap'),
      AsyncStorage.getItem(KEYSTORE),
      AsyncStorage.getItem(ACTIVE_CHAIN),
    ]);
    const networkMap = networkMapRaw ? JSON.parse(networkMapRaw) : {};
    const keystore = keystoreRaw ? JSON.parse(keystoreRaw) : {};

    if (chain !== AGGREGATED_CHAIN_KEY && keystore) {
      const shouldUpdateKeystore = Object.keys(keystore).some((key) => {
        const wallet = keystore[key];
        return wallet && !wallet.watchWallet && (!wallet.addresses[chain] || !wallet.pubKeys?.[chain]);
      });
      if (activeWallet && shouldUpdateKeystore) {
        const updatedKeystore = await updateKeyStore(activeWallet, chain);
        await setActiveWallet(updatedKeystore[activeWallet.id] as Key);
      }
    }

    await queryClient.cancelQueries();
    setActiveChain(chain as SupportedChain);
    rootStore.setActiveChain(chain);
    await AsyncStorage.setItem(ACTIVE_CHAIN, chain);
    setPendingTx(null);

    // Handle network setting for EVM and special cases
    if (chain !== AGGREGATED_CHAIN_KEY) {
      const _chainInfo = chainInfos[chain] || chainInfo;

      if (chain === 'seiDevnet') {
        setNetwork('mainnet');
      } else {
        if (_chainInfo?.evmOnlyChain) {
          setLastEvmActiveChain(chain);
          await AsyncStorage.setItem(LAST_EVM_ACTIVE_CHAIN, chain);
        }

        if (forceNetwork) {
          setNetwork(forceNetwork);
        } else if (networkMap[chain]) {
          let network = networkMap[chain];
          let hasChainOnlyTestnet = false;

          if (
            _chainInfo &&
            (!_chainInfo?.beta || _chainInfo.evmOnlyChain) &&
            _chainInfo?.chainId === _chainInfo?.testnetChainId
          ) {
            hasChainOnlyTestnet = true;
          }

          if (hasChainOnlyTestnet && network !== 'testnet') {
            network = 'testnet';
          }
          setNetwork(network);
        } else if (_chainInfo && _chainInfo?.apis?.rpc) {
          setNetwork('mainnet');
        } else if (_chainInfo && _chainInfo?.apis?.rpcTest) {
          setNetwork('testnet');
        }
      }
    } else {
      setNetwork('mainnet');
    }
  };
}

/**
 * Initialize the active chain on app startup or when enabled.
 */
export function useInitActiveChain(enabled: boolean) {
  const chainInfos = useChainInfos();
  const chains = useGetChains();
  const setActiveChain = useSetActiveChainWalletHooks();
  const setLastEvmActiveChain = useSetLastEvmActiveChain();
  const isAllChainsEnabled = useIsAllChainsEnabled();

  const [isActiveChainInitialized, setIsActiveChainInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      const [activeChainRaw, lastEvmActiveChainRaw] = await Promise.all([
        AsyncStorage.getItem(ACTIVE_CHAIN),
        AsyncStorage.getItem(LAST_EVM_ACTIVE_CHAIN),
      ]);
      if (!enabled) return;

      let activeChain: SupportedChain = (activeChainRaw as SupportedChain) || undefined;
      const leapFallbackChain = AGGREGATED_CHAIN_KEY as SupportedChain;
      const defaultActiveChain = leapFallbackChain;

      setLastEvmActiveChain((lastEvmActiveChainRaw as SupportedChain) ?? 'ethereum');

      if ((activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY && isAllChainsEnabled) {
        setActiveChain(activeChain);
        rootStore.setActiveChain(activeChain);
        setIsActiveChainInitialized(true);
        return;
      }

      if (!activeChain || chains[activeChain] === undefined) {
        activeChain = defaultActiveChain;
      }

      setActiveChain(activeChain);
      rootStore.setActiveChain(activeChain);
      setIsActiveChainInitialized(true);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainInfos, chains, isAllChainsEnabled, enabled]);

  useHandleWatchWalletChainSwitch(isActiveChainInitialized);
  useInitSelectedNetwork(isActiveChainInitialized);
}
