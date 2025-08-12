import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, GestureResponderEvent, StyleProp, View } from 'react-native';

export type Variant = 'default' | 'mono' | 'ghost' | 'action' | 'secondary' | 'destructive' | "text";
export type Size = 'default' | 'md' | 'slim' | 'sm' | 'icon' | 'iconSm' | 'action';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
} 

export const Button = forwardRef(
  (
    {
      children,
      variant = 'default',
      size = 'default',
      onPress,
      disabled,
      style,
      textStyle,
      testID,
      ...props
    }: ButtonProps,
    ref: React.Ref<View>
  ) => {
    const variantStyle = buttonVariantStyles[variant] || buttonVariantStyles.default;
    const sizeStyle = buttonSizeStyles[size] || buttonSizeStyles.default;
    const textColor = variantTextColor[variant] || '#fff';

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.base,
          variantStyle,
          sizeStyle,
          disabled && styles.disabled,
          style,
        ]}
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={[styles.text, { color: textColor }, textStyle]}>{children}</Text>
        ) : (
          React.isValidElement(children) ? children : null
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

// --- Styles ---

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    fontWeight: 'bold',
    gap: 8, // Not natively supported in RN, use marginRight on icon/text if needed
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

// Variant styles
const buttonVariantStyles: Record<Variant, ViewStyle> = {
  default: {
    backgroundColor: '#2563EB', // primary
  },
  mono: {
    backgroundColor: '#F3F4F6', // monochrome
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  action: {
    backgroundColor: '#059669', // accent-green-700
  },
  secondary: {
    backgroundColor: '#E5E7EB', // secondary-300
  },
  destructive: {
    backgroundColor: '#FF4D4F',
  },
};

const variantTextColor: Record<Variant, string> = {
  default: '#fff',
  mono: '#374151',
  ghost: '#6B7280',
  action: '#D1FAE5',
  secondary: '#222',
  destructive: '#fff',
};

// Size styles
const buttonSizeStyles: Record<Size, ViewStyle> = {
  default: {
    height: 52,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  md: {
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  slim: {
    height: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sm: {
    height: 32,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  icon: {
    height: 48,
    width: 48,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSm: {
    height: 32,
    width: 32,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  action: {
    height: 28,
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
};
