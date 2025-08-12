import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';

import { EmptyCard } from '../../../components/empty-card';
import { useWalletInfo } from '../../../hooks';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { Images } from '../../../../assets/images';
import StakeHeading from './StakeHeading';
// Make sure NotStakedCard is a React Native component!
import NotStakedCard from './NotStakedCard';

type StakingUnavailableProps = {
  isStakeNotSupported: boolean;
  isStakeComingSoon: boolean;
};

const StakingUnavailable = observer(({ isStakeNotSupported, isStakeComingSoon }: StakingUnavailableProps) => {
  const navigation = useNavigation();
  const { activeWallet } = useWalletInfo();
  const activeChain = useActiveChain();

  if (!activeWallet) {
    return (
      <View style={styles.centerPanel}>
        <EmptyCard src={Images.Logos.LeapCosmos} heading="No wallet found" style={{width:56, height: 56}} />
      </View>
    );
  }

  function getCardComponent() {
    if (isStakeNotSupported) {
      return (
        <NotStakedCard
          title="Staking unavailable"
          subtitle={`Staking is not yet available for ${activeChain}. You can stake on other chains in the meantime.`}
          buttonText="Stake on a different chain"
          onClick={() => navigation.navigate('Home')}
        />
      );
    }
    if (isStakeComingSoon) {
      return (
        <NotStakedCard
          title="Coming soon!"
          subtitle={`Staking for ${activeChain} is coming soon! Devs are hard at work. Stay tuned!`}
          buttonText="Stake on a different chain"
          onClick={() => navigation.navigate('Home')}
        />
      );
    }
    return null;
  }

  return (
    <View style={styles.panel}>
      <ScrollView contentContainerStyle={styles.scrollArea}>
        <StakeHeading />
        {getCardComponent()}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  centerPanel: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flexGrow: 1,
    padding: 24,
    gap: 24,
    paddingBottom: 48,
  },
});

export default StakingUnavailable;
