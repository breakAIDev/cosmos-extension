import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import { Button } from '../../../components/ui/button';
import StepProgress from '../../../components/ui/step-progress';

import { OnboardingLayout } from '../layout';
import { useImportWalletContext } from './import-wallet-context';

const NavHeader = () => {
  const { backToPreviousStep, currentStep, totalSteps, walletName } = useImportWalletContext();

  const isShortStep = walletName === 'private-key' || walletName === 'watch-wallet';
  const isLongStep = walletName === 'ledger' || walletName === 'evm-ledger';

  const totalStepsToShow = isShortStep
    ? totalSteps - 1
    : isLongStep
      ? totalSteps + 1
      : totalSteps;

  return (
    <View style={styles.header}>
      <Button variant="secondary" size="icon" onPress={backToPreviousStep}>
        <ArrowLeft size={16} />
      </Button>

      {currentStep > 0 && (
        <StepProgress
          currentStep={currentStep}
          totalSteps={totalStepsToShow}
          style={styles.progress}
        />
      )}

      {/* Spacer for progress bar centering */}
      <View style={styles.spacer} />
    </View>
  );
};

export const ImportWalletLayout = (props: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) => {
  return (
    <OnboardingLayout style={[styles.layout, props.style]}>
      <NavHeader />
      {props.children}
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 28, // p-7
    borderColor: '#E0E7EF', // border-secondary-300
    borderWidth: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    position: 'relative',
    margin: -4, // -m-1
  },
  progress: {
    alignSelf: 'center',
    height: 36,
  },
  spacer: {
    width: 36,  // size-9
    height: 36,
    flexShrink: 0,
  },
});
