import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type CssLoaderProps = {
  style?: ViewStyle;
  size?: number;
  color?: string;
};

const CssLoader = ({ style, size = 32, color = '#4F8EF7' }: CssLoaderProps) => (
  <View style={[styles.container, { width: size, height: size }, style]}>
    {[0, 1, 2, 3].map((i) => (
      <View
        key={i}
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderColor: color,
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [{ rotate: `${i * 90}deg` }],
          },
        ]}
      />
    ))}
  </View>
);

export default CssLoader;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 999,
    borderStyle: 'solid',
    top: 0,
    left: 0,
  },
});
