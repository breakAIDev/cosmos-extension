import { StdFee } from '@cosmjs/stargate';
import {
  currencyDetail,
  fetchCurrency,
  SelectedNetworkType,
  useChainId,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks';
import { fromSmallBN, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { FeeTokensStoreData, RootBalanceStore } from '@leapwallet/cosmos-wallet-store';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
// Tooltip and Warning need to be adapted for React Native!
import Tooltip from '../../components/better-tooltip';
import { useFormatCurrency } from '../../hooks/settings/useCurrency';
// Use a local image or RN Image import
import { Warning } from '../../../assets/images/misc';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// Utility function for fee formatting
const generateFeeValues = (fee: StdFee, coinDecimals: number) => {
  const { amount } = fee;
  const x = amount[0]?.amount ?? '';
  const amountBN = fromSmallBN(new BigNumber(x).toString(), coinDecimals);
  const formattedAmount = amountBN.toFormat(5, BigNumber.ROUND_DOWN);
  const isVerySmallAmount = amountBN.isLessThan('0.00001');
  return {
    amount: amountBN,
    formattedAmount: isVerySmallAmount && !amountBN.isEqualTo(0) ? '< 0.00001' : formattedAmount,
  };
};

type StaticFeeDisplayProps = {
  fee: StdFee | undefined;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  disableBalanceCheck?: boolean;
  rootBalanceStore: RootBalanceStore;
  activeChain: SupportedChain;
  selectedNetwork: SelectedNetworkType;
  feeTokensList: FeeTokensStoreData | null | undefined;
};

const StaticFeeDisplay: React.FC<StaticFeeDisplayProps> = observer(
  ({
    fee,
    error,
    setError,
    disableBalanceCheck,
    rootBalanceStore,
    activeChain,
    selectedNetwork,
    feeTokensList,
  }) => {
    const [preferredCurrency] = useUserPreferredCurrency();

    const allAssets = rootBalanceStore.getSpendableBalancesForChain(activeChain, selectedNetwork);
    const allTokensLoading = rootBalanceStore.getLoadingStatusForChain(activeChain, selectedNetwork);
    const allTokensStatus = useMemo(() => {
      return allTokensLoading ? 'loading' : 'success';
    }, [allTokensLoading]);

    const chainId = useChainId();
    const [formatCurrency] = useFormatCurrency();

    const feeToken = useMemo(() => {
      const feeBaseDenom = fee?.amount[0]?.denom;
      const feeDenomData = feeTokensList?.find((token) => {
        if (token.ibcDenom) {
          return token.ibcDenom === feeBaseDenom;
        }
        return token.denom.coinMinimalDenom === feeBaseDenom;
      });
      const amount = allAssets.find((asset) => {
        if (feeDenomData?.ibcDenom || asset?.ibcDenom) {
          return asset?.ibcDenom === feeDenomData?.ibcDenom;
        }
        return asset?.coinMinimalDenom === feeDenomData?.denom?.coinMinimalDenom;
      })?.amount;

      return { ...feeDenomData, amount };
    }, [allAssets, fee?.amount, feeTokensList]);

    const { data: feeTokenFiatValue } = useQuery(['fee-token-fiat-value', feeToken?.denom?.coinDenom], async () => {
      return fetchCurrency(
        '1',
        feeToken?.denom?.coinGeckoId ?? '',
        feeToken?.denom?.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
        `${chainId}-${feeToken?.denom?.coinMinimalDenom}`,
      );
    });

    const feeValues = useMemo(() => {
      if (!fee) return null;
      return generateFeeValues(fee, feeToken?.denom?.coinDecimals ?? 0);
    }, [fee, feeToken?.denom?.coinDecimals]);

    useEffect(() => {
      const amountString = feeValues?.amount?.toString();
      if (!disableBalanceCheck && amountString && allTokensStatus !== 'loading') {
        if (new BigNumber(amountString).isGreaterThan(feeToken?.amount ?? 0)) {
          setError(`You don't have enough ${feeToken?.denom?.coinDenom} to pay the gas fee`);
        } else {
          setError(null);
        }
      }
    }, [feeToken, feeValues, allTokensStatus, disableBalanceCheck, setError]);

    // ---- UI conversion starts here ----

    if (!feeValues) return null;

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.title}>Transaction Fee</Text>
          <Tooltip
            content={
              <Text style={styles.tooltipContent}>
                This dApp does not allow you to edit the transaction fee.
              </Text>
            }
          >
            <View style={styles.iconContainer}>
              <Image source={{uri: Warning}} style={styles.icon} resizeMode="contain" />
            </View>
          </Tooltip>
        </View>
        <View style={styles.row}>
          <Text style={styles.feeAmount}>
            {feeValues.formattedAmount} {feeToken?.denom?.coinDenom}
          </Text>
          {feeTokenFiatValue ? (
            <Text style={styles.fiatValue}>
              ({formatCurrency(new BigNumber(feeValues?.amount ?? 0).multipliedBy(feeTokenFiatValue))})
            </Text>
          ) : null}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }
);

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  title: {
    color: '#6B7280', // gray-500
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  tooltipContent: {
    color: '#374151', // gray-700
    fontSize: 14,
    fontWeight: '500',
  },
  iconContainer: {
    marginLeft: 4,
    position: 'relative',
  },
  icon: {
    width: 20,
    height: 20,
  },
  feeAmount: {
    color: '#374151', // gray-700
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
    marginTop: 2,
  },
  fiatValue: {
    color: '#6B7280', // gray-500
    fontSize: 14,
    fontWeight: '500',
    marginRight: 2,
    marginTop: 2,
  },
  error: {
    color: '#F87171', // red-300
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    paddingLeft: 4,
  },
});

export default StaticFeeDisplay;
