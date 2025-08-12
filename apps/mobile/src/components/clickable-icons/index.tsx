import React, { forwardRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ClickableIconProps {
  disabled?: boolean;
  label: string;
  icon: React.ElementType;
  onPress?: () => void;
  style?: any;
  testID?: string;
}

const ClickableIcon = forwardRef(
  ({ disabled, icon: Icon, label, style, onPress, testID }: ClickableIconProps,
     ref: React.Ref<View>) => {
    return (
      <View style={[styles.iconWrapper, disabled && styles.disabled]}>
        <TouchableOpacity
          ref={ref}
          style={[styles.button, style]}
          disabled={disabled}
          onPress={onPress}
          activeOpacity={0.7}
          testID={testID}
        >
          <Icon width={22} height={22} /> {/* Pass size as needed */}
        </TouchableOpacity>
        {!!label && (
          <Text style={styles.label}>{label}</Text>
        )}
      </View>
    );
  }
);

ClickableIcon.displayName = 'ClickableIcon';

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  disabled: {
    opacity: 0.4,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6', // Adjust to your secondary-100
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 22,
    textAlign: 'center',
    color: '#222', // Adjust as needed
  },
});

export default ClickableIcon;
