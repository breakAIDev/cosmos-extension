import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SeedPhraseInput } from '../../../../components/seed-phrase-input';
import { Button } from '../../../../components/ui/button';
import { validateSeedPhrase } from '../../../../utils/validateSeedPhrase';

import { OnboardingWrapper } from '../../wrapper';
import { useImportWalletContext } from '../import-wallet-context';

export const SeedPhrase = () => {
  const {
    walletName,
    privateKeyError,
    setPrivateKeyError,
    secret,
    setSecret,
    importWalletFromSeedPhrase,
    prevStep,
    currentStep,
  } = useImportWalletContext();
  const [error, setError] = useState(privateKeyError ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const isPrivateKey = walletName === 'private-key';

  useEffect(() => {
    if (privateKeyError?.length) {
      setError(privateKeyError);
    }
  }, [privateKeyError]);

  const onChangeHandler = (value: string) => {
    setError('');
    setPrivateKeyError && setPrivateKeyError('');
    setSecret(value);
  };

  const handleImportWalletClick = async () => {
    if (
      validateSeedPhrase({ phrase: secret, isPrivateKey, setError, setSecret })
    ) {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await importWalletFromSeedPhrase();
      setIsLoading(false);
    }
  };

  return (
    <OnboardingWrapper
      heading={'Enter recovery phrase'}
      subHeading={'Type or paste your 12 or 24-word recovery phrase'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <View style={styles.inputContainer}>
        <SeedPhraseInput onChangeHandler={onChangeHandler} isError={!!error} />
        {error ? (
          <Text
            style={styles.errorText}
            testID="error-text-ele"
          >
            {error}
          </Text>
        ) : null}
      </View>

      <Button
        testID="btn-import-wallet"
        style={styles.button}
        disabled={!!error || !secret || isLoading}
        onPress={handleImportWalletClick}
      >
        Continue
      </Button>
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF5A5F', // destructive-100 color
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    marginTop: 16,
    width: '100%',
  },
});
