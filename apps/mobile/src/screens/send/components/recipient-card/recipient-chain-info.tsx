import { useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { isAptosChain, isSolanaChain, isSuiChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Info } from 'phosphor-react-native';
import { SHOW_ETH_ADDRESS_CHAINS } from '../../../../services/config/constants';
import { useSendContext } from '../../../send/context';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function RecipientChainInfo() {
  const { sendActiveChain, addressError, selectedAddress } = useSendContext();
  const chains = useGetChains();

  const sendChainEcosystem = useMemo(() => {
    if (
      isAptosChain(sendActiveChain) ||
      isSuiChain(sendActiveChain) ||
      chains?.[sendActiveChain]?.evmOnlyChain ||
      isSolanaChain(sendActiveChain)
    ) {
      return chains?.[sendActiveChain]?.chainName ?? sendActiveChain;
    }
    if (
      SHOW_ETH_ADDRESS_CHAINS.includes(sendActiveChain) &&
      (!!selectedAddress?.ethAddress?.startsWith('0x') || !!selectedAddress?.address?.startsWith('0x'))
    ) {
      return chains?.[sendActiveChain]?.chainName ?? sendActiveChain;
    }
    if (!!selectedAddress?.address?.startsWith('init') && selectedAddress?.chainName) {
      return chains?.[selectedAddress?.chainName as SupportedChain]?.chainName ?? sendActiveChain;
    }
    return undefined;
  }, [sendActiveChain, chains, selectedAddress?.ethAddress, selectedAddress?.address, selectedAddress?.chainName]);

  if (!sendChainEcosystem || addressError) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.separator} />
      <View style={styles.infoRow}>
        <Info size={16} color="#1877F2" style={styles.infoIcon} />
        <Text style={styles.infoText}>
          This token will be sent to “{sendChainEcosystem}”
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    flexDirection: 'column',
    gap: 12,
  },
  separator: {
    backgroundColor: '#DDE4EF', // You can replace with Colors.secondary300 if you have it
    height: 1,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  infoIcon: {
    minWidth: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1877F2', // You can replace with Colors.accentBlue
    fontWeight: '500',
    lineHeight: 19,
    flexShrink: 1,
  },
});
