import { useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { Button } from '../../../components/ui/button';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { WalletIcon } from '../../../../assets/icons/wallet-icon';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Replace with your navigation hook or prop!
import { useNavigation } from '@react-navigation/native';
import { getLedgerEnabledEvmChainsKey } from '../../../utils/getLedgerEnabledEvmChains';

export function WalletNotConnected({ visible }: { visible: boolean }) {
  const navigation = useNavigation();
  const activeChain = useActiveChain();
  const chains = useGetChains();

  const ledgerEnabledEvmChainsKeys = useMemo(() => {
    return getLedgerEnabledEvmChainsKey(Object.values(chains));
  }, [chains]);

  const ledgerApp = useMemo(() => {
    return ledgerEnabledEvmChainsKeys.includes(activeChain) ? 'EVM' : 'Cosmos';
  }, [activeChain, ledgerEnabledEvmChainsKeys]);

  if (!visible) return null;

  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.centerBlock}>
          <View style={styles.iconCircle}>
            <WalletIcon size={24} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.title}>Wallet not connected</Text>
            <Text style={styles.desc}>
              You need to import Ledger using {ledgerApp} app to use this chain.
            </Text>
          </View>
        </View>
        <Button
          style={styles.button}
          onPress={() => {
            // For mobile, just navigate!
            navigation.navigate('ImportLedgerScreen', { app: ledgerApp });
          }}
        >
          Connect {ledgerApp} wallet
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    padding: 24,
    // Height minus 128px, if you need to enforce it:
    // height: 'calc(100%-128px)', // Not supported in RN
    // Instead, use flex and padding or set a fixed height if absolutely necessary.
  },
  innerContainer: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#F3F4F6', // bg-secondary-100
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12, // gap is not supported, add marginBottom on items if you need spacing
    paddingHorizontal: 24,
  },
  iconCircle: {
    backgroundColor: '#E5E7EB', // bg-secondary-200
    height: 64,
    width: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  textBlock: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222', // text-foreground
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  desc: {
    fontSize: 12,
    color: '#6B7280', // text-secondary-800
    textAlign: 'center',
    lineHeight: 16,
  },
  button: {
    width: 260,
    height: 44,
    fontSize: 14,
    marginTop: 32,
    justifyContent: 'center',
    alignItems: 'center',
    // leading-20 is lineHeight: 20
    lineHeight: 20,
    color: '#222',
  },
});
