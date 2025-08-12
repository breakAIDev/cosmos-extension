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
          Gas Fees <Text style={styles.optionText}>({gasPriceOption.option})</Text>
        </Text>
        <Tooltip
          content={
            <Text style={styles.tooltipText}>
              You can choose higher gas fees for faster transaction processing.
            </Text>
          }
        >
          <View style={styles.iconWrap}>
            <Image source={{uri: Images.Misc.InfoCircle}} style={styles.icon} resizeMode="contain" />
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
    backgroundColor: '#fff', // Adjust for dark mode as needed
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#6B7280', // text-gray-500
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.4,
    flexShrink: 0,
  },
  optionText: {
    textTransform: 'capitalize',
  },
  tooltipText: {
    color: '#6B7280',
    fontSize: 14,
  },
  iconWrap: {
    position: 'relative',
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 18,
    height: 18,
  },
  mt2: {
    marginTop: 8,
  },
  mt5: {
    marginTop: 20,
    padding: 0,
  },
  errorText: {
    color: '#F87171', // text-red-300
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    paddingHorizontal: 4,
  },
});
