import AsyncStorage from '@react-native-async-storage/async-storage';

import { KEYSTORE, PRIMARY_WALLET_ADDRESS } from '../../services/config/storage-keys';

// You must call this as an async function!
export async function storageMigrationV10(storage: Record<string, any>) {
  const keystore = storage[KEYSTORE];
  const primaryWallet: any = Object.values(keystore).find(
    (wallet: any) => wallet.addressIndex === 0 && wallet.walletType === 0
  );
  if (primaryWallet?.addresses?.cosmos) {
    await AsyncStorage.setItem(PRIMARY_WALLET_ADDRESS, primaryWallet.addresses.cosmos);
  }
}
