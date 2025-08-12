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
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk';
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
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import useGetWallet = Wallet.useGetWallet;
import { Button } from '../../../components/ui/button';
import { useCaptureUIException } from '../../../hooks/perf-monitoring/useCaptureUIException';
import LottieView from 'lottie-react-native';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import { rootBalanceStore } from '../../../context/root-store';
import { claimRewardsStore, delegationsStore, unDelegationsStore, validatorsStore } from '../../../context/stake-store';
import { transitionTitleMap } from '../utils/stake-text';
import { MotiView } from 'moti';

export const ClaimCard = (props: { title?: string; subText?: string; imgSrc: string; fallbackImgSrc?: string }) => {
  // Adapt this for RN if not already:
  return (
    <View style={styles.claimCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.claimCardTitle}>{props.title}</Text>
        {!!props.subText && <Text style={styles.claimCardSub}>{props.subText}</Text>}
      </View>
      <View>
        <Image
          source={{ uri: props.imgSrc }}
          style={styles.claimCardImg}
        />
      </View>
    </View>
  );
};

interface ReviewClaimTxProps {
  isOpen: boolean;
  onClose: () => void;
  validator?: Validator;
  validators?: Record<string, Validator>;
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
}

const ReviewClaimTx = observer(
  ({
    isOpen, onClose, validator, validators, setClaimTxMode, forceChain, forceNetwork,
  }: ReviewClaimTxProps) => {
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
    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);

    const chainDelegations = delegationsStore.delegationsForChain(activeChain);
    const chainValidators = validatorsStore.validatorsForChain(activeChain);
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

    const { delegations, totalRewardsDollarAmt, rewards, totalRewards } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    );

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
      Object.values(delegations ?? {}),
      activeChain,
      activeNetwork,
    );

    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState<boolean>(false);
    const [gasError, setGasError] = useState<string | null>(null);
    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: gasOption,
      gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
    });

    const rewardValidators = useMemo(() => {
      if (rewards && validators) {
        return rewards.rewards.map((reward) => validators[reward.validator_address]);
      }
    }, [rewards, validators]);

    const { data: validatorImage } = useValidatorImage(
      rewardValidators?.[0]?.image ? undefined : rewardValidators?.[0],
    );
    const imageUrl = rewardValidators?.[0]?.image || validatorImage || Images.Misc.Validator;

    const nativeTokenReward = useMemo(() => {
      if (rewards) {
        return rewards?.total?.find((token) => token.denom === activeStakingDenom?.coinMinimalDenom);
      }
    }, [activeStakingDenom?.coinMinimalDenom, rewards]);

    useCaptureTxError(error);
    useEffect(() => {
      setAmount(nativeTokenReward?.amount ?? '0');
    }, [totalRewards]);

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

    const formattedTokenAmount = useMemo(() => {
      const rewardCount = rewards?.total?.length ?? 0;
      return hideAssetsStore.formatHideBalance(
        `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom)}${
          rewardCount > 1 ? ` +${rewardCount - 1} more` : ''
        }`
      );
    }, [activeStakingDenom?.coinDenom, nativeTokenReward?.amount, rewards?.total.length]);

    const titleText = useMemo(() => {
      if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)));
      } else {
        return formattedTokenAmount;
      }
    }, [formatCurrency, formattedTokenAmount, totalRewardsDollarAmt]);

    const subTitleText = useMemo(() => {
      if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return formattedTokenAmount;
      }
      return '';
    }, [formattedTokenAmount, totalRewardsDollarAmt]);

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

    const validatorDetails = useMemo(() => {
      const title =
        rewardValidators &&
        sliceWord(
          rewardValidators[0]?.moniker,
          10,
          3,
        );

      const subText =
        rewardValidators && (rewardValidators.length > 1 ? `+${rewardValidators.length - 1} more validators` : '');

      const imgSrc = imageUrl;

      return {
        title,
        subText,
        imgSrc,
      };
    }, [imageUrl, rewardValidators]);

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
            from={{ opacity: 0, translateY: 32 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.motiContainer}
          >
            <View style={styles.cardsRow}>
              <ClaimCard title={titleText} subText={subTitleText} imgSrc={activeStakingDenom.icon} />
              <ClaimCard {...validatorDetails} />
            </View>

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

        <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />

        <FeesSettingsSheet
          showFeesSettingSheet={showFeesSettingSheet}
          onClose={handleCloseFeeSettingSheet}
          gasError={gasError}
        />
      </GasPriceOptions>
    );
  }
);

const styles = StyleSheet.create({
  motiContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    gap: 18,
  },
  cardsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
    justifyContent: 'center',
  },
  claimCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    width: 165,
    gap: 8,
  },
  claimCardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    marginBottom: 4,
  },
  claimCardSub: {
    color: '#6b7280',
    fontSize: 13,
  },
  claimCardImg: {
    height: 48,
    width: 48,
    borderRadius: 24,
    marginLeft: 10,
    backgroundColor: '#fff',
  },
  feesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    marginBottom: 18,
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

export default ReviewClaimTx;
