// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BETA_NFTS_COLLECTIONS,
  ENABLED_NFTS_COLLECTIONS,
  StoredBetaNftCollection,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ENCRYPTED_ACTIVE_WALLET, KeyChain, Key } from '@leapwallet/leap-keychain';
import {
  ACTIVE_WALLET,
  CONNECTIONS,
  ENCRYPTED_KEY_STORE,
  FAVOURITE_NFTS,
  HIDDEN_NFTS,
  KEYSTORE,
  V80_KEYSTORE_MIGRATION_COMPLETE,
  V118_KEYSTORE_MIGRATION_COMPLETE,
  V125_BETA_NFT_COLLECTIONS_MIGRATION_COMPLETE,
  V151_NFT_SEPARATOR_CHANGE_MIGRATION_COMPLETE,
} from '../services/config/storage-keys';
import { migrateEncryptedKeyStore, migrateKeyStore } from './migrations/v80';
import { migratePicassoAddress } from './migrations/v118-migrate-picasso-address';
import { favNftStore, hiddenNftStore } from './manage-nft-store';
import { passwordStore } from './password-store';
import { rootStore } from './root-store';

import { SeedPhrase } from '../hooks/wallet/seed-phrase/useSeedPhrase';

export type LockedState = 'pending' | 'locked' | 'unlocked';

export interface AuthContextType {
  locked: LockedState;
  noAccount: boolean;
  signin: (password: Uint8Array, callback?: VoidFunction) => Promise<void>;
  signout: (callback?: VoidFunction) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = observer(({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState<LockedState>('pending');
  const [noAccount, setNoAccount] = useState(false);

  const testPassword = SeedPhrase.useTestPassword();
  const chains = useGetChains();

  useEffect(() => {
    // Check for existing wallet/account on mount.
    const init = async () => {
      setLoading(true);
      // Replace with your AsyncStorage or wallet check
      const activeWallet = await AsyncStorage.getItem('ACTIVE_WALLET');
      if (!activeWallet) {
        setNoAccount(true);
        setLocked('locked');
        setLoading(false);
      } else {
        setNoAccount(false);
        setLocked('locked'); // Always lock on app start
        setLoading(false);
      }
    };
    init();
  }, []);

  const signin = useCallback(
    async (password: Uint8Array, callback?: VoidFunction) => {
      setLoading(true);
      if(!password) {
        setNoAccount(true);
      } else {
        try {
          await testPassword(password);

          // You would load/decrypt wallet with password here and save to state
          const [
            activeWallet,
            keyStore,
            v80KeystoreMigrationComplete,
            v118KeystoreMigrationComplete,
            v125BetaNFTCollectionsMigrationComplete,
            v151NFTSeparatorChangeMigrationComplete,
            encryptedKeyStore,
            encryptedActiveWallet
          ] = await Promise.all([
            AsyncStorage.getItem(ACTIVE_WALLET),
            AsyncStorage.getItem(KEYSTORE),
            AsyncStorage.getItem(V80_KEYSTORE_MIGRATION_COMPLETE),
            AsyncStorage.getItem(V118_KEYSTORE_MIGRATION_COMPLETE),
            AsyncStorage.getItem(V125_BETA_NFT_COLLECTIONS_MIGRATION_COMPLETE),
            AsyncStorage.getItem(V151_NFT_SEPARATOR_CHANGE_MIGRATION_COMPLETE),
            AsyncStorage.getItem(ENCRYPTED_KEY_STORE),
            AsyncStorage.getItem(ENCRYPTED_ACTIVE_WALLET),
          ]);

          const storage : Record<string, any> = {
            ACTIVE_WALLET: activeWallet,
            KEYSTORE: keyStore,
            V80_KEYSTORE_MIGRATION_COMPLETE: v80KeystoreMigrationComplete,
            V118_KEYSTORE_MIGRATION_COMPLETE: v118KeystoreMigrationComplete,
            V125_BETA_NFT_COLLECTIONS_MIGRATION_COMPLETE: v125BetaNFTCollectionsMigrationComplete,
            V151_NFT_SEPARATOR_CHANGE_MIGRATION_COMPLETE: v151NFTSeparatorChangeMigrationComplete,
            ENCRYPTED_KEY_STORE: encryptedKeyStore,
            ENCRYPTED_ACTIVE_WALLET: encryptedActiveWallet,
          }

          if (!v80KeystoreMigrationComplete) {
            if (encryptedKeyStore && encryptedActiveWallet) {
              await migrateEncryptedKeyStore(storage, password);
            } else {
              await migrateKeyStore(storage, password);
            }
          }

          if (!storage[ACTIVE_WALLET]) {
            await KeyChain.decrypt(password);
          }

          if (!storage[V118_KEYSTORE_MIGRATION_COMPLETE]) {
            const oldActiveWallet = await AsyncStorage.getItem(ACTIVE_WALLET);
            const oldKeyStore = await AsyncStorage.getItem(KEYSTORE);
            if (oldActiveWallet && oldKeyStore && JSON.parse(oldActiveWallet).addresses.composable) {
              const { newActiveWallet, newKeyStore } = migratePicassoAddress(
                JSON.parse(oldKeyStore),
                JSON.parse(oldActiveWallet),
              );
              await AsyncStorage.setItem(KEYSTORE, JSON.stringify(newKeyStore));
              await AsyncStorage.setItem(ACTIVE_WALLET, JSON.stringify(newActiveWallet));
              await AsyncStorage.setItem(V118_KEYSTORE_MIGRATION_COMPLETE, String(true));
            }
          }

          if (!storage[V125_BETA_NFT_COLLECTIONS_MIGRATION_COMPLETE]) {
            const storedBetaNftCollections = await AsyncStorage.getItem(BETA_NFTS_COLLECTIONS);

            if (storedBetaNftCollections) {
              const betaNftCollections = JSON.parse(storedBetaNftCollections ?? '{}');
              const formattedBetaNftCollections: {
                [chain: string]: { [network: string]: StoredBetaNftCollection[] };
              } = {};

              for (const chain in betaNftCollections) {
                const _chain = chain as SupportedChain;
                const isTestnetOnly = chains?.[_chain]?.chainId === chains?.[_chain]?.testnetChainId;

                if (chains?.[_chain] && isTestnetOnly) {
                  formattedBetaNftCollections[chain] = {
                    testnet: betaNftCollections[chain].map((collection: string) => {
                      return { address: collection, name: '', image: '' };
                    }),
                  };
                } else {
                  const evenHasTestnet = chains?.[_chain]?.testnetChainId;

                  if (evenHasTestnet) {
                    formattedBetaNftCollections[chain] = {
                      testnet: betaNftCollections[chain].map((collection: string) => {
                        return { address: collection, name: '', image: '' };
                      }),
                    };
                  }

                  formattedBetaNftCollections[chain] = {
                    ...(formattedBetaNftCollections[chain] ?? {}),
                    mainnet: betaNftCollections[chain].map((collection: string) => {
                      return { address: collection, name: '', image: '' };
                    }),
                  };
                }
              }

              await AsyncStorage.setItem(BETA_NFTS_COLLECTIONS, JSON.stringify(formattedBetaNftCollections));
              await AsyncStorage.setItem(ENABLED_NFTS_COLLECTIONS, JSON.stringify(betaNftCollections));
              await AsyncStorage.setItem(V125_BETA_NFT_COLLECTIONS_MIGRATION_COMPLETE, 'true');
            } else {
              await AsyncStorage.setItem(V125_BETA_NFT_COLLECTIONS_MIGRATION_COMPLETE, 'true');
            }
          }

          if (!storage[V151_NFT_SEPARATOR_CHANGE_MIGRATION_COMPLETE]) {
            const updateNftStruct = async (storageKey: string) => {
              const storedNfts = await AsyncStorage.getItem(storageKey);
              if (storedNfts) {
                const nfts = JSON.parse(storedNfts ?? '{}');
                const newNfts: Record<string, string[]> = {};

                if (Object.keys(nfts).length > 0) {
                  for (const walletId in nfts) {
                    const _nfts = nfts[walletId];
                    const _newNfts: string[] = [];

                    for (const nft of _nfts) {
                      if (nft.includes('-:-')) {
                        _newNfts.push(nft);
                      } else {
                        const separatorExist = nft.split('-').length === 2;
                        if (separatorExist) {
                          const [address, tokenId] = nft.split('-');
                          _newNfts.push(`${address}-:-${tokenId}`);
                        }
                      }
                    }

                    newNfts[walletId] = _newNfts;
                  }
                }

                const activeWallet = storage[ACTIVE_WALLET];
                if (activeWallet?.id) {
                  switch (storageKey) {
                    case HIDDEN_NFTS:
                      hiddenNftStore.setHiddenNfts(newNfts[activeWallet.id] ?? []);
                      break;
                    case FAVOURITE_NFTS:
                      favNftStore.setFavNfts(newNfts[activeWallet.id] ?? []);
                      break;
                  }
                }

                await AsyncStorage.setItem(storageKey, JSON.stringify(newNfts));
              }
            };

            await updateNftStruct(HIDDEN_NFTS);
            await updateNftStruct(FAVOURITE_NFTS);
            await AsyncStorage.setItem(V151_NFT_SEPARATOR_CHANGE_MIGRATION_COMPLETE, 'true');
          }

          setLocked('unlocked');
          setNoAccount(false);
          setLoading(false);
          passwordStore.setPassword(password);
          rootStore.initStores();
          callback && callback();
        } catch (e) {
          setLoading(false);
          throw new Error('Password authentication failed');
        }
      }
    },[testPassword, chains]
  );

  const signout = useCallback(
    async (callback?: VoidFunction) => {
      if(locked === 'locked') return;
      
      passwordStore.setPassword(null);
      
      const [
        activeWallet,
        encryptedActiveWallet
      ] = await Promise.all([
        AsyncStorage.getItem(ACTIVE_WALLET),
        AsyncStorage.getItem(ENCRYPTED_ACTIVE_WALLET),
      ]);
      if(!activeWallet && !encryptedActiveWallet) {
        setNoAccount(true);
      }

      await AsyncStorage.setItem(CONNECTIONS, JSON.stringify({}));
      setLocked('locked');
      
      // You should clear any sensitive state, cached decrypted wallet, etc.
      setLoading(false);
      if(callback) callback();
    }, [locked]
  );

  const value: AuthContextType = {
    locked,
    noAccount,
    signin,
    signout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
});

export function useAuth() {
  return useContext(AuthContext)!;
}
