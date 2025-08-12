import Tooltip from '../../components/better-tooltip';
import GasPriceOptions from '../../components/gas-price-options';
import { GasPriceOptionValue, useGasPriceContext } from '../../components/gas-price-options/context';
import { Images } from '../../../assets/images';
import React from 'react';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';
import { View, Text, Image, StyleSheet } from 'react-native';

export const NotAllowSignTxGasOptions = ({
  gasPriceOption,
  gasPriceError,
}: {
  gasPriceOption: GasPriceOptionValue;
  gasPriceError: string | null;
}) => {
  const { viewAdditionalOptions } = useGasPriceContext();
  if (!viewAdditionalOptions) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>
          Gas Fees <Text style={{ textTransform: 'capitalize' }}>({gasPriceOption.option})</Text>
        </Text>
        <Tooltip
          content={
            <Text style={styles.tooltipText}>
              You can choose higher gas fees for faster transaction processing.
            </Text>
          }
        >
          <View style={styles.iconWrap}>
            <Image source={{uri: Images.Misc.InfoCircle}} style={styles.icon} />
          </View>
        </Tooltip>
      </View>
      <GasPriceOptions.Selector style={styles.mt2} preSelected={false} />
      <GasPriceOptions.AdditionalSettings
        style={styles.mt5}
        showGasLimitWarning={true}
        rootDenomsStore={rootDenomsStore}
        rootBalanceStore={rootBalanceStore}
      />
      {gasPriceError ? (
        <Text style={styles.errorText}>{gasPriceError}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    backgroundColor: '#fff', // replace with dark color if needed
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  tooltipText: {
    color: '#6B7280',
    fontSize: 14,
  },
  iconWrap: {
    marginLeft: 8,
    position: 'relative',
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  mt2: {
    marginTop: 8,
  },
  mt5: {
    marginTop: 20,
    padding: 0,
  },
  errorText: {
    color: '#F87171', // red-300
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    paddingLeft: 4,
  },
});
