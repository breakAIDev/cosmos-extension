import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
// Import your Cosmos utilities as you do on web:
import { sliceAddress } from '@leapwallet/cosmos-wallet-hooks';
import { generateWalletFromPrivateKey, getFullHDPath } from '@leapwallet/leap-keychain';
import { chainInfoStore } from '../../../context/chain-infos-store';
import { validatePrivateKey } from '../../../utils/validateSeedPhrase';

import { TextareaWithPaste } from './textarea-with-paste'; // Implement this for RN

type PrivateKeyInputProps = {
  onChange: (value: string) => void;
  value: string;
  error?: string;
};

export const PrivateKeyInput = ({ onChange, value, error }: PrivateKeyInputProps) => {
  const addressToDisplay = useMemo(() => {
    if (!value) return '';

    const { valid, correctedSecret } = validatePrivateKey(value);
    if (!valid) return '';

    const chain = chainInfoStore.chainInfos.seiTestnet2;
    if (!chain) return '';

    try {
      const wallet = generateWalletFromPrivateKey(
        correctedSecret,
        getFullHDPath(chain?.useBip84 ? '84' : '44', chain?.bip44.coinType, '0'),
        'cosmos',
        chain.btcNetwork,
      );

      const account = wallet?.getAccounts?.()?.[0];
      if (!account) return '';

      return sliceAddress(account.address);
    } catch (error) {
      return '';
    }
  }, [value]);

  return (
    <View style={{ width: '100%' }}>
      <TextareaWithPaste
        autoFocus
        placeholder="Enter private key"
        style={styles.textarea}
        value={value}
        onChange={onChange}
        error={error}
      />

      {error ? (
        <Animatable.Text
          animation="fadeInDown"
          duration={150}
          style={styles.errorText}
        >
          {error}
        </Animatable.Text>
      ) : addressToDisplay ? (
        <Animatable.View
          animation="fadeInDown"
          duration={150}
          style={styles.accountRow}
        >
          <Text style={styles.label}>Account address</Text>
          <Text style={styles.address}>{addressToDisplay}</Text>
        </Animatable.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  textarea: {
    width: '100%',
    minHeight: 150,
    padding: 14,
    fontSize: 16,
    borderRadius: 14,
    backgroundColor: '#F3F7F6',
    borderColor: '#E3F9EC',
    borderWidth: 1,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  errorText: {
    color: '#E2655A',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  label: {
    color: '#97A3B9',
    fontSize: 14,
    fontWeight: '500',
  },
  address: {
    color: '#232323',
    fontSize: 15,
    fontWeight: '600',
  },
});
