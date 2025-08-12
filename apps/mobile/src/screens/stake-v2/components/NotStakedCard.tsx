import {
  SelectedNetwork,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Button } from '../../../components/ui/button'; // Should be RN Button
import { Images } from '../../../../assets/images';      // RN compatible
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, StyleSheet } from 'react-native';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { MotiView } from 'moti';

import { StakeInputPageState } from '../StakeInputPage';

const NotStakedCard = observer(
  ({
    forceChain,
    forceNetwork,
    onClick,
    title,
    subtitle,
    buttonText,
  }: {
    forceChain?: SupportedChain;
    forceNetwork?: SelectedNetwork;
    title: string;
    subtitle: string;
    onClick?: () => void;
    buttonText: string;
  }) => {
    const _activeChain = useActiveChain();
    const _activeNetwork = useSelectedNetwork();
    const activeChain = forceChain ?? _activeChain;
    const activeNetwork = forceNetwork ?? _activeNetwork;
    const navigation = useNavigation<any>(); // Or correct type for your stack

    const [activeStakingDenom] = useActiveStakingDenom(rootDenomsStore.allDenoms, activeChain, activeNetwork);

    return (
      <View style={styles.card} >
        <View style={styles.centeredContent}>
          <Image
            source={{uri: Images.Logos.LeapLogo}}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Button
          style={styles.button}
          onPress={() => {
            if (onClick) {
              onClick();
            } else {
              // You'll need to replace this with your own navigation logic in RN
              const state: StakeInputPageState = {
                mode: 'DELEGATE',
                forceChain: activeChain,
                forceNetwork: activeNetwork,
              };
              // sessionStorage not available, so use your preferred state mgmt or nav params
              navigation.navigate('StakeInput', { state });
            }
          }}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Button>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    gap: 28,
    paddingVertical: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Adjust for your theme
    borderRadius: 20,
    backgroundColor: '#fff',
    marginVertical: 14,
  },
  centeredContent: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 88,
    height: 50,
    marginBottom: 6,
  },
  title: {
    color: '#222', // Adjust for dark mode if needed
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#333',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  button: {
    marginTop: 18,
    width: '100%',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3D63DD', // Example
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default NotStakedCard;
