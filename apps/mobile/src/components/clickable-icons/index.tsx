import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native';

type ClickableIconProps = {
  disabled?: boolean;
  label: string;
  icon: React.ElementType;
  onPress?: (event: GestureResponderEvent) => void;
  style?: any;
  iconProps?: any; // Pass props to your icon component
};

const ClickableIcon = React.forwardRef<TouchableOpacity, ClickableIconProps>(
  ({ disabled, icon: Icon, label, onPress, style, iconProps, ...rest }, ref) => {
    return (
      <View style={[styles.container, disabled && styles.disabled, style]}>
        <TouchableOpacity
          ref={ref}
          activeOpacity={0.7}
          disabled={disabled}
          style={styles.button}
          onPress={onPress}
          {...rest}
        >
          {/* If using react-native-vector-icons, pass iconProps as needed */}
          <Icon width={22} height={22} color="#222B45" {...iconProps} />
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
    minWidth: 60,
  },
  disabled: {
    opacity: 0.4,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F7FB', // secondary-100
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    // Optionally: Add shadow for iOS/Android
    // shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity:0.04, elevation:2
  },
  label: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: '#222B45',
    letterSpacing: 0.2,
    minHeight: 22,
  },
});
