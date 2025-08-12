import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { captureException } from '@sentry/react-native';
import BottomModal from '../../components/new-bottom-modal';
import { Button } from '../../components/ui/button';
import { PrivateKeyInput } from '../../components/ui/input/private-key-input';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { passwordStore } from '../../context/password-store';
import { validateSeedPhrase } from '../../utils/validateSeedPhrase';
import { Wallet } from '../../hooks/wallet/useWallet';
import { View, StyleSheet } from 'react-native';

type ImportPrivateKeyProps = {
  isVisible: boolean;
  onClose: (closeParent: boolean) => void;
};

export const ImportPrivateKey = observer(({ isVisible, onClose }: ImportPrivateKeyProps) => {
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const activeChain = useActiveChain();
  const { activeWallet } = useActiveWallet();
  const importWallet = Wallet.useImportWallet();
  const updateWatchWalletSeed = Wallet.useUpdateWatchWalletSeed();

  const onChangeText = (value: string) => {
    setError('');
    setPrivateKey(value);
  };

  const handleImportWallet = async () => {
    setError('');
    setIsLoading(true);

    if (
      privateKey &&
      passwordStore.password &&
      validateSeedPhrase({
        phrase: privateKey,
        isPrivateKey: true,
        setError,
        setSecret: setPrivateKey,
      })
    ) {
      try {
        if (activeWallet?.watchWallet) {
          await updateWatchWalletSeed(privateKey);
        } else {
          await importWallet({
            privateKey,
            type: 'import',
            addressIndex: '0',
            password: passwordStore.password,
          });
        }
        setPrivateKey('');
        onClose(true);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
        captureException(errorMessage);
        setError(errorMessage);
      }
    }

    setIsLoading(false);
  };

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={() => {
        onClose(false);
        setError('');
      }}
      title="Import Wallet"
      footerComponent={
        <>
          <Button variant="secondary" size="md" style={styles.flex1} onPress={() => onClose(false)}>
            Cancel
          </Button>

          <Button
            size="md"
            disabled={!privateKey || !!error || isLoading}
            onPress={handleImportWallet}
            style={styles.flex1}
          >
            Import Wallet
          </Button>
        </>
      }
    >
      <View style={styles.inputContainer}>
        <PrivateKeyInput value={privateKey} onChangeText={onChangeText} error={error} />
      </View>
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  inputContainer: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
});
