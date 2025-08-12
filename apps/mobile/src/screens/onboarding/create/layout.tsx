import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import { Button } from '../../../components/ui/button';
import StepProgress from '../../../components/ui/step-progress';

import { OnboardingLayout } from '../layout';
import { useCreateWalletContext } from './create-wallet-context';

const NavHeader = () => {
  const { backToPreviousStep, currentStep, totalSteps } = useCreateWalletContext();

  return (
    <View style={styles.header}>
      <Button variant="secondary" size="icon" onPress={backToPreviousStep}>
        <ArrowLeft size={16} />
      </Button>

      {currentStep > 0 && (
        <StepProgress currentStep={currentStep} totalSteps={totalSteps} style={styles.progress} />
      )}

      {/* to center the progress bar horizontally */}
      <View style={styles.spacer} />
    </View>
  );
};

export const CreateWalletLayout = (props:  React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) => {
  return (
    <OnboardingLayout style={[styles.layout, props.style]}>
      <NavHeader key="nav-header" />
      {props.children}
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 28, // 7 * 4 (React Native doesn't support `gap` in all versions, so you may need marginBottom on children)
    padding: 28,
    borderColor: '#E0E7EF', // border-secondary-300
    borderWidth: 1,
    backgroundColor: '#fff', // or your background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    position: 'relative',
    margin: -4, // -m-1 in Tailwind, optional
  },
  progress: {
    alignSelf: 'center',
    height: 36, // h-9
  },
  spacer: {
    width: 36,  // size-9
    height: 36,
    flexShrink: 0,
  },
});
