import { useAddCustomChannel, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { useSendContext } from '../../../send-v2/context';
import React, { useCallback, useState } from 'react';
import { View, TextInput, Text, StyleSheet, Keyboard } from 'react-native';

type AddIBCChannelProps = {
  targetChain: string;
  onAddComplete: (value: string) => void;
};

const AddIBCChannel: React.FC<AddIBCChannelProps> = ({ targetChain, onAddComplete }) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const { sendActiveChain } = useSendContext();
  const addCustomChannel = useAddCustomChannel({
    targetChain,
  });

  const { chains } = useChainsStore();
  const activeChainInfo = chains[sendActiveChain];

  const handleAddChannel = useCallback(
    async (channelId: string) => {
      if (!channelId) return;
      setStatus('loading');
      try {
        const result = await addCustomChannel(channelId);
        if (result.success) {
          onAddComplete(result.channel);
          setValue('');
          setStatus('success');
          setMessage(result.message);
          Keyboard.dismiss();
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (e) {
        setStatus('error');
        setMessage('Something went wrong');
      }
    },
    [addCustomChannel, onAddComplete],
  );

  return (
    <View>
      <TextInput
        value={value}
        keyboardType="numeric"
        placeholder="Source channel ID"
        placeholderTextColor="#6B7280"
        style={styles.input}
        onChangeText={(text) => {
          setValue(text);
          if (status === 'error') {
            setStatus('idle');
            setMessage('');
          }
        }}
        onSubmitEditing={() => handleAddChannel(value)}
        returnKeyType="done"
        textAlign="right"
      />
      <Text style={styles.hint}>
        You can enter <Text style={styles.hintHighlight}>24</Text> for <Text style={styles.hintHighlight}>channel-24</Text> on {activeChainInfo.chainName}
      </Text>
      {status === 'error' && <Text style={styles.errorMsg}>{message}</Text>}
      {status === 'success' && <Text style={styles.successMsg}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontWeight: '500',
    fontSize: 16,
    backgroundColor: '#F9FAFB', // bg-gray-50
    color: '#111827',           // text-black-100
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    color: '#6B7280', // text-gray-600
  },
  hintHighlight: {
    fontWeight: '500',
    color: '#1F2937', // text-gray-800
  },
  errorMsg: {
    fontSize: 12,
    marginTop: 8,
    color: '#F87171', // text-red-300
    fontWeight: '500',
  },
  successMsg: {
    fontSize: 12,
    marginTop: 8,
    color: '#86EFAC', // text-green-300
    fontWeight: '500',
  },
});

export default AddIBCChannel;
