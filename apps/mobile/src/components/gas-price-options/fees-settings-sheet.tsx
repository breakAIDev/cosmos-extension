import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomModal from '../new-bottom-modal';   // Should be a React Native Modal
import { Button } from '../ui/button';           // Should be a RN Button, TouchableOpacity, or custom
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';

import { useGasPriceContext } from './context';
import GasPriceOptions from './index';

type FeesSettingsSheetProps = {
  showFeesSettingSheet: boolean;
  onClose: () => void;
  gasError: string | null;
  hideAdditionalSettings?: boolean;
};

export const FeesSettingsSheet: React.FC<FeesSettingsSheetProps> = ({
  onClose,
  showFeesSettingSheet,
  gasError,
  hideAdditionalSettings,
}) => {
  const { setViewAdditionalOptions, viewAdditionalOptions } = useGasPriceContext();

  return (
    <BottomModal
      isOpen={showFeesSettingSheet}
      title="Transaction Fees"
      onClose={() => {
        onClose();
        setViewAdditionalOptions(false);
      }}
    >
      <View
        style={[
          styles.column,
          !viewAdditionalOptions ? styles.gap8 : styles.gap5,
        ]}
      >
        <Text style={styles.infoText}>
          Transaction fee is charged by the network. Higher the transaction fee, faster the transaction will go through.
        </Text>

        <GasPriceOptions.Selector />

        {!hideAdditionalSettings && (
          <View style={styles.additionalSettingsBox}>
            <View style={styles.fullWidth}>
              <GasPriceOptions.AdditionalSettingsToggle />
            </View>
            <GasPriceOptions.AdditionalSettings
              showGasLimitWarning={true}
              gasError={gasError}
              rootBalanceStore={rootBalanceStore}
              rootDenomsStore={rootDenomsStore}
            />
          </View>
        )}
      </View>
      <Button
        onPress={onClose}
        disabled={gasError !== null}
        style={styles.fullWidth}
        testID="send-tx-fee-proceed-btn"
      >
        Confirm and proceed
      </Button>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  column: {
    flexDirection: 'column',
    width: '100%',
  },
  gap8: {
    gap: 32,
    marginBottom: 40,
  },
  gap5: {
    gap: 20,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#26292E', // text-secondary-800
    marginBottom: 0,
  },
  additionalSettingsBox: {
    width: '100%',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#F4F4F6', // border-secondary-200
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  fullWidth: {
    width: '100%',
  },
});

export default FeesSettingsSheet;
