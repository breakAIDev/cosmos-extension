import { StdFee } from '@cosmjs/stargate';
import {
  currencyDetail,
  fetchCurrency,
  formatBigNumber,
  GasOptions,
  getGasPricesForOsmosisFee,
  Token,
  useActiveChain,
  useChainId,
  useGetAptosGasPrices,
  useGetChains,
  useGetEvmGasPrices,
  useGetSolanaGasPrices,
  useGetSuiGasPrices,
  useHasToCalculateDynamicFee,
  useLowGasPriceStep,
  useNativeFeeDenom,
  useSeiLinkedAddressState,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  DefaultGasEstimates,
  DenomsRecord,
  GasPrice,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { CaretDown } from '@phosphor-icons/react';
import * as Sentry from '@sentry/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import Text from '../text';
import { TokenImageWithFallback } from '../token-image-with-fallback';
import { useEnableEvmGasRefetch } from '../../hooks/cosm-wasm/use-enable-evm-gas-refetch';
import { useFormatCurrency } from '../../hooks/settings/useCurrency';
import { Images } from '../../../assets/images';

import Long from 'long';
import { observer } from 'mobx-react-lite';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { activeChainStore } from '../../context/active-chain-store';
import { evmBalanceStore, solanaCoinDataStore, suiCoinDataStore } from '../../context/balance-store';
import { chainInfoStore } from '../../context/chain-infos-store';
import { chainApisStore } from '../../context/chains-api-store';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import {
  defaultGasEstimatesStore,
  feeMarketGasPriceStepStore,
  feeTokensStore,
  gasAdjustmentStore,
  gasPriceOptionsStore,
  gasPriceStepForChainStore,
} from '../../context/fee-store';
import { rootBalanceStore } from '../../context/root-store';
import { selectedNetworkStore } from '../../context/selected-network-store';
import { sliceWord } from '../../utils/strings';

import { GasPriceOptionsContext, GasPriceOptionsContextType, useGasPriceContext } from './context';
import { SelectTokenModal } from './select-token-modal';
import { updateFeeTokenData } from './utils';
import { Text } from 'react-native-gesture-handler';

type ExtendedNativeDenom = NativeDenom & { ibcDenom?: string };

export const useDefaultGasPrice = (
  denoms: DenomsRecord,
  options?: {
    activeChain?: SupportedChain;
    selectedNetwork?: 'mainnet' | 'testnet';
    feeDenom?: ExtendedNativeDenom;
    isSeiEvmTransaction?: boolean;
  },
) => {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => options?.activeChain ?? _activeChain, [_activeChain, options?.activeChain]);

  const _lowGasPriceStep = useLowGasPriceStep(activeChain);
  const { gasPrice: evmGasPrice } = useGetEvmGasPrices(activeChain, options?.selectedNetwork);
  const { gasPrice: aptosGasPrice } = useGetAptosGasPrices(activeChain, options?.selectedNetwork);
  const { gasPrice: solanaGasPrice } = useGetSolanaGasPrices(activeChain, options?.selectedNetwork);
  const { gasPrice: suiGasPrice } = useGetSuiGasPrices(activeChain, options?.selectedNetwork);
  const chains = useGetChains();

  const lowGasPriceStep = useMemo(() => {
    if (options?.isSeiEvmTransaction || chains[activeChain]?.evmOnlyChain) {
      return evmGasPrice.low;
    }

    if (isAptosChain(activeChain)) {
      return aptosGasPrice.low;
    }

    if (isSolanaChain(activeChain)) {
      return solanaGasPrice.low;
    }

    if (isSuiChain(activeChain)) {
      return suiGasPrice.low;
    }

    return _lowGasPriceStep;
  }, [
    _lowGasPriceStep,
    activeChain,
    aptosGasPrice.low,
    solanaGasPrice.low,
    chains,
    evmGasPrice.low,
    options?.isSeiEvmTransaction,
    suiGasPrice.low,
  ]);

  const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, options?.selectedNetwork);
  const defaultPrice = useMemo(() => {
    const feeDenom = options?.feeDenom ?? (nativeFeeDenom as ExtendedNativeDenom);
    const amount = new BigNumber(lowGasPriceStep);

    return {
      gasPrice: GasPrice.fromUserInput(amount.toString(), feeDenom?.ibcDenom ?? feeDenom?.coinMinimalDenom ?? ''),
    };
  }, [options?.feeDenom, nativeFeeDenom, lowGasPriceStep]);

  return defaultPrice;
};

function tokenHasBalance(token: Token | undefined) {
  return !!token?.amount && !isNaN(parseFloat(token?.amount)) && parseFloat(token.amount) > 0;
}

export type GasPriceOptionsProps = React.PropsWithChildren<{
  className?: string;
  hasUserTouchedFees?: boolean;
  recommendedGasLimit?: BigNumber | string;
  gasLimit: BigNumber | string;
  setGasLimit: (gasLimit: number | string | BigNumber) => void;
  recommendedGasPrice?: GasPrice;
  gasPriceOption: GasPriceOptionsContextType['value'];
  onGasPriceOptionChange: GasPriceOptionsContextType['onChange'];
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  initialFeeDenom?: string;
  chain?: SupportedChain;
  network?: 'mainnet' | 'testnet';
  considerGasAdjustment?: boolean;
  disableBalanceCheck?: boolean;
  fee?: StdFee;
  validateFee?: boolean;
  onInvalidFees?: (feeData: NativeDenom, isFeesValid: boolean | null) => void;
  isSelectedTokenEvm?: boolean;
  isSeiEvmTransaction?: boolean;
  notUpdateInitialGasPrice?: boolean;
  rootDenomsStore: RootDenomsStore;
  rootBalanceStore: RootBalanceStore;
  computedGas?: number;
  setComputedGas?: React.Dispatch<React.SetStateAction<number>>;
}>;

interface GasPriceOptionsType extends React.FC<GasPriceOptionsProps> {
  Selector: React.FC<{ className?: string; preSelected?: boolean }>;
  AdditionalSettingsToggle: React.FC<{
    children?: (isOpen: boolean) => JSX.Element;
    className?: string;
  }>;
  AdditionalSettings: React.FC<{
    className?: string;
    showGasLimitWarning?: boolean;
    rootDenomsStore: RootDenomsStore;
    rootBalanceStore: RootBalanceStore;
    gasError?: string | null;
  }>;
}

const GasPriceOptions = observer(
  ({
    gasPriceOption,
    onGasPriceOptionChange,
    initialFeeDenom,
    gasLimit,
    setGasLimit,
    recommendedGasLimit,
    className,
    children,
    error,
    setError,
    chain,
    network,
    considerGasAdjustment = true,
    disableBalanceCheck,
    validateFee = false,
    fee,
    onInvalidFees,
    isSelectedTokenEvm,
    isSeiEvmTransaction,
    notUpdateInitialGasPrice,
    hasUserTouchedFees,
    computedGas,
  }: GasPriceOptionsProps) => {
    const activeChain = chain ?? (activeChainStore.activeChain as SupportedChain);
    const selectedNetwork = network ?? selectedNetworkStore.selectedNetwork;

    const chainGasPriceOptionsStore = gasPriceOptionsStore.getStore(activeChain, selectedNetwork);

    const allTokensLoading = rootBalanceStore.getLoadingStatusForChain(activeChain, selectedNetwork);
    const spendableBalancesForChain = rootBalanceStore.getSpendableBalancesForChain(activeChain, selectedNetwork);

    const chainInfo = chainInfoStore.chainInfos[activeChain];
    const evmBalance = evmBalanceStore.evmBalanceForChain(activeChain, selectedNetwork);
    const solanaBalance = solanaCoinDataStore.getSolanaBalances(activeChain, selectedNetwork);
    const suiBalance = suiCoinDataStore.getSuiBalances(activeChain, selectedNetwork);

    const isSeiEvmChain = chainGasPriceOptionsStore.isSeiEvmChain;
    const feeTokenData = chainGasPriceOptionsStore.feeTokenData;
    const finalRecommendedGasLimit = chainGasPriceOptionsStore.finalRecommendedGasLimit;
    const hasToCalculateDynamicFee = chainGasPriceOptionsStore.hasToCalculateDynamicFee;

    const feeTokens = feeTokensStore.getStore(activeChain, selectedNetwork, isSeiEvmTransaction);
    const chainNativeFeeTokenData = feeTokens?.data?.[0];
    const isPayingFeeInNonNativeToken = feeTokenData?.ibcDenom !== chainNativeFeeTokenData?.ibcDenom;

    const { addressLinkState } = useSeiLinkedAddressState();

    useEnableEvmGasRefetch(activeChain, selectedNetwork);

    const allTokens = useMemo(() => {
      const _isSolanaChain = isSolanaChain(chainInfo.chainId);
      const _isSuiChain = isSuiChain(chainInfo.chainId);
      if (_isSolanaChain) {
        return solanaBalance;
      }
      if (_isSuiChain) {
        return suiBalance;
      }
      if (
        (isSeiEvmChain && isSelectedTokenEvm && !['done', 'unknown'].includes(addressLinkState)) ||
        chainInfo?.evmOnlyChain
      ) {
        return [...spendableBalancesForChain, ...(evmBalance?.evmBalance ?? [])].filter((token) =>
          new BigNumber(token.amount).gt(0),
        );
      }

      return spendableBalancesForChain;
    }, [
      isSeiEvmChain,
      isSelectedTokenEvm,
      addressLinkState,
      chainInfo?.evmOnlyChain,
      spendableBalancesForChain,
      evmBalance?.evmBalance,
      solanaBalance,
      suiBalance,
      chainInfo.chainId,
    ]);

    const allTokensStatus = useMemo(() => {
      if (
        (isSeiEvmChain && isSelectedTokenEvm && !['done', 'unknown'].includes(addressLinkState)) ||
        chainInfo?.evmOnlyChain
      ) {
        if (evmBalance?.status === 'loading' || allTokensLoading) {
          return 'loading';
        }
        return 'success';
      }
      return allTokensLoading ? 'loading' : 'success';
    }, [
      addressLinkState,
      allTokensLoading,
      chainInfo?.evmOnlyChain,
      evmBalance?.status,
      isSeiEvmChain,
      isSelectedTokenEvm,
    ]);

    const feeTokenAsset = allTokens.find((token: Token) => {
      if (isSelectedTokenEvm && token?.isEvm) {
        return token.coinMinimalDenom === feeTokenData?.denom.coinMinimalDenom;
      }

      if (token.ibcDenom) {
        return token.ibcDenom === feeTokenData?.ibcDenom;
      } else {
        return token.coinMinimalDenom === feeTokenData?.denom.coinMinimalDenom;
      }
    });

    useEffect(() => {
      const stringifiedFee = JSON.stringify(fee, (_, value) => {
        return typeof value === 'bigint' ? value.toString() : value;
      });

      if (stringifiedFee === chainGasPriceOptionsStore.prevFeeRef) return;
      chainGasPriceOptionsStore.prevFeeRef = stringifiedFee;
      if (fee && validateFee) {
        chainGasPriceOptionsStore
          .validateFees(
            {
              
              gaslimit: (fee as any).gasLimit ?? Long.fromString(fee.gas),
              feeAmount: fee.amount[0]?.amount,
              feeDenom: fee.amount[0]?.denom,
              chain: activeChain,
            },
            onInvalidFees ??
              (() => {
                //
              }),
            fetchCurrency,
          )
          .catch((e) => {
            Sentry.captureException(e);
          });
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fee, activeChain]);

    useEffect(() => {
      const fn = async () => {
        const dappFeeDenomData = feeTokens?.data?.find((a) => a.ibcDenom === initialFeeDenom);
        const feeTokenData = dappFeeDenomData ?? chainNativeFeeTokenData;
        if (
          activeChain === 'osmosis' &&
          feeTokenData &&
          ![feeTokenData.ibcDenom, feeTokenData.denom?.coinMinimalDenom].includes('uosmo')
        ) {
          const baseGasPriceStep = await gasPriceStepForChainStore.getGasPriceSteps(activeChain, selectedNetwork);
          const { lcdUrl } = await chainApisStore.getChainApis(activeChain, selectedNetwork);
          const gasPriceStep = await getGasPricesForOsmosisFee(
            lcdUrl ?? '',
            feeTokenData.ibcDenom ?? feeTokenData?.denom?.coinMinimalDenom ?? '',
            baseGasPriceStep,
          );
          chainGasPriceOptionsStore.setFeeTokenData({ ...feeTokenData, gasPriceStep });
        }

        if (hasToCalculateDynamicFee && feeTokenData) {
          let feeDenom = feeTokenData.denom?.coinMinimalDenom ?? '';
          if (feeTokenData.ibcDenom?.toLowerCase().startsWith('ibc/')) {
            feeDenom = feeTokenData.ibcDenom ?? feeDenom;
          }

          const gasPriceStep = await feeMarketGasPriceStepStore.getFeeMarketGasPricesSteps({
            chain: activeChain,
            network: selectedNetwork,
            feeDenom,
            forceBaseGasPriceStep: feeTokenData.gasPriceStep,
          });
          chainGasPriceOptionsStore.setFeeTokenData({
            ...feeTokenData,
            gasPriceStep: gasPriceStep,
          });
        }
      };

      fn();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feeTokens?.data, hasToCalculateDynamicFee]);

    useEffect(() => {
      if (recommendedGasLimit) {
        const gasLimit = isPayingFeeInNonNativeToken
          ? new BigNumber(recommendedGasLimit)
              .multipliedBy(chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier)
              .toFixed(0)
          : recommendedGasLimit.toString();
        chainGasPriceOptionsStore.setFinalRecommendedGasLimit(gasLimit);
      }
    }, [
      chainGasPriceOptionsStore,
      chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier,
      isPayingFeeInNonNativeToken,
      recommendedGasLimit,
    ]);

    useEffect(() => {
      chainGasPriceOptionsStore.feeIbcDenomTracker.previous = chainGasPriceOptionsStore.feeIbcDenomTracker.current;
      chainGasPriceOptionsStore.feeIbcDenomTracker.current = feeTokenData?.ibcDenom ?? '';

      if (!chainGasPriceOptionsStore.feeIbcDenomTracker.previous) return;

      if (
        chainGasPriceOptionsStore.feeIbcDenomTracker.current !== chainNativeFeeTokenData?.ibcDenom &&
        chainGasPriceOptionsStore.feeIbcDenomTracker.previous === chainNativeFeeTokenData?.ibcDenom
      ) {
        // if the user is paying with non-native token but previously had native token
        const newGasLimit = new BigNumber(gasLimit)
          .multipliedBy(chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier)
          .toFixed(0);
        const newRecommendedGasLimit = new BigNumber(finalRecommendedGasLimit)
          .multipliedBy(chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier)
          .toFixed(0);
        setGasLimit(newGasLimit);
        chainGasPriceOptionsStore.setFinalRecommendedGasLimit(newRecommendedGasLimit);

        return;
      }

      if (
        chainGasPriceOptionsStore.feeIbcDenomTracker.current === chainNativeFeeTokenData?.ibcDenom &&
        chainGasPriceOptionsStore.feeIbcDenomTracker.previous !== chainNativeFeeTokenData?.ibcDenom
      ) {
        // if the user is paying with native token but previously had non-native token
        const newGasLimit = new BigNumber(gasLimit)
          .dividedBy(chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier)
          .toFixed(0);
        setGasLimit(newGasLimit);
        const newRecommendedGasLimit = new BigNumber(finalRecommendedGasLimit)
          .dividedBy(chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier)
          .toFixed(0);

        setGasLimit(newGasLimit);
        chainGasPriceOptionsStore.setFinalRecommendedGasLimit(newRecommendedGasLimit);
      }
    }, [
      chainNativeFeeTokenData?.ibcDenom,
      feeTokenData?.ibcDenom,
      setGasLimit,
      gasLimit,
      recommendedGasLimit,
      finalRecommendedGasLimit,
      chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier,
      chainGasPriceOptionsStore,
    ]);

    useEffect(() => {
      const gasPriceBN = new BigNumber(gasPriceOption.gasPrice.amount.toFloatApproximation());
      // if the dapp has specified a fee granter or has set disableFeeCheck on SignOptions, the fees is being paid by the dapp we ignore the fee asset balance checks
      if (disableBalanceCheck || gasPriceBN.isZero() || allTokensStatus === 'loading') {
        setError(null);
        return;
      }
      if (!feeTokenAsset && feeTokenData?.denom.coinDenom) {
        return setError(`You do not have any ${feeTokenData?.denom.coinDenom} tokens`);
      }

      const isIbcDenom = !!feeTokenAsset?.ibcDenom;
      const hasToChangeDecimals =
        (isSeiEvmTransaction && feeTokenData?.denom?.coinMinimalDenom === 'usei') || chainInfo?.evmOnlyChain;

      const amount = gasPriceBN
        .multipliedBy(gasLimit)
        .multipliedBy(considerGasAdjustment ? gasAdjustmentStore.getGasAdjustments(activeChain) : 1)
        
        //@ts-ignore
        .dividedBy(10 ** (hasToChangeDecimals ? 18 : feeTokenData?.denom?.coinDecimals ?? 8));

      const skipBalanceCheck =
        !!notUpdateInitialGasPrice && hasUserTouchedFees !== true && !chainGasPriceOptionsStore.userHasSelectedToken;

      if (
        !skipBalanceCheck &&
        feeTokenData &&
        ((isIbcDenom && feeTokenAsset?.ibcDenom === feeTokenData?.ibcDenom) ||
          feeTokenAsset?.coinMinimalDenom === feeTokenData.denom?.coinMinimalDenom)
      ) {
        if (amount.isGreaterThan(feeTokenAsset?.amount ?? 0)) {
          setError(`You don't have enough ${feeTokenData?.denom.coinDenom.toUpperCase()} to pay gas fees`);
        } else {
          Number(gasLimit) && setError(null);
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      allTokensStatus,
      feeTokenAsset,
      feeTokenData,
      gasLimit,
      gasPriceOption.gasPrice.amount,
      gasPriceOption.gasPrice.denom,
      setError,
      disableBalanceCheck,
      considerGasAdjustment,
      notUpdateInitialGasPrice,
      hasUserTouchedFees,
      chainGasPriceOptionsStore.userHasSelectedToken,
    ]);

    // if recommended gas limit updates, set the gas limit to the recommended gas limit
    useEffect(() => {
      if (recommendedGasLimit) {
        setGasLimit(recommendedGasLimit.toString());
      }
      // if you add setGasLimit to the dependency array, its triggered when not needed
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recommendedGasLimit]);

    useEffect(() => {
      if (feeTokens?.isLoading || initialFeeDenom || chainGasPriceOptionsStore.userHasSelectedToken) {
        return;
      }

      const foundFeeTokenData = feeTokens?.data?.find(
        (feeToken) =>
          !!allTokens?.find((token: Token) => {
            if (token.ibcDenom) {
              return token.ibcDenom === feeToken?.ibcDenom && tokenHasBalance(token);
            } else {
              return token.coinMinimalDenom === feeToken?.denom?.coinMinimalDenom && tokenHasBalance(token);
            }
          }),
      );

      if (chainNativeFeeTokenData) {
        updateFeeTokenData({
          foundFeeTokenData,
          activeChain,
          selectedNetwork,
          chainNativeFeeTokenData,
          setFeeTokenData: (v) => chainGasPriceOptionsStore.setFeeTokenData(v),
          onGasPriceOptionChange,
          hasToCalculateDynamicFee,
          getFeeMarketGasPricesSteps: (feeDenom, forceBaseGasPriceStep) =>
            feeMarketGasPriceStepStore.getFeeMarketGasPricesSteps({
              chain: activeChain,
              network: selectedNetwork,
              feeDenom,
              forceBaseGasPriceStep,
            }),
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      chainNativeFeeTokenData,
      allTokens,
      feeTokens?.data,
      feeTokens?.isLoading,
      chainGasPriceOptionsStore.userHasSelectedToken,
      hasToCalculateDynamicFee,
    ]);

    useEffect(() => {
      if (feeTokens?.isLoading || !initialFeeDenom || chainGasPriceOptionsStore.userHasSelectedToken) {
        return;
      }

      let foundFeeTokenData = feeTokens?.data?.find((token) => {
        if (token.ibcDenom) {
          return token.ibcDenom === initialFeeDenom;
        }
        return token.denom.coinMinimalDenom === initialFeeDenom;
      });
      if (!notUpdateInitialGasPrice) {
        const dAppSuggestedFeeToken = allTokens?.find((token: Token) => {
          if (token.ibcDenom) {
            return token.ibcDenom === initialFeeDenom;
          }
          return token.coinMinimalDenom === initialFeeDenom;
        });
        if (!tokenHasBalance(dAppSuggestedFeeToken)) {
          foundFeeTokenData =
            feeTokens?.data?.find(
              (feeToken) =>
                !!allTokens?.find((token: Token) => {
                  if (token.ibcDenom) {
                    return token.ibcDenom === feeToken?.ibcDenom && tokenHasBalance(token);
                  } else {
                    return token.coinMinimalDenom === feeToken?.denom?.coinMinimalDenom && tokenHasBalance(token);
                  }
                }),
            ) ?? foundFeeTokenData;
        }
      }

      updateFeeTokenData({
        foundFeeTokenData,
        chainNativeFeeTokenData,
        setFeeTokenData: (v) => chainGasPriceOptionsStore.setFeeTokenData(v),
        onGasPriceOptionChange,
        activeChain,
        selectedNetwork,
        notUpdateGasPrice: notUpdateInitialGasPrice,
        hasToCalculateDynamicFee,
        getFeeMarketGasPricesSteps: (feeDenom, forceBaseGasPriceStep) =>
          feeMarketGasPriceStepStore.getFeeMarketGasPricesSteps({
            chain: activeChain,
            network: selectedNetwork,
            feeDenom,
            forceBaseGasPriceStep,
          }),
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      feeTokens?.data,
      initialFeeDenom,
      allTokens,
      feeTokens?.isLoading,
      chainGasPriceOptionsStore.userHasSelectedToken,
      notUpdateInitialGasPrice,
      hasToCalculateDynamicFee,
    ]);

    if (!feeTokenData) return null;

    return (
      <View style={[className]}>
        <GasPriceOptionsContext.Provider
          value={{
            value: gasPriceOption,
            onChange: onGasPriceOptionChange,
            feeTokenData,
            setFeeTokenData: (v) => chainGasPriceOptionsStore.setFeeTokenData(v),
            gasLimit,
            setGasLimit,
            recommendedGasLimit: finalRecommendedGasLimit,
            viewAdditionalOptions: chainGasPriceOptionsStore.viewAdditionalOptions,
            setViewAdditionalOptions: (flag) => {
              typeof flag === 'boolean' && chainGasPriceOptionsStore.setViewAdditionalPriceOptions(flag);
              typeof flag === 'function' &&
                chainGasPriceOptionsStore.setViewAdditionalPriceOptions(
                  flag(chainGasPriceOptionsStore.viewAdditionalOptions),
                );
            },
            error,
            setError,
            feeTokenAsset,
            allTokens,
            //TODO: remove this
            allTokensStatus,
            userHasSelectedToken: chainGasPriceOptionsStore.userHasSelectedToken,
            setUserHasSelectedToken: (v) => chainGasPriceOptionsStore.setUserHasSelectedToken(v),
            considerGasAdjustment: considerGasAdjustment,
            activeChain,
            selectedNetwork,
            rootDenomsStore: rootDenomsStore,
            isSeiEvmTransaction,
            chainNativeFeeTokenData,
            computedGas,
          }}
        >
          {children}
        </GasPriceOptionsContext.Provider>
      </View>
    );
  },
) as GasPriceOptionsType;

export const calculateFeeAmount = ({
  gasPrice,
  gasLimit,
  feeDenom,
  gasAdjustment,
  isSeiEvmTransaction,
  isSolana,
  isSui,
  computedGas,
}: {
  gasPrice: BigNumber.Value;
  gasLimit: BigNumber.Value;
  feeDenom: NativeDenom;
  gasAdjustment: number;
  isSeiEvmTransaction?: boolean;
  isSolana?: boolean;
  isSui?: boolean;
  computedGas?: number;
}) => {
  const gasPriceBN = new BigNumber(gasPrice);

  let amount = gasPriceBN
    .multipliedBy(gasAdjustment)
    .multipliedBy(gasLimit)
    .dividedBy(10 ** (isSeiEvmTransaction ? 18 : feeDenom.coinDecimals));

  if (isSolana) {
    if (isNaN(amount.toNumber())) {
      amount = new BigNumber(5000).dividedBy(10 ** feeDenom.coinDecimals);
    } else {
      amount = amount.plus(new BigNumber(5000).dividedBy(10 ** feeDenom.coinDecimals));
    }
  }
  if (isSui) {
    amount = amount.plus(new BigNumber(computedGas ?? 0).dividedBy(10 ** feeDenom.coinDecimals));
  }
  return {
    amount,
    formattedAmount: amount.isEqualTo(0)
      ? '0'
      : amount.isLessThan('0.00001')
      ? '< 0.00001'
      : amount.toFormat(5, BigNumber.ROUND_DOWN),
    isVerySmallAmount: amount.isLessThan('0.00001') && !amount.isEqualTo(0),
  } as const;
};

function Selector({ className, preSelected = true }: { className?: string; preSelected?: boolean }) {
  const {
    value,
    onChange,
    gasLimit,
    feeTokenData,
    considerGasAdjustment,
    activeChain,
    selectedNetwork,
    isSeiEvmTransaction,
    computedGas,
  } = useGasPriceContext();
  const chains = useGetChains();
  const chainId = useChainId(activeChain, selectedNetwork);

  const [formatCurrency, preferredCurrency] = useFormatCurrency();

  const { data: feeTokenFiatValue } = useQuery(['fee-token-fiat-value', feeTokenData.denom.coinGeckoId], async () => {
    return fetchCurrency(
      '1',
      feeTokenData.denom.coinGeckoId,
      feeTokenData.denom.chain as SupportedChain,
      currencyDetail[preferredCurrency].currencyPointer,
      `${chainId}-${feeTokenData.denom.coinMinimalDenom}`,
    );
  });

  useEffect(() => {
    // trigger onChange after first render
    if (feeTokenData && !value && preSelected) {
      onChange(
        {
          option: GasOptions.LOW,
          gasPrice: GasPrice.fromUserInput(
            feeTokenData.gasPriceStep.low.toString(),
            feeTokenData.ibcDenom ?? feeTokenData.denom.coinMinimalDenom,
          ),
        },
        feeTokenData,
      );
    }

    if (feeTokenData && !value && !preSelected) {
      onChange(
        {
          option: '' as GasOptions,
          gasPrice: GasPrice.fromUserInput(
            feeTokenData.gasPriceStep.low.toString(),
            feeTokenData.ibcDenom ?? feeTokenData.denom.coinMinimalDenom,
          ),
        },
        feeTokenData,
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <View style={[styles.gasGrid, className]}>
      {Object.entries(feeTokenData?.gasPriceStep ?? {}).map(([level, gasPrice]) => {
        const isSelected = value.option === level;
        const gasPriceBN = new BigNumber(gasPrice);
        const estimatedGasLimit =
          gasLimit ??
          defaultGasEstimatesStore.estimate?.[activeChain]?.DEFAULT_GAS_TRANSFER ??
          DefaultGasEstimates.DEFAULT_GAS_TRANSFER;
        const { amount, formattedAmount, isVerySmallAmount } = calculateFeeAmount({
          gasPrice: gasPriceBN,
          gasLimit: estimatedGasLimit,
          feeDenom: feeTokenData.denom,
          gasAdjustment: considerGasAdjustment ? gasAdjustmentStore.getGasAdjustments(activeChain) : 1,
          isSeiEvmTransaction: isSeiEvmTransaction || chains[activeChain]?.evmOnlyChain,
          isSolana: isSolanaChain(activeChain),
          isSui: isSuiChain(activeChain),
          computedGas: computedGas,
        });
        const amountInFiat = feeTokenFiatValue ? new BigNumber(amount).multipliedBy(feeTokenFiatValue) : null;
        const handleChange = () => {
          onChange(
            {
              option: level,
              gasPrice: GasPrice.fromUserInput(
                gasPrice?.toString() || '0',
                feeTokenData.ibcDenom ?? feeTokenData.denom.coinMinimalDenom,
              ),
            },
            feeTokenData,
          );
        };
        const levelText = (level) => {
          if (activeChain === 'bitcoin' || activeChain === 'bitcoinSignet') {
            const levelMap = {
              high: 'fast',
              medium: 'average',
              low: 'slow',
            };
            return levelMap[level];
          }
          return level;
        };

        return (
          <TouchableOpacity
            key={level}
            style={[
              styles.gasOption,
              isSelected && styles.gasOptionSelected,
            ]}
            onPress={handleChange}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.gasOptionLabel,
                isSelected && styles.gasOptionLabelSelected,
              ]}
            >
              {levelText(level)}
            </Text>
            <Text
              style={[
                styles.gasAmount,
                isSelected && styles.gasAmountSelected,
              ]}
            >
              {isVerySmallAmount ? '< 0.00001' : formattedAmount} {sliceWord(feeTokenData?.denom?.coinDenom ?? '')}
            </Text>
            {amountInFiat ? (
              <Text style={styles.fiatAmount}>
                {formatCurrency(amountInFiat)}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

GasPriceOptions.Selector = observer(Selector);

GasPriceOptions.AdditionalSettingsToggle = function AdditionalSettingsToggle({
  children,
  className,
}: {
  
  children?: (isOpen: boolean) => JSX.Element;
  className?: string;
}) {
  const { viewAdditionalOptions, setViewAdditionalOptions } = useGasPriceContext();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.toggleRow}
      onPress={() => setViewAdditionalOptions((v) => !v)}
    >
      {children?.(viewAdditionalOptions) ?? (
        <View style={styles.rowBetween}>
          <Text
            style={[
              styles.toggleLabel,
              !viewAdditionalOptions && styles.toggleLabelInactive,
            ]}
          >
            Show additional settings
          </Text>
          <Icon
            name="chevron-down" // Substitute with CaretDown, or any icon you prefer
            size={14}
            style={[
              styles.caret,
              viewAdditionalOptions && styles.caretOpen,
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const isGasLimitInvalid = (_limit: string) => {
  const limit = new BigNumber(_limit);
  return limit.isNaN() || limit.isLessThan(0) || !limit.isInteger();
};

GasPriceOptions.AdditionalSettings = observer(
  ({
    className,
    showGasLimitWarning,
    rootDenomsStore,
    rootBalanceStore,
    gasError,
  }: {
    className?: string;
    showGasLimitWarning?: boolean;
    rootDenomsStore: RootDenomsStore;
    rootBalanceStore: RootBalanceStore;
    gasError?: string | null;
  }) => {
    const [showTokenSelectSheet, setShowTokenSelectSheet] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);

    const {
      feeTokenData,
      setFeeTokenData,
      onChange,
      chainNativeFeeTokenData,
      viewAdditionalOptions,
      value,
      feeTokenAsset,
      allTokens,
      setError,
      gasLimit,
      setGasLimit,
      recommendedGasLimit,
      allTokensStatus,
      setUserHasSelectedToken,
      userHasSelectedToken,
      considerGasAdjustment,
      activeChain,
      selectedNetwork,
      isSeiEvmTransaction,
    } = useGasPriceContext();

    // hardcoded
    const hasToCalculateDynamicFee = useHasToCalculateDynamicFee(activeChain, selectedNetwork);

    const activeChainfeeTokensStore = feeTokensStore.getStore(activeChain, selectedNetwork, isSeiEvmTransaction);
    const feeTokensList = activeChainfeeTokensStore?.data;
    const isLoading = activeChainfeeTokensStore?.isLoading;
    const [gasLimitInputValue, setGasLimitInputValue] = useState('100000');

    useEffect(() => {
      setGasLimitInputValue(() => {
        const limit = gasLimit.toString() || recommendedGasLimit?.toString() || '100000';
        return Math.round(
          Number(limit) * (considerGasAdjustment ? gasAdjustmentStore.getGasAdjustments(activeChain) : 1),
        ).toString();
      });
    }, [activeChain, considerGasAdjustment, gasLimit, recommendedGasLimit]);

    const eligibleFeeTokens = useMemo(() => {
      return allTokens.filter((token) => {
        return feeTokensList?.find((feeToken) => {
          // is token ibc?
          if (token.ibcDenom) {
            return feeToken.ibcDenom === token.ibcDenom;
          }
          return feeToken.denom.coinMinimalDenom === token.coinMinimalDenom;
        });
      });
    }, [allTokens, feeTokensList]);

    useEffect(() => {
      if (viewAdditionalOptions) {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, [viewAdditionalOptions]);

    useEffect(() => {
      if (isGasLimitInvalid(gasLimitInputValue)) {
        setError('Gas limit is invalid');
      }
    }, [gasLimitInputValue, setError]);

    useEffect(() => {
      const handleTouch = () => {
        setInputTouched(true);
      };
      const input = inputRef.current;
      if (!input || inputTouched) {
        return;
      }
      input.addEventListener('click', handleTouch, {
        once: true,
      });
      return () => {
        input.removeEventListener('click', handleTouch);
      };
    }, [feeTokenAsset, inputTouched, viewAdditionalOptions]);

    if (!feeTokenAsset && (!eligibleFeeTokens || eligibleFeeTokens?.length === 0)) {
      if (allTokensStatus === 'error') {
        return (
          <View style={styles.fullWidth && styles.z0 && styles.p3}>
            <Text style={colorScheme === 'dark' ? styles.textSmGrayDark : styles.textSmGray}>
              Failed to load your tokens, please reload the extension and try again
            </Text>
          </View>
        );
      }
      if (allTokensStatus === 'loading' && viewAdditionalOptions) {
        return (
          <View style={styles.fullWidth && styles.z0 && styles.p3}>
            <View style={styles.row && styles.fullWidth}>
              <SkeletonPlaceholder borderRadius={9999}>
                <SkeletonPlaceholder.Item
                  width={80} // w-20
                  height={40} // h-10
                  borderRadius={9999} // rounded-full
                  style={styles.skeleton}
                />
              </SkeletonPlaceholder>
              <SkeletonPlaceholder borderRadius={9999}>
                <SkeletonPlaceholder.Item
                  width={128} // w-32
                  height={20} // h-5
                  borderRadius={9999} // rounded-full
                  style={styles.skeleton}
                />
              </SkeletonPlaceholder>
            </View>
            <SkeletonPlaceholder borderRadius={12}>
              <SkeletonPlaceholder.Item
                width="100%" // w-full
                height={40} // h-10
                borderRadius={12} // rounded-lg
                style={[styles.skeleton, { marginTop: 12 }]} // mt-3 = 12
              />
            </SkeletonPlaceholder>
          </View>
        );
      }
      if (allTokensStatus === 'success' && viewAdditionalOptions) {
        return (
          <View style={styles.fullWidth && styles.z0 && styles.p3}>
            <Text style={colorScheme === 'dark' ? styles.textSmGrayDark : styles.textSmGray}>
              You do not have any tokens that can be used to pay transaction fees.
            </Text>
          </View>
        );
      }
      return null;
    }

    const onlySingleFeeToken = feeTokensList?.length === 1;

    const handleTokenSelect = async (selectedMinimalDenom: string, selectedIbcDenom?: string) => {
      const selectedFeeTokenData = feeTokensList?.find((feeToken) => {
        if (feeToken.ibcDenom && selectedIbcDenom) {
          return feeToken.ibcDenom === selectedIbcDenom;
        }
        return feeToken.denom.coinMinimalDenom === selectedMinimalDenom;
      });
      if (selectedFeeTokenData) {
        updateFeeTokenData({
          foundFeeTokenData: selectedFeeTokenData,
          chainNativeFeeTokenData,
          setFeeTokenData,
          onGasPriceOptionChange: onChange,
          activeChain,
          selectedNetwork,
          defaultGasPriceOption: value?.option ?? '',
          hasToCalculateDynamicFee,
          getFeeMarketGasPricesSteps: (feeDenom, forceBaseGasPriceStep) =>
            feeMarketGasPriceStepStore.getFeeMarketGasPricesSteps({
              chain: activeChain,
              network: selectedNetwork,
              feeDenom,
              forceBaseGasPriceStep,
            }),
        });
        setError(null);
        if (!userHasSelectedToken) {
          setUserHasSelectedToken(true);
        }
        setTimeout(() => {
          document.getElementById(`gas-option-${value.option}`)?.click();
        }, 50);
      } else {
        setError('Unable to calculate gas price for selected token');
      }
    };

    const handleGasLimitOnChange = (e: ChangeEvent<TextInput>) => {
      const value = e.target.value;
      setGasLimitInputValue(value);

      const _gasLimitInt =
        parseInt(value || '0', 10) / (considerGasAdjustment ? gasAdjustmentStore.getGasAdjustments(activeChain) : 1);
      const _gasLimit = Math.round(_gasLimitInt).toString();

      if (!isGasLimitInvalid(gasLimitInputValue) && _gasLimit !== recommendedGasLimit) {
        setGasLimit(_gasLimit);
      }
    };

    return viewAdditionalOptions ? (
      <>
        <View style={styles.additionalPanel}>
          <Text style={styles.toggleLabel}>
            {onlySingleFeeToken
              ? 'You are paying fees transaction fees in'
              : 'Choose a token for paying transaction fees'}
          </Text>
          <View style={styles.selectTokenRow}>
            <TouchableOpacity
              style={[
                styles.selectTokenButton,
                isLoading || onlySingleFeeToken ? styles.disabledButton : null,
              ]}
              disabled={isLoading || onlySingleFeeToken}
              onPress={() => setShowTokenSelectSheet(true)}
            >
              <TokenImageWithFallback
                assetImg={feeTokenData.denom.icon ?? feeTokenAsset?.img}
                text={feeTokenData.denom.coinDenom}
                altText={feeTokenData.denom.coinDenom}
              />
              <Text style={styles.tokenDenomText}>
                {sliceWord(feeTokenData?.denom?.coinDenom ?? '', 3, 3)}
              </Text>
              {/* RN: Use Icon instead of <img>. For demo, left as null */}
              {(isLoading || onlySingleFeeToken) ? null : (
                <Images.Misc.FilledDownArrowSvg /> // You can use a vector icon here
              )}
            </TouchableOpacity>
            <View style={styles.balanceCol}>
              <Text style={styles.balanceLabel}>BAL:</Text>
              <Text style={styles.balanceValue}>
                {formatBigNumber(new BigNumber(feeTokenAsset?.amount ?? '0'))}{' '}
                {sliceWord(feeTokenData?.denom?.coinDenom ?? '')}
              </Text>
            </View>
          </View>
          <View style={styles.mt4}>
            <View style={styles.gap3}>
              <Text style={styles.inputLabel}>Enter gas limit manually</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.gasLimitInput,
                    !gasError ? styles.textMonochrome : styles.textDestructive,
                  ]}
                  value={gasLimitInputValue}
                  onChangeText={handleGasLimitOnChange}
                  ref={inputRef}
                  keyboardType="numeric"
                  placeholder="Enter gas limit"
                />
                <TouchableOpacity
                  onPress={() => setGasLimit(recommendedGasLimit)}
                >
                  <Text style={styles.clearButton}>Clear</Text>
                </TouchableOpacity>
              </View>
              {gasError ? (
                <Text style={styles.errorText}>{gasError}</Text>
              ) : showGasLimitWarning &&
                inputTouched &&
                new BigNumber(gasLimitInputValue).isLessThan(
                  Math.round(
                    Number(recommendedGasLimit) *
                      (considerGasAdjustment ? gasAdjustmentStore.getGasAdjustments(activeChain) : 1)
                  )
                ) ? (
                <Text style={styles.warningText}>We recommend using the default gas limit</Text>
              ) : null}
            </View>
          </View>
        </View>
        <SelectTokenModal
          isOpen={showTokenSelectSheet}
          assets={eligibleFeeTokens}
          selectedToken={feeTokenAsset}
          onClose={() => setShowTokenSelectSheet(false)}
          onTokenSelect={handleTokenSelect}
        />
      </>
    ) : null;
  },
);
const styles = StyleSheet.create({
  gasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5, // or marginHorizontal in each item
  },
  gasOption: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    margin: 2,
    backgroundColor: '#fff',
  },
  gasOptionSelected: {
    backgroundColor: '#F4F4F6',
  },
  gasOptionLabel: {
    textTransform: 'capitalize',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
    color: '#555',
  },
  gasOptionLabelSelected: {
    color: '#222',
    fontWeight: '700',
  },
  gasAmount: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#777',
    textAlign: 'center',
  },
  gasAmountSelected: {
    color: '#222',
  },
  fiatAmount: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
    additionalPanel: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
  },
  selectTokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F4F6',
    borderRadius: 12,
    paddingRight: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  selectTokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 9999,
    backgroundColor: '#F4F4F6',
  },
  disabledButton: {
    opacity: 0.5,
  },
  tokenDenomText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 16,
    marginRight: 8,
  },
  balanceCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#888',
  },
  balanceValue: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  gap3: {
    flexDirection: 'column',
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  gasLimitInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  textMonochrome: {
    color: '#222',
  },
  textDestructive: {
    color: '#FF4C4C',
  },
  clearButton: {
    marginLeft: 10,
    fontWeight: '700',
    color: '#AAA',
    fontSize: 12,
  },
  errorText: {
    color: '#FF4C4C',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  warningText: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },  toggleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    gap: 8, // Only works on RN >= 0.71
  },
  rowBetween: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555', // Normal
  },
  toggleLabelInactive: {
    color: '#AAA', // text-muted-foreground
  },
  caret: {
    color: '#AAA', // Default color, update for theme
    transform: [{ rotate: '0deg' }],
  },
  caretOpen: {
    transform: [{ rotate: '180deg' }],
  },
  textSmGray: {
    fontSize: 14,
    color: '#374151', // gray-700
  },
  textSmGrayDark: {
    fontSize: 14,
    color: '#9CA3AF', // gray-400 for dark mode
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeleton: {
    backgroundColor: '#F9FAFB', // gray-50 (can be changed for dark mode support)
    marginHorizontal: 2,
  },

  // General utility
  fullWidth: { width: '100%' },
  column: { flexDirection: 'column' },
  rounded: { borderRadius: 12 },
  px4: { paddingHorizontal: 16 },
  py3: { paddingVertical: 12 },
  mt4: { marginTop: 16 },
  p3: { padding: 12 },
  z0: { zIndex: 0 },
});
export default GasPriceOptions;
