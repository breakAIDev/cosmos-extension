import { getMayaTxFee, getThorChainTxFee, useChainApis, useformatCurrency } from '@leapwallet/cosmos-wallet-hooks';
import BigNumber from 'bignumber.js';
import { useSendContext } from '../../../send-v2/context';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function FixedFee() {
  const [fee, setFee] = useState(new BigNumber(1));
  const [formatCurrency] = useformatCurrency();

  const {
    feeDenom,
    feeTokenFiatValue,
    sendActiveChain: sourceChain,
    sendSelectedNetwork: sourceNetwork,
  } = useSendContext();
  const { lcdUrl } = useChainApis(sourceChain, sourceNetwork);

  useEffect(() => {
    (async function () {
      switch (sourceChain) {
        case 'mayachain': {
          const fee = await getMayaTxFee(lcdUrl ?? '');
          setFee(new BigNumber(fee).div(10 ** feeDenom.coinDecimals));
          break;
        }
        case 'thorchain': {
          const fee = await getThorChainTxFee(lcdUrl ?? '');
          setFee(new BigNumber(fee).div(10 ** feeDenom.coinDecimals));
          break;
        }
      }
    })();
  }, [feeDenom.coinDecimals, lcdUrl, sourceChain]);

  return (
    <View style={styles.feeWrap}>
      <Text style={styles.feeLabel}>Transaction fee: </Text>
      <Text style={styles.feeValue}>
        <Text style={styles.feeStrong}>
          {fee.toString()} {feeDenom.coinDenom}
        </Text>
        {feeTokenFiatValue
          ? ` (${formatCurrency(fee.multipliedBy(feeTokenFiatValue))})`
          : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  feeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B7280', // text-gray-600
    marginTop: 8,
    marginBottom: 8,
  },
  feeLabel: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280', // text-gray-600
  },
  feeValue: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280', // text-gray-600
    marginLeft: 4,
  },
  feeStrong: {
    fontWeight: 'bold',
    marginRight: 4,
  },
});
