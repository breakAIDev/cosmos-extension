import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import Modal from 'react-native-modal'; // Replace with your BottomSheet component if you have a custom one
import { useActiveChain, useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { useGetWalletAddresses } from '../../hooks/useGetWalletAddresses';
import { sliceAddress } from '../../utils/strings';
import { Images } from '../../../assets/images';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

type Props = {
  visible?: boolean;
  onClose?: () => void;
  forceChain?: SupportedChain;
};

export default function ReceiveToken({ visible, onClose, forceChain }: Props) {
  const wallet = useActiveWallet().activeWallet;
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;

  const activeChainInfo = useChainInfo(activeChain);
  const isEvmOnlyChain = activeChainInfo?.evmOnlyChain;
  const walletAddress = useGetWalletAddresses(activeChain);
  const address = isEvmOnlyChain ? walletAddress[0] : wallet?.addresses[activeChain];

  if (!wallet) return null;

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.container}>
        <Text style={styles.title}>Your QR code</Text>
        <View style={styles.qrWrapper}>
          <QRCode value={address ?? ''} size={200} />
        </View>

        <Text style={styles.walletName}>{wallet.name}</Text>

        <ScrollView>
          {walletAddress.map((addr, index) => (
            <TouchableOpacity
              key={addr}
              style={styles.copyBtn}
              onPress={() => Clipboard.setString(addr)}
            >
              <Text style={styles.copyText}>{sliceAddress(addr)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Optional on-ramp (Swapped) */}
        {/* Uncomment when Swapped is integrated */}
        {/* <TouchableOpacity onPress={() => Linking.openURL('https://widget.swapped.com')}>
          <Image source={Images.Logos.SwappedLight} style={styles.onRampLogo} />
        </TouchableOpacity> */}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  qrWrapper: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 32,
    elevation: 4,
  },
  walletName: { fontSize: 24, fontWeight: 'bold', marginVertical: 16 },
  copyBtn: {
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  copyText: { fontSize: 14, fontWeight: '600' },
  onRampLogo: { width: 180, height: 40, marginTop: 16, resizeMode: 'contain' },
});
