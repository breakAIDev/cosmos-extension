import { CardDivider, ThemeName, useTheme } from '@leapwallet/leap-ui';
import { DownloadSimple, PlusCircle, Usb } from 'phosphor-react-native';
import { ButtonName, EventName } from '../../services/config/analytics';
import { Images } from '../../../assets/images';
import mixpanel from '../../mixpanel';
import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Text from '../../components/text';
import { Wallet } from '../../hooks/wallet/useWallet';
import { hasMnemonicWallet } from '../../utils/hasMnemonicWallet';
import { useNavigation } from '@react-navigation/native'; // Uncomment and use for navigation

const CreateImportActions = observer(
  ({
    setShowImportSeedPhrase,
    setShowImportPrivateKey,
    setShowImportWatchWallet,
    setIsNewWalletFormVisible,
  }: {
    setShowImportSeedPhrase: (show: boolean) => void;
    setShowImportPrivateKey: (show: boolean) => void;
    setShowImportWatchWallet: (show: boolean) => void;
    setIsNewWalletFormVisible: (show: boolean) => void;
  }) => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const wallets = Wallet.useWallets();

    const handleCreateNewWalletClick = useCallback(() => {
      if (hasMnemonicWallet(wallets as Wallet.Keystore)) {
        setIsNewWalletFormVisible(true);
      } else {
        navigation.navigate('Onboarding'); // Use your React Native navigation here
      }
    }, [navigation, setIsNewWalletFormVisible, wallets]);

    const handleWatchWalletClick = useCallback(() => {
      setShowImportWatchWallet(true);
      mixpanel.track(EventName.ButtonClick, {
        buttonName: ButtonName.WATCH_WALLET,
      });
    }, [setShowImportWatchWallet]);

    const handleConnectLedgerClick = useCallback(() => {
      navigation.navigate('OnboardingImport', { walletName: 'ledger' });
    }, []);

    return (
      <View>
        <View style={styles.cardSection}>
          <TouchableOpacity
            onPress={handleCreateNewWalletClick}
            style={styles.actionRow}
            testID="create-new-wallet-div"
            activeOpacity={0.8}
          >
            <PlusCircle size={20} color="#9CA3AF" style={styles.icon} />
            <Text size="md" style={styles.actionText}>
              Create new wallet
            </Text>
          </TouchableOpacity>

          <CardDivider />
          <TouchableOpacity
            onPress={() => setShowImportSeedPhrase(true)}
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <DownloadSimple size={20} color="#9CA3AF" style={styles.icon} />
            <Text size="md" style={styles.actionText}>
              Import using recovery phrase
            </Text>
          </TouchableOpacity>

          <CardDivider />
          <TouchableOpacity
            onPress={() => setShowImportPrivateKey(true)}
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <Image
              source={{uri: Images.Misc.FilledKey}}
              style={styles.imgIcon}
              resizeMode="contain"
            />
            <Text size="md" style={styles.actionText}>
              Import using private key
            </Text>
          </TouchableOpacity>

          <CardDivider />
          <TouchableOpacity
            onPress={handleWatchWalletClick}
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <Image
              source={{uri : theme === ThemeName.DARK ? Images.Misc.EyeDark : Images.Misc.EyeLight}}
              style={styles.imgIcon}
              resizeMode="contain"
            />
            <Text size="md" style={styles.actionText}>
              Watch wallet
            </Text>
            <View style={styles.newBadge}>
              <Text size="xs" style={styles.newBadgeText}>
                NEW
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleConnectLedgerClick}
          style={[styles.actionRow, styles.ledgerRow]}
          activeOpacity={0.8}
        >
          <Usb size={20} color="#9CA3AF" style={styles.icon} />
          <Text size="md" style={styles.actionText}>
            Connect Ledger
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  cardSection: {
    backgroundColor: '#fff', // bg-white-100
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff', // or dark variant if in dark mode
  },
  icon: {
    marginRight: 16,
  },
  imgIcon: {
    width: 20,
    height: 20,
    marginRight: 16,
  },
  actionText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  newBadge: {
    backgroundColor: 'rgba(34,197,94,0.1)', // bg-green-500/10
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 18,
    marginLeft: 8,
    alignSelf: 'center',
  },
  newBadgeText: {
    color: '#22C55E',
    fontWeight: '500',
    fontSize: 12,
  },
  ledgerRow: {
    borderRadius: 16,
    marginTop: 8,
    backgroundColor: '#fff',
  },
});

export default CreateImportActions;
