import {
  useSelectedNetwork as useSelectedNetworkWalletHooks,
  useSetSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SELECTED_NETWORK } from '../../services/config/storage-keys';
import { useEffect, useCallback } from 'react';
import { rootStore } from '../../context/root-store';

export type SelectedNetwork = 'mainnet' | 'testnet';

export function useSelectedNetwork() {
  return useSelectedNetworkWalletHooks();
}

export function useSetNetwork() {
  const setSelectedNetwork = useSetSelectedNetwork();

  return useCallback((chain: SelectedNetwork) => {
    rootStore.setSelectedNetwork(chain);
    setSelectedNetwork(chain);
    AsyncStorage.setItem(SELECTED_NETWORK, chain); // Always a string
  }, [setSelectedNetwork]);
}

export function useInitNetwork() {
  const setNetwork = useSetNetwork();

  useEffect(() => {
    AsyncStorage.getItem(SELECTED_NETWORK).then((network) => {
      const defaultNetwork: SelectedNetwork = 'mainnet';
      if (network === 'mainnet' || network === 'testnet') {
        setNetwork(network);
      } else {
        setNetwork(defaultNetwork);
      }
    });
  }, [setNetwork]);
}
