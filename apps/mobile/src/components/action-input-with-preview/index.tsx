import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons'; // or your icon library
import { hex2rgba } from '../../utils/hextorgba';

interface ActionInputProps {
  action: string;
  buttonText: string;
  buttonTextColor?: string;
  icon?: any; // Should be a React Native image source or icon component
  value: string;
  onAction: (action: string, value: string) => void;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: any;
  preview?: React.ReactNode;
  invalid?: boolean;
  warning?: boolean;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

export const ActionInputWithPreview = React.forwardRef<TextInput, ActionInputProps>(
  (
    {
      buttonText,
      buttonTextColor,
      icon,
      value,
      onChange,
      onAction,
      action,
      placeholder = '',
      style = {},
      preview,
      invalid = false,
      warning = false,
      rightElement,
      disabled = false,
    },
    ref,
  ) => {
    const [showPreview, setShowPreview] = useState(true);

    // Optional: Use Animated for fade transitions
    // Skipped for simplicity

    return (
      <View style={[styles.container, style]}>
        {preview !== undefined && showPreview ? (
          <TouchableOpacity
            style={[
              styles.previewBox,
              invalid && styles.invalid,
              warning && styles.warning,
            ]}
            onPress={() => setShowPreview(false)}
            activeOpacity={0.8}
            disabled={disabled}
          >
            {typeof preview === 'string' ? <Text>{preview}</Text> : preview}
          </TouchableOpacity>
        ) : (
          <TextInput
            ref={ref}
            style={[
              styles.input,
              invalid && styles.invalid,
              warning && styles.warning,
              disabled && styles.disabled,
            ]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            editable={!disabled}
            placeholderTextColor="#999"
            // testID or accessibilityLabel if needed
          />
        )}
        <View style={styles.rightElement}>
          {rightElement ? (
            rightElement
          ) : !disabled ? (
            icon ? (
              <TouchableOpacity
                onPress={() => onAction(action, value)}
                style={styles.iconBtn}
                accessibilityLabel={action}
              >
                {/* If icon is a local asset */}
                {/* <Image source={icon} style={{ width: 24, height: 24 }} /> */}
                {/* Or if using vector icons */}
                {/* <Icon name={icon} size={24} color={buttonTextColor || '#000'} /> */}
                {icon}
              </TouchableOpacity>
            ) : buttonText ? (
              <TouchableOpacity
                style={[
                  styles.button,
                  buttonTextColor && {
                    backgroundColor: hex2rgba(buttonTextColor, 0.1),
                  },
                ]}
                onPress={() => onAction(action, value)}
              >
                <Text style={[styles.buttonText, buttonTextColor && { color: buttonTextColor }]}>
                  {buttonText}
                </Text>
              </TouchableOpacity>
            ) : null
          ) : null}
        </View>
      </View>
    );
  },
);

ActionInputWithPreview.displayName = 'ActionInput';

// ------ Styles -------
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    marginVertical: 8,
  },
  previewBox: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    color: '#222',
    paddingLeft: 16,
    paddingRight: 60,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
  },
  rightElement: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  iconBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
  },
  button: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  invalid: {
    borderColor: '#ef4444', // red
  },
  warning: {
    borderColor: '#eab308', // yellow
  },
  disabled: {
    backgroundColor: '#eee',
    color: '#aaa',
  },
});

export default ActionInputWithPreview;
