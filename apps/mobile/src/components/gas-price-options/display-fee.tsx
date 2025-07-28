import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // GasPump as "zap", CaretDown as "chevron-down" (or your choice)

import {
  currencyDetail,
  fetchCurrency,
  useChainId,
  useformatCurrency,
  useGasAdjustmentForChain,
  useGetChains,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks';
import { isSolanaChain, isSuiChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';

import { DisplayFeeValue, useGasPriceContext } from './context';
import { calculateFeeAmount } from './index';

type DisplayFeeProps = {
  style?: any;
  setDisplayFeeValue?: (value: DisplayFeeValue) => void;
  setShowFeesSettingSheet?: React.Dispatch<React.SetStateAction<boolean>>;
  forceChain?: SupportedChain;
};

export const DisplayFee: React.FC<DisplayFeeProps> = ({
  style,
  setShowFeesSettingSheet,
  setDisplayFeeValue,
}) => {
  const [formatCurrency] = useformatCurrency();
  const [preferredCurrency] = useUserPreferredCurrency();

  const {
    gasLimit,
    value,
    feeTokenData,
    activeChain,
    selectedNetwork,
    computedGas,
  } = useGasPriceContext();
  const chainId = useChainId(activeChain, selectedNetwork);
  const chainGasAdjustment = useGasAdjustmentForChain(activeChain);
  const chains = useGetChains();

  const { data: feeTokenFiatValue } = useQuery(
    ['fee-token-fiat-value', feeTokenData.denom.coinGeckoId],
    async () => {
      return fetchCurrency(
        '1',
        feeTokenData.denom.coinGeckoId,
        feeTokenData.denom.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
        `${chainId}-${feeTokenData.denom.coinMinimalDenom}`,
      );
    }
  );

  const displayFee = useMemo(() => {
    const { amount, formattedAmount, isVerySmallAmount } = calculateFeeAmount({
      gasLimit,
      feeDenom: feeTokenData.denom,
      gasPrice: value.gasPrice.amount.toFloatApproximation(),
      gasAdjustment: chainGasAdjustment,
      isSeiEvmTransaction: chains[activeChain]?.evmOnlyChain,
      isSolana: isSolanaChain(activeChain),
      isSui: isSuiChain(activeChain),
      computedGas,
    });

    return {
      value: amount.toNumber(),
      formattedAmount: isVerySmallAmount ? '< 0.00001' : formattedAmount,
      fiatValue: feeTokenFiatValue ? formatCurrency(amount.multipliedBy(feeTokenFiatValue)) : '',
    };
  }, [
    gasLimit,
    feeTokenData.denom,
    value.gasPrice.amount,
    chainGasAdjustment,
    chains,
    activeChain,
    feeTokenFiatValue,
    formatCurrency,
    computedGas,
  ]);

  useEffect(() => {
    setDisplayFeeValue?.(displayFee);
  }, [displayFee, setDisplayFeeValue]);

  return (
    <View style={[styles.row, style]}>
      <Icon name="zap" size={16} color="#26292E" style={styles.icon} /> 
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.feeButton}
        onPress={() => setShowFeesSettingSheet && setShowFeesSettingSheet(true)}
        testID="send-tx-fee-text"
      >
        <Text style={styles.feeText}>
          {displayFee.formattedAmount} {feeTokenData.denom.coinDenom}
          {'  '}
          <Text style={styles.fiatText}>
            {displayFee.fiatValue ? `(${displayFee.fiatValue})` : null}
          </Text>
        </Text>
        {setShowFeesSettingSheet && (
          <Icon name="chevron-down" size={16} color="#AAA" style={styles.caret} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    // light/dark theme: update color as needed
  },
  icon: {
    color: '#26292E', // text-secondary-800 (customize for theme)
    marginRight: 2,
  },
  feeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  feeText: {
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 12,
    color: '#26292E', // text-secondary-800
    lineHeight: 16,
  },
  fiatText: {
    color: '#AAA', // text-muted-foreground
    fontWeight: '400',
  },
  caret: {
    marginLeft: 4,
    color: '#AAA', // text-muted-foreground
  },
});

export default DisplayFee;
