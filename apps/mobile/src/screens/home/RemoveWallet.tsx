import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MinusCircle } from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomModal from '../../components/new-bottom-modal';
import { Button } from '../../components/ui/button';
import { DISABLE_BANNER_ADS, PRIMARY_WALLET_ADDRESS } from '../../services/config/storage-keys';
import { getPrimaryWalletAddress } from '../../hooks/wallet/useInitPrimaryWalletAddress';
import { Wallet } from '../../hooks/wallet/useWallet';
import { CopyButton } from './EditWallet/copy-address';
import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk';
import { useSetPrimaryAddress } from '@leapwallet/cosmos-wallet-hooks';

type EditWalletFormProps = {
  wallet: any; // Use your Key type here
  isVisible: boolean;
  address: string;
  onClose: (closeParent: boolean) => void;
};

export const RemoveWallet = ({ isVisible, wallet, onClose, address }: EditWalletFormProps) => {
  const { removeWallets } = Wallet.useRemoveWallet();
  const setPrimaryWalletAddress = useSetPrimaryAddress();

  const handleRemoveWallet = async () => {
    if (wallet) {
      await removeWallets([wallet.id]);

      const storedDisabledBannerAds = await AsyncStorage.getItem(DISABLE_BANNER_ADS);
      const parsedDisabledAds = storedDisabledBannerAds ? JSON.parse(storedDisabledBannerAds) : {};

      let walletAddress = wallet?.addresses?.cosmos;
      if (!walletAddress) {
        const evmPubKey = wallet?.pubKeys?.ethereum;
        if (evmPubKey) {
          walletAddress = pubKeyToEvmAddressToShow(evmPubKey, true) || '';
        } else {
          const solanaPubKey = wallet?.pubKeys?.solana;
          if (solanaPubKey) {
            walletAddress = solanaPubKey;
          } else {
            const suiPubKey = wallet?.addresses?.sui;
            if (suiPubKey) {
              walletAddress = suiPubKey;
            }
          }
        }
      }

      if (walletAddress && parsedDisabledAds[walletAddress]) {
        delete parsedDisabledAds[walletAddress];
        await AsyncStorage.setItem(DISABLE_BANNER_ADS, JSON.stringify(parsedDisabledAds));
      }

      onClose(true);

      const res = await AsyncStorage.getItem(PRIMARY_WALLET_ADDRESS);
      if (res === walletAddress) {
        getPrimaryWalletAddress(setPrimaryWalletAddress);
      }
    }
  };

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => onClose(false)}
      title="Remove wallet?"
      footerComponent={
        <View style={styles.footer}>
          <Button variant="secondary" size="md" onPress={() => onClose(false)} style={styles.flex1}>
            Don&apos;t Remove
          </Button>
          <Button
            testID="btn-remove-wallet"
            onPress={handleRemoveWallet}
            size="md"
            variant="destructive"
            style={styles.flex1}
          >
            Remove
          </Button>
        </View>
      }
    >
      <View style={styles.centeredColumn}>
        <View style={styles.iconCircle}>
          <MinusCircle weight="fill" size={36} color="#64748b" />
        </View>

        <View style={styles.textCol}>
          <Text style={styles.confirmText}>Are you sure you want to remove</Text>
          <Text style={styles.walletName}>{wallet?.name}</Text>
        </View>

        {address ? <CopyButton address={address} /> : null}
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  centeredColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
  },
  iconCircle: {
    borderRadius: 999,
    backgroundColor: '#d1e7fa', // Adjust to your theme
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  textCol: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: '500',
  },
  walletName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#22223b',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  flex1: {
    flex: 1,
  },
});
