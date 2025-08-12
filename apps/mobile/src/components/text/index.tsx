import React, { PropsWithChildren } from 'react';
import { Text as RNText, StyleSheet, TextStyle, StyleProp } from 'react-native';

export type TextProps = {
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'jumbo';
  readonly children?: string;
  readonly color?: string; // Accepts hex or named color string
  readonly style?: StyleProp<TextStyle>;
};

/**
 * Text component for React Native
 *
 * @param props {('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'jumbo')} - size - xs 12, sm 14, md 16, lg 20, xl 24, xxl 32, jumbo 48
 */
export default function Text(props: PropsWithChildren<TextProps>) {
  const { size = 'md', children, color, style, ...rest } = props;

  // Font sizes mapped to your requirements
  const sizeToStyle: Record<NonNullable<TextProps['size']>, TextStyle> = {
    xs: { fontSize: 12 },
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 20 },
    xl: { fontSize: 24 },
    xxl: { fontSize: 32 },
    jumbo: { fontSize: 48 },
  };

  return (
    <RNText
      style={[
        styles.base,
        sizeToStyle[size],
        { color: color ?? '#111' }, // Default to black if no color
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
    fontFamily: 'Satoshi', // If you use custom fonts, otherwise remove
    flexShrink: 1,
  },
});
