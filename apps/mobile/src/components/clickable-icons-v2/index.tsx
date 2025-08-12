import React, { forwardRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface ClickableIconProps {
  disabled?: boolean;
  label: string;
  icon: React.ElementType;
  darker?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
  testID?: string;
}

const ClickableIcon = forwardRef(
  (
    { disabled, icon: Icon, label, darker = false, style, onPress, testID, ...rest }: ClickableIconProps,
    ref: React.Ref<View>
  ) => {
    return (
      <View
        style={[
          styles.container,
          disabled && styles.disabled,
        ]}
      >
        <TouchableOpacity
          ref={ref}
          {...rest}
          style={[
            styles.button,
            darker ? styles.darker : styles.lighter,
            style,
          ]}
          disabled={disabled}
          onPress={onPress}
          activeOpacity={0.7}
          testID={testID}
        >
          <Icon width={24} height={24} />
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
  container: {
    flexDirection: 'column',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  lighter: {
    backgroundColor: '#F3F4F6', // Tailwind's bg-secondary-100
  },
  darker: {
    backgroundColor: '#E5E7EB', // Tailwind's bg-secondary-200 or a bit darker
  },
  label: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: 'bold',
    letterSpacing: 0.3,
    textAlign: 'center',
    color: '#222',
  },
});

export default ClickableIcon;
