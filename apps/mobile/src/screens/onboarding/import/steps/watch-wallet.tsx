import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { isValidWalletAddress } from '@leapwallet/cosmos-wallet-sdk';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { TextareaWithPaste } from '../../../../components/ui/input/textarea-with-paste';
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from '../../../../services/config/config';
import { EyeIcon } from '../../../../../assets/icons/eye-icon';
import { OnboardingWrapper } from '../../../onboarding/wrapper';
import { useImportWalletContext } from '../import-wallet-context';

export const ImportWatchWallet = () => {
  const {
    prevStep,
    currentStep,
    watchWalletAddress,
    setWatchWalletAddress,
    watchWalletName,
    setWatchWalletName,
    moveToNextStep,
  } = useImportWalletContext();
  const [error, setError] = useState('');

  const onImportWallet = () => {
    if (!watchWalletAddress) {
      setError('');
      return;
    }
    if (!isValidWalletAddress(watchWalletAddress)) {
      setError('Invalid public address, please enter a valid address');
      return;
    }
    setError('');
    moveToNextStep();
  };

  return (
    <OnboardingWrapper
      headerIcon={<EyeIcon size={24} />}
      heading={'Watch wallet'}
      subHeading={`Add a wallet address you'd like to watch.`}
      entry={prevStep <= currentStep ? 'right' : 'left'}
      style={styles.gap10}
    >
      <View style={styles.flexColGap4}>
        <View style={styles.flexCol}>
          <TextareaWithPaste
            autoFocus
            onChangeText={(value) => {
              setError('');
              setWatchWalletAddress(value);
            }}
            value={watchWalletAddress}
            error={error}
            placeholder="Public address"
            data-testing-id="enter-watch-address"
          />

          <AnimatePresence>
            {error ? (
              <MotiView
                from={{ opacity: 0, translateY: -10, height: 0 }}
                animate={{ opacity: 1, translateY: 0, height: 18 }}
                exit={{ opacity: 0, translateY: -10, height: 0 }}
                transition={{ type: 'timing', duration: 150 }}
                style={styles.errorBox}
              >
                <Text style={styles.errorText}>{error}</Text>
              </MotiView>
            ) : null}
          </AnimatePresence>
        </View>

        <Input
          placeholder="Name your wallet (optional)"
          maxLength={24}
          value={watchWalletName?.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '')}
          onChangeText={setWatchWalletName}
          trailingElement={
            watchWalletName?.length > 0 ? (
              <Text style={styles.trailingText}>{`${watchWalletName?.length}/24`}</Text>
            ) : null
          }
        />
      </View>

      <Button
        data-testing-id="btn-import-wallet"
        style={styles.mtAutoFull}
        disabled={!!error || !watchWalletAddress || !watchWalletName}
        onPress={onImportWallet}
      >
        Start watching
      </Button>
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  gap10: {
    gap: 40,
  },
  flexColGap4: {
    flexDirection: 'column',
    gap: 16,
  },
  flexCol: {
    flexDirection: 'column',
  },
  errorBox: {
    minHeight: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444', // text-destructive-100
    textAlign: 'center',
  },
  trailingText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  mtAutoFull: {
    marginTop: 'auto',
    width: '100%',
  },
});
