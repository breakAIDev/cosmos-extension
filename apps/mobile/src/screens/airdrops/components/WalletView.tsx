import React, { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Text from '../../../components/text';
import useActiveWallet from '../../../hooks/settings/useActiveWallet';
import { Images } from '../../../../assets/images';
import { formatWalletName } from '../../../utils/formatWalletName';
import { trim } from '../../../utils/strings';

export default function WalletView() {
  const { activeWallet } = useActiveWallet();
  const walletName = formatWalletName(activeWallet?.name || '');

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return activeWallet.avatar;
    }
    return null;
  }, [activeWallet?.avatar]);

  return (
    <View style={styles.outerContainer}>
      <Text size="sm" style={styles.label}>
        Airdrops shown for
      </Text>
      <View style={styles.walletContainer}>
        <Image
          style={styles.avatar}
          source={
            walletAvatar
              ? { uri: walletAvatar }
              : {uri: Images.Logos.LeapLogo28}
          }
        />
        <Text size="sm" style={styles.walletName}>
          {trim(walletName, 10)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6', // secondary-100
    paddingLeft: 16,
    borderRadius: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  label: {
    fontWeight: '500',
    fontSize: 14,
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 16,
    backgroundColor: '#FAFAFA', // gray-50
    borderRadius: 30,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  walletName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
