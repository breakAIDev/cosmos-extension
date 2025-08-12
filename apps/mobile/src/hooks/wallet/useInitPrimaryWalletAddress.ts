import { useSetPrimaryAddress, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { KeyChain } from '@leapwallet/leap-keychain';
import { useEffect } from 'react';

import { PRIMARY_WALLET_ADDRESS } from '../../services/config/storage-keys';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getPrimaryWalletAddress = async (setPrimaryWalletAddress: (address: string) => void) => {
  KeyChain.getAllWallets<SupportedChain>().then((wallets) => {
    if (wallets) {
      const _wallets = Object.values(wallets);
      const primaryWallet = _wallets.find(
        (wallet) =>
          (wallet.walletType === WALLETTYPE.SEED_PHRASE || wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED) &&
          wallet.addressIndex === 0,
      );
      if (primaryWallet) {
        let primaryWalletAddress = primaryWallet?.addresses?.cosmos;
        if (!primaryWalletAddress) {
          const evmPubKey = primaryWallet?.pubKeys?.ethereum;
          if (evmPubKey) {
            primaryWalletAddress = pubKeyToEvmAddressToShow(evmPubKey, true) || '';
          }
          if (!evmPubKey) {
            const solanaPubKey = _wallets?.[0]?.pubKeys?.solana;
            if (solanaPubKey) {
              primaryWalletAddress = solanaPubKey;
            }
            if (!solanaPubKey) {
              const suiPubKey = _wallets?.[0]?.addresses?.sui;
              if (suiPubKey) {
                primaryWalletAddress = suiPubKey;
              }
            }
          }
        }
        setPrimaryWalletAddress(primaryWalletAddress);
        AsyncStorage.setItem(PRIMARY_WALLET_ADDRESS, primaryWalletAddress);
      } else {
        let primaryWalletAddress = _wallets?.[0]?.addresses?.cosmos;
        if (!primaryWalletAddress) {
          const evmPubKey = _wallets?.[0]?.pubKeys?.ethereum;
          if (evmPubKey) {
            primaryWalletAddress = pubKeyToEvmAddressToShow(evmPubKey, true) || '';
          }
          if (!evmPubKey) {
            const solanaPubKey = _wallets?.[0]?.pubKeys?.solana;
            if (solanaPubKey) {
              primaryWalletAddress = solanaPubKey;
            }
            if (!solanaPubKey) {
              const suiPubKey = _wallets?.[0]?.addresses?.sui;
              if (suiPubKey) {
                primaryWalletAddress = suiPubKey;
              }
            }
          }
        }
        AsyncStorage.setItem(PRIMARY_WALLET_ADDRESS, primaryWalletAddress);
        setPrimaryWalletAddress(primaryWalletAddress);
      }
    } else {
      AsyncStorage.removeItem(PRIMARY_WALLET_ADDRESS);
    }
  });
};
export function useInitPrimaryWalletAddress() {
  const setPrimaryWalletAddress = useSetPrimaryAddress();

  useEffect(() => {
    AsyncStorage.getItem(PRIMARY_WALLET_ADDRESS).then((storage) => {
      const primaryWalletAddress = storage ? JSON.parse(storage) : {};
      if (primaryWalletAddress) {
        setPrimaryWalletAddress(primaryWalletAddress);
      } else {
        getPrimaryWalletAddress(setPrimaryWalletAddress);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
