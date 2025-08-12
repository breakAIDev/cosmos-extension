// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BETA_NFTS_COLLECTIONS,
  ENABLED_NFTS_COLLECTIONS,
  StoredBetaNftCollection,
  useActiveChain,
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
import { ActivityIndicator, DeviceEventEmitter, EmitterSubscription, View, ScrollView, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Wallet } from '../hooks/wallet/useWallet';
import { hasMnemonicWallet } from '../utils/hasMnemonicWallet';
import { AggregatedSupportedChain } from '../types/utility';
import { HomeLoadingState } from '../screens/home/components/home-loading-state';
import { QUICK_SEARCH_DISABLED_PAGES } from '../services/config/config';
import { searchModalStore } from './search-modal-store';
import { SearchModal } from '../components/search-modal';
import ExtensionPage from '../components/extension-page';


export type LockedState = 'pending' | 'locked' | 'unlocked';

export interface AuthContextType {
  locked: LockedState;
  noAccount: boolean;
  signin: (password: Uint8Array, callback?: VoidFunction) => Promise<void>;
  signout: (callback?: VoidFunction) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const v2LayoutPages = new Set([
  'Onboarding',
  'OnboardingCreateWallet',
  'OnboardingImportWallet',
  'OnboardingSuccess',
  'ImportLedger',
  'Swap',
  'Home',
  'Login',
  'Nfts',
  'Alpha',
  'Activity',
  'AssetDetails',
  'Send',
  'Stake',
  'StakeInput',
  'Airdrops',
  'Alpha',
  'Earn-usdn',
  'Initia-vip',
  'Buy',
  'Airdrops',
  'AirdropsDetails',
  'Gov',
  'ForgotPassword',
  'AddToken',
  'ManageTokens',
]);

export const AuthProvider = observer(({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState<LockedState>('pending');
  const [noAccount, setNoAccount] = useState(false);

  const testPassword = SeedPhrase.useTestPassword();
  const chains = useGetChains();
  useEffect(() => {
    
    const listener = DeviceEventEmitter.addListener('auto-lock', () => {
      setLocked('locked');

    });
    return () => {
      listener.remove();
    };
  }, []);

  const signin = useCallback(
    async (password: Uint8Array, callback?: VoidFunction) => {
      setLoading(true);
      if(!password) {
        setNoAccount(true);
      } else {
        try {
          await testPassword(password);

          /**
           * when there is an active wallet, we don't need to decrypt the keychain,
           * if we do it will overwrite the active wallet and keychain with the encrypted version
           *
           * on signout, we encrypt the updated keychain and active wallet.
           *
           * for some reason the password authentication failed errors are not propagated to the calling function when using async await
           */
          try {
            const passwordBase64 = Buffer.from(password).toString('base64');
            await DeviceEventEmitter.emit('unlock', { password: passwordBase64 });
          } catch (e) {
          }

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
      DeviceEventEmitter.emit('lock');
      
      const [
        activeWallet,
        encryptedActiveWallet
      ] = await Promise.all([
        AsyncStorage.getItem(ACTIVE_WALLET),
        AsyncStorage.getItem(ENCRYPTED_ACTIVE_WALLET),
      ]);
      await AsyncStorage.setItem(CONNECTIONS, JSON.stringify({}));

      if(!activeWallet && !encryptedActiveWallet) {
        setNoAccount(true);
      }

      setLocked('locked');
      
      if(callback) callback();
    }, [locked]
  );
  
  useEffect(() => {
    let listener: EmitterSubscription;

    const fn = async () => {
      setLoading(true);
      const activeWallet = await AsyncStorage.getItem(ACTIVE_WALLET);
      const encryptedActiveWallet = await AsyncStorage.getItem(ENCRYPTED_ACTIVE_WALLET);
      if (activeWallet || encryptedActiveWallet) {
        setNoAccount(false);
        listener = DeviceEventEmitter.addListener('authentication', async (message: any) => {
          if (message.status === 'success') {
            try {
              const passwordBase64 = message.password;
              const password = Buffer.from(passwordBase64, 'base64');
              await signin(password);
            } catch (_) {
              signout();
              setLoading(false);
            }
          } else {
            setLocked('locked');
            setLoading(() => false);
          }
          listener.remove();
        });
        DeviceEventEmitter.emit('popup-open');
        setTimeout(() => {
          if (loading) {
            setLoading(false);
          }
        }, 1000);
      } else {
        await AsyncStorage.setItem(V80_KEYSTORE_MIGRATION_COMPLETE, 'true');
        await AsyncStorage.setItem(V118_KEYSTORE_MIGRATION_COMPLETE, 'true');
        setLocked('locked');
        setNoAccount(true);
        setLoading(false);
      }
    };

    fn();

    return () => {
      listener.remove();
    };
  }, [signin]);

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

export const RequireAuth = ({
  children,
  hideBorder,
  titleComponent,
}: {
  children: React.ReactNode;
  hideBorder?: boolean;
  titleComponent?: React.ReactNode;
}) => {
  const auth = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const activeChain = useActiveChain() as AggregatedSupportedChain;

  if (!auth || auth?.locked === 'pending') {
    return route.name === 'Home' ? <HomeLoadingState /> : (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (auth?.locked === 'locked') {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    return null;
  }

  if (v2LayoutPages.has(route.name)) {
    return children;
  }

  const isQuickSearchDisabled = QUICK_SEARCH_DISABLED_PAGES.includes(route.name) || activeChain === 'aggregated';

  // Keyboard/Hotkey logic: On mobile, use a button or gesture instead!
  const openSearchModal = () => {
    searchModalStore.setShowModal(!searchModalStore.showModal);
    searchModalStore.setEnteredOption(null);
  };

  const Children = isQuickSearchDisabled ? (
    children
  ) : (
    <>
      <TouchableOpacity style={styles.searchButton} onPress={openSearchModal}>
        <Text style={styles.searchButtonText}>🔍</Text>
      </TouchableOpacity>
      {children}
      <SearchModal />
    </>
  );

  if (hideBorder) {
    return (
      <ScrollView
        style={styles.hideBorderContainer}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {React.isValidElement(Children) ? Children : <View/>}
      </ScrollView>
    );
  }

  return (
    <ExtensionPage titleComponent={titleComponent}>
      <View style={styles.extensionPageWrapper}>
        <View style={styles.extensionPanel}>
          {React.isValidElement(Children) ? Children : <View/>}
        </View>
      </View>
    </ExtensionPage>
  );
};

export function RequireAuthOnboarding({ children }: { children: React.ReactNode }) {
  const [redirectTo, setRedirectTo] = useState<'Home' | 'Onboarding' | undefined>();
  const auth = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const newUser = useRef(false);
  const walletName = route.params?.walletName ?? undefined;

  // Trigger navigation in useEffect, NOT in the render
  useEffect(() => {
    if (redirectTo === 'Home') {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
    // No need to handle 'Onboarding' here because that's the current screen
  }, [redirectTo, navigation]);

  useEffect(() => {
    const fn = async () => {
      if (newUser.current) {
        return;
      }

      const encryptedActiveWallet = await AsyncStorage.getItem(ENCRYPTED_ACTIVE_WALLET);
      if (!auth?.loading && auth?.locked === 'locked' && encryptedActiveWallet) {
        setRedirectTo('Home');
        return;
      }

      const allWallets = await Wallet.getAllWallets();
      if (!allWallets || Object.keys(allWallets).length === 0) {
        newUser.current = true;
      }
      const hasPrimaryWallet = hasMnemonicWallet(allWallets);
      const isLedger = walletName === 'ledger';

      if (hasPrimaryWallet && !isLedger) {
        setRedirectTo('Home');
      } else {
        setRedirectTo('Onboarding');
      }
    };
    fn();
  }, [auth, walletName]);

  if (redirectTo === 'Onboarding') {
    return <>{children}</>;
  }

  // When redirecting or loading, return null (renders nothing)
  return null;
}

const styles = StyleSheet.create({
  hideBorderContainer: {
    flex: 1,
    backgroundColor: '#18181B', // dark:bg-black-100
    // Add more style props as needed
  },
  searchButton: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 60 : 30,
    zIndex: 10,
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 30,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 22,
  },
  extensionPageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Add any shadow or background styling as needed
  },
  extensionPanel: {
    width: '90%',
    minHeight: 350,
    backgroundColor: '#222', // dark:shadow-sm shadow-xl dark:shadow-gray-700
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
    // etc...
  },
});