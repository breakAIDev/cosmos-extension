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
import Tooltip from '../../components/better-tooltip';
import { Fee } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useFormatCurrency } from '../../hooks/settings/useCurrency';
import { Warning } from '../../../assets/images/misc';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const generateFeeValues = (fee: Fee, coinDecimals: number) => {
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
  fee: Fee | null;
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feeToken, feeValues, allTokensStatus, disableBalanceCheck]);

    // If not ready, return nothing (or a loading spinner, if you wish)
    if (!feeValues) return <View/>;

    return (
      <View style={styles.root}>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction Fee</Text>
          <Tooltip
            content={
              <Text style={styles.tooltipText}>
                This dApp does not allow you to edit the transaction fee.
              </Text>
            }
          >
            <View style={styles.iconWrapper}>
              <Image source={{uri: Warning}} style={styles.icon} resizeMode="contain" />
            </View>
          </Tooltip>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amount}>
            {feeValues.formattedAmount} {feeToken?.denom?.coinDenom}
          </Text>
          {feeTokenFiatValue ? (
            <Text style={styles.fiatAmount}>
              ({formatCurrency(new BigNumber(feeValues?.amount ?? 0).multipliedBy(feeTokenFiatValue))})
            </Text>
          ) : null}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

export default StaticFeeDisplay;

const styles = StyleSheet.create({
  root: {
    marginVertical: 4,
    marginHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#6B7280', // gray-500
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    flex: 0,
  },
  tooltipText: {
    color: '#374151', // gray-700
    fontSize: 14,
    fontWeight: '500',
  },
  iconWrapper: {
    marginLeft: 4,
    position: 'relative',
  },
  icon: {
    height: 20,
    width: 20,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  amount: {
    color: '#374151', // gray-700
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  fiatAmount: {
    color: '#374151', // gray-700
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 2,
  },
  error: {
    color: '#F87171', // red-300
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginHorizontal: 2,
  },
});
