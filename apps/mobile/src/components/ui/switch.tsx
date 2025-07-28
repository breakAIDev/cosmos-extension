import React from 'react';
import { Switch as RNSwitch, StyleSheet, View, Platform } from 'react-native';

type SwitchProps = {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  style?: any;
  thumbColor?: string;
  trackColor?: { false: string; true: string };
};

export const Switch = ({
  value,
  onValueChange,
  disabled,
  style,
  thumbColor,
  trackColor,
}: SwitchProps) => {
  // Default colors (feel free to adjust!)
  const activeTrack = '#3664F4';    // bg-primary
  const inactiveTrack = '#E6EAEF';  // bg-input
  const activeThumb = '#fff';       // bg-background
  const inactiveThumb = '#fff';     // bg-foreground

  return (
    <View style={[styles.container, style]}>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={trackColor || { false: inactiveTrack, true: activeTrack }}
        thumbColor={Platform.OS === 'android' ? (value ? activeThumb : inactiveThumb) : undefined}
        ios_backgroundColor={inactiveTrack}
        style={styles.switch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Optional container styling if you want custom shadow or border
    height: 24,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    transform: [{ scaleX: 1.05 }, { scaleY: 1.05 }],
  },
});
