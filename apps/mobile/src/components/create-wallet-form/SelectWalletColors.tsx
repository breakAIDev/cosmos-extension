import { Check } from 'phosphor-react-native';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';

import { walletColors } from '../../theme/colors';

type Props = {
  
  selectColorIndex: (index: number) => void;
  colorIndex: number;
};

export default function SelectWalletColors({ selectColorIndex, colorIndex }: Props) {
  return (
    <View style={styles.container}>
      {walletColors.map((color, index) => {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => {
              selectColorIndex(index);
            }}
            style={[
              styles.colorWrapper,
              colorIndex === index && { borderColor: color, borderWidth: 2 },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[styles.colorCircle, { backgroundColor: color }]}
            >
              {index === colorIndex && <Check size={12} className='text-white-100' />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // use gap if supported, otherwise marginRight on child
    justifyContent: 'center',
  },
  colorWrapper: {
    padding: 4,
    borderRadius: 999,
    borderWidth: 0,
    borderColor: 'transparent',
    marginRight: 8,
  },
  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});