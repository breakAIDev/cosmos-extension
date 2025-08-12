import { useAddCustomChannel, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { useSendContext } from '../../../send/context';
import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';

type AddIBCChannelProps = {
  targetChain: string;
  onAddComplete: (value: string) => void;
  value: string;
  setValue: (value: string) => void;
};

const AddIBCChannel: React.FC<AddIBCChannelProps> = ({
  targetChain,
  onAddComplete,
  value,
  setValue,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const { sendActiveChain } = useSendContext();
  const addCustomChannel = useAddCustomChannel({ targetChain });
  const { chains } = useChainsStore();
  const activeChainInfo = chains[sendActiveChain];

  const handleAddChannel = useCallback(
    async (channelId: string) => {
      setStatus('loading');
      try {
        const result = await addCustomChannel(channelId);
        if (result.success) {
          onAddComplete(result.channel);
          setValue('');
          setStatus('success');
          setMessage(result.message);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (e) {
        setStatus('error');
        setMessage('Something went wrong');
      }
    },
    [addCustomChannel, onAddComplete, setValue],
  );

  return (
    <View style={{ width: '100%' }}>
      <TextInput
        value={value}
        placeholder="Source channel ID"
        onChangeText={(text) => {
          setValue(text.replace(/[^0-9]/g, ''));
          if (status === 'error') {
            setStatus('idle');
            setMessage('');
          }
        }}
        keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        style={styles.input}
        placeholderTextColor="#A0A3B1"
        onKeyPress={() => value && handleAddChannel(value)}
        // onSubmitEditing will fire when enter is pressed
        onSubmitEditing={() => value && handleAddChannel(value)}
        returnKeyType="done"
      />
      <Text style={styles.info}>
        You can enter{' '}
        <Text style={styles.infoStrong}>24</Text> for{' '}
        <Text style={styles.infoStrong}>channel-24</Text> on {activeChainInfo.chainName}
      </Text>
      {status === 'error' ? (
        <Text style={styles.error}>{message}</Text>
      ) : null}
      {status === 'success' ? (
        <Text style={styles.success}>{message}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontWeight: '500',
    backgroundColor: '#F7F7FA',
    color: '#232940',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginBottom: 6,
    textAlign: 'right',
  },
  info: {
    fontSize: 12,
    marginTop: 2,
    color: '#8C94A6',
  },
  infoStrong: {
    fontWeight: '500',
    color: '#232940',
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    color: '#E57373',
    fontWeight: '500',
  },
  success: {
    fontSize: 12,
    marginTop: 6,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default AddIBCChannel;
