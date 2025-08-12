import { useDebounce } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants';
import { ActionInputWithPreview } from '../../components/action-input-with-preview';
import Tooltip from '../../components/better-tooltip';
import { Images } from '../../../assets/images';
import React, { useEffect, useState } from 'react';
import { getChainColor } from '../../theme/colors';
import { View, Text, Image, StyleSheet } from 'react-native';

export const MemoInput: React.FC<{
  memo: string;
  setMemo: (memo: string) => void;
  disabled: boolean;
  activeChain: SupportedChain;
}> = ({ memo, setMemo, disabled, activeChain }) => {
  const [input, setInput] = useState<string>(memo);

  const debouncedInputValue = useDebounce(input, 200);

  useEffect(() => {
    if (debouncedInputValue !== memo) {
      setMemo(debouncedInputValue);
    }
  }, [debouncedInputValue, memo, setMemo]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Memo</Text>
        <Tooltip
          content={
            <Text style={styles.tooltipText}>
              An optional short message that can be attached to a transaction, can be viewed by anyone.
            </Text>
          }
        >
          <View style={styles.iconWrap}>
            <Image source={{uri: Images.Misc.InfoCircle}} style={styles.icon} resizeMode="contain" />
          </View>
        </Tooltip>
      </View>
      <ActionInputWithPreview
        disabled={disabled}
        buttonText={input.trim().length > 0 ? 'Clear' : ''}
        rightElement={input.trim().length > 0 ? undefined : ' '}
        buttonTextColor={getChainColor(activeChain)}
        value={input}
        onChangeText={setInput}
        onAction={(_, action) => {
          if (action === 'clear') {
            setInput('');
            setMemo('');
          }
        }}
        action={input.trim().length > 0 ? 'clear' : 'save'}
      />
      <Text style={styles.hint}>
        {disabled ? 'The dApp has set the memo, you cannot change it' : 'Edit the memo here'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    backgroundColor: '#fff', // Adjust for dark mode if needed
    // You can add conditional theming here
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#6B7280', // text-gray-500
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.4,
    flexShrink: 0,
    // Adjust for dark mode if needed
  },
  tooltipText: {
    color: '#6B7280', // text-gray-500
    fontSize: 14,
    // Adjust for dark mode if needed
  },
  iconWrap: {
    position: 'relative',
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 18,
    height: 18,
  },
  hint: {
    color: '#374151', // text-gray-700
    fontSize: 12,
    textAlign: 'left',
    marginTop: 6,
    // Adjust for dark mode if needed
  },
});
