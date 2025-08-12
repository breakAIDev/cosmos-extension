import React, { useCallback } from 'react';
import { View, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Text from '../../../components/text';
import { AGGREGATED_CHAIN_KEY } from '../../../services/config/constants';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { useGetWalletAddresses } from '../../../hooks/useGetWalletAddresses';
import { observer } from 'mobx-react-lite';

import { BalanceHeader } from './balance-header';
import { AggregatedSupportedChain } from '../../../types/utility';

export const HeroSection = observer(() => {
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const walletAddresses = useGetWalletAddresses();

  const handleConnectEvmWalletClick = useCallback(() => {
    Linking.openURL('https://yourapp.com/onboardingImport?walletName=evm-ledger');
  }, []);

  return (
    <View>
      {activeChain !== 'nomic' ? <BalanceHeader /> : null}

      {/* Handle Ledger */}
      {activeChain !== AGGREGATED_CHAIN_KEY && (!walletAddresses?.[0]?.length) ? (
        <View style={{ marginTop: 12 }}>
          <Text size="md" style={{ marginBottom: 12 }}>
            EVM wallets not connected
          </Text>
          <TouchableOpacity onPress={handleConnectEvmWalletClick} style={styles.connectButton}>
            <Text
              size="sm"
              style={{
                fontWeight: 'bold',
                color: '#fff', // Adjust for your theme
                textAlign: 'center',
              }}
            >
              Connect EVM wallet
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  connectButton: {
    backgroundColor: '#2D3748', // Equivalent to Tailwind bg-gray-800
    borderRadius: 16,           // Tailwind rounded-2xl
    paddingVertical: 4,         // Tailwind py-1
    paddingHorizontal: 12,      // Tailwind px-3
    alignSelf: 'center',        // mx-auto
    minWidth: 100,
  },
});
