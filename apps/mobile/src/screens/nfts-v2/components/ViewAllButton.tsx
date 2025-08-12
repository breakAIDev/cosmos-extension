import { useChainPageInfo } from '../../../hooks';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export function ViewAllButton({ onPress }: { onPress: VoidFunction }) {
  const { topChainColor } = useChainPageInfo();

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.buttonText, { color: topChainColor }]}>
        View all
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexBasis: '100%', // Makes it span the grid (col-span-2 equivalent)
    alignItems: 'center',
    paddingVertical: 10,
    marginVertical: 4,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
