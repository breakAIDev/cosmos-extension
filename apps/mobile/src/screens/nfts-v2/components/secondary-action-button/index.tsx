import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet } from 'react-native';

type SecondaryActionButtonProps = {
  
  onClick: (e: React.MouseEvent) => void;
  leftIcon?: string;
  className?: string;
  actionLabel: string;
  
} & React.PropsWithChildren<any>;

export const SecondaryActionButton = ({
  actionLabel,
  leftIcon,
  onPress,
  children,
  style,
}: SecondaryActionButtonProps) => {
  return (
    <TouchableOpacity
      accessibilityLabel={actionLabel}
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {leftIcon && (
        <Image
          source={typeof leftIcon === 'string' ? { uri: leftIcon } : leftIcon}
          style={styles.icon}
          resizeMode="contain"
        />
      )}
      <View>{children}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    backgroundColor: 'white',
    // Add more as needed for dark mode, etc.
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
});
