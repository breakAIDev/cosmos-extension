import {
  FeeTokenData,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStakeTx,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain, UnbondingDelegationEntry, Validator } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import GasPriceOptions, { useDefaultGasPrice } from '../../../components/gas-price-options';
import { GasPriceOptionValue } from '../../../components/gas-price-options/context';
import { DisplayFee } from '../../../components/gas-price-options/display-fee';
import { FeesSettingsSheet } from '../../../components/gas-price-options/fees-settings-sheet';
import LedgerConfirmationPopup from '../../../components/ledger-confirmation/LedgerConfirmationPopup';
import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import { useCaptureUIException } from '../../../hooks/perf-monitoring/useCaptureUIException';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { useCaptureTxError } from '../../../hooks/utility/useCaptureTxError';
import { Wallet } from '../../../hooks/wallet/useWallet';
import { Images } from '../../../../assets/images';
import loadingImage from '../../../../assets/lottie-files/swaps-btn-loading.json';
import LottieView from 'lottie-react-native';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { rootBalanceStore } from '../../../context/root-store';
import { ClaimCard } from './ReviewClaimTx';
import { MotiView } from 'moti';
import useGetWallet = Wallet.useGetWallet;
import { transitionTitleMap } from '../utils/stake-text';

interface ReviewCancelUnstakeTxProps {
  isOpen: boolean;
  onClose: () => void;
  validator: Validator;
  unbondingDelegationEntry?: UnbondingDelegationEntry;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void;
}

const ReviewCancelUnstakeTx = observer(({
  isOpen,
  onClose,
  validator,
  unbondingDelegationEntry,
  forceChain,
  forceNetwork,
  setClaimTxMode,
}: ReviewCancelUnstakeTxProps) => {
  const denoms = rootDenomsStore.allDenoms;
  const getWallet = useGetWallet();
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);
  const defaultGasPrice = useDefaultGasPrice(denoms, { activeChain, selectedNetwork: activeNetwork });
  const [formatCurrency] = useFormatCurrency();
  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);

  const {
    showLedgerPopup,
    onReviewTransaction,
    isLoading,
    error,
    setAmount,
    recommendedGasLimit,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    setUserPreferredGasPrice,
    gasOption,
    setGasOption,
    userPreferredGasPrice,
    setFeeDenom,
    setCreationHeight,
    ledgerError,
    setLedgerError,
    customFee,
    feeDenom,
  } = useStakeTx(
    denoms,
    'CANCEL_UNDELEGATION',
    validator as Validator,
    undefined,
    undefined,
    activeChain,
    activeNetwork,
  );

  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState<boolean>(false);
  const [gasError, setGasError] = useState<string | null>(null);
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  });

  const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator);
  const imageUrl = validator?.image || validatorImage || Images.Misc.Validator;

  useCaptureTxError(error);

  useEffect(() => {
    if (unbondingDelegationEntry) {
      setCreationHeight(unbondingDelegationEntry.creation_height);
      setAmount(unbondingDelegationEntry.balance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unbondingDelegationEntry]);

  useEffect(() => {
    if (gasPriceOption.option) setGasOption(gasPriceOption.option);
    if (gasPriceOption.gasPrice) setUserPreferredGasPrice(gasPriceOption.gasPrice);
  }, [gasPriceOption, setGasOption, setUserPreferredGasPrice]);

  const onGasPriceOptionChange = useCallback(
    (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
      setGasPriceOption(value);
      setFeeDenom(feeBaseDenom.denom);
    },
    [setFeeDenom],
  );

  const handleCloseFeeSettingSheet = useCallback(() => setShowFeesSettingSheet(false), []);

  const txCallback = useCallback(() => {
    setClaimTxMode('CANCEL_UNDELEGATION');
    onClose();
  }, [onClose, setClaimTxMode]);

  const onSubmit = useCallback(async () => {
    try {
      const wallet = await getWallet(activeChain);
      onReviewTransaction(wallet, txCallback, false, {
        stdFee: customFee,
        feeDenom: feeDenom,
      });
    } catch (error) {
      const _error = error as Error;
      setLedgerError(_error.message);
      setTimeout(() => setLedgerError(''), 6000);
    }
  }, [customFee, feeDenom, getWallet, onReviewTransaction, setLedgerError, txCallback, activeChain]);

  useCaptureUIException(ledgerError || error, {
    activeChain,
    activeNetwork,
  });

  return (
    <GasPriceOptions
      recommendedGasLimit={recommendedGasLimit}
      gasLimit={userPreferredGasLimit?.toString() ?? recommendedGasLimit}
      setGasLimit={(value: number | string | BigNumber) => setUserPreferredGasLimit(Number(value.toString()))}
      gasPriceOption={gasPriceOption}
      onGasPriceOptionChange={onGasPriceOptionChange}
      error={gasError}
      setError={setGasError}
      chain={activeChain}
      network={activeNetwork}
      rootBalanceStore={rootBalanceStore}
      rootDenomsStore={rootDenomsStore}
    >
      <BottomModal isOpen={isOpen} onClose={onClose} title={transitionTitleMap.CANCEL_UNDELEGATION}>
        <MotiView
          from={{ opacity: 0, translateY: 32 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.motiContainer}
        >
          <Text style={styles.infoText}>
            This will reset the unstaking period and stake the tokens back to the validator
          </Text>

          <ClaimCard
            title={formatCurrency(new BigNumber(unbondingDelegationEntry?.currencyBalance ?? ''))}
            subText={unbondingDelegationEntry?.formattedBalance}
            imgSrc={activeStakingDenom.icon}
          />

          <ClaimCard
            title={sliceWord(validator?.moniker, 10, 3)}
            subText='Validator'
            imgSrc={imageUrl}
          />

          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Fees</Text>
            <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />
          </View>

          <View style={{ alignItems: 'center', minHeight: 34 }}>
            {!!ledgerError && <Text style={styles.errorText}>{ledgerError}</Text>}
            {!!error && <Text style={styles.errorText}>{error}</Text>}
            {!!gasError && !showFeesSettingSheet && (
              <Text style={styles.errorText}>{gasError}</Text>
            )}
          </View>

          <Button
            style={styles.button}
            disabled={isLoading || !!error || !!gasError || !!ledgerError}
            onPress={onSubmit}
          >
            {isLoading ? (
              <View style={{ height: 24, width: 24 }}>
                <LottieView
                  source={loadingImage}
                  autoPlay
                  loop
                  style={{ height: 24, width: 24 }}
                />
              </View>
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm</Text>
            )}
          </Button>
        </MotiView>
      </BottomModal>

      {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}

      <FeesSettingsSheet
        showFeesSettingSheet={showFeesSettingSheet}
        onClose={handleCloseFeeSettingSheet}
        gasError={gasError}
      />
    </GasPriceOptions>
  );
});

const styles = StyleSheet.create({
  motiContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    gap: 18,
  },
  infoText: {
    fontSize: 14,
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },
  feesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    marginBottom: 14,
  },
  feesLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff453a',
    marginBottom: 3,
    paddingHorizontal: 6,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginTop: 10,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReviewCancelUnstakeTx;
