import {
  EARN_MODE, FeeTokenData, formatTokenAmount, useEarnTx,
} from '@leapwallet/cosmos-wallet-hooks';
import { fromSmall } from '@leapwallet/cosmos-wallet-sdk';
import {
  ArrowDown, ArrowLeft, CaretDown, CheckSquare, GasPump, Square,
} from 'phosphor-react-native';
import BigNumber from 'bignumber.js';
import React, {
  useCallback, useEffect, useState,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import GasPriceOptions, { useDefaultGasPrice } from '../../components/gas-price-options'; // Should be RN
import { DisplayFee } from '../../components/gas-price-options/display-fee';
import { FeesSettingsSheet } from '../../components/gas-price-options/fees-settings-sheet';
import { PageHeader } from '../../components/header/PageHeaderV2';
import { useSelectedNetwork } from '../../hooks/settings/useNetwork';
import useQuery from '../../hooks/useQuery';
import { Wallet } from '../../hooks/wallet/useWallet';
import { Images } from '../../../assets/images';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { miscellaneousDataStore } from '../../context/chain-infos-store';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';

import ReviewTxSheet from './ReviewTxSheet';
import Terms from './Terms';
import TxPage from './TxPage';

const EarnPage = observer(() => {
  // usePageView(PageName.USDN_REWARDS)
  const navigation = useNavigation();
  const query = useQuery();
  const [mode, setMode] = useState<EARN_MODE>(query.get('withdraw') ? 'withdraw' : 'deposit');
  const [showTerms, setShowTerms] = useState(false);
  const activeNetwork = useSelectedNetwork();
  const {
    amount,
    setAmount,
    sourceToken,
    setSourceToken,
    destinationToken,
    setDestinationToken,
    userPreferredGasLimit,
    recommendedGasLimit,
    setUserPreferredGasLimit,
    userPreferredGasPrice,
    gasOption,
    setGasOption,
    setUserPreferredGasPrice,
    setFeeDenom,
    amountOut,
    setError,
    onReviewTransaction,
    txHash,
    setTxHash,
    isLoading,
    customFee,
    error,
    showLedgerPopup,
    ledgerError,
  } = useEarnTx(rootDenomsStore.allDenoms, mode);
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [amountError, setAmountError] = useState('');
  const [textInputValue, setTextInputValue] = useState('');
  const getWallet = Wallet.useGetWallet();
  const [showReviewTxSheet, setShowReviewTxSheet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const allBalanceTokens = rootBalanceStore.allTokens;
  const defaultGasPrice = useDefaultGasPrice(rootDenomsStore.allDenoms, { activeChain: 'noble' });
  const [gasError, setGasError] = useState<string | null>(null);
  const [gasPriceOption, setGasPriceOption] = useState({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  });
  const [displayFeeValue, setDisplayFeeValue] = useState<any>();

  useEffect(() => {
    setGasPriceOption({
      option: gasOption,
      gasPrice: defaultGasPrice.gasPrice,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom]);

  useEffect(() => {
    if (gasPriceOption.option) setGasOption(gasPriceOption.option);
    if (gasPriceOption.gasPrice) setUserPreferredGasPrice(gasPriceOption.gasPrice);
  }, [gasPriceOption, setGasOption, setUserPreferredGasPrice]);

  const onGasPriceOptionChange = useCallback(
    (value: any, feeBaseDenom: FeeTokenData) => {
      setGasPriceOption(value);
      setFeeDenom(feeBaseDenom.denom);
    },
    [setFeeDenom]
  );

  useEffect(() => {
    let usdn = allBalanceTokens.find(
      (token) => token.coinMinimalDenom === 'uusdn' && token.tokenBalanceOnChain === 'noble',
    );
    if (!usdn) {
      usdn = {
        ...rootDenomsStore.allDenoms.uusdn,
        symbol: rootDenomsStore.allDenoms.uusdn?.coinDenom,
        amount: '0',
        img: rootDenomsStore.allDenoms.uusdn?.icon,
      };
    }
    let usdc = allBalanceTokens.find(
      (token) => token.coinMinimalDenom === 'uusdc' && token.tokenBalanceOnChain === 'noble',
    );
    if (!usdc) {
      usdc = {
        ...rootDenomsStore.allDenoms.usdc,
        symbol: rootDenomsStore.allDenoms.usdc?.coinDenom,
        amount: '0',
        img: rootDenomsStore.allDenoms.usdc?.icon,
      };
    }
    if (mode === 'deposit') {
      setSourceToken(usdc);
      setDestinationToken(usdn);
    } else {
      setSourceToken(usdn);
      setDestinationToken(usdc);
    }
  }, [allBalanceTokens, mode, query, setDestinationToken, setSourceToken]);

  useEffect(() => {
    if (textInputValue && sourceToken) {
      if (
        new BigNumber(textInputValue).gt(0)
        && new BigNumber(textInputValue).lte(sourceToken.amount ?? '0')
      ) {
        let val = textInputValue;
        setAmountError('');
        if (
          customFee?.amount[0].denom === sourceToken.coinMinimalDenom
          && new BigNumber(textInputValue).plus(fromSmall(customFee?.amount[0].amount ?? '0')).gt(sourceToken.amount)
        ) {
          const newVal = new BigNumber(sourceToken.amount).minus(fromSmall(customFee?.amount[0].amount ?? '0'));
          if (newVal.gt(0)) {
            setTimeout(() => {
              setAmount(newVal.toString());
            }, 200);
            return;
          } else {
            val = '0';
          }
        }
        setAmount(val);
      } else {
        setAmount('0');
        if (!new BigNumber(textInputValue).lte(sourceToken.amount ?? '0')) {
          setAmountError('Insufficient Balance');
        }
      }
    } else {
      setAmount('0');
      setAmountError('');
    }
  }, [customFee?.amount, setAmount, sourceToken, textInputValue]);

  const handle25Click = () => {
    const amount = new BigNumber(sourceToken?.amount ?? '0');
    if (amount.gt(0)) setTextInputValue(amount.dividedBy(4).toFixed(6, 1));
  };

  const handle50Click = () => {
    const amount = new BigNumber(sourceToken?.amount ?? '0');
    if (amount.gt(0)) setTextInputValue(amount.dividedBy(2).toFixed(6, 1));
  };

  const handleMaxClick = () => {
    const amount = new BigNumber(sourceToken?.amount ?? '0').minus(
      customFee?.amount[0].denom === sourceToken?.coinMinimalDenom
        ? fromSmall(customFee?.amount[0].amount ?? '0')
        : '0',
    );
    if (amount.gt(0)) setTextInputValue(amount.toFixed(6, 1));
  };

  const isReviewDisabled =
    !new BigNumber(amountOut).gt(0)
    || !new BigNumber(textInputValue).gt(0)
    || isLoading
    || !!amountError
    || !!gasError
    || !!error
    || !!ledgerError
    || (mode === 'deposit' && !isChecked);

  const handleConfirmTx = useCallback(async () => {
    setIsProcessing(true);
    try {
      const wallet = await getWallet('noble');
      onReviewTransaction(wallet, () => {}, false);
      setTxHash(txHash);
    } catch (error) {
      setError(error as string);
      setTimeout(() => {
        setError(undefined);
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  }, [getWallet, onReviewTransaction, setError, setTxHash, txHash]);

  // --- Render logic ---
  if (txHash) {
    return (
      <TxPage
        onClose={() => {
          setTxHash(undefined);
          setShowReviewTxSheet(false);
          setAmount('0');
          setAmountError('');
          setTextInputValue('');
        }}
        txHash={txHash}
        txType={mode}
        sourceToken={sourceToken}
        destinationToken={destinationToken}
      />
    );
  }

  if (showTerms) {
    return (
      <Terms
        onBack={() => setShowTerms(false)}
        onAgree={() => {
          setIsChecked(true);
          setShowTerms(false);
        }}
      />
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#fff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <PageHeader>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ArrowLeft size={36} color="#64748b" /> {/* text-muted-foreground */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Earn</Text>
          <View style={{ width: 36 }} /> {/* Spacer */}
        </PageHeader>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.descText}>
            Put your stable asset to work and earn
            <Text style={styles.strongGreen}>
              {' '}
              {
                parseFloat(miscellaneousDataStore.data?.noble?.usdnEarnApy) > 0
                  ? `${new BigNumber(miscellaneousDataStore.data.noble.usdnEarnApy).multipliedBy(100).toFixed(2)}%`
                  : '-'
              }
              {' '}APY
            </Text>
            {' '}with no lock-ups!
          </Text>

          {/* Input Card */}
          <View style={styles.card}>
            <Text style={styles.label}>Enter amount to deposit</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  amountError
                    ? styles.inputError
                    : styles.inputOk,
                  textInputValue.length < 12
                    ? styles.inputLarge
                    : textInputValue.length < 15
                      ? styles.inputMedium
                      : textInputValue.length < 18
                        ? styles.inputSmall
                        : styles.inputXSmall,
                ]}
                placeholder="0"
                keyboardType="numeric"
                value={textInputValue}
                onChangeText={setTextInputValue}
                autoFocus
                placeholderTextColor="#d1d5db"
              />
              <View style={styles.tokenBtn}>
                <Image
                  source={{uri: sourceToken?.img ?? Images.Logos.GenericDark}}
                  style={styles.tokenIcon}
                  resizeMode="contain"
                />
                <Text style={styles.tokenLabel}>{sourceToken?.symbol}</Text>
              </View>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.balanceText}>
                {formatTokenAmount(sourceToken?.amount ?? '0', sourceToken?.symbol)}
              </Text>
              <View style={styles.pctRow}>
                <TouchableOpacity style={styles.pctBtn} onPress={handle25Click}>
                  <Text style={styles.pctBtnText}>25%</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pctBtn} onPress={handle50Click}>
                  <Text style={styles.pctBtnText}>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pctBtn} onPress={handleMaxClick}>
                  <Text style={styles.pctBtnText}>Max</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <ArrowDown size={30} color="#22c55e" style={styles.arrowIcon} />
          </View>

          {/* Output Card */}
          <View style={styles.card}>
            <Text style={styles.label}>To</Text>
            <View style={styles.inputRow}>
              {isLoading ? (
                <View style={styles.tokenBtn}>
                  {/* Replace with a skeleton loader if you have one for RN */}
                  <Text style={{ color: '#64748b' }}>...</Text>
                </View>
              ) : (
                <TextInput
                  style={[styles.input, styles.inputOk]}
                  placeholder="0"
                  value={amountOut}
                  editable={false}
                  placeholderTextColor="#d1d5db"
                />
              )}
              <View style={styles.tokenBtn}>
                <Image
                  source={{uri: destinationToken?.img ?? Images.Logos.GenericDark}}
                  style={styles.tokenIcon}
                  resizeMode="contain"
                />
                <Text style={styles.tokenLabel}>{destinationToken?.symbol}</Text>
              </View>
            </View>
          </View>

          {/* Fees */}
          {(displayFeeValue?.fiatValue && new BigNumber(amount).gt(0) && !isLoading) && (
            <View style={styles.rowBetween}>
              <Text style={styles.feeLabel}>Fees</Text>
              <TouchableOpacity style={styles.feeInfo} onPress={() => setShowFeesSettingSheet(true)}>
                <GasPump size={20} color="#0f172a" />
                <Text style={styles.feeText}>{displayFeeValue?.fiatValue}</Text>
                <CaretDown size={16} color="#0f172a" />
              </TouchableOpacity>
            </View>
          )}

          {/* Error */}
          {(error || gasError || ledgerError) && (
            <Text style={styles.errorText}>{error || gasError || ledgerError}</Text>
          )}

          {/* Main Action */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              amountError ? styles.actionBtnError : isReviewDisabled ? styles.actionBtnDisabled : {},
            ]}
            disabled={isReviewDisabled}
            onPress={() => setShowReviewTxSheet(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnLabel}>
              {amountError ? amountError : 'Swap now'}
            </Text>
          </TouchableOpacity>

          {/* Terms agreement */}
          {mode === 'deposit' && (
            <View style={styles.agreeRow}>
              <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
                {isChecked
                  ? <CheckSquare size={24} color="#22c55e" weight="fill" />
                  : <Square size={24} color="#22c55e" />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => setShowTerms(true)}
                >
                  Terms & Conditions
                </Text>
              </Text>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ReviewTxSheet */}
      {showReviewTxSheet && sourceToken && destinationToken && (
        <ReviewTxSheet
          amountIn={amount}
          amountOut={amountOut}
          destination={destinationToken}
          source={sourceToken}
          isOpen={showReviewTxSheet}
          onClose={() => setShowReviewTxSheet(false)}
          onConfirm={handleConfirmTx}
          isProcessing={isProcessing || isLoading}
          error={error || gasError || ledgerError}
          showLedgerPopup={showLedgerPopup}
        />
      )}
      {/* Gas Price Modal/Sheet */}
      <GasPriceOptions
        recommendedGasLimit={recommendedGasLimit.toString()}
        gasLimit={userPreferredGasLimit?.toString() ?? recommendedGasLimit.toString()}
        setGasLimit={(value: number | string | BigNumber) => setUserPreferredGasLimit(Number(value.toString()))}
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={onGasPriceOptionChange}
        error={gasError}
        setError={setGasError}
        chain={'noble'}
        network={activeNetwork}
        rootDenomsStore={rootDenomsStore}
        rootBalanceStore={rootBalanceStore}
      >
        <DisplayFee
          style={{ display: 'none' }} // You can skip rendering
          setDisplayFeeValue={setDisplayFeeValue}
          setShowFeesSettingSheet={setShowFeesSettingSheet}
        />
        <FeesSettingsSheet
          showFeesSettingSheet={showFeesSettingSheet}
          onClose={() => setShowFeesSettingSheet(false)}
          gasError={null}
        />
      </GasPriceOptions>
    </>
  );
});

export default EarnPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconBtn: { padding: 6 },
  headerTitle: { fontWeight: 'bold', fontSize: 18, color: '#1e293b' },
  descText: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '400',
  },
  strongGreen: { color: '#22c55e', fontWeight: 'bold' },
  card: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 4,
    height: 36,
  },
  input: {
    backgroundColor: 'transparent',
    flex: 1,
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 32,
    padding: 0,
    margin: 0,
  },
  inputLarge: { fontSize: 24 },
  inputMedium: { fontSize: 22 },
  inputSmall: { fontSize: 20 },
  inputXSmall: { fontSize: 18 },
  inputError: { color: '#f87171' }, // red-400
  inputOk: { color: '#111827' }, // black-100
  tokenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 40,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  tokenLabel: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  rowBetween: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  balanceText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pctBtn: {
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 2,
  },
  pctBtnText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  arrowIcon: {
    backgroundColor: '#22c55e',
    borderRadius: 15,
    padding: 4,
  },
  feeLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  feeInfo: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  feeText: { fontSize: 12, color: '#0f172a', fontWeight: '600', marginHorizontal: 4 },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '700', marginVertical: 6, textAlign: 'center' },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#22c55e',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnLabel: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnError: { backgroundColor: '#dc2626' },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 6,
  },
  termsText: { fontSize: 12, color: '#64748b', fontWeight: '400', marginLeft: 6 },
  termsLink: { color: '#22c55e', fontWeight: '500' },
});
