import {
  ChainRewards,
  FeeTokenData,
  formatTokenAmount,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useClaimAndStakeRewards,
  useSelectedNetwork,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks';
import { GasPrice, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import GasPriceOptions, { useDefaultGasPrice } from '../../../components/gas-price-options';
import { GasPriceOptionValue } from '../../../components/gas-price-options/context';
import { DisplayFee } from '../../../components/gas-price-options/display-fee';
import { FeesSettingsSheet } from '../../../components/gas-price-options/fees-settings-sheet';
import LedgerConfirmationPopup from '../../../components/ledger-confirmation/LedgerConfirmationPopup';
import BottomModal from '../../../components/new-bottom-modal';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { useCaptureTxError } from '../../../hooks/utility/useCaptureTxError';
import { Wallet } from '../../../hooks/wallet/useWallet';
import { Images } from '../../../../assets/images';
import loadingImage from '../../../../assets/lottie-files/swaps-btn-loading.json';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useGetWallet = Wallet.useGetWallet;

import { Button } from '../../../components/ui/button';
import { useCaptureUIException } from '../../../hooks/perf-monitoring/useCaptureUIException';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import { rootBalanceStore } from '../../../context/root-store';
import { claimRewardsStore, delegationsStore, unDelegationsStore, validatorsStore } from '../../../context/stake-store';

import { transitionTitleMap } from '../utils/stake-text';
import { ClaimCard } from './ReviewClaimTx';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface ReviewClaimAndStakeTxProps {
  isOpen: boolean;
  onClose: () => void;
  validators: Record<string, Validator>;
  chainRewards: ChainRewards;
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
}

const ReviewClaimAndStakeTx = observer(
  ({
    isOpen,
    onClose,
    validators,
    chainRewards,
    setClaimTxMode,
    forceChain,
    forceNetwork,
  }: ReviewClaimAndStakeTxProps) => {
    const _activeChain = useActiveChain();
    const _activeNetwork = useSelectedNetwork();
    const activeChain = forceChain ?? _activeChain;
    const activeNetwork = forceNetwork ?? _activeNetwork;

    const getWallet = useGetWallet(activeChain);
    const [formatCurrency] = useFormatCurrency();

    const denoms = rootDenomsStore.allDenoms;
    const chainDelegations = delegationsStore.delegationsForChain(activeChain);
    const chainValidators = validatorsStore.validatorsForChain(activeChain);
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);
    const { delegations, totalRewardsDollarAmt, rewards } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    );

    const [error, setError] = useState('');
    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain,
      selectedNetwork: activeNetwork,
    });

    const {
      claimAndStakeRewards,
      recommendedGasLimit,
      userPreferredGasLimit,
      setUserPreferredGasLimit,
      setUserPreferredGasPrice,
      gasOption,
      setGasOption,
      userPreferredGasPrice,
      setFeeDenom,
      setMemo,
      showLedgerPopup,
      ledgerError,
      setLedgerError,
    } = useClaimAndStakeRewards(
      denoms,
      delegations,
      chainRewards,
      chainClaimRewards.refetchDelegatorRewards,
      setError,
      activeChain,
      undefined,
      activeNetwork,
    );

    const [gasError, setGasError] = useState<string | null>(null);
    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false);
    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: gasOption,
      gasPrice: (userPreferredGasPrice ?? defaultGasPrice.gasPrice) as GasPrice,
    });

    const nativeTokenReward = useMemo(() => {
      if (rewards) {
        return rewards.total?.find((token) => token.denom === activeStakingDenom?.coinMinimalDenom);
      }
    }, [activeStakingDenom?.coinMinimalDenom, rewards]);

    const rewardValidators = useMemo(() => {
      if (rewards && Object.values(validators ?? {}).length) {
        return rewards.rewards
          .filter((reward) => reward.reward.some((r) => r.denom === activeStakingDenom?.coinMinimalDenom))
          .map((reward) => validators[reward.validator_address]);
      }
    }, [activeStakingDenom?.coinMinimalDenom, rewards, validators]);

    const { data: validatorImage } = useValidatorImage(
      rewardValidators?.[0]?.image ? undefined : rewardValidators?.[0],
    );
    const imageUrl = rewardValidators?.[0]?.image || validatorImage || Images.Misc.Validator;
    useCaptureTxError(error);

    useEffect(() => {
      let isPromotedValidator = false;
      if (rewardValidators?.length) {
        for (const validator of rewardValidators) {
          if (validator && validator.custom_attributes?.priority && validator.custom_attributes.priority > 0) {
            isPromotedValidator = true;
            break;
          }
        }
      }
      setMemo(isPromotedValidator ? 'Staked with Leap Wallet' : '');
    }, [rewardValidators, setMemo]);

    const txCallback = useCallback(() => {
      setClaimTxMode('CLAIM_AND_DELEGATE');
      onClose();

      // mixpanel.track(EventName.TransactionSigned, {
      //   transactionType: 'stake_claim_and_delegate',
      // })
    }, [onClose, setClaimTxMode]);

    const onClaimRewardsClick = useCallback(async () => {
      try {
        const wallet = await getWallet();
        await claimAndStakeRewards(wallet, {
          success: txCallback,
        });
      } catch (error) {
        const _error = error as Error;
        setLedgerError(_error.message);

        setTimeout(() => {
          setLedgerError('');
        }, 6000);
      }
    }, [claimAndStakeRewards, getWallet, setLedgerError, txCallback]);

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

    const formattedTokenAmount = useMemo(() => {
      return hideAssetsStore.formatHideBalance(
        formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom),
      );
    }, [activeStakingDenom?.coinDenom, nativeTokenReward?.amount]);

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

    useCaptureUIException(ledgerError || error, {
      activeChain,
      activeNetwork,
    });

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

      return { title, subText, imgSrc, fallbackImgSrc: Images.Misc.Validator };
    }, [imageUrl, rewardValidators]);

    const [loading, setLoading] = useState(false);

    const handleConfirm = useCallback(() => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setClaimTxMode('CLAIM_AND_DELEGATE');
        onClose();
      }, 1200);
    }, [onClose, setClaimTxMode]);
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
        <BottomModal
          isOpen={isOpen}
          onClose={onClose}
          title={<span className='whitespace-nowrap'>{transitionTitleMap.CLAIM_AND_DELEGATE}</span>}
          style={{padding: 24, marginTop: 16}}
        >
          <View style={modalStyles.backdrop}>
            <View style={modalStyles.sheet}>
              <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
                <Text style={modalStyles.title}>Claim & Stake</Text>
                <ClaimCard title={titleText} subText={subTitleText} imgSrc={Images.Misc.Validator} />
                <ClaimCard {...validatorDetails} />

                <View style={modalStyles.feeRow}>
                  <Text style={modalStyles.feeLabel}>Fees</Text>
                  {/* You can add your fee display logic here */}
                  <Text style={modalStyles.feeValue}>--</Text>
                </View>

                <View style={modalStyles.errorContainer}>
                  {ledgerError ? <Text style={modalStyles.errorText}>{ledgerError}</Text> : null}
                  {error ? <Text style={modalStyles.errorText}>{error}</Text> : null}
                  {gasError ? <Text style={modalStyles.errorText}>{gasError}</Text> : null}
                </View>

                <Button
                  style={modalStyles.button}
                  disabled={loading || !!error || !!gasError || !!ledgerError || showLedgerPopup}
                  onPress={handleConfirm}
                >
                  {loading ? (
                    <LottieView
                      source={{uri: '../../../../assets/lottie-files/swaps-btn-loading.json'}}
                      autoPlay
                      loop
                      style={{ height: 28, width: 28 }}
                    />
                  ) : (
                    'Confirm Claim'
                  )}
                </Button>
              </ScrollView>
            </View>
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

export default ReviewClaimAndStakeTx;


const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    minHeight: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 15,
    color: '#8287A7',
    fontWeight: '500',
  },
  feeValue: {
    fontSize: 15,
    color: '#22243A',
    fontWeight: '600',
  },
  button: { width: '100%', marginTop: 12 },
  errorContainer: { width: '100%', alignItems: 'center', marginVertical: 4 },
  errorText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold', marginVertical: 2 },
});