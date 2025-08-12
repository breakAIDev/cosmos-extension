import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { CheckCircle } from 'phosphor-react-native';
import { Button } from '../../../../components/ui/button';
import { LedgerDriveIcon } from '../../../../../assets/icons/ledger-drive-icon';
import { Images } from '../../../../../assets/images';
import { useActiveChain, useActiveWallet, useChainsStore, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { importLedgerAccount, isLedgerUnlocked, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Keystore } from '@leapwallet/leap-keychain';
import { captureException } from '@sentry/react-native';
import { getLedgerEnabledEvmChainsKey } from '../../../../utils/getLedgerEnabledEvmChains';
import useActiveWalletExt from '../../../../hooks/settings/useActiveWallet';
import { OnboardingWrapper } from '../../wrapper';
import { LEDGER_CONNECTION_STEP } from '../types';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYSTORE } from '../../../../services/config/storage-keys';

const stepsData = [
  { description: 'Unlock Ledger & connect to your device via USB' },
  { description: 'Select networks & choose wallets to import' },
];

const entry = 'right';

// Replace with actual local images or require() statements in RN
const HardwareWalletConnectCable = Images.Misc.HardwareWalletConnectCable;
const HardwareWalletConnectUsb = Images.Misc.HardwareWalletConnectUsb;

type ChainWiseAddresses = Record<string, { address: string; pubKey: Uint8Array }[]>;

export const ImportEvmLedger = () => {
  const navigation = useNavigation();
  const [error, setError] = useState('');
  const [status, setLedgerConnectionStatus] = useState(LEDGER_CONNECTION_STEP.step0);

  const activeWallet = useActiveWallet();
  const activeChain = useActiveChain();
  const { chains } = useChainsStore();
  const { setActiveWallet } = useActiveWalletExt(); // Uncomment and adapt if using RN context/provider

  // Animation: fade in with slight up movement
  const imgAnimation = {
    from: { opacity: 0, translateY: 16 },
    animate: { opacity: 1, translateY: 0 },
    exit: { opacity: 0, translateY: 16 },
    transition: { type: 'timing', duration: 500 },
  };

  const ledgerEnabledEvmChains = useMemo(
    () => getLedgerEnabledEvmChainsKey(Object.values(chains)),
    [chains]
  );

  const getLedgerAccountDetails = async () => {
    if (chains[activeChain].bip44.coinType !== '60' || !ledgerEnabledEvmChains.includes(activeChain)) {
      throw new Error(`Import Error: Ledger is not supported on ${chains[activeChain].chainName}`);
    }
    if (!activeWallet) throw new Error('Import Error: No active wallet found');

    const useEvmApp = true;
    const addressIndex = String(activeWallet.addressIndex);
    const isCustomDerivationPathWallet = addressIndex?.includes("'");

    const { chainWiseAddresses } = await importLedgerAccount(
      isCustomDerivationPathWallet ? [] : [0, 1, 2, 3, 4],
      useEvmApp,
      activeChain,
      ledgerEnabledEvmChains,
      chains,
      isCustomDerivationPathWallet ? [addressIndex] : [],
    );

    return { chainWiseAddresses };
  };

  const confirmImport = async ({ chainWiseAddresses }: { chainWiseAddresses: ChainWiseAddresses }) => {
    if (!activeWallet) throw new Error('Unable to import ledger wallet');
    const store = await AsyncStorage.getItem(KEYSTORE);

    const keystore: Keystore<SupportedChain> = store ? JSON.parse(store) : {};
    if (!keystore) throw new Error('Unable to import ledger wallet');

    const ledgerWallets = Object.values(keystore).filter((key) => key.walletType === WALLETTYPE.LEDGER);
    const newKeystore = keystore;

    for (const ledgerWallet of ledgerWallets) {
      const newAddresses: Record<string, string> = {};
      const newPubKeys: Record<string, string> = {};

      for (const chain of ledgerEnabledEvmChains) {
        if (chainWiseAddresses[chain] && !ledgerWallet.addresses[chain]) {
          const account = chainWiseAddresses[chain][ledgerWallet.addressIndex];

          newAddresses[chain] = account.address;
          newPubKeys[chain] = Buffer.from(account.pubKey).toString('base64');
        }
      }

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
    navigation.navigate('Home');
  };

  const importLedger = async () => {
    try {
      setError('');
      setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step2);
      const chainWiseAddresses = await getLedgerAccountDetails();
      await confirmImport(chainWiseAddresses);
      setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step3);
    } catch (err) {
      captureException(err);
      setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step1);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fn = async () => {
      const unlocked = await isLedgerUnlocked('Ethereum');
      if (unlocked) {
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step1);
        clearTimeout(timeout);
      } else {
        timeout = setTimeout(async () => {
          await fn();
        }, 1000);
      }
    };
    fn();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <OnboardingWrapper headerIcon={<LedgerDriveIcon size={24} />} heading="Connect your Ledger" entry={entry}>
      <View style={styles.cardList}>
        {stepsData.map((d, index) => (
          <View key={index} style={styles.stepCard}>
            <CheckCircle weight="bold" size={20} color="#94a3b8" style={styles.icon} />
            <Text style={styles.stepText}>{d.description}</Text>
          </View>
        ))}

        <View style={styles.imgRow}>
          <AnimatePresence>
            <MotiView {...imgAnimation} style={styles.cableImgWrap} key="img-cable">
              <Image
                source={HardwareWalletConnectCable}
                style={styles.cableImg}
                resizeMode="contain"
              />
            </MotiView>
            <MotiView {...imgAnimation} style={styles.usbImgWrap} key="img-usb">
              <Image
                source={HardwareWalletConnectUsb}
                style={styles.usbImg}
                resizeMode="contain"
              />
            </MotiView>
          </AnimatePresence>
        </View>
      </View>

      <Button
        style={styles.button}
        disabled={status === LEDGER_CONNECTION_STEP.step2}
        onPress={importLedger}
      >
        {status === LEDGER_CONNECTION_STEP.step2 ? 'Looking for device...' : 'Continue'}
      </Button>
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  cardList: {
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    height: 301, // h-[301px]
    position: 'relative',
  },
  stepCard: {
    backgroundColor: '#f1f5f9', // bg-secondary-200
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 0,
  },
  icon: {
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  imgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: -28, // -mx-7
    marginTop: 28, // mt-7
  },
  cableImgWrap: {
    width: '40%',
    alignItems: 'flex-start',
  },
  cableImg: {
    width: '100%',
    height: 77,
    maxWidth: 180,
  },
  usbImgWrap: {
    width: '60%',
    alignItems: 'flex-end',
  },
  usbImg: {
    width: '100%',
    height: 77,
    maxWidth: 266,
  },
  button: {
    width: '100%',
    marginTop: 'auto',
  },
});
