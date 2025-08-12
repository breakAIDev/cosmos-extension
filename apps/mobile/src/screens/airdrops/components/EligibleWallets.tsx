import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Wallet, WarningCircle, CopySimple, CheckCircle } from 'phosphor-react-native';
import { AirdropEligibilityInfo, sliceAddress } from '@leapwallet/cosmos-wallet-hooks';
import useActiveWallet from '../../../hooks/settings/useActiveWallet';
import { Images } from '../../../../assets/images';
import { UserClipboard } from '../../../utils/clipboard';
import { formatWalletName } from '../../../utils/formatWalletName';
import { trim } from '../../../utils/strings';

interface EligibleWalletsProps {
  selectedAirdrop: AirdropEligibilityInfo; // You can type this more strictly as needed
}

const EligibleWallets: React.FC<EligibleWalletsProps> = ({ selectedAirdrop }) => {
  const [showAddressError, setShowAddressError] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { activeWallet } = useActiveWallet();
  const walletName = formatWalletName(activeWallet?.name || '');

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return { uri: activeWallet.avatar };
    }
    return Images.Logos.LeapLogo28
      ? Images.Logos.LeapLogo28
      : null;
  }, [activeWallet?.avatar]);

  useEffect(() => {
    const addressNotFound = selectedAirdrop?.tokenInfo?.find((token: any) => !token?.address);
    if (addressNotFound) {
      setShowAddressError(true);
    }
  }, [selectedAirdrop]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (copiedIndex !== null) {
      timeout = setTimeout(() => setCopiedIndex(null), 2000);
    }
    return () => clearTimeout(timeout as any);
  }, [copiedIndex]);

  const onCopy = (address: string | undefined, idx: number) => {
    if (!address) return;
    UserClipboard.copyText(address);
    setCopiedIndex(idx);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Wallet size={20} color="#111" style={styles.headerIcon} />
        <Text style={styles.headerText}>Eligible wallets</Text>
      </View>
      {/* Wallet Box */}
      <View style={styles.walletBox}>
        {/* Avatar + Wallet name */}
        <View style={styles.walletInfoRow}>
          <Image source={walletAvatar} style={styles.avatar} />
          <Text style={styles.walletName}>{trim(walletName, 10)}</Text>
        </View>
        {/* Addresses */}
        <View style={styles.addressesRow}>
          {selectedAirdrop?.tokenInfo?.map((token: any, idx: number) => {
            if (token?.address) {
              return (
                <View key={idx} style={styles.addressBubble}>
                  <Text style={styles.addressText}>{sliceAddress(token?.address)}</Text>
                  <TouchableOpacity onPress={() => onCopy(token?.address, idx)}>
                    {copiedIndex === idx ? (
                      <CheckCircle size={20} weight="fill" color="#111" />
                    ) : (
                      <CopySimple size={20} color="#111" />
                    )}
                  </TouchableOpacity>
                </View>
              );
            }
            return null;
          })}
          {showAddressError && (
            <View style={styles.errorBubble}>
              <WarningCircle size={16} color="#FF6565" style={{ marginTop: 3, marginRight: 4 }} />
              <Text style={styles.errorText}>
                We are unable to fetch airdrops for some addresses. Please try again later.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default EligibleWallets;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 8,
    backgroundColor: '#F7F8FA', // secondary-100
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  walletBox: {
    backgroundColor: '#E5E7EB', // secondary-200
    borderRadius: 20,
    padding: 16,
    marginTop: 4,
  },
  walletInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  walletName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  addressesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  addressBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#D1D5DB', // secondary-300
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    color: '#111',
    fontWeight: '500',
    marginRight: 4,
  },
  errorBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,101,101,0.12)', // destructive/75
    borderRadius: 16,
    padding: 12,
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#111',
    fontWeight: '500',
    flex: 1,
    lineHeight: 19,
  },
});
