import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, ViewProps } from 'react-native';

type SkeletonProps = ViewProps & {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
};

export const Skeleton = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  ...props
}: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.7, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: 'rgba(54, 100, 244, 0.12)', // bg-primary/10
          opacity,
        },
        styles.skeleton,
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});
