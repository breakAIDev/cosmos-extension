import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

type StepProgressProps = {
  currentStep: number;
  totalSteps: number;
  style?: any;
  moveToStep?: (step: number) => void;
};

const StepProgress = ({
  currentStep,
  totalSteps,
  style,
  moveToStep,
}: StepProgressProps) => {
  const steps = useMemo(() => Array.from({ length: totalSteps }, (_, i) => i + 1), [totalSteps]);

  return (
    <View style={[styles.container, style]}>
      {steps.map((step) => (
        <TouchableOpacity
          key={step}
          onPress={() => moveToStep?.(step)}
          activeOpacity={moveToStep ? 0.7 : 1}
          style={[
            styles.step,
            step === currentStep ? styles.stepActive : styles.stepInactive,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12, // Requires React Native >= 0.71.0; use margin if on lower version
  },
  step: {
    height: 4, // h-1 (4px)
    width: 18, // w-[1.125rem] (18px)
    borderRadius: 8,
    marginHorizontal: 6, // For gap between steps if "gap" is not supported
    transitionDuration: '500ms', // No direct equivalent; can animate with Animated if you want
  },
  stepActive: {
    backgroundColor: '#26c06f', // bg-accent-green
  },
  stepInactive: {
    backgroundColor: '#E6EAEF', // bg-secondary-300
  },
});

export default StepProgress;
