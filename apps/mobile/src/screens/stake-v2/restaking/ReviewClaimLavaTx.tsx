import {
  FeeTokenData,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useDualStaking,
  useDualStakingTx,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import { Provider, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk';
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
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
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import LottieView from 'lottie-react-native';

import { ClaimCard } from '../components/ReviewClaimTx';
import { transitionTitleMap } from '../utils/stake-text';

interface ReviewClaimLavaTxProps {
  isOpen: boolean;
  onClose: () => void;
  validator?: Validator;
  rootDenomsStore: RootDenomsStore;
  rootBalanceStore: RootBalanceStore;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void;
}
export const ReviewClaimLavaTx = observer(
  ({
    isOpen,
    onClose,
    validator,
    rootDenomsStore,
    rootBalanceStore,
    forceChain,
    forceNetwork,
    setClaimTxMode,
  }: ReviewClaimLavaTxProps) => {
    const denoms = rootDenomsStore.allDenoms;
    const _activeChain = useActiveChain();
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

    const _activeNetwork = useSelectedNetwork();
    const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);

    const getWallet = Wallet.useGetWallet();
    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain,
      selectedNetwork: activeNetwork,
    });

    const [formatCurrency] = useFormatCurrency();
    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);

    const { rewards, providers } = useDualStaking();
    const rewardProviders = useMemo(() => {
      if (rewards && providers) {
        const _rewardProviders = rewards?.rewards
          ?.map((reward) => providers.find((provider) => provider.address === reward.provider))
          .filter((provider) => provider !== undefined);
        return _rewardProviders as Provider[];
      }
    }, [providers, rewards]);
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
      customFee,
      feeDenom,
      ledgerError,
      setLedgerError,
    } = useDualStakingTx(
      denoms,
      'CLAIM_REWARDS',
      validator as Validator,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      rewardProviders,
      activeChain,
      activeNetwork,
    );
    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState<boolean>(false);
    const [gasError, setGasError] = useState<string | null>(null);
    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: gasOption,
      gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
    });

    useCaptureTxError(error);

    useEffect(() => {
      setAmount(rewards?.totalRewards ?? '0');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rewards?.totalRewards]);

    const formattedTokenProviderReward = useMemo(() => {
      if (rewards) {
        const rewardItems = rewards.rewards
          ?.flatMap((reward) => reward.amount)
          .reduce((acc, curr) => {
            acc[curr.denom] = acc[curr.denom]
              ? new BigNumber(acc[curr.denom]).plus(new BigNumber(curr.amount))
              : new BigNumber(curr.amount);
            return acc;
          }, {} as Record<string, BigNumber>);
        const rewardsLength = Object.keys(rewardItems ?? {}).length;
        return hideAssetsStore.formatHideBalance(
          `${rewards.formattedTotalRewards} ${rewardsLength > 1 ? `+${rewardsLength - 1} more` : ''}`,
        );
      }
    }, [rewards]);

    const onGasPriceOptionChange = useCallback(
      (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
        setGasPriceOption(value);
        setFeeDenom(feeBaseDenom.denom);
        if (value.option) {
          setGasOption(value.option);
        }
      },
      [setFeeDenom, setGasOption],
    );

    const handleCloseFeeSettingSheet = useCallback(() => {
      setShowFeesSettingSheet(false);
    }, []);

    const txCallback = useCallback(() => {
      setClaimTxMode('CLAIM_REWARDS');
      onClose();
    }, [onClose, setClaimTxMode]);

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

    useCaptureUIException(ledgerError || error);

    return (
      <GasPriceOptions
        recommendedGasLimit={recommendedGasLimit}
        gasLimit={userPreferredGasLimit?.toString() ?? recommendedGasLimit}
        setGasLimit={(value: string | number | BigNumber) => setUserPreferredGasLimit(Number(value.toString()))}
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={onGasPriceOptionChange}
        error={gasError}
        chain={activeChain}
        network={activeNetwork}
        setError={setGasError}
        rootDenomsStore={rootDenomsStore}
        rootBalanceStore={rootBalanceStore}
      >
        <BottomModal
          isOpen={isOpen}
          onClose={onClose}
          title={transitionTitleMap.CLAIM_REWARDS}
          containerStyle={styles.modalContainer}
        >
          <View style={styles.centeredContent}>
            <ClaimCard
              title={hideAssetsStore.formatHideBalance(
                formatCurrency(new BigNumber(rewards?.totalRewardsDollarAmt ?? '0')),
              )}
              subText={formattedTokenProviderReward}
              imgSrc={activeStakingDenom.icon}
            />
            <ClaimCard
              title={
                rewardProviders &&
                sliceWord(
                  rewardProviders[0]?.moniker,
                  10, // mobile: no window width logic
                  3,
                )
              }
              subText={
                rewardProviders && (rewardProviders.length > 1 ? `+${rewardProviders.length - 1} more providers` : '')
              }
              imgSrc={Images.Misc.Validator}
            />
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Fees</Text>
            <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />
          </View>

          <View style={styles.btnArea}>
            {ledgerError ? <Text style={styles.errorMsg}>{ledgerError}</Text> : null}
            {error ? <Text style={styles.errorMsg}>{error}</Text> : null}
            {gasError && !showFeesSettingSheet ? (
              <Text style={styles.errorMsg}>{gasError}</Text>
            ) : null}

            <Button
              style={styles.confirmBtn}
              disabled={isLoading || !!error || !!gasError || showLedgerPopup || !!ledgerError}
              onPress={onClaimRewardsClick}
            >
              {isLoading ? (
                <LottieView
                  autoPlay
                  loop
                  source={loadingImage}
                  style={{ height: 24, width: 24 }}
                />
              ) : (
                'Confirm Claim'
              )}
            </Button>
          </View>
        </BottomModal>

        <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />

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
  modalContainer: {
    padding: 24,
    marginTop: 12,
  },
  centeredContent: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: 16,
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  feeLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  btnArea: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  errorMsg: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  confirmBtn: {
    width: '100%',
  },
});

