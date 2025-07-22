import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  error?: boolean;
};

export const UIInput: React.FC<Props> = ({ error, style, ...props }) => (
  <View>
    <TextInput
      style={[styles.input, error && styles.error, style]}
      {...props}
      placeholderTextColor="#aaa"
    />
  </View>
);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  error: {
    borderColor: '#FF707E',
  },
});
