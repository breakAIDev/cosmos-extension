import {
  FeeTokenData,
  GasOptions,
  GasPriceStep,
  getGasPricesForOsmosisFee,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  defaultGasPriceStep,
  GasPrice,
  NetworkType,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';

// CHANGE: use Sentry for React Native
import * as Sentry from '@sentry/react-native';

import { chainApisStore } from '../../context/chains-api-store';
import { gasPriceStepForChainStore } from '../../context/fee-store';
import { uiErrorTags } from '../../utils/sentry';

import { GasPriceOptionValue } from './context';

type UpdateFeeTokenDataParams = {
  foundFeeTokenData?: FeeTokenData;
  activeChain: SupportedChain;
  selectedNetwork: NetworkType;
  chainNativeFeeTokenData?: FeeTokenData;
  setFeeTokenData: (feeDenom: FeeTokenData) => void;
  onGasPriceOptionChange: (value: GasPriceOptionValue, feeDenom: FeeTokenData) => void;
  notUpdateGasPrice?: boolean;
  hasToCalculateDynamicFee: boolean;
  defaultGasPriceOption?: GasOptions;
  getFeeMarketGasPricesSteps: (
    feeDenom: string,
    forceBaseGasPriceStep?: GasPriceStep,
    isIbcDenom?: boolean,
  ) => Promise<GasPriceStep>;
};

export async function updateFeeTokenData({
  foundFeeTokenData,
  activeChain,
  selectedNetwork,
  chainNativeFeeTokenData,
  setFeeTokenData,
  onGasPriceOptionChange,
  notUpdateGasPrice = false,
  hasToCalculateDynamicFee,
  getFeeMarketGasPricesSteps,
  defaultGasPriceOption = GasOptions.LOW,
}: UpdateFeeTokenDataParams) {
  let feeTokenDataToSet = foundFeeTokenData;

  if (foundFeeTokenData) {
    if (
      activeChain === 'osmosis' &&
      ![foundFeeTokenData.ibcDenom, foundFeeTokenData.denom.coinMinimalDenom].includes('uosmo')
    ) {
      try {
        const [baseGasPriceStep, { lcdUrl }] = await Promise.all([
          gasPriceStepForChainStore.getGasPriceSteps(activeChain, selectedNetwork),
          chainApisStore.getChainApis(activeChain, selectedNetwork),
        ]);

        const gasPriceStep = await getGasPricesForOsmosisFee(
          lcdUrl ?? '',
          foundFeeTokenData.ibcDenom ?? foundFeeTokenData.denom.coinMinimalDenom,
          baseGasPriceStep,
        );

        feeTokenDataToSet = { ...foundFeeTokenData, gasPriceStep };
      } catch (error) {
        feeTokenDataToSet = {
          ...foundFeeTokenData,
          gasPriceStep: {
            low: defaultGasPriceStep.low,
            medium: defaultGasPriceStep.average,
            high: defaultGasPriceStep.high,
          },
        };

        // ✅ React Native Sentry
        Sentry.captureException(error, {
          tags: uiErrorTags,
        });
      }
    } else if (hasToCalculateDynamicFee) {
      let feeDenom = foundFeeTokenData.denom?.coinMinimalDenom ?? '';
      if (foundFeeTokenData.ibcDenom?.toLowerCase().startsWith('ibc/')) {
        feeDenom = foundFeeTokenData.ibcDenom;
      }

      const gasPriceStep = await getFeeMarketGasPricesSteps(feeDenom, foundFeeTokenData.gasPriceStep);

      feeTokenDataToSet = { ...foundFeeTokenData, gasPriceStep };
    }
  } else {
    feeTokenDataToSet = chainNativeFeeTokenData;
  }

  if (feeTokenDataToSet) {
    setFeeTokenData(feeTokenDataToSet);

    if (!notUpdateGasPrice) {
      onGasPriceOptionChange(
        {
          option: defaultGasPriceOption,
          gasPrice: GasPrice.fromUserInput(
            feeTokenDataToSet.gasPriceStep.low.toString(),
            feeTokenDataToSet.ibcDenom ?? feeTokenDataToSet.denom.coinMinimalDenom,
          ),
        },
        feeTokenDataToSet,
      );
    }
  }
}
