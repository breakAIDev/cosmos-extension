import React, { useRef, useEffect } from 'react';
import { Animated, ViewProps, StyleSheet } from 'react-native';

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
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.7, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: 'rgba(35,35,35,0.18)', // bg-foreground/20 (dark gray with 20% opacity)
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
