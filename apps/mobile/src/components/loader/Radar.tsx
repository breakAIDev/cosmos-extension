import React from 'react';
import { StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import radar from '../../../assets/lottie-files/radar.json';

type RadarAnimationProps = {
  style?: object;
};

export default function RadarAnimation({ style }: RadarAnimationProps) {
  return (
    <LottieView
      source={radar}
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
