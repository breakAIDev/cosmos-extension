import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Check } from 'phosphor-react-native';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  style?: any;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled,
  style,
}) => {
  return (
    <Pressable
      style={[
        styles.box,
        checked && styles.checkedBox,
        disabled && styles.disabled,
        style,
      ]}
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      {checked && (
        <Check size={16} weight="bold" color="#F3F7F6" /> {/* White/secondary-300 */}
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 20, // h-4 w-4
    height: 20,
    borderRadius: 4, // rounded-sm
    borderWidth: 2,
    borderColor: '#26c06f', // border-accent-green
    backgroundColor: '#E6EAEF', // bg-secondary-300
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  checkedBox: {
    backgroundColor: '#26c06f', // bg-accent-green
    borderColor: '#26c06f',
  },
  disabled: {
    opacity: 0.5,
  },
});
