import { formatTokenAmount, sliceWord, Token, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { isAptosChain, isSolanaChain, isSuiChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store';
import { useTheme } from '@leapwallet/leap-ui';
import { ArrowsLeftRight, CaretDown } from 'phosphor-react-native';
import { QueryStatus } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useFormatCurrency } from '../../../../hooks/settings/useCurrency';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { observer } from 'mobx-react-lite';
import { useSendContext } from '../../../send/context';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

import { hideAssetsStore } from '../../../../context/hide-assets-store';

import { ErrorWarningTokenCard } from '../error-warning';

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
  resetForm?: boolean;
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
  resetForm,
}: TokenInputCardProps) {
  const [formatCurrency] = useFormatCurrency();
  const chains = useGetChains();

  const defaultTokenLogo = useDefaultTokenLogo();
  const [setIsFocused] = useState(false);
  const [textInputValue, setTextInputValue] = useState<string>(value?.toString());

  const { allGasOptions, gasOption, selectedAddress, addressError, selectedToken } =
    useSendContext();

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

  const switchToUSDDisabled = useMemo(
    () => !selectedAssetUSDPrice || new BigNumber(selectedAssetUSDPrice ?? 0).isLessThan(10 ** -6),
    [selectedAssetUSDPrice]
  );

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
  }, [textInputValue, isInputInUSDC, selectedAssetUSDPrice, onChange]);

  useEffect(() => {
    if (resetForm) {
      setTextInputValue('');
    }
  }, [resetForm]);

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
            new BigNumber(token?.amount ?? 0).minus(new BigNumber(feeValue)).toFixed(decimals, BigNumber.ROUND_DOWN)
          );
        } else {
          setTextInputValue(new BigNumber(token?.amount ?? 0).toFixed(decimals, BigNumber.ROUND_DOWN));
        }
      } else {
        setTextInputValue(new BigNumber(token?.amount ?? 0).toFixed(decimals, BigNumber.ROUND_DOWN));
      }
    }
  };

  const onHalfBtnClick = useCallback(() => {
    if (isInputInUSDC) {
      if (!selectedAssetUSDPrice) throw 'USD price is not available';
      const usdAmount = new BigNumber(token?.amount ?? '0').dividedBy(2).multipliedBy(selectedAssetUSDPrice);
      setTextInputValue(usdAmount.toString());
    } else {
      const amount = new BigNumber(token?.amount ?? '0').dividedBy(2).toFixed(6, 1);
      setTextInputValue(amount);
    }
  }, [isInputInUSDC, selectedAssetUSDPrice, token?.amount, setTextInputValue]);

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

  const tokenHolderChain = useMemo(() => {
    if (!token?.tokenBalanceOnChain) return null;
    return chains?.[token.tokenBalanceOnChain];
  }, [token?.tokenBalanceOnChain, chains]);

  const isIBCError = (addressError || '').includes('IBC transfers are not supported');

  const sendChainEcosystem = useMemo(() => {
    if (
      isAptosChain(sendActiveChain) ||
      isSuiChain(sendActiveChain) ||
      chains?.[sendActiveChain]?.evmOnlyChain ||
      isBitcoinChain(sendActiveChain) ||
      isSolanaChain(sendActiveChain)
    ) {
      return chains?.[sendActiveChain]?.chainName ?? sendActiveChain;
    }
    return 'Cosmos';
  }, [sendActiveChain, chains]);

  return (
    <View style={styles.container} key={balanceAmount}>
      <View style={styles.innerBox}>
        <Text style={styles.label}>Send</Text>
        <View style={styles.inputRow}>
          {loadingAssets ? (
            <View style={styles.skeletonInput} />
          ) : (
            <>
              <View style={styles.valueRow}>
                {isInputInUSDC && (
                  <Text style={styles.usdSign}>$</Text>
                )}
                <TextInput
                  keyboardType="decimal-pad"
                  style={[
                    styles.input,
                    amountError ? styles.inputError : styles.inputNormal,
                    textInputValue.length < 12
                      ? styles.inputXL
                      : textInputValue.length < 15
                      ? styles.inputLG
                      : textInputValue.length < 18
                      ? styles.inputMD
                      : styles.inputSM,
                  ]}
                  placeholder="0"
                  value={isInputInUSDC ? textInputValue : value}
                  onChangeText={setTextInputValue}
                />
              </View>
              <TouchableOpacity
                style={styles.tokenBtn}
                onPress={onTokenSelectSheet}
                activeOpacity={0.8}
              >
                <View style={styles.tokenLogoWrap}>
                  <Image
                    source={{ uri: token?.img ?? defaultTokenLogo}}
                    style={styles.tokenLogo}
                    onError={() => {}}
                  />
                  {tokenHolderChain && (
                    <Image
                      source={{ uri: tokenHolderChain.chainSymbolImageUrl ?? defaultTokenLogo}}
                      style={styles.chainLogo}
                      onError={() => {}}
                    />
                  )}
                </View>
                <View style={styles.tokenNameRow}>
                  <Text style={styles.tokenName}>
                    {token?.symbol ? sliceWord(token?.symbol ?? '', 4, 4) : 'Select Token'}
                  </Text>
                  <CaretDown size={20} color="#222" style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Value / Fiat Switch Row */}
        <View style={styles.amountRow}>
          <View style={styles.fiatRow}>
            <Text style={styles.fiatText}>
              {value === ''
                ? isInputInUSDC
                  ? '0.00'
                  : '$0.00'
                : isInputInUSDC
                ? formattedInputValue
                : formattedDollarAmount}
            </Text>
            <TouchableOpacity
              style={[
                styles.switchBtn,
                switchToUSDDisabled && styles.switchBtnDisabled,
              ]}
              disabled={switchToUSDDisabled}
              onPress={handleInputTypeSwitchClick}
              activeOpacity={0.7}
            >
              <ArrowsLeftRight size={20} color="#888" style={{ transform: [{ rotate: '90deg' }] }} />
            </TouchableOpacity>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceText}>
              {!balanceStatus || balanceStatus === 'success'
                ? balanceAmount
                : <View style={styles.skeletonBalance} />}
            </Text>
            {!balanceStatus || balanceStatus === 'success' ? (
              <>
                <TouchableOpacity style={styles.halfBtn} onPress={onHalfBtnClick}>
                  <Text style={styles.halfBtnText}>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.maxBtn} onPress={onMaxBtnClick}>
                  <Text style={styles.maxBtnText}>Max</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
        {!isIBCError && addressError && selectedAddress ? (
          <Text style={styles.ibcWarnText}>
            You can only send {selectedToken?.symbol} on {sendChainEcosystem}.
          </Text>
        ) : null}
      </View>
      <ErrorWarningTokenCard />
    </View>
  );
}

export const TokenInputCard = observer(TokenInputCardView);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F3F5FA',
    borderRadius: 16,
    marginVertical: 0,
  },
  innerBox: {
    flexDirection: 'column',
    padding: 20,
    gap: 8,
  },
  label: {
    color: '#A0A2B1',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'space-between',
    minHeight: 34,
    paddingVertical: 2,
    gap: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  usdSign: {
    color: '#18191A',
    fontWeight: 'bold',
    fontSize: 24,
    marginRight: 2,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    textAlign: 'left',
    fontWeight: 'bold',
    paddingVertical: 0,
    color: '#18191A',
  },
  inputError: {
    color: '#F87171',
  },
  inputNormal: {
    color: '#18191A',
  },
  inputXL: { fontSize: 24, lineHeight: 32 },
  inputLG: { fontSize: 22, lineHeight: 32 },
  inputMD: { fontSize: 20, lineHeight: 30 },
  inputSM: { fontSize: 18, lineHeight: 28 },
  tokenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 40,
    backgroundColor: '#E5E9F2',
  },
  tokenLogoWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tokenLogo: {
    width: 19.2,
    height: 19.2,
    borderRadius: 9.6,
  },
  chainLogo: {
    width: 8.4,
    height: 8.4,
    borderRadius: 4.2,
    backgroundColor: '#E5E9F2',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  tokenNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tokenName: {
    color: '#18191A',
    fontSize: 16,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 0,
    minHeight: 22,
  },
  fiatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fiatText: {
    color: '#A0A2B1',
    fontSize: 14,
    fontWeight: '400',
    marginRight: 4,
  },
  switchBtn: {
    borderRadius: 12,
    height: 22,
    backgroundColor: '#E5E9F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 6,
  },
  switchBtnDisabled: {
    opacity: 0.5,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceText: {
    color: '#A0A2B1',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 2,
  },
  halfBtn: {
    borderRadius: 12,
    backgroundColor: '#E5E9F2',
    paddingHorizontal: 6,
    marginLeft: 2,
  },
  halfBtnText: {
    color: '#888',
    fontWeight: '500',
    fontSize: 13,
  },
  maxBtn: {
    borderRadius: 12,
    backgroundColor: '#E5E9F2',
    paddingHorizontal: 6,
    marginLeft: 2,
  },
  maxBtnText: {
    color: '#888',
    fontWeight: '500',
    fontSize: 13,
  },
  ibcWarnText: {
    color: '#F87171',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 12,
  },
  skeletonInput: {
    width: 75,
    height: 32,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  skeletonBalance: {
    width: 50,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
});
