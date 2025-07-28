import { Input } from '@leapwallet/leap-ui';
import { View, StyleSheet  } from 'react-native';
import React from 'react';

type Props = {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default function CreateWalletInput({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Input
        data-testing-id='input-enter-wallet-name'
        placeholder='Enter wallet Name'
        maxLength={24}
        value={value}
        onChange={onChange}
      />
      <View style={styles.charCount}>{`${value.length}/24`}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
    minHeight: 48,
  },
  input: {
    height: 48,
    paddingLeft: 16,
    paddingRight: 56, // leave space for char counter
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    borderRadius: 10,
    backgroundColor: '#F9FAFB', // subtle bg
    fontSize: 16,
    fontWeight: '500',
    color: '#222B45',
  },
  charCount: {
    position: 'absolute',
    right: 16,
    top: 14,
    color: '#A3A3A3', // gray-400
    fontSize: 14,
    fontWeight: '500',
  },
});
