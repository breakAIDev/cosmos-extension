import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { Key, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { importLedgerAccountV2, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { WALLETTYPE } from '@leapwallet/cosmos-wallet-store';
import { Keystore } from '@leapwallet/leap-keychain';
import { KEYSTORE } from '../../services/config/storage-keys';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { LedgerDriveIcon } from '../../../assets/icons/ledger-drive-icon';
import { CreatingWalletLoader } from '../onboarding/create/creating-wallet-loader';
import { LEDGER_NETWORK } from '../onboarding/import/import-wallet-context';
import { HoldState } from './hold-state';
// Storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLedgerEnabledEvmChainsKey } from '../../utils/getLedgerEnabledEvmChains';
import { OnboardingLayout } from '../onboarding/layout';

const ImportLedgerView = observer(() => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { chains } = useChainsStore();
  const [isLoading, setIsLoading] = useState(false);
  const { activeWallet, setActiveWallet } = useActiveWallet();

  // Fetch the 'app' param passed in navigation
  const app = route.params?.app as string | undefined;

  const getLedgerAccountDetails = async (app: LEDGER_NETWORK) => {
    const primaryChain = app === LEDGER_NETWORK.ETH ? 'ethereum' : 'cosmos';
    const defaultIndexes = [0, 1, 2, 3, 4];
    // Get EVM chains enabled for ledger, replace this with your util
    const ledgerEnabledEvmChains = getLedgerEnabledEvmChainsKey(Object.values(chains));
    const chainsToImport = app === LEDGER_NETWORK.ETH ? ledgerEnabledEvmChains : [];
    const chainInfos = {} as Record<SupportedChain, { addressPrefix: string; enabled: boolean; coinType: string }>;

    for (const chainEntry of Object.entries(chains)) {
      const [chain, chainInfo] = chainEntry;
      chainInfos[chain as SupportedChain] = {
        addressPrefix: chainInfo.addressPrefix,
        enabled: chainInfo.enabled,
        coinType: chainInfo.bip44.coinType,
      };
    }

    const { pathWiseAddresses } = await importLedgerAccountV2(app, defaultIndexes, undefined, {
      primaryChain,
      chainsToImport,
      chainInfos,
    });

    return pathWiseAddresses;
  };

  const importComplete = useCallback(
    async (
      addresses: Record<
        string,
        Record<
          string,
          {
            address: string;
            pubKey: Uint8Array;
          }
        >
      >,
    ) => {
      setIsLoading(true);
      if (!activeWallet || !addresses) throw new Error('Unable to import ledger wallet');
      // Load keystore from AsyncStorage
      const keystoreRaw = await AsyncStorage.getItem(KEYSTORE);
      if (!keystoreRaw) throw new Error('Unable to import ledger wallet');
      const keystore: Keystore<SupportedChain> = JSON.parse(keystoreRaw);

      // Find existing ledger wallets in keystore
      const existingLedgerWallets = Object.values(keystore).filter((key: any) => key.walletType === WALLETTYPE.LEDGER);
      const newKeystore = { ...keystore };

      for (const ledgerWallet of existingLedgerWallets) {
        const path =
          (ledgerWallet as Key)?.path ||
          (ledgerWallet.addressIndex?.toString()?.length === 1
            ? `0'/0/${ledgerWallet.addressIndex}`
            : ledgerWallet.addressIndex?.toString());
        const addressesForPath = addresses?.[path] ?? {};
        const newAddresses: Record<string, string> = {};
        const newPubKeys: Record<string, string> = {};

        Object.keys(addressesForPath).forEach((chain) => {
          const address = addressesForPath[chain];
          newAddresses[chain] = address.address;
          newPubKeys[chain] = Buffer.from(address.pubKey).toString('base64');
        });

        const newWallet = {
          ...ledgerWallet,
          addresses: {
            ...ledgerWallet.addresses,
            ...newAddresses,
          },
          pubKeys: {
            ...(ledgerWallet.pubKeys as Record<SupportedChain, string>),
            ...newPubKeys,
          },
        };

        newKeystore[ledgerWallet.id] = newWallet;
      }

      const newActiveWallet = newKeystore[activeWallet.id];

      await AsyncStorage.setItem(KEYSTORE, JSON.stringify(newKeystore));
      await AsyncStorage.setItem('active-wallet', JSON.stringify(newActiveWallet));
      setActiveWallet(newActiveWallet);
      navigation.navigate('OnboardingSuccess');
    },
    [activeWallet, setActiveWallet, navigation],
  );

  const currentAppToImport = (app === 'EVM' ? 'eth' : app)?.toLowerCase() as LEDGER_NETWORK;

  return (
    <View style={{ flex: 1 }}>
      {/* AnimatePresence not needed for native - just conditional render */}
      {currentAppToImport && !isLoading && (
        <HoldState
          key={`hold-state-${currentAppToImport}`}
          title={`Open ${currentAppToImport === LEDGER_NETWORK.ETH ? 'Ethereum' : 'Cosmos'} app on your ledger`}
          Icon={LedgerDriveIcon}
          appType={currentAppToImport}
          moveToNextApp={importComplete}
          getLedgerAccountDetails={getLedgerAccountDetails}
        />
      )}
      {isLoading && (
        <CreatingWalletLoader title={`Importing ${app} wallets`} key='creating-wallet-loader' />
      )}
    </View>
  );
});

const ImportLedgerLayout: React.FC<React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>> = (props) => {
  // For native, just wrap children. If you want a styled layout, adjust here.
  return <OnboardingLayout
      style = {[
        layoutStyles.wrapper,
        props.style
      ]}
    >
      {props.children}
    </OnboardingLayout>
};

const ImportLedger = () => (
  <ImportLedgerLayout>
    <ImportLedgerView />
  </ImportLedgerLayout>
);

export default ImportLedger;

// --- Styles ---
const layoutStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff', // Change to your theme
  },
});
