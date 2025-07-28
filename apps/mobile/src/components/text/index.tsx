import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps } from 'react-native';

export type TextProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'jumbo';
  children?: React.ReactNode;
  color?: string; // You can use color names or HEX
  style?: any;    // Accept any extra style object/array
} & RNTextProps;

const sizeMap = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  jumbo: 48,
};

export default function Text(props: TextProps) {
  const { size, children, color, style, ...rest } = props;

  return (
    <RNText
      style={[
        styles.base,
        { fontSize: size ? sizeMap[size] : sizeMap['md'] }, // default 'md' = 16
        { color: color || '#0C0C0D' }, // default text-black-100 (customize as needed)
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'Satoshi-Regular', // Set your font family if available, or use system default
    flexShrink: 1,
  },
});