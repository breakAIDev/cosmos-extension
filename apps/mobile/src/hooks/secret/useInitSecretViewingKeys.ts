import { useScrtKeysStore } from '@leapwallet/cosmos-wallet-hooks';
import { PasswordStore } from '@leapwallet/cosmos-wallet-store';
import { decrypt } from '@leapwallet/leap-keychain';
import { useEffect } from 'react';

import { QUERY_PERMIT, VIEWING_KEYS } from '../../services/config/storage-keys';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useInitSecretViewingKeys(passwordStore: PasswordStore) {
  const { setViewingKeys, setQueryPermits } = useScrtKeysStore();

  useEffect(() => {
    async function init() {
      if (!passwordStore.password) return;
      const keysRaw = await AsyncStorage.getItem(VIEWING_KEYS);
      const permitsRaw = await AsyncStorage.getItem(QUERY_PERMIT);
      const keys = keysRaw ? JSON.parse(keysRaw) : {};
      const permits = permitsRaw ? JSON.parse(permitsRaw) : {};

      for (const address of Object.keys(keys)) {
        for (const contract of Object.keys(keys[address])) {
          let viewingKey = decrypt(keys[address][contract], passwordStore.password);
          if (viewingKey === '') {
            viewingKey = decrypt(keys[address][contract], passwordStore.password, 100);
          }
          keys[address][contract] = decrypt(keys[address][contract], passwordStore.password);
        }
      }
      setViewingKeys(keys);
      for (const address of Object.keys(permits)) {
        const permit = permits[address];
        permits[address] = JSON.parse(decrypt(permit, passwordStore.password) ?? '{}');
      }

      setQueryPermits(permits);
    }

    if (passwordStore.password) {
      init();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordStore.password]);
}
