import { SelectedNetwork, useActiveStakingDenom, useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MotiView } from 'moti';

type InsufficientBalanceCardProps = {
  rootDenomsStore: RootDenomsStore;
  activeChain?: SupportedChain;
  activeNetwork?: SelectedNetwork;
};

const InsufficientBalanceCard = observer(
  ({ rootDenomsStore, activeChain, activeNetwork }: InsufficientBalanceCardProps) => {
    const [activeStakingDenom] = useActiveStakingDenom(rootDenomsStore.allDenoms, activeChain, activeNetwork);
    const chain = useChainInfo();
    const osmosisChainInfo = useChainInfo('osmosis');
    const navigation = useNavigation<any>(); // Type as needed

    const handleButtonClick = () => {
      // Adjust navigation logic to fit your navigation stack and params passing
      navigation.navigate('Swap', {
        sourceChainId: osmosisChainInfo.chainId,
        sourceToken: osmosisChainInfo.denom,
        destinationChainId: chain.chainId,
        destinationToken: activeStakingDenom.coinDenom,
        pageSource: 'stake',
      });
    };

    return (
      <View
        style={styles.card}
      >
        <View style={styles.left}>
          <Text style={styles.title}>Insufficient balance to stake</Text>
          <Text style={styles.subtitle}>
            Get {activeStakingDenom.coinDenom ?? ''} to stake and earn rewards
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleButtonClick}>
          <Text style={styles.buttonText}>
            Get {activeStakingDenom.coinDenom ?? ''}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#F3F4F6', // secondary-100, adjust for theme
    marginVertical: 8,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
    color: '#222',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    color: '#888', // muted-foreground
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#222', // mono style
    borderRadius: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default InsufficientBalanceCard;
