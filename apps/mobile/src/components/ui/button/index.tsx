import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';

type ButtonVariant = {
  backgroundColor: string;
  textColor: string;
};

type VariantType =
  | 'default'
  | 'mono'
  | 'ghost'
  | 'action'
  | 'secondary'
  | 'destructive';

type ButtonVariants = Record<VariantType, ButtonVariant>;

type ButtonSize = {
  height: number;
  paddingHorizontal?: number;
  fontSize: number;
  borderRadius: number;
  width?: number; // for icon/iconSm
};

type SizeType = 'default' | 'md' | 'slim' | 'sm' | 'icon' | 'iconSm' | 'action';

type ButtonSizes = Record<SizeType, ButtonSize>;

const BUTTON_VARIANTS: ButtonVariants = {
  default: {
    backgroundColor: '#3664F4',
    textColor: '#fff',
  },
  mono: {
    backgroundColor: '#ededed',
    textColor: '#232323',
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: '#69788A',
  },
  action: {
    backgroundColor: '#26c06f',
    textColor: '#fff',
  },
  secondary: {
    backgroundColor: '#f5f5f5',
    textColor: '#69788A',
  },
  destructive: {
    backgroundColor: '#FFE8E7',
    textColor: '#E2655A',
  },
};

const BUTTON_SIZES: ButtonSizes = {
  default: {
    height: 52,
    paddingHorizontal: 24,
    fontSize: 16,
    borderRadius: 999,
  },
  md: {
    height: 44,
    paddingHorizontal: 16,
    fontSize: 15,
    borderRadius: 999,
  },
  slim: {
    height: 38,
    paddingHorizontal: 12,
    fontSize: 15,
    borderRadius: 999,
  },
  sm: {
    height: 32,
    paddingHorizontal: 12,
    fontSize: 13,
    borderRadius: 999,
  },
  icon: {
    height: 48,
    width: 48,
    fontSize: 16,
    borderRadius: 999,
    paddingHorizontal: 0,
  },
  iconSm: {
    height: 36,
    width: 36,
    fontSize: 14,
    borderRadius: 999,
    paddingHorizontal: 0,
  },
  action: {
    height: 28,
    paddingHorizontal: 8,
    fontSize: 13,
    borderRadius: 999,
  },
};

export interface ButtonProps {
  children?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: VariantType;
  size?: SizeType;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  style,
  textStyle,
  disabled,
  loading,
  ...rest
}: ButtonProps) {
  const v = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.default;
  const s = BUTTON_SIZES[size] || BUTTON_SIZES.default;

  const content = loading ? (
    <ActivityIndicator color={v.textColor} />
  ) : (
    <Text
      style={[
        styles.text,
        { color: v.textColor, fontSize: s.fontSize },
        textStyle,
      ]}
    >
      {children}
    </Text>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: v.backgroundColor,
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
          opacity: disabled ? 0.5 : 1,
          ...(s.width ? { width: s.width } : {}),
        },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.85}
      {...rest}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 48,
    marginVertical: 2,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
