import React, { ReactNode } from 'react';
import { TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';

type IconActionButtonProps = {
  onPress?: () => void;
  children: ReactNode;
  title?: string; // Used for accessibility only
  style?: ViewStyle;
  disabled?: boolean;
};

export const IconActionButton = React.memo(
  ({ onPress, title, children, style, disabled }: IconActionButtonProps) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={title}
        accessibilityRole="button"
        disabled={disabled}
        activeOpacity={0.65}
        style={[
          styles.button,
          disabled ? styles.disabled : styles.enabled,
          style,
        ]}
      >
        {children}
      </TouchableOpacity>
    );
  }
);

IconActionButton.displayName = 'IconActionButton';

const styles = StyleSheet.create({
  button: {
    height: 24,
    width: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // default "bg-white-100"
  },
  enabled: {
    opacity: 1,
  },
  disabled: {
    opacity: 0.75,
  },
});
