import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import loadingAnimation from '../../../assets/lottie-files/loading.json';

export type LoaderProps = {
  title?: string;
  color?: string; // not used directly in Lottie, included for parity
};

export const LoaderAnimation = ({
  color,
  style,
}: {
  color?: string;
  style?: object;
}) => {
  return (
    <LottieView
      source={loadingAnimation}
      autoPlay
      loop
      style={[styles.lottie, style]}
    />
  );
};

export default function Loader({ title, color }: LoaderProps) {
  return (
    <View style={styles.container}>
      <LoaderAnimation color={color} />
      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 48,
    height: 48,
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563', // Tailwind's gray-600
  },
});
