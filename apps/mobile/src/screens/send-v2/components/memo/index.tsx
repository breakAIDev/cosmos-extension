import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { BTC_CHAINS, isAptosChain } from '@leapwallet/cosmos-wallet-sdk';
import { useSendContext } from '../../../send-v2/context';

export const Memo: React.FC = () => {
  const { memo, setMemo, addressWarning, sendActiveChain } = useSendContext();
  const chains = useGetChains();

  if (
    isAptosChain(sendActiveChain) ||
    chains?.[sendActiveChain]?.evmOnlyChain ||
    BTC_CHAINS.includes(sendActiveChain)
  ) {
    return null;
  }

  const isDisabled = addressWarning.type === 'link';

  return (
    <View style={[
      styles.container,
      isDisabled && styles.disabled,
    ]}>
      <Text style={styles.label}>Memo</Text>
      <TextInput
        value={memo}
        onChangeText={setMemo}
        editable={!isDisabled}
        placeholder="Required for CEX transfers..."
        placeholderTextColor="#6B7280"
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#F3F4F6', // bg-white-100
    marginBottom: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#6B7280', // text-gray-600
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: '500',
    fontSize: 13,
    backgroundColor: '#F9FAFB', // bg-gray-50
    color: '#111827', // text-black-100
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
