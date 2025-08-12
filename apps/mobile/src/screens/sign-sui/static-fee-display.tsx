import { StdFee } from '@cosmjs/stargate';
import {
  currencyDetail,
  fetchCurrency,
  SelectedNetworkType,
  useChainId,
  useDefaultGasEstimates,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks';
import { fromSmallBN, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { FeeTokensStoreData, RootBalanceStore } from '@leapwallet/cosmos-wallet-store';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import Loader from '../../components/loader/Loader';
import { useFormatCurrency } from '../../hooks/settings/useCurrency';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  feeToShow: number;
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
    feeToShow,
    fee,
    error,
    setError,
    disableBalanceCheck,
    rootBalanceStore,
    activeChain,
    selectedNetwork,
    feeTokensList,
  }) => {
    const defaultGasEstimates = useDefaultGasEstimates();
    const [preferredCurrency] = useUserPreferredCurrency();

    const allAssets = rootBalanceStore.getSpendableBalancesForChain(activeChain, selectedNetwork);
    const allTokensLoading = rootBalanceStore.getLoadingStatusForChain(activeChain, selectedNetwork);
    const allTokensStatus = useMemo(() => (allTokensLoading ? 'loading' : 'success'), [allTokensLoading]);

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

    if (!feeValues || feeToShow === 0) {
      return <Loader />;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.label}>Transaction Fee</Text>
        <Text style={styles.feeText}>
          <Text style={styles.amount}>
            {feeToShow} {feeToken?.denom?.coinDenom}
          </Text>
          {feeTokenFiatValue ? (
            <Text style={styles.fiat}>
              {' '}
              (
              {formatCurrency(
                new BigNumber(feeValues?.amount ?? 0).multipliedBy(feeTokenFiatValue),
              )}
              )
            </Text>
          ) : null}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    color: '#6B7280', // gray-500
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  feeText: {
    color: '#374151', // gray-700
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 8,
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 4,
  },
  fiat: {
    color: '#6B7280',
    fontWeight: '400',
    fontSize: 14,
    marginLeft: 2,
  },
  error: {
    color: '#F87171', // red-300
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    paddingLeft: 4,
  },
});

export default StaticFeeDisplay;
