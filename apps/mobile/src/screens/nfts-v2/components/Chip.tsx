import React from 'react';
import { View, Text, Image, StyleSheet, ViewProps, ImageProps, ViewStyle, StyleProp, ImageStyle, TextStyle, TextInputProps } from 'react-native';

// Main Chip
type ChipProps = React.PropsWithChildren<ViewProps> & {
  style?: StyleProp<ViewStyle>;
};

export function Chip({ children, style, ...rest }: ChipProps) {
  return (
    <View style={[styles.chip, style]} {...rest}>
      {children}
    </View>
  );
}

// Chip.Text
type ChipTextProps = React.PropsWithChildren<TextInputProps> & {
  style?: StyleProp<TextStyle>;
};
Chip.Text = function ChipText({ children, style, ...rest }: ChipTextProps) {
  return (
    <Text style={[styles.chipText, style]} {...rest}>
      {children}
    </Text>
  );
};

// Chip.Image
type ChipImageProps = ImageProps & {
  style?: StyleProp<ImageStyle>;
};
Chip.Image = function ChipImage({ source, style, ...rest }: ChipImageProps) {
  return (
    <Image
      source={source}
      style={[styles.chipImage, style]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    color: '#222',
  },
  chipImage: {
    borderRadius: 999,
    marginRight: 4,
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
});
