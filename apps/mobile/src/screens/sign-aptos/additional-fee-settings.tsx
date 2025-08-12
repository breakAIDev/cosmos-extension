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
          Gas Fees <Text style={styles.capitalize}>({gasPriceOption.option})</Text>
        </Text>
        <Tooltip
          content={
            <Text style={styles.tooltipText}>
              You can choose higher gas fees for faster transaction processing.
            </Text>
          }
        >
          <View style={styles.iconWrap}>
            <Image
              source={{uri: Images.Misc.InfoCircle}}
              style={styles.icon}
              resizeMode="contain"
              accessibilityLabel="Hint"
            />
          </View>
        </Tooltip>
      </View>

      <View style={styles.marginTop2}>
        <GasPriceOptions.Selector preSelected={false} />
      </View>

      <View style={styles.marginTop5}>
        <GasPriceOptions.AdditionalSettings
          showGasLimitWarning={true}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        />
      </View>

      {gasPriceError ? (
        <Text style={styles.error}>{gasPriceError}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    backgroundColor: '#fff', // Use dynamic color for dark mode if needed
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#6B7280', // gray-500
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  tooltipText: {
    color: '#6B7280',
    fontSize: 14,
  },
  iconWrap: {
    position: 'relative',
    marginLeft: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  marginTop2: {
    marginTop: 8,
  },
  marginTop5: {
    marginTop: 20,
    padding: 0,
  },
  error: {
    color: '#F87171', // red-300
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    paddingLeft: 4,
  },
});
