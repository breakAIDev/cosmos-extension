import React from 'react';
import { StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import scanning from '../../../assets/lottie-files/scanning.json';

type ScanningAnimationProps = {
  style?: object;
};

export default function ScanningAnimation({ style }: ScanningAnimationProps) {
  return (
    <LottieView
      source={scanning}
      autoPlay
      loop
      style={[styles.default, style]}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    width: 196,
    height: 196,
  },
});
