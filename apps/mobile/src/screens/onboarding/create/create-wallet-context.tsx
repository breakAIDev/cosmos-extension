import { sleep } from '@leapwallet/cosmos-wallet-sdk';
import { useOnboarding } from '../../../hooks/onboarding/useOnboarding';
import { usePrevious } from '../../../hooks/utility/usePrevious';
import React, { useState } from 'react';
import { passwordStore } from '../../../context/password-store';
import { useNavigation } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';

export type CreateWalletContextType = {
  mnemonic: string;
  onOnboardingCompleted: (password: Uint8Array) => void;
  moveToNextStep: () => void;
  backToPreviousStep: () => void;
  currentStep: number;
  prevStep: number;
  totalSteps: number;
  loading: boolean;
};

const CreateWalletContext = React.createContext<CreateWalletContextType | null>(null);

const totalSteps = 3;

export const CreateWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { mnemonic, onOnboardingComplete } = useOnboarding();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const prevStep = usePrevious(currentStep) || 1;
  const navigation = useNavigation();

  const onOnboardingCompleted = async (password: Uint8Array) => {
    setLoading(true);

    await onOnboardingComplete(mnemonic, password, { 0: true }, 'create');

    const passwordBase64 = Buffer.from(password).toString('base64');
    DeviceEventEmitter.emit('unlock',{ password: passwordBase64 });
    passwordStore.setPassword(password);

    await sleep(2_000);

    navigation.navigate('OnboardingSuccess');
    setLoading(false);
  };

  const moveToStep = (step: number) => {
    if (step === totalSteps && passwordStore.password) {
      onOnboardingCompleted(passwordStore.password);
      return;
    }

    if (step < 1) {
      navigation.goBack();
      return;
    }

    setCurrentStep(step);
  };

  const moveToNextStep = () => {
    moveToStep(currentStep + 1);
  };

  const backToPreviousStep = () => {
    moveToStep(currentStep - 1);
  };

  return (
    <CreateWalletContext.Provider
      value={{
        mnemonic,
        onOnboardingCompleted,
        moveToNextStep,
        backToPreviousStep,
        currentStep,
        prevStep,
        totalSteps,
        loading,
      }}
    >
      {children}
    </CreateWalletContext.Provider>
  );
};

export const useCreateWalletContext = () => {
  const context = React.useContext(CreateWalletContext);
  if (!context) {
    throw new Error('useCreateWalletContext must be used within a CreateWalletProvider');
  }

  return context;
};
