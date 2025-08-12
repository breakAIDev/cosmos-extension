import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import { Button } from '../../../../components/ui/button';
import { AnimatePresence, MotiImage, MotiText } from 'moti';
import { LedgerDriveIcon } from '../../../../../assets/icons/ledger-drive-icon';
import { Images } from '../../../../../assets/images';

import { OnboardingWrapper } from '../../wrapper';
import { useImportWalletContext } from '../import-wallet-context';
import { LEDGER_CONNECTION_STEP } from '../types';

const stepsData = [
  { description: 'Unlock Ledger & connect to your device via USB' },
  { description: 'Select networks & choose wallets to import' },
];

const ledgerImgTransition = {
  type: 'timing',
  duration: 750,
};

export const ImportLedger = () => {
  const { prevStep, currentStep, ledgerConnectionStatus: status, moveToNextStep } = useImportWalletContext();
  const entry = prevStep <= currentStep ? 'right' : 'left';
  const forward = entry === 'right';

  return (
    <OnboardingWrapper
      headerIcon={<LedgerDriveIcon style={styles.headerIcon} />}
      heading="Connect your Ledger"
      entry={entry}
    >
      <View style={styles.container}>
        {stepsData.map((d, index) => (
          <View key={index} style={styles.stepRow}>
            <CheckCircle
              weight="bold"
              size={20}
              color="#A0AEC0" // text-muted-foreground or similar
              style={styles.icon}
            />            
            <MotiText
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 300 }}
              style={styles.stepText}
            >
              {d.description}
            </MotiText>
          </View>
        ))}

        {/* Animated Cable/USB */}
        <View style={styles.animatedRow}>
          <AnimatePresence>
            <MotiImage
              from={{ opacity: 0, translateX: forward ? -100 : 0 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={ledgerImgTransition}
              source={Images.Misc.HardwareWalletConnectCable}
              style={styles.cableImage}
              resizeMode="contain"
            />
            <MotiImage
              from={{ opacity: 0, translateX: forward ? 100 : 0 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={ledgerImgTransition}
              source={Images.Misc.HardwareWalletConnectUsb}
              style={styles.usbImage}
              resizeMode="contain"
            />
          </AnimatePresence>
        </View>
      </View>

      <Button
        style={styles.button}
        disabled={status === LEDGER_CONNECTION_STEP.step2}
        onPress={moveToNextStep}
      >
        {status === LEDGER_CONNECTION_STEP.step2
          ? 'Looking for device...'
          : 'Continue'}
      </Button>
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    minHeight: 301,
    position: 'relative',
    marginBottom: 16,
  },
  headerIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  stepRow: {
    backgroundColor: '#F5F6F8', // secondary-200
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 12,
    gap: 12,
  },
  icon: {
    marginRight: 12,
    flexShrink: 0,
  },
  stepText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#232323',
    flex: 1,
  },
  animatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    justifyContent: 'space-between',
    width: '100%',
  },
  cableImage: {
    width: '40%',
    height: 70,
  },
  usbImage: {
    width: '58%',
    height: 70,
  },
  button: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 4,
  },
});

export default ImportLedger;
