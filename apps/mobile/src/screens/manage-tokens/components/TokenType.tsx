import React from 'react';
import { Text, StyleSheet } from 'react-native';

type TokenTypeProps = {
  style?: any;
  type: string;
};

export function TokenType({ style, type }: TokenTypeProps) {
  return (
    <Text style={[styles.tokenType, style]}>
      {type}
    </Text>
  );
}

const styles = StyleSheet.create({
  tokenType: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontSize: 10,
    textAlign: 'center',
    marginLeft: 2,
    borderRadius: 8,
    overflow: 'hidden',
    // The color is overridden by typeStyle
  },
});
