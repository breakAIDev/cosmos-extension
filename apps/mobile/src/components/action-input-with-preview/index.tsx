import React, { useEffect, useState, forwardRef } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text, Platform } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { hex2rgba } from '../../utils/hextorgba';

interface ActionInputProps {
  action: string;
  buttonText: string;
  buttonTextColor?: string;
  icon?: any; // Should be a React Native image source or icon component
  value: string;
  onAction: (action: string, value: string) => void;
  onChangeText: (e: string) => void;
  placeholder?: string;
  style?: any;
  preview?: React.ReactNode;
  invalid?: boolean;
  warning?: boolean;
  rightElement?: React.ReactNode;
  disabled?: boolean;
  autoComplete?: any;
  spellCheck?: boolean | undefined;
}
export const ActionInputWithPreview = forwardRef(
  (
    {
      action,
      buttonText,
      buttonTextColor,
      icon,
      value,
      onChangeText,
      onAction,
      placeholder = '',
      style,
      preview,
      invalid = false,
      warning = false,
      rightElement,
      disabled = false,
      autoComplete,
      spellCheck,
    }: ActionInputProps,
    ref: React.Ref<TextInput>
  ) => {
    const [showPreview, setShowPreview] = useState(preview !== undefined);

    // If preview disappears, hide preview
    useEffect(() => {
      if (!preview) setShowPreview(false);
    }, [preview, value]);

    const handleFocus = () => setShowPreview(false);
    const handleButtonClick = () => onAction && onAction(action, value);

    return (
      <View style={[styles.relative, style]}>
        <AnimatePresence>
          {preview !== undefined && showPreview ? (
            <MotiView
              key="preview"
              from={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'timing', duration: 180 }}
              style={[
                styles.preview,
                invalid && styles.borderRed,
                warning && styles.borderYellow,
                !invalid && !warning && styles.borderTransparent,
              ]}
              onTouchEnd={() => setShowPreview(false)}
            >
              {React.isValidElement(preview) ? preview : <View/>}
            </MotiView>
          ) : (
            <MotiView
              key="input"
              from={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'timing', duration: 180 }}
              style={[
                styles.inputWrapper,
                invalid && styles.borderRed,
                warning && styles.borderYellow,
                !invalid && !warning && styles.borderGray,
                disabled && styles.disabled,
              ]}
            >
              <TextInput
                ref={ref}
                style={[styles.input, disabled && styles.inputDisabled]}
                value={value}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                placeholder={placeholder}
                placeholderTextColor="#a1a1aa"
                editable={!disabled}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={autoComplete}
                spellCheck={spellCheck}
              />
            </MotiView>
          )}
        </AnimatePresence>
        <View style={styles.rightElement}>
          {React.isValidElement(rightElement) ? (
            rightElement
          ) : !disabled ? (
            icon ? (
              <TouchableOpacity
                onPress={handleButtonClick}
                style={styles.iconButton}
                accessibilityLabel={action}
                hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
              >
                <Image source={{uri: icon}} style={styles.icon} />
              </TouchableOpacity>
            ) : buttonText ? (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: buttonTextColor
                      ? hex2rgba(buttonTextColor, 0.1)
                      : '#f3f4f6',
                  },
                ]}
                onPress={handleButtonClick}
                disabled={disabled}
              >
                <Text
                  style={{
                    color: buttonTextColor || '#222',
                    fontSize: 12,
                    fontWeight: '500',
                    textTransform: 'capitalize',
                  }}
                >
                  {buttonText}
                </Text>
              </TouchableOpacity>
            ) : null
          ) : null}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  relative: {
    position: 'relative',
    width: '100%',
    marginBottom: 0,
  },
  preview: {
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    paddingHorizontal: 16,
    minHeight: 42,
    justifyContent: 'center',
    width: '100%',
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    paddingHorizontal: 16,
    minHeight: 42,
    justifyContent: 'center',
    width: '100%',
  },
  input: {
    fontSize: 16,
    color: '#222',
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    width: '100%',
  },
  inputDisabled: {
    color: '#9ca3af',
  },
  borderRed: {
    borderColor: '#fca5a5',
  },
  borderYellow: {
    borderColor: '#f59e42',
  },
  borderTransparent: {
    borderColor: 'transparent',
  },
  borderGray: {
    borderColor: '#d1d5db',
  },
  disabled: {
    backgroundColor: '#f3f4f6',
  },
  rightElement: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    flexDirection: 'row',
  },
  iconButton: {
    borderRadius: 999,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  icon: {
    width: 18,
    height: 18,
  },
  button: {
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});