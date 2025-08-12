import { getMayaTxFee, getThorChainTxFee, useChainApis, useformatCurrency } from '@leapwallet/cosmos-wallet-hooks';
import BigNumber from 'bignumber.js';
import { useSendContext } from '../../../send/context';
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
    <View style={styles.container}>
      <Text style={styles.label}>Transaction fee: </Text>
      <Text style={styles.value}>
        <Text style={styles.bold}>
          {fee.toString()} {feeDenom.coinDenom}
        </Text>
        {feeTokenFiatValue ? ` (${formatCurrency(fee.multipliedBy(feeTokenFiatValue))})` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#70737a',
    textAlign: 'center',
  },
  value: {
    fontWeight: '600',
    fontSize: 14,
    color: '#70737a',
    textAlign: 'center',
    marginLeft: 4,
  },
  bold: {
    fontWeight: 'bold',
    marginRight: 3,
  },
});

export default FixedFee;
