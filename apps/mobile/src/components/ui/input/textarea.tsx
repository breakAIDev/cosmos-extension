import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

export type InputStatus = 'error' | 'success' | 'warning' | 'default';

type TextareaProps = TextInputProps & {
  status?: InputStatus;
  style?: any;
};

const inputStatusOutlineStyleMap = {
  error: {
    borderColor: '#E2655A', // red
    borderWidth: 1,
  },
  success: {
    borderColor: '#26c06f', // green
    borderWidth: 1,
  },
  warning: {
    borderColor: '#FBBF24', // yellow
    borderWidth: 1,
  },
  default: {
    borderColor: '#E3F9EC',
    borderWidth: 1,
  },
};

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ status = 'default', style, ...props }, ref) => {
    const outlineStyle = inputStatusOutlineStyleMap[status] ?? inputStatusOutlineStyleMap.default;

    return (
      <TextInput
        ref={ref}
        style={[
          styles.textarea,
          outlineStyle,
          style,
        ]}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#97A3B9"
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

const styles = StyleSheet.create({
  textarea: {
    width: '100%',
    minHeight: 150,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: '#F3F7F6', // bg-secondary-200
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 2,
    color: '#232323',
  },
});
