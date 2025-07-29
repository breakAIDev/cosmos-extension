import { Key, useActiveWalletStore, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo, pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { PasswordStore } from '@leapwallet/cosmos-wallet-store';
import { KeyChain } from '@leapwallet/leap-keychain';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { useChainInfos } from '../useChainInfos';
import { getUpdatedKeyStore } from '../wallet/getUpdatedKeyStore';
import { useCallback, useEffect } from 'react';
import { passwordStore } from '../../context/password-store';
import { rootStore } from '../../context/root-store';
import { AggregatedSupportedChain } from '../../types/utility';
import { sendMessageToTab } from '../../utils';

import {
  ACTIVE_CHAIN,
  ACTIVE_WALLET,
  ACTIVE_WALLET_ID,
  KEYSTORE,
  LAST_EVM_ACTIVE_CHAIN,
  MANAGE_CHAIN_SETTINGS,
} from '../../services/config/storage-keys';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ActionType = 'UPDATE' | 'DELETE';

function useHandleMissingAddressAndPubKeys() {
  const chainInfos = useChainInfos();

  return useCallback(
    async (
      chains: SupportedChain | SupportedChain[],
      existingWallet: Key,
      actionType: ActionType,
      chainInfo?: ChainInfo,
      _chainInfos?: Partial<Record<SupportedChain, ChainInfo>>,
    ): Promise<Key | undefined> => {
      if (!passwordStore.password) return existingWallet;
      if (Array.isArray(chains)) {
        let keyStore = existingWallet;
        for await (const chain of chains) {
          const chainInfo = _chainInfos?.[chain] ?? chainInfos?.[chain];
          try {
            const updatedKeyStore = await getUpdatedKeyStore(
              chainInfos,
              passwordStore.password,
              chain,
              keyStore,
              actionType,
              chainInfo,
            );
            if (updatedKeyStore) {
              keyStore = updatedKeyStore;
            }
          } catch (e) {
            //
          }
        }
        return keyStore;
      }

      const chain = chains;
      return getUpdatedKeyStore(chainInfos, passwordStore.password, chain, existingWallet, actionType, chainInfo);
    },
    [chainInfos],
  );
}

export function useUpdateKeyStore() {
  const handleMissingAddressAndPubKeys = useHandleMissingAddressAndPubKeys();

  return useCallback(
    async (
      wallet: Key,
      activeChain: SupportedChain | SupportedChain[],
      actionType: ActionType = 'UPDATE',
      chainInfo?: ChainInfo,
      chainInfos?: Partial<Record<SupportedChain, ChainInfo>>,
    ) => {
      const keystore = await KeyChain.getAllWallets();
      const newKeystoreEntries: [string, Key | undefined][] = await Promise.all(
        Object.entries(keystore).map(async (keystoreEntry) => {
          const [walletId, walletInfo] = keystoreEntry;
          const newWallet = await handleMissingAddressAndPubKeys(
            activeChain,
            walletInfo,
            actionType,
            chainInfo,
            chainInfos,
          );
          return [walletId, newWallet];
        }),
      );

      const newKeystore = newKeystoreEntries.reduce((newKs: Record<string, Key | undefined>, keystoreEntry) => {
        newKs[keystoreEntry[0]] = keystoreEntry[1];
        return newKs;
      }, {});
      await AsyncStorage.setItem(KEYSTORE, JSON.stringify(newKeystore));
      await AsyncStorage.setItem(ACTIVE_WALLET, JSON.stringify(newKeystore[wallet.id]));
      return newKeystore;
    },
    [handleMissingAddressAndPubKeys],
  );
}

export function useInitActiveWallet(passwordStore: PasswordStore) {
  const { setActiveWallet } = useActiveWalletStore();

useEffect(() => {
  async function fetchActiveWallet() {
    try {
      const [
        activeWalletRaw,
        manageChainSettingsRaw,
        activeWalletId
      ] = await Promise.all([
        AsyncStorage.getItem('ACTIVE_WALLET'),
        AsyncStorage.getItem('MANAGE_CHAIN_SETTINGS'),
        AsyncStorage.getItem('ACTIVE_WALLET_ID'),
      ]);

      const activeWallet = activeWalletRaw ? JSON.parse(activeWalletRaw) : null;
      const manageChainSettings = manageChainSettingsRaw ? JSON.parse(manageChainSettingsRaw) : null;
      setActiveWallet(activeWallet);

      if (!activeWalletId && activeWallet) {
        await AsyncStorage.setItem('ACTIVE_WALLET_ID', activeWallet.id);
      }
    } catch (err) {
      // handle error if needed
    }
  }

  fetchActiveWallet();
  }, [passwordStore.password, setActiveWallet]);
}

export default function useActiveWallet() {
  const { setActiveWallet: setState, activeWallet } = useActiveWalletStore();
  const { data: featureFlags } = useFeatureFlags();

  const setActiveWallet = useCallback(
    async (wallet: Key | null) => {
      if (!wallet) return;

      const activeChainRaw = await AsyncStorage.getItem(ACTIVE_CHAIN);
      const lastEvmActiveChainRaw = await AsyncStorage.getItem(LAST_EVM_ACTIVE_CHAIN);
      const lastEvmActiveChain: SupportedChain = lastEvmActiveChainRaw ? JSON.parse(lastEvmActiveChainRaw) : 'ethereum';
      const activeChain: SupportedChain = activeChainRaw ? JSON.parse(activeChainRaw) : 'cosmos';

      const evmAddress = pubKeyToEvmAddressToShow(wallet.pubKeys?.[lastEvmActiveChain]);
      await sendMessageToTab({ event: 'accountsChanged', data: [evmAddress] });
      if (wallet.pubKeys?.['sui']) {
        const suiAddress = wallet.pubKeys?.['sui'];
        await sendMessageToTab({ event: 'suiAccountsChanged', data: [suiAddress] });
      }
      if (wallet.pubKeys?.['solana']) {
        const solanaAddress = wallet.pubKeys?.['solana'];
        await sendMessageToTab({ event: 'solanaAccountsChanged', data: [solanaAddress] });
      }

      await sendMessageToTab({ event: 'leap_keystorechange' });
      await AsyncStorage.setItem(ACTIVE_WALLET, JSON.stringify(wallet));
      await AsyncStorage.setItem(ACTIVE_WALLET_ID, wallet.id);

      rootStore.reloadAddresses().finally(() => {
        if (
          featureFlags?.swaps?.chain_abstraction === 'active' &&
          (activeChain as AggregatedSupportedChain) !== AGGREGATED_CHAIN_KEY
        ) {
          rootStore.rootBalanceStore.loadBalances('aggregated');
        }
      });

      try {
        setState(wallet);
      } catch (e) {
        //
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeWallet, setState, featureFlags],
  );

  return { activeWallet, setActiveWallet };
}
