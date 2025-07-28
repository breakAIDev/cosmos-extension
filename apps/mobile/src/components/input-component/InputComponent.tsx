import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';

type InputComponentProps = {
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
  name: string;
  warning?: string;
  error?: string;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  style?: object;
};

const InputComponent = forwardRef<TextInput, InputComponentProps>(
  ({ placeholder, value, onChange, name, error, warning, onBlur, style }, ref) => {
    const inputStyles = [
      styles.input,
      error && styles.errorBorder,
      warning && styles.warningBorder,
      value !== '' && styles.filledInput,
      style,
    ];

    return (
      <View style={styles.container}>
        <TextInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          style={inputStyles}
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel={name}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
        {warning && <Text style={styles.warningText}>{warning}</Text>}
      </View>
    );
  }
);

InputComponent.displayName = 'InputComponent';


const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb', // secondary-200
    borderRadius: 12,
    height: 48,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  filledInput: {
    backgroundColor: '#f3f4f6', // secondary-100
  },
  errorBorder: {
    borderColor: '#fca5a5', // red-300
  },
  warningBorder: {
    borderColor: '#b45309', // yellow-600
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    marginTop: 4,
  },
  warningText: {
    color: '#b45309',
    fontSize: 14,
    marginTop: 4,
  },
});

export { InputComponent };
