import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Keyboard,
} from 'react-native';
import { useAddCustomChannel, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useSendContext } from '../../../send/context';

type RadioOption = { title: string; subTitle?: string; value: string };

type RadioGroupProps = {
  options: RadioOption[];
  selectedOption: string;
  onChange: (value: string) => void;
  themeColor?: string;
  isAddChannel?: boolean;
  targetChain: SupportedChain;
  hasChannelId: boolean;
};

const RadioGroupSend: React.FC<RadioGroupProps> = ({
  options,
  selectedOption,
  onChange,
  themeColor = '#2196F3',
  isAddChannel,
  hasChannelId,
  targetChain,
}) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const isCustomSelected = value !== '' && status === 'success';

  const { sendActiveChain } = useSendContext();
  const addCustomChannel = useAddCustomChannel({
    sourceChain: sendActiveChain,
    targetChain,
  });

  const { chains } = useChainsStore();
  const activeChainInfo = chains[sendActiveChain];

  const handleAddChannel = useCallback(
    async (channelId: string) => {
      setStatus('loading');
      try {
        const result = await addCustomChannel(channelId);
        if (result.success) {
          onChange(result.channel);
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
    [addCustomChannel, onChange],
  );

  useEffect(() => {
    if (value) {
      handleAddChannel(value);
    } else {
      setStatus('idle');
      setMessage('');
    }
  }, [value, handleAddChannel]);

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selectedOption === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              { paddingVertical: option.subTitle ? 8 : 12 }
            ]}
            activeOpacity={0.7}
            onPress={() => {
              onChange(option.value);
              setValue('');
              Keyboard.dismiss();
            }}
          >
            <View
              style={[
                styles.radioOuter,
                isSelected && { borderColor: themeColor, shadowOpacity: 0.1 }
              ]}
            >
              {isSelected && <View style={[styles.radioInner, { backgroundColor: themeColor }]} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              {!!option.subTitle && (
                <Text style={styles.optionSubTitle}>{option.subTitle}</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      {(isAddChannel || !hasChannelId) && (
        <View style={styles.customOptionContainer}>
          <View style={styles.customRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.radioOuter,
                isCustomSelected && { borderColor: themeColor, shadowOpacity: 0.1 }
              ]}
            >
              {isCustomSelected && <View style={[styles.radioInner, { backgroundColor: themeColor }]} />}
            </TouchableOpacity>
            <TextInput
              value={value}
              onChangeText={(text) => {
                setValue(text.replace(/[^0-9]/g, '')); // only allow numbers
                if (status === 'error') {
                  setStatus('idle');
                  setMessage('');
                }
              }}
              keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
              placeholder="Enter source channel ID"
              style={styles.input}
              placeholderTextColor="#A0A3B1"
              onFocus={() => {
                setStatus('idle');
                setMessage('');
              }}
              clearButtonMode="while-editing"
            />
          </View>
          <Text style={styles.infoText}>
            You can enter <Text style={styles.infoHighlight}>24</Text> for{' '}
            <Text style={styles.infoHighlight}>channel-24</Text> on {activeChainInfo.chainName}
          </Text>
          {status === 'error' && (
            <Text style={styles.errorMsg}>{message}</Text>
          )}
          {status === 'success' && (
            <Text style={styles.successMsg}>{message}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'column', width: '100%' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 0,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C5CAD4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    backgroundColor: '#fff',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    opacity: 1,
  },
  optionTitle: {
    fontWeight: '500',
    fontSize: 15,
    color: '#232940',
  },
  optionSubTitle: {
    fontSize: 12,
    color: '#8C94A6',
    marginTop: 2,
  },
  customOptionContainer: {
    paddingVertical: 5,
    marginTop: 8,
    marginBottom: 0,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 0,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F7F7FA',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#232940',
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginLeft: 12,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    marginTop: 6,
    color: '#8C94A6',
  },
  infoHighlight: {
    fontWeight: '500',
    color: '#232940',
  },
  errorMsg: {
    fontSize: 12,
    marginTop: 6,
    color: '#E57373',
    fontWeight: '500',
  },
  successMsg: {
    fontSize: 12,
    marginTop: 6,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default RadioGroupSend;
