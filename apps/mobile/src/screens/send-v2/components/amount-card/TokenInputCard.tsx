import { formatTokenAmount, sliceWord, Token, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ArrowsLeftRight, CaretDown } from 'phosphor-react-native';
import { QueryStatus } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useFormatCurrency } from '../../../../hooks/settings/useCurrency';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { observer } from 'mobx-react-lite';
import { useSendContext } from '../../../send-v2/context';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import TokenImageWithFallback from '../../../../components/token-image-with-fallback';

import { hideAssetsStore } from '../../../../context/hide-assets-store';
import { useTheme } from '@leapwallet/leap-ui';

type TokenInputCardProps = {
  isInputInUSDC: boolean;
  setIsInputInUSDC: Dispatch<SetStateAction<boolean>>;
  value: string;
  token?: Token | null;
  balanceStatus?: QueryStatus | boolean;
  loadingAssets?: boolean;
  onChange?: (value: string) => void;
  onTokenSelectSheet?: () => void;
  amountError?: string;
  sendActiveChain: SupportedChain;
  selectedChain: SupportedChain | null;
};

function TokenInputCardView({
  isInputInUSDC,
  setIsInputInUSDC,
  value,
  token,
  loadingAssets,
  balanceStatus,
  onChange,
  onTokenSelectSheet,
  amountError,
  sendActiveChain,
  selectedChain,
}: TokenInputCardProps) {
  const [formatCurrency] = useFormatCurrency();
  const chains = useGetChains();
  const theme = useTheme();
  const isDarkMode = theme.theme === 'dark';

  const defaultTokenLogo = useDefaultTokenLogo();
  const [textInputValue, setTextInputValue] = useState<string>(value?.toString());

  const { pfmEnabled, isIbcUnwindingDisabled, allGasOptions, gasOption } = useSendContext();

  const selectedAssetUSDPrice = useMemo(() => {
    if (token && token.usdPrice && token.usdPrice !== '0') {
      return token.usdPrice;
    }
    return undefined;
  }, [token]);

  useEffect(() => {
    if (!selectedAssetUSDPrice && isInputInUSDC) {
      setIsInputInUSDC(false);
    }
  }, [selectedAssetUSDPrice, isInputInUSDC, setIsInputInUSDC]);

  const { formattedDollarAmount } = useMemo(() => {
    let _dollarAmount = '0';
    if (value === '' || (value && isNaN(parseFloat(value)))) {
      return { formattedDollarAmount: '' };
    }
    if (token && token.usdPrice && value) {
      _dollarAmount = String(parseFloat(token.usdPrice) * parseFloat(value));
    }
    return {
      formattedDollarAmount: hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(_dollarAmount))),
    };
  }, [formatCurrency, token, value]);

  const formattedInputValue = useMemo(() => {
    return hideAssetsStore.formatHideBalance(
      formatTokenAmount(value ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3, 'en-US'),
    );
  }, [value, token?.symbol]);

  const balanceAmount = useMemo(() => {
    return hideAssetsStore.formatHideBalance(
      formatTokenAmount(token?.amount ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3, 'en-US'),
    );
  }, [token?.amount, token?.symbol]);

  const isMaxAmount = useMemo(() => {
    return token?.amount === value;
  }, [token?.amount, value]);

  const showMaxButton = useMemo(() => {
    return token?.amount && token?.amount !== '0' && !isMaxAmount;
  }, [isMaxAmount, token?.amount]);

  const switchToUSDDisabled = useMemo(() => {
    return !selectedAssetUSDPrice || new BigNumber(selectedAssetUSDPrice ?? 0).isLessThan(10 ** -6);
  }, [selectedAssetUSDPrice]);

  useEffect(() => {
    if (!onChange) return;
    if (isInputInUSDC && selectedAssetUSDPrice) {
      const cleanedInputValue = textInputValue.trim();
      if (!cleanedInputValue) {
        onChange('');
        return;
      }
      const cryptoAmount = new BigNumber(textInputValue).dividedBy(selectedAssetUSDPrice);
      onChange(!isNaN(parseFloat(cryptoAmount.toString())) ? cryptoAmount?.toFixed(6) : '');
    } else {
      onChange(!isNaN(parseFloat(textInputValue)) ? textInputValue : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textInputValue, isInputInUSDC, selectedAssetUSDPrice]);

  const onMaxBtnClick = () => {
    if (isInputInUSDC) {
      if (!selectedAssetUSDPrice) throw 'USD price is not available';
      const usdAmount = new BigNumber(token?.amount ?? '0').multipliedBy(selectedAssetUSDPrice);
      setTextInputValue(usdAmount.toString());
    } else {
      const isNativeToken = !!chains[sendActiveChain].nativeDenoms[token?.coinMinimalDenom ?? ''];
      const decimals = token?.coinDecimals || 6;

      if (!allGasOptions || !gasOption) {
        return;
      }

      if (isNativeToken) {
        const feeValue = parseFloat(allGasOptions[gasOption]);
        if (new BigNumber(token?.amount ?? 0).isGreaterThan(new BigNumber(feeValue))) {
          setTextInputValue(
            new BigNumber(token?.amount ?? 0).minus(new BigNumber(feeValue)).toFixed(decimals, BigNumber.ROUND_DOWN),
          );
        } else {
          setTextInputValue(new BigNumber(token?.amount ?? 0).toFixed(decimals, BigNumber.ROUND_DOWN));
        }
      } else {
        setTextInputValue(new BigNumber(token?.amount ?? 0).toFixed(decimals, BigNumber.ROUND_DOWN));
      }
    }
  };

  const handleInputTypeSwitchClick = useCallback(() => {
    if (!selectedAssetUSDPrice) {
      throw 'USD price is not available';
    }
    if (isInputInUSDC) {
      setIsInputInUSDC(false);
      const cryptoAmount = new BigNumber(textInputValue).dividedBy(selectedAssetUSDPrice);
      setTextInputValue(cryptoAmount.toString());
    } else {
      setIsInputInUSDC(true);
      const usdAmount = new BigNumber(textInputValue).multipliedBy(selectedAssetUSDPrice);
      setTextInputValue(usdAmount.toString());
    }
  }, [isInputInUSDC, selectedAssetUSDPrice, setIsInputInUSDC, textInputValue]);

  return (
    <View style={styles.cardWrap} key={balanceAmount}>
      {/* Input Section */}
      <View
        style={[
          styles.inputRow,
          amountError
            ? styles.inputRowError
            : !pfmEnabled && !isIbcUnwindingDisabled
            ? styles.inputRowWarning
            : styles.inputRowFocus,
        ]}
      >
        {loadingAssets ? (
          <View style={{ width: 71, height: 24, backgroundColor: '#E5E7EB', borderRadius: 8 }} />
        ) : (
          <>
            <View style={styles.amountInputBox}>
              {isInputInUSDC && (
                <Text style={styles.inputDollar}>$</Text>
              )}
              <TextInput
                keyboardType="decimal-pad"
                placeholder="0"
                style={styles.amountInput}
                value={isInputInUSDC ? textInputValue : value}
                onChangeText={setTextInputValue}
                placeholderTextColor="#6B7280"
              />
            </View>
            <TouchableOpacity style={styles.tokenSelectorBtn} onPress={onTokenSelectSheet} activeOpacity={0.7}>
              <TokenImageWithFallback
                assetImg={token?.img}
                text={token?.symbol ?? ''}
                key={token?.img}
                imageStyle={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                }}
                containerStyle={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#e5e5e5', // Example for dark/light
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                textStyle={{
                  fontSize: 7,
                  lineHeight: 9,
                  color: isDarkMode ? '#fff' : '#111', // Example for dark/light
                }}
              />
              {selectedChain && (
                <Image
                  source={{ uri: chains[selectedChain]?.chainSymbolImageUrl ?? defaultTokenLogo }}
                  style={styles.chainIcon}
                  onError={() => {/* fallback logic */}}
                />
              )}
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.tokenSymbol}>
                  {token?.symbol ? sliceWord(token?.symbol ?? '', 4, 4) : 'Select Token'}
                </Text>
                {selectedChain ? (
                  <Text style={styles.chainName}>
                    {chains[selectedChain]?.chainName ?? 'Unknown'}
                  </Text>
                ) : null}
              </View>
              <CaretDown size={14} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Value, Switch, and Max Button Row */}
      <View style={styles.balanceRow}>
        <View style={styles.leftBalanceCol}>
          {value !== '' && (
            <Text style={styles.inputValueText}>
              {isInputInUSDC ? formattedInputValue : formattedDollarAmount}
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.switchBtn,
              switchToUSDDisabled && styles.switchBtnDisabled,
              value === '' ? styles.switchBtnPadded : styles.switchBtnSquare,
            ]}
            disabled={switchToUSDDisabled}
            onPress={handleInputTypeSwitchClick}
            activeOpacity={switchToUSDDisabled ? 1 : 0.7}
          >
            {value === '' && (
              <Text style={styles.switchBtnText}>
                Switch to {isInputInUSDC ? 'Token' : 'USD'}
              </Text>
            )}
            <ArrowsLeftRight size={12} color="#111827" style={{ transform: [{ rotate: '90deg' }] }} />
          </TouchableOpacity>
        </View>
        <View style={styles.rightBalanceCol}>
          <Text
            style={[
              styles.balanceText,
              (amountError || '').includes('Insufficient balance') ? styles.balanceError : styles.balanceNormal,
            ]}
          >
            Bal: {!balanceStatus || balanceStatus === 'success' ? balanceAmount : <ActivityIndicator size="small" color="#9CA3AF" />}
          </Text>
          {showMaxButton && (
            <TouchableOpacity style={styles.maxBtn} onPress={onMaxBtnClick}>
              <Text style={styles.maxBtnText}>Max</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'column',
    gap: 12,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingLeft: 16,
    minHeight: 48,
    height: 48,
    padding: 2,
    marginBottom: 6,
    justifyContent: 'space-between',
  },
  inputRowError: {
    borderColor: '#F87171',
  },
  inputRowWarning: {
    borderColor: '#FFC770',
  },
  inputRowFocus: {
    borderColor: '#16A34A',
  },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputDollar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 4,
  },
  amountInput: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    textAlign: 'left',
  },
  tokenSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingRight: 8,
  },
  tokenImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 2,
  },
  chainIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#F3F4F6',
  },
  tokenSymbol: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chainName: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
    marginTop: -4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
    width: '100%',
    marginTop: 8,
  },
  leftBalanceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputValueText: {
    color: '#111827',
    fontSize: 12,
    marginRight: 6,
  },
  switchBtn: {
    borderRadius: 999,
    backgroundColor: '#F9FAFB',
    height: 24,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    marginLeft: 6,
    justifyContent: 'center',
  },
  switchBtnSquare: {
    width: 24,
    paddingHorizontal: 0,
  },
  switchBtnPadded: {
    paddingHorizontal: 10,
  },
  switchBtnDisabled: {
    opacity: 0.5,
  },
  switchBtnText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '400',
    marginRight: 2,
  },
  rightBalanceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  balanceNormal: {
    color: '#6B7280',
  },
  balanceError: {
    color: '#F87171',
  },
  maxBtn: {
    borderRadius: 999,
    backgroundColor: '#29A87433',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 6,
  },
  maxBtnText: {
    color: '#16A34A',
    fontWeight: '500',
    fontSize: 12,
  },
});

export const TokenInputCard = observer(TokenInputCardView);
