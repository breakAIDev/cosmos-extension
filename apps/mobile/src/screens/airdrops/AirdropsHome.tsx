import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks';
import { Images } from '../../../assets/images';
import { MotiView } from 'moti';
import { transition } from '../../utils/motion-variants';

import EligibleAirdrops from './components/EligibleAirdrops';
import EmptyAirdrops from './components/EmptyAirdrops';
import FailedAirdrops from './components/FailedAirdrops';
import InEligibleAirdrops from './components/InEligibleAirdrops';
import MoreAirdrops from './components/MoreAirdrops';
import WalletView from './components/WalletView';
import { Colors } from '../../theme/colors';

export default function AirdropsHome() {
  const [isLoading, setIsLoading] = useState(true);
  const airdropsEligibilityData = useAirdropsEligibilityData();
  const isDataNull = airdropsEligibilityData === null;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isDataNull) {
      setIsLoading(true);
      timeout = setTimeout(() => setIsLoading(false), 10000);
    } else {
      setIsLoading(false);
    }
    return () => clearTimeout(timeout);
  }, [isDataNull]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.iconLoaderWrapper}>
          <Image
            source={{uri: Images.Misc.WalletIconGreen}}
            style={styles.walletIcon}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#10B981" style={styles.spinner} />
        </View>
        <MotiView
          style={{backgroundColor: Colors.secondary300}}
          transition={transition}
          animate='visible'
        >
          Loading Airdrops...
        </MotiView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WalletView />
      {isDataNull ? (
        <EmptyAirdrops
          style={styles.emptyAirdrops}
          title="Airdrops can’t be loaded"
          subTitle={
            <>
              Airdrops can’t be loaded due to a{'\n'}
              technical failure, Kindly try again later.
            </>
          }
          showRetryButton={true}
        />
      ) : (
        <>
          <EligibleAirdrops />
          <FailedAirdrops />
          <InEligibleAirdrops />
          <MoreAirdrops />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingBottom: 75,
    height: '100%',
  },
  iconLoaderWrapper: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
  },
  spinner: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    zIndex: 1,
  },
  loadingText: {
    color: '#374151', // text-secondary-foreground
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    padding: 0,
  },
  emptyAirdrops: {
    height: 340,
    justifyContent: 'center',
  },
});
