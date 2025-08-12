import { Key } from '@leapwallet/cosmos-wallet-hooks';
import Text from '../../../components/text';
import { useSiteLogo } from '../../../hooks/utility/useSiteLogo';
import { Images } from '../../../../assets/images';
import { addToConnections } from '../../ApproveConnection/utils';
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

export const WalletNotConnectedMsg = ({
  currentWalletInfo,
  onClose,
}: {
  currentWalletInfo?: {
    wallets: [Key];
    chainIds: [string];
    origin: string;
  } | null;
  onClose: VoidFunction;
}) => {
  const walletName = currentWalletInfo?.wallets?.[0]?.name;
  const walletColorIndex = currentWalletInfo?.wallets?.[0]?.colorIndex;
  const watchWallet = currentWalletInfo?.wallets?.[0]?.watchWallet;
  const siteName =
    currentWalletInfo?.origin?.split('//')?.at(-1)?.split('.')?.at(-2) ||
    currentWalletInfo?.origin?.split('//')?.at(-1);

  const siteLogo = useSiteLogo(currentWalletInfo?.origin);

  const [logoSource, setLogoSource] = useState(siteLogo);

  const handleConnectWalletClick = async () => {
    const walletIds = currentWalletInfo?.wallets.map((wallet) => wallet.id);
    await addToConnections(
      currentWalletInfo?.chainIds as [string],
      walletIds ?? [],
      currentWalletInfo?.origin as string,
    );
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Image
          source={{ uri: Images.Misc.getWalletIconAtIndex(walletColorIndex as number, watchWallet) }}
          style={styles.walletIcon}
        />
        <Image
          source={{ uri: logoSource }}
          style={styles.siteLogo}
          onError={() => setLogoSource(Images.Misc.DefaultWebsiteIcon)}
        />
      </View>
      <Text size="md" color="text-green-600" style={styles.siteName}>
        {siteName}
      </Text>
      <Text size="xl" style={styles.walletStatus}>
        {walletName} not Connected
      </Text>
      <Text size="xs" style={styles.infoText} color="text-gray-400">
        You can connect this wallet, or can switch to an already connected wallet.
      </Text>
      <TouchableOpacity
        onPress={handleConnectWalletClick}
        style={styles.connectBtn}
        activeOpacity={0.85}
      >
        <Text style={styles.connectBtnText}>Connect {walletName}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderRadius: 20,
    backgroundColor: '#fff',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginBottom: 16,
  },
  logoRow: {
    paddingTop: 32,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIcon: {
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#111827',
    borderRadius: 999,
    width: 48,
    height: 48,
    marginRight: -16,
    backgroundColor: '#fff',
  },
  siteLogo: {
    zIndex: 1,
    width: 48,
    height: 48,
    borderRadius: 999,
    marginLeft: -16,
    backgroundColor: '#fff',
  },
  siteName: {
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#22C55E', // text-green-600
  },
  walletStatus: {
    marginVertical: 0,
    fontWeight: 'bold',
    fontSize: 20,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#9CA3AF', // text-gray-400
  },
  connectBtn: {
    backgroundColor: 'rgba(225, 136, 129, 0.1)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  connectBtnText: {
    color: '#E18881',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
