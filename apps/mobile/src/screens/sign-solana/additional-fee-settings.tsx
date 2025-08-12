import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Tooltip from '../../components/better-tooltip';
import GasPriceOptions from '../../components/gas-price-options';
import { GasPriceOptionValue, useGasPriceContext } from '../../components/gas-price-options/context';
import { Images } from '../../../assets/images';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';

type NotAllowSignTxGasOptionsProps = {
  gasPriceOption: GasPriceOptionValue;
  gasPriceError: string | null;
};

export const NotAllowSignTxGasOptions: React.FC<NotAllowSignTxGasOptionsProps> = ({
  gasPriceOption,
  gasPriceError,
}) => {
  const { viewAdditionalOptions } = useGasPriceContext();

  if (!viewAdditionalOptions) return null;

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>
          Gas Fees <Text style={styles.headerOption}>({gasPriceOption.option})</Text>
        </Text>
        <Tooltip
          content={
            <Text style={styles.tooltipText}>
              You can choose higher gas fees for faster transaction processing.
            </Text>
          }
        >
          <View style={styles.tooltipIconWrap}>
            <Image source={{uri: Images.Misc.InfoCircle}} style={styles.infoIcon} />
          </View>
        </Tooltip>
      </View>

      <View style={styles.selectorWrap}>
        <GasPriceOptions.Selector preSelected={false} />
      </View>
      <View style={styles.additionalSettingsWrap}>
        <GasPriceOptions.AdditionalSettings
          showGasLimitWarning={true}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        />
      </View>
      {gasPriceError ? (
        <Text style={styles.errorText}>{gasPriceError}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    backgroundColor: '#fff', // white-100 (adjust as needed for dark mode)
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#6B7280', // gray-500
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  headerOption: {
    textTransform: 'capitalize',
    color: '#6B7280', // gray-500
  },
  tooltipText: {
    color: '#6B7280',
    fontSize: 14,
  },
  tooltipIconWrap: {
    position: 'relative',
    marginLeft: 8,
    justifyContent: 'center',
  },
  infoIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  selectorWrap: {
    marginTop: 8,
  },
  additionalSettingsWrap: {
    marginTop: 20,
    padding: 0,
  },
  errorText: {
    color: '#FCA5A5', // red-300
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    paddingHorizontal: 4,
  },
});

export default NotAllowSignTxGasOptions;
