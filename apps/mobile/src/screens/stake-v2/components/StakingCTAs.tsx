import { LSProvider, SelectedNetwork } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import Text from '../../../components/text';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../../theme/colors';

import { StakeInputPageState } from '../StakeInputPage';

type StakingCTAsProps = {
  tokenLSProviders: LSProvider[];
  isLSProvidersLoading: boolean;
  setShowSelectLSProvider: (show: boolean) => void;
  activeChain: SupportedChain;
  activeNetwork: SelectedNetwork;
  navigation: any; // should be typed as StackNavigationProp<...> if using react-navigation
};

const StakingCTAs = observer(({
  tokenLSProviders,
  isLSProvidersLoading,
  setShowSelectLSProvider,
  activeChain,
  activeNetwork,
  navigation,
}: StakingCTAsProps) => {
  const { theme } = useTheme();

  const handleLiquidStake = () => {
    setShowSelectLSProvider(true);
  };

  const handleStake = () => {
    navigation.navigate('StakeInput', {
      state: {
        mode: 'DELEGATE',
        forceChain: activeChain,
        forceNetwork: activeNetwork,
      } as StakeInputPageState,
    });
  };

  return (
    <View style={styles.container}>
      {tokenLSProviders?.length > 0 && (
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme === ThemeName.DARK ? Colors.gray800 : Colors.gray200,
              opacity: isLSProvidersLoading ? 0.5 : 1,
            },
          ]}
          disabled={isLSProvidersLoading}
          onPress={handleLiquidStake}
        >
          {isLSProvidersLoading ? (
            <ActivityIndicator size="small" color={theme === ThemeName.DARK ? '#fff' : '#222'} />
          ) : (
            <Text style={{ color: theme === ThemeName.DARK ? '#fff' : '#111', fontWeight: 'bold' }}>
              Liquid Stake
            </Text>
          )}
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors.green600 }]}
        onPress={handleStake}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Stake</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
    marginTop: 6,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default StakingCTAs;
