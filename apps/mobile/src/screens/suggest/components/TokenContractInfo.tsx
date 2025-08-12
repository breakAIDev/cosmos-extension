import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider, Key, Value } from '../../../components/dapp';
import { Colors } from '../../../theme/colors';

type TokenContractInfoProps = {
  name: string;
  symbol: string;
  decimals: number;
};

export function TokenContractInfo({ name, symbol, decimals }: TokenContractInfoProps) {
  return (
    <View style={styles.container}>
      <Key>Coin Name</Key>
      <Value>{name}</Value>
      {Divider}

      <Key>Coin Symbol</Key>
      <Value>{symbol}</Value>
      {Divider}

      <Key>Coin Decimals</Key>
      <Value>{decimals}</Value>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.white100, // swap via theme for dark mode if needed
    borderRadius: 16, // rounded-2xl
    padding: 16, // p-4
    rowGap: 10 as any, // RN supports gap on newer versions; if not, add margins to children
  },
});
