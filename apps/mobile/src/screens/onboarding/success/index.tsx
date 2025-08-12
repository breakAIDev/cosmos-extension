import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAddress } from '@leapwallet/cosmos-wallet-hooks';
import { sha256 } from '@noble/hashes/sha256';
import { utils } from '@noble/secp256k1';
import { Button } from '../../../components/ui/button';
import { EventName } from '../../../services/config/analytics';
import dayjs from 'dayjs';
import { Images } from '../../../../assets/images';
import mixpanel from '../../../mixpanel';
import { captureException } from '@sentry/react-native';
import ConfettiCannon from 'react-native-confetti-cannon'; // install this package
import { MotiView } from 'moti';
import { OnboardingLayout } from '../layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingSuccess({ navigation }: {navigation: any}) {
  const activeWalletCosmosAddress = useAddress('cosmos');
  const activeWalletEvmAddress = useAddress('ethereum');
  const activeWalletSolanaAddress = useAddress('solana');
  const activeWalletSuiAddress = useAddress('sui');
  const [showConfetti, setShowConfetti] = useState(true);

  const activeWalletAddress = useMemo(
    () =>
      activeWalletCosmosAddress ||
      activeWalletEvmAddress ||
      activeWalletSolanaAddress ||
      activeWalletSuiAddress,
    [activeWalletCosmosAddress, activeWalletEvmAddress, activeWalletSolanaAddress, activeWalletSuiAddress],
  );

  useEffect(() => {
    // On success, fire analytics
    const currentTime = new Date().getTime();
    const timeStarted1 = Number(AsyncStorage.getItem('timeStarted1'));
    const timeStarted2 = Number(AsyncStorage.getItem('timeStarted2'));
    const methodChosen = AsyncStorage.getItem('onboardingMethodChosen');
    if (timeStarted1 && timeStarted2 && activeWalletAddress) {
      const hashedAddress = utils.bytesToHex(sha256(activeWalletAddress));
      try {
        mixpanel.track(EventName.OnboardingCompleted, {
          methodChosen,
          timeTaken1: dayjs(currentTime).diff(timeStarted1, 'seconds'),
          timeTaken2: dayjs(currentTime).diff(timeStarted2, 'seconds'),
          wallet: hashedAddress,
          time: Date.now() / 1000,
        });
      } catch (e) {
        captureException(e);
      }

      AsyncStorage.removeItem('timeStarted1');
      AsyncStorage.removeItem('timeStarted2');
      AsyncStorage.removeItem('onboardingMethodChosen');
    }
  }, [activeWalletAddress]);

  // Fire confetti for 5 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <OnboardingLayout style={styles.layout}>
      {showConfetti && (
        <ConfettiCannon
          count={180}
          origin={{ x: 200, y: -10 }}
          fadeOut
          fallSpeed={3000}
          explosionSpeed={700}
        />
      )}
      <View style={styles.contentWrapper}>
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.frogWrapper}
        >
          <Image
            source={{uri: Images.Misc.OnboardingFrog}}
            style={styles.frogImage}
            resizeMode="contain"
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, type: 'timing', duration: 400 }}
          style={styles.header}
        >
          <Text style={styles.title}>You are all set!</Text>
          <View style={styles.subtitleBlock}>
            <Text style={styles.subtitle}>Discover Cosmos, Ethereum & more with Leap.</Text>
            {/* On mobile, adapt or remove keyboard shortcut instructions */}
            <Text style={styles.mobileShortcut}>
              Open Leap app anytime from your home screen!
            </Text>
          </View>
        </MotiView>
      </View>
      <Button
        style={styles.button}
        onPress={() => {
          // You could link to a webapp or home screen if needed
          // Linking.openURL('https://app.leapwallet.io');
          navigation.navigate('Home');
        }}
      >
        Get started
      </Button>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    backgroundColor: '#f5f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    marginTop: 60,
    marginBottom: 16,
  },
  frogWrapper: {
    width: 128,
    height: 128,
    marginBottom: 16,
    alignSelf: 'center',
  },
  frogImage: {
    width: 128,
    height: 128,
  },
  header: {
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#101D35',
    marginBottom: 10,
  },
  subtitleBlock: {
    gap: 2,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6878A7',
    textAlign: 'center',
    marginBottom: 4,
  },
  mobileShortcut: {
    fontSize: 15,
    color: '#3282fa',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  button: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 24,
    alignSelf: 'center',
  },
});
