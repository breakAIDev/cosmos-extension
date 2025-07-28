import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle, StyleProp } from 'react-native';

export type InputStatus = 'error' | 'success' | 'warning' | 'default';

export interface InputProps extends TextInputProps {
  trailingElement?: React.ReactNode;
  status?: InputStatus;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
}

const inputStatusOutlineStyleMap = {
  error: {
    borderColor: '#E2655A', // ring-destructive-100
    borderWidth: 1,
  },
  success: {
    borderColor: '#26c06f', // ring-accent-success
    borderWidth: 1,
  },
  warning: {
    borderColor: '#FBBF24', // ring-accent-warning
    borderWidth: 1,
  },
  default: {
    borderColor: '#E3F9EC', // ring-accent-green-200 or your default
    borderWidth: 1,
  },
};

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ trailingElement, status = 'default', containerStyle, inputStyle, editable = true, ...props }, ref) => {
    const outlineStyle = inputStatusOutlineStyleMap[status] ?? inputStatusOutlineStyleMap.default;

    return (
      <View
        style={[
          styles.container,
          outlineStyle,
          !editable && styles.disabled,
          containerStyle,
        ]}
        pointerEvents={editable ? 'auto' : 'none'}
      >
        <TextInput
          ref={ref}
          style={[
            styles.input,
            inputStyle,
            !editable && styles.inputDisabled,
          ]}
          editable={editable}
          placeholderTextColor="#97A3B9"
          {...props}
        />
        {trailingElement}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,              // h-12
    borderRadius: 14,        // rounded-xl
    paddingHorizontal: 20,   // px-5
    backgroundColor: '#F3F7F6', // bg-secondary-200
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    marginVertical: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 0,
    color: '#232323',
  },
  inputDisabled: {
    color: '#ccc',
  },
  disabled: {
    opacity: 0.5,
  },
});
