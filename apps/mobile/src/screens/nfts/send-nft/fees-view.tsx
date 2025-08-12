import { StdFee } from '@cosmjs/stargate';
import { GasOptions, useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { GasPrice } from '@leapwallet/cosmos-wallet-sdk';
import { GasPump } from 'phosphor-react-native';
import GasPriceOptions, { useDefaultGasPrice } from '../../../components/gas-price-options';
import { DisplayFeeValue, GasPriceOptionValue } from '../../../components/gas-price-options/context';
import { DisplayFee } from '../../../components/gas-price-options/display-fee';
import Text from '../../../components/text';
import { observer } from 'mobx-react-lite';
import { NftDetailsType } from '../../nfts/context';
import React, { useEffect, useMemo, useState } from 'react';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { rootBalanceStore } from '../../../context/root-store';

import { View, TouchableOpacity, StyleSheet } from 'react-native';

interface FeesViewProps {
  nftDetails: NftDetailsType;
  fee: StdFee;
}

export const FeesView: React.FC<FeesViewProps> = observer(({ nftDetails, fee }) => {
  const collectionAddress = useMemo(() => {
    return nftDetails?.collection.address ?? '';
  }, [nftDetails?.collection.address]);

  const [displayFeeValue, setDisplayFeeValue] = useState<DisplayFeeValue | undefined>();
  const denoms = rootDenomsStore.allDenoms;
  const defaultGasPrice = useDefaultGasPrice(denoms, {
    isSeiEvmTransaction: collectionAddress.toLowerCase().startsWith('0x'),
  });

  const activeChainInfo = useChainInfo();
  const gasOption = GasOptions.LOW;

  const userPreferredGasPrice = GasPrice.fromUserInput(
    String(fee.amount[0].amount),
    Object.keys(activeChainInfo.nativeDenoms)[0],
  );

  const [gasError, setGasError] = useState<string | null>(null);

  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  });

  // initialize gasPriceOption with correct defaultGasPrice.gasPrice
  useEffect(() => {
    setGasPriceOption({
      option: gasOption,
      gasPrice: defaultGasPrice.gasPrice,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom]);

  return (
    <View style={{ width: '100%' }}>
      <GasPriceOptions
        recommendedGasLimit={String(fee.gas)}
        gasLimit={String(fee.gas)}
        setGasLimit={() => { /* noop */ }}
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={() => { /* noop */ }}
        error={gasError}
        setError={setGasError}
        isSeiEvmTransaction={collectionAddress.toLowerCase().startsWith('0x')}
        rootBalanceStore={rootBalanceStore}
        rootDenomsStore={rootDenomsStore}
      >
        <DisplayFee setDisplayFeeValue={setDisplayFeeValue} style={{ display: 'none' }} />
        {displayFeeValue?.fiatValue && (
          <View style={styles.feeRow}>
            <Text color='text-muted-foreground' size='sm' style={styles.feeLabel}>
              Fees
            </Text>
            <TouchableOpacity style={styles.feeValueRow} activeOpacity={0.8}>
              <GasPump size={16} color="#444" />
              <Text style={styles.feeValueText}>{displayFeeValue?.fiatValue}</Text>
              {/* <CaretDown size={16} color="#aaa" /> */}
            </TouchableOpacity>
          </View>
        )}
        {gasError ? (
          <Text style={styles.errorText}>{gasError}</Text>
        ) : null}
      </GasPriceOptions>
    </View>
  );
});

const styles = StyleSheet.create({
  feeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  feeLabel: {
    fontWeight: '500',
  },
  feeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  feeValueText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  errorText: {
    color: '#e6555a',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});
