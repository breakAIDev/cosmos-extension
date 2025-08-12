import {
  FeeTokenData,
  formatTokenAmount,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStakeTx,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain, Validator, Delegation } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import GasPriceOptions, { useDefaultGasPrice } from '../../../components/gas-price-options';
import { GasPriceOptionValue } from '../../../components/gas-price-options/context';
import { DisplayFee } from '../../../components/gas-price-options/display-fee';
import { FeesSettingsSheet } from '../../../components/gas-price-options/fees-settings-sheet';
import LedgerConfirmationPopup from '../../../components/ledger-confirmation/LedgerConfirmationPopup';
import BottomModal from '../../../components/new-bottom-modal';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { useCaptureTxError } from '../../../hooks/utility/useCaptureTxError';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { Wallet } from '../../../hooks/wallet/useWallet';
import { Images } from '../../../../assets/images';
import loadingImage from '../../../../assets/lottie-files/swaps-btn-loading.json';
import LottieView from 'lottie-react-native';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import useGetWallet = Wallet.useGetWallet;

import { Button } from '../../../components/ui/button';
import { useCaptureUIException } from '../../../hooks/perf-monitoring/useCaptureUIException';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { rootBalanceStore } from '../../../context/root-store';
import { claimRewardsStore } from '../../../context/stake-store';
import { MotiView, AnimatePresence } from 'moti';

import { transitionTitleMap } from '../utils/stake-text';
import { ClaimCard } from './ReviewClaimTx';

interface ReviewValidatorClaimTxProps {
  isOpen: boolean;
  onClose: () => void;
  validator?: Validator;
  validators?: Record<string, Validator>;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
  selectedDelegation: Delegation;
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void;
}

const ReviewValidatorClaimTx = observer(
  ({
    isOpen,
    onClose,
    validator,
    forceChain,
    forceNetwork,
    selectedDelegation,
    setClaimTxMode,
  }: ReviewValidatorClaimTxProps) => {
    const _activeChain = useActiveChain();
    const activeChain = forceChain ?? _activeChain;
    const _activeNetwork = useSelectedNetwork();
    const activeNetwork = forceNetwork ?? _activeNetwork;

    const getWallet = useGetWallet(activeChain);
    const denoms = rootDenomsStore.allDenoms;
    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain,
      selectedNetwork: activeNetwork,
    });

    const [formatCurrency] = useFormatCurrency();
    const defaultTokenLogo = useDefaultTokenLogo();
    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);

    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

    const {
      showLedgerPopup,
      onReviewTransaction,
      isLoading,
      error,
      setAmount,
      recommendedGasLimit,
      userPreferredGasLimit,
      setUserPreferredGasLimit,
      gasOption,
      setGasOption,
      userPreferredGasPrice,
      setFeeDenom,
      ledgerError,
      setLedgerError,
      customFee,
      feeDenom,
      setUserPreferredGasPrice,
    } = useStakeTx(
      denoms,
      'CLAIM_REWARDS',
      validator as Validator,
      undefined,
      [selectedDelegation],
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

    // Calculate validator rewards
    const [validatorRewardCurrency, validatorRewardToken, validatorRewardTotal] = useMemo(() => {
      const validatorRewards = chainClaimRewards?.rewards?.rewards?.[validator?.address ?? ''];
      const _validatorRewardCurrency = validatorRewards?.reward.reduce(
        (acc, reward) => acc.plus(new BigNumber(reward.currencyAmount ?? '')),
        new BigNumber(0),
      );
      const rewardCount = validatorRewards?.reward.length ?? 0;
      const nativeReward = validatorRewards?.reward.find((r) => r.denom === activeStakingDenom?.coinMinimalDenom);
      const _validatorRewardToken =
        formatTokenAmount(nativeReward?.amount ?? '', activeStakingDenom?.coinDenom) +
        `${rewardCount > 1 ? ` +${rewardCount - 1} more` : ''}`;
      const _validatorRewardTotal = validatorRewards?.reward.reduce(
        (acc, reward) => acc.plus(new BigNumber(reward.amount)),
        new BigNumber(0),
      );
      return [_validatorRewardCurrency, _validatorRewardToken, _validatorRewardTotal];
    }, [activeStakingDenom, chainClaimRewards, validator]);

    useCaptureTxError(error);
    useEffect(() => {
      setAmount(validatorRewardTotal?.toString() ?? '0');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validatorRewardTotal]);

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

    const handleCloseFeeSettingSheet = useCallback(() => {
      setShowFeesSettingSheet(false);
    }, []);

    const txCallback = useCallback(() => {
      setClaimTxMode('CLAIM_REWARDS');
      onClose();
    }, [setClaimTxMode, onClose]);

    const onClaimRewardsClick = useCallback(async () => {
      try {
        const wallet = await getWallet(activeChain);
        onReviewTransaction(wallet, txCallback, false, {
          stdFee: customFee,
          feeDenom: feeDenom,
        });
      } catch (error) {
        const _error = error as Error;
        setLedgerError(_error.message);

        setTimeout(() => {
          setLedgerError('');
        }, 6000);
      }
    }, [activeChain, customFee, feeDenom, getWallet, onReviewTransaction, setLedgerError, txCallback]);

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
        <BottomModal isOpen={isOpen} onClose={onClose} title={transitionTitleMap.CLAIM_REWARDS}>
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 350 }}
            style={styles.content}
          >
            <View style={styles.cardsRow}>
              <ClaimCard
                title={formatCurrency(validatorRewardCurrency ?? new BigNumber(''))}
                subText={validatorRewardToken}
                imgSrc={activeStakingDenom.icon}
              />
              <ClaimCard
                title={
                  validator &&
                  sliceWord(
                    validator.moniker,
                    10,
                    3,
                  )
                }
                imgSrc={imageUrl}
              />
            </View>
            <View style={styles.feesRow}>
              <Text style={styles.feesLabel}>Fees</Text>
              <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />
            </View>
            <View style={styles.errorRow}>
              {!!ledgerError && (
                <Text style={styles.errorText}>{ledgerError}</Text>
              )}
              {!!error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
              {!!gasError && !showFeesSettingSheet && (
                <Text style={styles.errorText}>{gasError}</Text>
              )}
            </View>
            <Button
              style={styles.button}
              disabled={isLoading || !!error || !!gasError || showLedgerPopup || !!ledgerError}
              onPress={onClaimRewardsClick}
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
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm Claim</Text>
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
  },
);

const styles = StyleSheet.create({
  content: {
    padding: 12,
    alignItems: 'center',
    gap: 18,
  },
  cardsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 18,
  },
  feesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    marginBottom: 16,
  },
  feesLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorRow: {
    minHeight: 28,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff453a',
    marginBottom: 4,
    paddingHorizontal: 6,
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

export default ReviewValidatorClaimTx;
