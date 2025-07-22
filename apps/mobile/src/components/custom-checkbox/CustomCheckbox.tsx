import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

type Props = {
  checked: boolean;
  onPress: () => void;
};

export const CustomCheckbox: React.FC<Props> = ({ checked, onPress }) => (
  <TouchableOpacity style={styles.checkbox} onPress={onPress}>
    {checked && <View style={styles.inner} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#224874',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  inner: {
    width: 14,
    height: 14,
    backgroundColor: '#224874',
    borderRadius: 3,
  },
});
