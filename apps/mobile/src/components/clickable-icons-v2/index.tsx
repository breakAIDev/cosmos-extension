import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native';

type ClickableIconProps = {
  disabled?: boolean;
  label: string;
  icon: React.ElementType;
  darker?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: any;
  iconProps?: any;
};

const ClickableIcon = React.forwardRef<TouchableOpacity, ClickableIconProps>(
  ({ disabled, icon: Icon, label, onPress, style, iconProps, darker, ...rest }, ref) => {
    return (
      <View style={[styles.container, disabled && styles.disabled, style]}>
        <TouchableOpacity
          ref={ref}
          activeOpacity={0.7}
          disabled={disabled}
          style={[
            styles.button,
            darker ? styles.buttonDarker : null,
          ]}
          onPress={onPress}
          {...rest}
        >
          {/* You can pass iconProps for custom color/size */}
          <Icon width={24} height={24} {...iconProps} />
        </TouchableOpacity>
        {label ? (
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        ) : null}
      </View>
    );
  }
);

ClickableIcon.displayName = 'ClickableIcon';

export default ClickableIcon;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    opacity: 1,
    minWidth: 64,
  },
  disabled: {
    opacity: 0.4,
  },
  button: {
    width: 52,           // 3.25rem
    height: 52,          // 3.25rem
    borderRadius: 26,
    backgroundColor: '#F5F7FB', // secondary-100
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  buttonDarker: {
    backgroundColor: '#E9EEF7', // secondary-200 or your darker color
  },
  label: {
    marginTop: 8,        // mt-2
    textAlign: 'center',
    fontSize: 15,        // text-sm
    fontWeight: 'bold',
    color: '#222B45',
    letterSpacing: 0.2,
    minHeight: 22,
  },
});
