import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/auth-context';
import { KeyChain } from '@leapwallet/leap-keychain';
import { EventName } from '../../services/config/analytics';
import { passwordStore } from '../../context/password-store';
import { hasMnemonicWallet } from '../../utils/hasMnemonicWallet';
import { preloadOnboardingRoutes } from '../../utils/preload';
import { captureException } from '@sentry/react-native';
import mixpanel from '../../mixpanel';
import { MotiView, MotiImage } from 'moti';
import { HappyFrog } from '../../../assets/icons/frog';
import { OnboardingLayout } from './layout';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace this with your RN gradient implementation (e.g., react-native-linear-gradient)
const backgroundGradient = '../../../assets/images/onboarding-gradient.png';

const transition = {
  type: 'timing',
  duration: 250,
  delay: 1050,
};

const OnboardingView = ({ navigation, trackCTAEvent }: {
  navigation: any;
  trackCTAEvent: (methodChosen: string) => void;
}) => {
  return (
    <View style={styles.flexContainer}>
      {/* Background gradient */}
      <ImageBackground source={{uri: backgroundGradient}} style={styles.background} imageStyle={styles.backgroundImage} />

      {/* Logo + Headings */}
      <View style={styles.centerContent}>
        <MotiView
          from={{ opacity: 0, translateY: 120 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...transition, type: 'timing' }}
          style={styles.logoWrapper}
        >
          <HappyFrog width={90} height={90} />
        </MotiView>
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...transition, delay: 200 }}
          style={styles.textWrapper}
        >
          <Text style={styles.heading}>Leap everywhere</Text>
          <Text style={styles.subHeading}>
            Multi-chain wallet for Cosmos, Ethereum, Solana, Bitcoin & more
          </Text>
        </MotiView>
      </View>

      {/* Buttons */}
      <MotiView
        from={{ opacity: 0, translateY: 25 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ ...transition, delay: 300 }}
        style={styles.buttonWrapper}
      >
        <Button
          style={styles.button}
          testID="create-new-wallet"
          onPress={() => {
            navigation.navigate('OnboardingCreate');
            trackCTAEvent('new');
          }}
        >
          Create a new wallet
        </Button>
        <Button
          variant="mono"
          style={styles.button}
          testID="import-existing-wallet"
          onPress={() => {
            navigation.navigate('OnboardingImport');
            trackCTAEvent('import-seed-phrase');
          }}
        >
          Import an existing wallet
        </Button>
      </MotiView>
    </View>
  );
};

export default observer(function Onboarding() {
  const navigation = useNavigation();
  const { loading, noAccount } = useAuth() || {};

  const trackCTAEvent = (methodChosen: string) => {
    try {
      mixpanel.track(EventName.OnboardingMethod, { methodChosen, time: Date.now() / 1000 });
    } catch (e) {
      captureException(e);
    }
    AsyncStorage.setItem('onboardingMethodChosen', methodChosen);
    AsyncStorage.setItem('timeStarted2', new Date().getTime().toString());
  };

  useEffect(() => {
    (async () => {
      const wallets = await KeyChain.getAllWallets();
      if (loading === false && hasMnemonicWallet(wallets)) {
        if (!noAccount || passwordStore.password) {
          navigation.navigate('OnboardingSuccess');
        }
      }
    })();
  }, [loading, navigation, noAccount]);

  useEffect(() => {
    preloadOnboardingRoutes();

    const timeStarted1 = AsyncStorage.getItem('timeStarted1');
    if (!timeStarted1) {
      AsyncStorage.setItem('timeStarted1', new Date().getTime().toString());
    }

    try {
      mixpanel.track(EventName.OnboardingStarted, {
        firstWallet: true,
        time: Date.now() / 1000,
      });
    } catch (e) {
      captureException(e);
    }
  }, []);

  if (loading) return null;

  return (
    <OnboardingLayout style={styles.layout}>
      <OnboardingView navigation={navigation} trackCTAEvent={trackCTAEvent} />
    </OnboardingLayout>
  );
});

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  flexContainer: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    padding: 28,
    position: 'relative',
    backgroundColor: '#f7fafd',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  logoWrapper: {
    marginBottom: 16,
  },
  textWrapper: {
    alignItems: 'center',
    gap: 10,
  },
  heading: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#273852', // secondary-foreground
    marginBottom: 4,
  },
  subHeading: {
    textAlign: 'center',
    fontSize: 18,
    color: '#4a5973', // secondary-800
    marginBottom: 2,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 'auto',
    gap: 16,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
});
