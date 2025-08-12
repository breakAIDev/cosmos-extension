import React from 'react';
import { observer } from 'mobx-react-lite';
import { Pressable, Text, StyleSheet } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useActiveChain } from '../../../../hooks/settings/useActiveChain';
import { useFormatCurrency } from '../../../../hooks/settings/useCurrency';
import { hideAssetsStore } from '../../../../context/hide-assets-store';
import { rootBalanceStore } from '../../../../context/root-store';
import { AggregatedSupportedChain } from '../../../../types/utility';

export const TotalBalance = observer(() => {
  const [formatCurrency] = useFormatCurrency();
  const activeChain = useActiveChain() as AggregatedSupportedChain;

  const chains = useGetChains();
  const isEvmOnlyChain = chains?.[activeChain as SupportedChain]?.evmOnlyChain;

  const totalFiatValue = (() => {
    const addEvmDetails = isEvmOnlyChain ?? false;
    if (addEvmDetails) {
      return rootBalanceStore.totalFiatValue.plus(
        rootBalanceStore.erc20BalanceStore.evmBalanceStore.evmBalance.currencyInFiatValue,
      );
    }
    return rootBalanceStore.totalFiatValue;
  })();

  // This handles show/hide logic and animation
  return (
    <AnimatePresence>
      <MotiView
        key={hideAssetsStore.isHidden ? 'hidden' : 'visible'}
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: 12 }}
        transition={{ type: 'timing', duration: 150 }}
      >
        <Pressable onPress={() => hideAssetsStore.setHidden(!hideAssetsStore.isHidden)}>
          <Text style={[
            styles.balanceText,
            hideAssetsStore.isHidden && styles.hiddenText,
          ]}>
            {hideAssetsStore.formatHideBalance(formatCurrency(totalFiatValue, true))}
          </Text>
        </Pressable>
      </MotiView>
    </AnimatePresence>
  );
});

const styles = StyleSheet.create({
  balanceText: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 49,
    color: '#181A20', // dark text, adjust as needed or use your theme
    textAlign: 'center',
  },
  hiddenText: {
    color: '#9297A0', // muted foreground, adjust as needed or use your theme
  },
});
