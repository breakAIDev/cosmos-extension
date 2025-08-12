import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { useSiteLogo } from '../../hooks/utility/useSiteLogo';
import { Wallet } from '../../hooks/wallet/useWallet';
import { sliceAddress } from '../../utils/strings';
import { formatWalletName } from '../../utils/formatWalletName';
import { addToConnections } from '../../screens/ApproveConnection/utils';
import { Images } from '../../../assets/images';
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from '../../services/config/config';
import { walletLabels } from '../../services/config/constants';
import { WALLETTYPE } from '@leapwallet/leap-keychain';
import BottomModal from '../bottom-modal'; // You will need to create this component for mobile
import { Key } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import useWallets = Wallet.useWallets;

type SelectWalletProps = {
  readonly title: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly currentWalletInfo?: {
    wallets: [Key];
    chainIds: [string];
    origin: string;
  } | null;
  readonly activeChain: SupportedChain;
};

export default function SelectWalletSheet({
  isOpen,
  onClose,
  title,
  currentWalletInfo,
  activeChain,
}: SelectWalletProps) {
  const wallets = useWallets();
  const { activeWallet, setActiveWallet } = useActiveWallet();

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets).sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [wallets]);

  const walletName = currentWalletInfo?.wallets?.[0]?.name;
  const walletAddress = currentWalletInfo?.wallets?.[0]?.addresses?.[activeChain];
  const walletColorIndex = currentWalletInfo?.wallets?.[0]?.colorIndex;
  const siteName = currentWalletInfo?.origin?.split('//')?.at(-1)?.split('.')?.at(-2) ??
    currentWalletInfo?.origin?.split('//')?.at(-1);
  const siteLogo = useSiteLogo(currentWalletInfo?.origin);

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={title}>
      <View style={styles.container}>
        {currentWalletInfo && (
          <View style={styles.connectedCard}>
            <View style={styles.rowCenter}>
              <Image
                source={{uri: Images.Misc.getWalletIconAtIndex(walletColorIndex as number, currentWalletInfo?.wallets?.[0]?.watchWallet)}}
                style={[styles.walletIcon, { zIndex: 10 }]}
              />
              <Image
                source={{ uri: siteLogo }}
                style={[styles.avatar, { zIndex: 0 }]}
              />
            </View>
            <Text style={styles.siteName}>{siteName}</Text>
            <Text style={styles.walletConnected}>{walletName} Connected</Text>
            {walletAddress ? (
              <Text style={styles.address}>{sliceAddress(walletAddress)}</Text>
            ) : null}
          </View>
        )}

        <ScrollView style={styles.walletsList}>
          {walletsList.map((wallet) => {
            if (wallet.id === currentWalletInfo?.wallets?.[0]?.id) return null;

            let walletLabel = '';
            if (wallet.walletType === WALLETTYPE.LEDGER) {
              walletLabel = ` · /0'/0/${wallet.addressIndex}`;
            } else if (
              wallet.walletType === WALLETTYPE.PRIVATE_KEY ||
              wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
            ) {
              walletLabel = ' · Imported';
            }

            let walletNameStr =
              wallet.walletType === WALLETTYPE.LEDGER && !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(wallet.name)
                ? `${walletLabels[wallet.walletType]} Wallet ${wallet.addressIndex + 1}`
                : formatWalletName(wallet.name);

            if (walletNameStr.length > 16) {
              walletNameStr = walletNameStr.slice(0, 16) + '...';
            }

            return (
              <TouchableOpacity
                key={wallet.id}
                style={styles.card}
                onPress={async () => {
                  const walletIds = currentWalletInfo?.wallets.map((wallet) => wallet.id);
                  await addToConnections(currentWalletInfo?.chainIds as [string], walletIds ?? [], currentWalletInfo?.origin as string);
                  setActiveWallet(wallet);
                  onClose();
                }}
              >
                <View style={styles.rowBetween}>
                  <Image
                    source={{uri: Images.Misc.getWalletIconAtIndex(wallet.colorIndex, wallet.watchWallet)}}
                    style={styles.icon}
                  />
                  <View style={styles.walletTextBox}>
                    <Text style={styles.walletName}>{walletNameStr}</Text>
                    <Text style={styles.walletSub}>{sliceAddress(wallet.addresses[activeChain]) + walletLabel}</Text>
                  </View>
                  {activeWallet?.id === wallet.id && (
                    <Image source={{uri :Images.Misc.CheckCosmos}} style={styles.iconCheck} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  connectedCard: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: -16,
    borderWidth: 2,
    borderColor: '#111827',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  siteName: {
    color: '#059669',
    fontWeight: 'bold',
    marginVertical: 4,
  },
  walletConnected: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 12,
    color: '#4B5563',
  },
  walletsList: {
    maxHeight: 250,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  walletTextBox: {
    flex: 1,
  },
  walletName: {
    fontWeight: '600',
  },
  walletSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  iconCheck: {
    width: 20,
    height: 20,
  },
});
