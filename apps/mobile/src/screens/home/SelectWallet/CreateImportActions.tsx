import { CaretRight, PlusCircle } from 'phosphor-react-native';
import BottomModal from '../../../components/new-bottom-modal';
import { ButtonName, EventName } from '../../../services/config/analytics';
import { EyeIcon } from '../../../../assets/icons/eye-icon';
import { KeyIcon } from '../../../../assets/icons/key-icon';
import { LedgerDriveIcon } from '../../../../assets/icons/ledger-drive-icon';
import { LockRotateIcon } from '../../../../assets/icons/lock-rotate-icon';
import mixpanel from '../../../mixpanel';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Wallet } from '../../../hooks/wallet/useWallet';
import { NewWalletForm } from '../CreateNewWallet';
import { ImportPrivateKey } from '../ImportPrivateKey';
import { ImportSeedPhrase } from '../ImportSeedPhrase';
import ImportWatchWallet from '../ImportWatchWallet';
import { hasMnemonicWallet } from '../../../utils/hasMnemonicWallet';

type SelectedAction = 'new-wallet' | 'import-private-key' | 'import-seed-phrase' | 'watch-wallet';

const CreateImportActions = observer(
  ({
    isVisible,
    onClose,
    title,
  }: {
    isVisible: boolean;
    onClose: (closeParent?: boolean) => void;
    title: string;
  }) => {
    const navigation = useNavigation();
    const wallets = Wallet.useWallets();

    const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(null);

    // For mobile: if the user doesn't have mnemonic wallet, just navigate to onboarding.
    const handleCreateNewWalletClick = useCallback(() => {
      if (hasMnemonicWallet(wallets as Wallet.Keystore)) {
        setSelectedAction('new-wallet');
      } else {
        // Replace with navigation to onboarding screen
        navigation.navigate('OnboardingScreen');
        // Optionally: onClose();
      }
    }, [wallets, navigation]);

    const handleWatchWalletClick = useCallback(() => {
      setSelectedAction('watch-wallet');
      mixpanel.track(EventName.ButtonClick, {
        buttonName: ButtonName.WATCH_WALLET,
      });
    }, []);

    const handleConnectLedgerClick = useCallback(() => {
      // Just navigate in mobile
      navigation.navigate('OnboardingImportScreen', { walletName: 'ledger' });
      // Optionally: onClose();
    }, [navigation]);

    const actions = [
      {
        title: 'Create new wallet',
        testId: 'create-new-wallet-div',
        icon: <PlusCircle size={20} weight="fill" color="#22c55e" />, // text-accent-success
        onPress: handleCreateNewWalletClick,
      },
      {
        title: 'Import using recovery phrase',
        testId: 'import-seed-phrase-div',
        icon: <LockRotateIcon size={24} color="#ef4444" />, // text-destructive-100
        onPress: () => setSelectedAction('import-seed-phrase'),
      },
      {
        title: 'Import using private key',
        testId: 'import-private-key-div',
        icon: <KeyIcon size={24} color="#2563eb" />, // text-blue-600
        onPress: () => setSelectedAction('import-private-key'),
      },
      {
        title: 'Import using Ledger',
        testId: 'import-ledger-div',
        icon: <LedgerDriveIcon size={22} color="#C984EB" />,
        onPress: handleConnectLedgerClick,
      },
      {
        title: 'Watch wallet',
        testId: 'watch-wallet-div',
        icon: <EyeIcon size={20} weight="fill" color="#eab308" />, // text-accent-warning
        onPress: handleWatchWalletClick,
      },
    ];

    return (
      <>
        <BottomModal isOpen={isVisible} onClose={onClose} title={title} fullScreen>
          <View style={styles.actionsContainer}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.testId}
                onPress={action.onPress}
                style={styles.actionButton}
                activeOpacity={0.85}
                testID={action.testId}
              >
                {action.icon}
                <Text style={styles.actionText}>{action.title}</Text>
                <CaretRight size={18} weight="bold" color="#6B7280" style={styles.caretIcon} />
              </TouchableOpacity>
            ))}
          </View>
        </BottomModal>

        <NewWalletForm
          isVisible={selectedAction === 'new-wallet'}
          onClose={(closeSelectWallet: boolean) => {
            if (closeSelectWallet) {
              onClose(true);
            }
            setSelectedAction(null);
          }}
        />

        <ImportSeedPhrase
          isVisible={selectedAction === 'import-seed-phrase'}
          onClose={(closeSelectWallet: boolean) => {
            if (closeSelectWallet) onClose(true);
            setSelectedAction(null);
          }}
        />

        <ImportPrivateKey
          isVisible={selectedAction === 'import-private-key'}
          onClose={(closeSelectWallet: boolean) => {
            if (closeSelectWallet) onClose(true);
            setSelectedAction(null);
          }}
        />

        <ImportWatchWallet
          isVisible={selectedAction === 'watch-wallet'}
          onClose={(closeSelectWallet?: boolean) => {
            if (closeSelectWallet) onClose(true);
            setSelectedAction(null);
          }}
        />
      </>
    );
  }
);

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'column',
    gap: 14, // Not supported in RN, use marginBottom on actionButton below if needed
    paddingVertical: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F3F4F6', // bg-secondary-100
    borderRadius: 18,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#222',
    flex: 1,
  },
  caretIcon: {
    marginLeft: 'auto',
  },
});

export default CreateImportActions;
