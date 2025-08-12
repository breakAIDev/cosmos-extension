import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { AnimatePresence, MotiText } from 'moti';

import {
  formatTokenAmount,
  SelectedNetwork,
  STAKE_MODE,
  useActiveStakingDenom,
  useformatCurrency,
} from '@leapwallet/cosmos-wallet-hooks';
import { fromSmall, SupportedChain, toSmall } from '@leapwallet/cosmos-wallet-sdk';
import { Amount } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/staking';
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { SwapIcon } from '../../../../assets/icons/swap-icon'; // Should be RN compatible!
import { Skeleton } from '../../../components/ui/skeleton'; // Should be RN compatible!
import { stakeModeMap } from '../utils/stake-text';

interface YouStakeProps {
  token?: any;
  setAmount: (val: string) => void;
  fees?: { amount: string; denom: string };
  hasError: boolean;
  setHasError: (val: boolean) => void;
  mode: STAKE_MODE;
  delegationBalance?: Amount;
  amount: string;
  adjustAmount: boolean;
  setAdjustAmount: (val: boolean) => void;
  tokenLoading: boolean;
  rootDenomsStore: RootDenomsStore;
  activeChain?: SupportedChain;
  activeNetwork?: SelectedNetwork;
  delegationBalanceLoading: boolean;
}

const YouStake = observer(({
  token,
  amount,
  setAmount,
  fees,
  hasError,
  setHasError,
  mode,
  delegationBalance,
  adjustAmount,
  setAdjustAmount,
  tokenLoading,
  rootDenomsStore,
  activeChain,
  activeNetwork,
  delegationBalanceLoading,
}: YouStakeProps) => {
  const inputRef = useRef<TextInput>(null);
  const [activeStakingDenom] = useActiveStakingDenom(rootDenomsStore.allDenoms, activeChain, activeNetwork);
  const [formatCurrency] = useformatCurrency();
  const [inputValue, setInputValue] = useState('');
  const [isDollarInput, setIsDollarInput] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const displayedValue = useMemo(() => {
    return inputValue
      ? isDollarInput
        ? new BigNumber(inputValue).dividedBy(new BigNumber(token?.usdPrice ?? '0')).toString()
        : new BigNumber(inputValue).multipliedBy(new BigNumber(token?.usdPrice ?? '0')).toString()
      : '';
  }, [inputValue, isDollarInput, token?.usdPrice]);

  const maxValue = useMemo(() => {
    if (mode !== 'DELEGATE') {
      return isDollarInput
        ? new BigNumber(delegationBalance?.currencyAmount ?? '')
        : new BigNumber(delegationBalance?.amount ?? '');
    }

    const tokenAmount = toSmall(token?.amount ?? '0', token?.coinDecimals ?? 6);
    const maxMinimalTokens = new BigNumber(tokenAmount).minus(fees?.amount ?? '0');
    if (maxMinimalTokens.lte(0)) {
      return new BigNumber(0);
    }

    const maxTokens = new BigNumber(fromSmall(maxMinimalTokens.toString(), token?.coinDecimals ?? 6));
    return isDollarInput ? new BigNumber(maxTokens).multipliedBy(token?.usdPrice ?? '0') : maxTokens;
  }, [delegationBalance, fees?.amount, isDollarInput, mode, token]);

  const validateInput = useCallback((value: string) => {
    const numericValue = new BigNumber(value);
    if (numericValue.isLessThan(0)) {
      setHasError(true);
      return;
    }
    let limit;
    if (mode === 'DELEGATE') {
      limit = isDollarInput ? token?.usdValue ?? '0' : token?.amount ?? '0';
    } else {
      limit = isDollarInput ? delegationBalance?.currencyAmount ?? '' : delegationBalance?.amount ?? '';
    }
    if (numericValue.isGreaterThan(limit)) {
      setHasError(true);
      return;
    }
    setHasError(false);
  }, [delegationBalance?.amount, delegationBalance?.currencyAmount, isDollarInput, mode, setHasError, token]);

  const handleInputChange = (text: string) => {
    const value = text
      .replace(/\$/, '')
      .replace(/^0+(?=\d)/, '')
      .replace(/(\.+)/g, '.');
    if (/^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
      validateInput(value);
    }
  };

  const handleSwapClick = () => {
    if (inputValue) {
      const newInputValue = isDollarInput
        ? (parseFloat(inputValue) / parseFloat(token?.usdPrice ?? '0')).toFixed(6)
        : (parseFloat(inputValue) * parseFloat(token?.usdPrice ?? '0')).toFixed(6);
      setInputValue(newInputValue);
    }
    setIsDollarInput(!isDollarInput);
    inputRef.current?.focus();
  };

  const balance = useMemo(() => {
    if (isDollarInput) {
      const currencyAmount = new BigNumber(
        (mode === 'DELEGATE' ? token?.usdValue : delegationBalance?.currencyAmount) ?? '',
      );
      return currencyAmount;
    } else {
      const tokenAmount = new BigNumber((mode === 'DELEGATE' ? token?.amount : delegationBalance?.amount) ?? '');
      return tokenAmount;
    }
  }, [
    delegationBalance?.amount,
    delegationBalance?.currencyAmount,
    isDollarInput,
    mode,
    token?.amount,
    token?.usdValue,
  ]);

  const handleUpdateInputValue = (value: string) => {
    setInputValue(value);
    validateInput(value);
  };

  useEffect(() => {
    if (adjustAmount) {
      if (isDollarInput) {
        setInputValue((parseFloat(amount) * parseFloat(token?.usdPrice ?? '0')).toFixed(6));
      } else {
        setInputValue(amount);
      }
      setAdjustAmount(false);
    }
  }, [adjustAmount]);

  useEffect(() => {
    if (inputValue && !hasError) {
      const tokenAmount = isDollarInput
        ? parseFloat(inputValue) / parseFloat(token?.usdPrice ?? '0')
        : parseFloat(inputValue);
      setAmount(tokenAmount.toFixed(6));
    } else {
      setAmount('');
    }
  }, [inputValue, isDollarInput, token?.usdPrice, hasError]);

  useEffect(() => {
    if (mode === 'DELEGATE') {
      setBalanceLoading(tokenLoading);
    } else {
      setBalanceLoading(delegationBalanceLoading);
    }
  }, [mode, tokenLoading, delegationBalanceLoading]);

  return (
    <View style={styles.card}>
      <Text style={styles.modeLabel}>{stakeModeMap[mode]}</Text>

      <TextInput
        ref={inputRef}
        style={[styles.input, hasError && styles.inputError]}
        value={isDollarInput ? `$${inputValue}` : inputValue}
        onChangeText={handleInputChange}
        placeholder="0"
        keyboardType="decimal-pad"
        autoFocus
        selectionColor="#2563eb"
      />

      <View style={styles.rowBetween}>
        <View style={styles.rowLeft}>
          <Text style={styles.hintText}>
            {inputValue
              ? isDollarInput
                ? `${formatTokenAmount(displayedValue)} ${activeStakingDenom?.coinDenom}`
                : formatCurrency(new BigNumber(displayedValue))
              : isDollarInput
                ? '$0.00'
                : '0.00'}
          </Text>
          <TouchableOpacity
            onPress={handleSwapClick}
            style={styles.swapBtn}
            activeOpacity={0.7}
          >
            <SwapIcon style={{ transform: [{ rotate: '90deg' }], padding: 2, width: 18, height: 18 }} />
          </TouchableOpacity>
        </View>
        <View style={styles.rowRight}>
          <AnimatePresence>
            {balanceLoading ? (
              <Skeleton width={64} height={22} key="skeleton" />
            ) : (
              <MotiText
                key="balance"
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                transition={{ type: 'timing', duration: 220 }}
                style={styles.balanceText}
              >
                {balance.eq(0)
                  ? '0'
                  : isDollarInput
                    ? formatCurrency(balance)
                    : formatTokenAmount(balance.toString())}{' '}
                {activeStakingDenom?.coinDenom}
              </MotiText>
            )}
          </AnimatePresence>
          <TouchableOpacity
            style={styles.percBtn}
            onPress={() => handleUpdateInputValue(maxValue.dividedBy(2).toFixed(6, 1).toString())}
          >
            <Text style={styles.percBtnText}>50%</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.maxBtn}
            onPress={() => handleUpdateInputValue(maxValue.toFixed(6, 1).toString())}
          >
            <Text style={styles.maxBtnText}>Max</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    borderRadius: 16,
    backgroundColor: '#f4f5f8',
    padding: 20,
    marginVertical: 8,
    gap: 10,
  },
  modeLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderWidth: 0,
    marginBottom: 6,
  },
  inputError: {
    color: '#dc2626',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#888',
    marginRight: 2,
  },
  swapBtn: {
    backgroundColor: '#ebecef',
    borderRadius: 999,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  balanceText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginRight: 4,
  },
  percBtn: {
    marginLeft: 2,
    backgroundColor: '#ebecef',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginHorizontal: 2,
  },
  percBtnText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  maxBtn: {
    backgroundColor: '#ebecef',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 2,
  },
  maxBtnText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default YouStake;
