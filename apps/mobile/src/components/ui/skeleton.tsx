import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';

interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
  asChild?: boolean; // Not really needed in RN, kept for compatibility
}

export const Skeleton: React.FC<SkeletonProps> = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          borderRadius: 8,
          backgroundColor: '#D1D5DB', // fallback gray
          opacity,
        },
        style,
      ]}
    />
  );
};
