import { useEarnTx } from '@leapwallet/cosmos-wallet-hooks';
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import { FeeTokenData } from '@leapwallet/cosmos-wallet-store';
import { formatTokenAmount } from '@leapwallet/cosmos-wallet-store/dist/utils';
import BigNumber from 'bignumber.js';
import GasPriceOptions, { useDefaultGasPrice } from '../../components/gas-price-options';
import { GasPriceOptionValue } from '../../components/gas-price-options/context';
import { DisplayFee } from '../../components/gas-price-options/display-fee';
import { FeesSettingsSheet } from '../../components/gas-price-options/fees-settings-sheet';
import LedgerConfirmationPopup from '../../components/ledger-confirmation/LedgerConfirmationPopup';
import BottomModal from '../../components/new-bottom-modal';
import Text from '../../components/text';
import { useSelectedNetwork } from '../../hooks/settings/useNetwork';
import { Wallet } from '../../hooks/wallet/useWallet';
import loadingImage from '../../../assets/lottie-files/swaps-btn-loading.json';
import LottieView from 'lottie-react-native';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useState } from 'react';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  denom: NativeDenom;
  amount: string;
  setTxHash: (val: string) => void;
};

const ReviewClaimTxSheet = observer(({ isOpen, onClose, denom, amount, setTxHash }: Props) => {
  const activeNetwork = useSelectedNetwork();
  const {
    setAmount,
    userPreferredGasLimit,
    recommendedGasLimit,
    setUserPreferredGasLimit,
    userPreferredGasPrice,
    gasOption,
    setGasOption,
    setUserPreferredGasPrice,
    setFeeDenom,
    onReviewTransaction,
    txHash,
    isLoading,
    setError,
    error,
    ledgerError,
    showLedgerPopup,
  } = useEarnTx(rootDenomsStore.allDenoms, 'claim');
  const getWallet = Wallet.useGetWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false);

  const defaultGasPrice = useDefaultGasPrice(rootDenomsStore.allDenoms, {
    activeChain: 'noble',
  });
  const [gasError, setGasError] = useState<string | null>(null);
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  });
  const isReviewDisabled = isLoading || !!error || !!gasError || !!ledgerError || isProcessing;

  const handleConfirmTx = useCallback(async () => {
    setIsProcessing(true);
    try {
      const wallet = await getWallet('noble');
      onReviewTransaction(wallet, () => {}, false);
    } catch (error) {
      setError(error as string);
      setTimeout(() => {
        setError(undefined);
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  }, [getWallet, onReviewTransaction, setError]);

  useEffect(() => {
    if (txHash) {
      setTxHash(txHash);
    }
  }, [setTxHash, txHash]);

  useEffect(() => {
    setGasPriceOption({
      option: gasOption,
      gasPrice: defaultGasPrice.gasPrice,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom]);

  useEffect(() => {
    if (gasPriceOption.option) {
      setGasOption(gasPriceOption.option);
    }
    if (gasPriceOption.gasPrice) {
      setUserPreferredGasPrice(gasPriceOption.gasPrice);
    }
  }, [gasPriceOption, setGasOption, setUserPreferredGasPrice]);

  const onGasPriceOptionChange = useCallback(
    (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
      setGasPriceOption(value);
      setFeeDenom(feeBaseDenom.denom);
    },
    [setFeeDenom],
  );

  useEffect(() => {
    setAmount(amount);
  }, [amount, setAmount]);

  return (
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
      <BottomModal title="Confirm Transaction" isOpen={isOpen} onClose={onClose} style={{ zIndex: 10 }}>
        <View style={styles.sheet}>
          <View style={styles.tokenCard}>
            <Image
              source={{ uri: denom.icon ?? '../../../assets/images/default-token.png'}}
              style={styles.tokenIcon}
              resizeMode="contain"
            />
            <Text style={styles.tokenAmountText}>
              {formatTokenAmount(amount, denom.coinDenom, 5)}
            </Text>
          </View>

          <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />

          {(error || gasError || ledgerError) && (
            <Text style={styles.errorText}>{error || gasError || ledgerError}</Text>
          )}

          <TouchableOpacity
            style={[styles.confirmBtn, isReviewDisabled && styles.disabledBtn]}
            disabled={isReviewDisabled}
            onPress={handleConfirmTx}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <LottieView
                source={loadingImage}
                autoPlay
                loop
                style={{ width: 24, height: 24 }}
              />
            ) : (
              <Text style={styles.confirmBtnText}>Confirm Claim</Text>
            )}
          </TouchableOpacity>
        </View>
      </BottomModal>
      {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}
      <FeesSettingsSheet
        showFeesSettingSheet={showFeesSettingSheet}
        onClose={() => setShowFeesSettingSheet(false)}
        gasError={gasError}
      />
    </GasPriceOptions>
  );
});

export default ReviewClaimTxSheet;

const styles = StyleSheet.create({
  sheet: {
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tokenCard: {
    width: '100%',
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    gap: 18,
  },
  tokenIcon: {
    width: 44,
    height: 44,
    marginRight: 16,
    borderRadius: 22,
    backgroundColor: '#fff',
  },
  tokenAmountText: {
    fontWeight: 'bold',
    color: '#222', // black-100
    fontSize: 18,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  confirmBtn: {
    width: '100%',
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.4,
  },
});
