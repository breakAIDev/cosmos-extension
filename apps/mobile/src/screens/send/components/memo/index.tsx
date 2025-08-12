import { useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { BTC_CHAINS, isAptosChain, isSolanaChain, isSuiChain } from '@leapwallet/cosmos-wallet-sdk';
import { Plus } from 'phosphor-react-native';
import Text from '../../../../components/text';
import { useSendContext } from '../../../send/context';
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export const Memo = ({ containerStyle }: { containerStyle?: StyleProp<ViewStyle> }) => {
  const { memo, setMemo, addressWarning, sendActiveChain } = useSendContext();
  const chains = useGetChains();

  if (
    isAptosChain(sendActiveChain) ||
    chains?.[sendActiveChain]?.evmOnlyChain ||
    BTC_CHAINS.includes(sendActiveChain) ||
    isSolanaChain(sendActiveChain) ||
    isSuiChain(sendActiveChain)
  ) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        value={memo}
        placeholder="Add memo"
        style={styles.input}
        onChangeText={setMemo}
        placeholderTextColor="#A0A2B1"
      />
      {memo.length === 0 ? (
        <Plus size={20} color="#A0A2B1" style={styles.plusIcon} />
      ) : (
        <TouchableOpacity onPress={() => setMemo('')}>
          <Text size="xs" color="text-muted-foreground" style={styles.clearText}>
            Clear
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E9F2', // replace with Colors.secondary100 if you have it
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    marginTop: 0,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#18191A', // Colors.monochrome if you have it
    backgroundColor: 'transparent',
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  plusIcon: {
    marginLeft: 8,
  },
  clearText: {
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#A0A2B1',
  },
});
