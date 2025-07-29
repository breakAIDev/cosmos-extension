import { createMnemonic } from '@leapwallet/cosmos-wallet-sdk';
import { ENCRYPTED_ACTIVE_WALLET } from '@leapwallet/leap-keychain';
import { decrypt } from '@leapwallet/leap-keychain';
import * as bip39 from 'bip39';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ACTIVE_WALLET, V80_KEYSTORE_MIGRATION_COMPLETE } from '../../../services/config/storage-keys';
import useActiveWallet from '../../settings/useActiveWallet';
import AsyncStorage from '@react-native-async-storage/async-storage';

export namespace SeedPhrase {
  // store encrypted mnemonic string
  const MNEMONIC_KEY = 'stored-encrypted-mnemonic';

  export function validateSeedPhrase(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  export function useTestPassword(): (password: Uint8Array, message?: string) => Promise<void> {
    const secret = useRef({});

    useEffect(() => {
      (async () => {
        const encryptedActiveWallet = await AsyncStorage.getItem(ENCRYPTED_ACTIVE_WALLET);
        const activeWalletRaw = await AsyncStorage.getItem(ACTIVE_WALLET);
        const activeWallet = activeWalletRaw ? JSON.parse(activeWalletRaw) : {};

        if (encryptedActiveWallet) {
          secret.current = encryptedActiveWallet;
        } else if (activeWallet?.cipher) {
          secret.current = activeWallet.cipher;
        }
      })();
    }, []);

    const testPassword = useCallback(
      async (password: Uint8Array, encryptedMessage?: string) => {
        try {
          const storage = await AsyncStorage.getItem(V80_KEYSTORE_MIGRATION_COMPLETE);
          const iterations = storage === 'true' ? 10_000 : 100;
          const decrypted = decrypt(encryptedMessage ?? secret.current as string ?? '', password, iterations);
          if (decrypted === '') {
            throw new Error('Wrong Password');
          }
        } catch (e) {
          throw new Error('Wrong Password');
        }
      },
      [secret],
    );
    return testPassword;
  }

  export function CreateNewMnemonic() {
    const mnemonic = createMnemonic(12);
    return mnemonic;
  }

  export function useMnemonic(password: Uint8Array): string {
    const [mnemonic, setMnemonic] = useState('');
    const { activeWallet } = useActiveWallet();

    useEffect(() => {

      password &&
        AsyncStorage.getItem(MNEMONIC_KEY)
          .then(() => {
            const _mnemonic = decrypt(activeWallet?.cipher as string, password);
            return _mnemonic;
          })
          .then((mnemonic) => {
            setMnemonic(mnemonic);
          });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [password]);

    return mnemonic;
  }
}
