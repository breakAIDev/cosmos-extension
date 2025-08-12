import { captureException } from '@sentry/react-native';
import BottomModal from '../../components/new-bottom-modal';
import { SeedPhraseInput } from '../../components/seed-phrase-input/v2';
import { Button } from '../../components/ui/button';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { Wallet } from '../../hooks/wallet/useWallet';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { passwordStore } from '../../context/password-store';
import { validateSeedPhrase } from '../../utils/validateSeedPhrase';
import { View, Text, StyleSheet } from 'react-native';

type ImportSeedPhraseProps = {
  isVisible: boolean;
  onClose: (closeParent: boolean) => void;
};

export const ImportSeedPhrase = observer(({ isVisible, onClose }: ImportSeedPhraseProps) => {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { activeWallet } = useActiveWallet();
  const importWallet = Wallet.useImportWallet();
  const updateWatchWalletSeed = Wallet.useUpdateWatchWalletSeed();

  const onChangeHandler = (value: string) => {
    setError('');
    setSecret(value);
  };

  const handleImportWallet = async () => {
    setError('');
    setIsLoading(true);

    if (
      secret &&
      passwordStore.password &&
      validateSeedPhrase({ phrase: secret, isPrivateKey: false, setError, setSecret })
    ) {
      try {
        if (activeWallet?.watchWallet) {
          await updateWatchWalletSeed(secret);
        } else {
          await importWallet({
            privateKey: secret,
            type: 'import',
            addressIndex: '0',
            password: passwordStore.password,
          });
        }
        setSecret('');
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
          <Button
            variant="secondary"
            size="md"
            style={styles.flex1}
            onPress={() => onClose(false)}
          >
            Cancel
          </Button>
          <Button
            size="md"
            disabled={!secret || !!error || isLoading}
            onPress={handleImportWallet}
            style={styles.flex1}
          >
            Import Wallet
          </Button>
        </>
      }
    >
      <View style={styles.centered}>
        <SeedPhraseInput
          onChangeHandler={onChangeHandler}
          isError={!!error}
          onPage="SelectWallet"
        />
        {!!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  centered: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E2655A', // destructive-100
    textAlign: 'center',
    marginTop: 8,
  },
});
