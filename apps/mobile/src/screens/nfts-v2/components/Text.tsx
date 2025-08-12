import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps } from 'react-native';

type CustomTextProps = RNTextProps & {
  children: React.ReactNode;
  style?: any;
};

export function Text({ children, style, numberOfLines = 1, ...rest }: CustomTextProps) {
  return (
    <RNText
      style={[styles.text, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode="tail"
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    maxWidth: 150,
    // "truncate" (ellipsis) is handled by numberOfLines and ellipsizeMode
  },
});
