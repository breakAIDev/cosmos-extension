import React, { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { PrivateKeyInput } from '../../../../components/ui/input/private-key-input';
import { KeySlimIcon } from '../../../../../assets/icons/key-slim-icon';
import { validateSeedPhrase } from '../../../../utils/validateSeedPhrase';

import { OnboardingWrapper } from '../../wrapper';
import { useImportWalletContext } from '../import-wallet-context';

export const PrivateKey = () => {
  const {
    secret,
    setSecret,
    privateKeyError,
    setPrivateKeyError,
    importWalletFromSeedPhrase,
    prevStep,
    currentStep,
  } = useImportWalletContext();

  const [error, setError] = useState(privateKeyError ?? '');

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

  const handleImportWalletClick = () => {
    if (validateSeedPhrase({ phrase: secret, isPrivateKey: true, setError, setSecret })) {
      importWalletFromSeedPhrase();
    }
  };

  return (
    <OnboardingWrapper
      headerIcon={<KeySlimIcon size={24} />}
      heading={'Import with private key'}
      subHeading={'Type or paste your private key here'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
      style={{ gap: 40 }}
    >
      <PrivateKeyInput value={secret} onChangeText={onChangeHandler} error={error} />

      <Button
        data-testing-id="btn-import-wallet"
        style={{ marginTop: 'auto', width: '100%' }}
        disabled={!!error || !secret}
        onPress={handleImportWalletClick}
      >
        Import private key
      </Button>
    </OnboardingWrapper>
  );
};
