import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useActiveStakingDenom, useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { observer } from 'mobx-react-lite';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { useNavigation } from '@react-navigation/native';
import Text from '../../../components/text'; // Or use RN's Text

type RequireMinStakingProps = {
  forceChain?: SupportedChain;
  forceNetwork?: 'mainnet' | 'testnet';
};

export const RequireMinStaking = observer(({ forceChain, forceNetwork }: RequireMinStakingProps) => {
  const chainInfo = useChainInfo(forceChain);
  const denoms = rootDenomsStore.allDenoms;
  const [activeStakingDenom] = useActiveStakingDenom(denoms, forceChain, forceNetwork);
  const navigation = useNavigation();

  // Use your navigation function here (e.g., useNavigation from @react-navigation/native)
  const handleButtonClick = useCallback(() => {
    navigation.navigate('Stake');
  }, [navigation]);

  return (
    <View style={styles.root}>
      <Text style={styles.message}>
        {chainInfo.chainName} requires you to have{'\n'}
        at least <Text style={styles.boldText}>1 {activeStakingDenom?.coinDenom} staked</Text> to start voting
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleButtonClick} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Stake {activeStakingDenom?.coinDenom}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    backgroundColor: '#fff',
    gap: 8,
  },
  message: {
    fontSize: 12,
    color: '#222',
    fontWeight: '500',
    lineHeight: 19.2,
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#222',
  },
  button: {
    borderRadius: 999,
    backgroundColor: '#222', // dark
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#fff',
    lineHeight: 20,
  },
});
