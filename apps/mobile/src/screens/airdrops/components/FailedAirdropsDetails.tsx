import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ArrowCounterClockwise } from 'phosphor-react-native';
import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks';
import { captureException } from '@sentry/react-native';
import Loader from '../../../components/loader/Loader';
import Text from '../../../components/text';
import { ButtonName, ButtonType, EventName } from '../../../services/config/analytics';
import { useAirdropsData } from '../../../hooks/useAirdropsData';
import { Images } from '../../../../assets/images';
import mixpanel from '../../../mixpanel'; // Make sure you use the correct RN SDK

export default function FailedAirdropsDetails() {
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfRetries, setNumberOfRetries] = useState(1);
  const fetchAirdropsData = useAirdropsData();
  const airdropsEligibilityData = useAirdropsEligibilityData();
  const isDataNull = airdropsEligibilityData === null;

  useEffect(() => {
    setIsLoading(isDataNull);
    return () => setIsLoading(false);
  }, [isDataNull]);

  const trackCTAEvent = () => {
    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonType: ButtonType.AIRDROPS,
        buttonName: ButtonName.RETRY_AIRDROP,
        redirectURL: '',
        numberOfRetries,
        time: Date.now() / 1000,
      });
    } catch (e) {
      captureException(e);
    }
  };

  const onRetry = () => {
    setIsLoading(true);
    setNumberOfRetries((prevState) => prevState + 1);
    fetchAirdropsData();
    trackCTAEvent();
    setTimeout(() => {
      setIsLoading(false);
    }, 10000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Loader />
            <Text style={styles.loadingText}>Loading Airdrop</Text>
          </View>
        ) : (
          <>
            <Image source={{uri: Images.Airdrop.airdropFailed}} style={styles.banner} resizeMode="contain" />
            <Text size="xl" style={styles.title}>
              Woops!
            </Text>
            <Text size="sm" style={styles.subtitle}>
              We aren’t able to load details for this {'\n'}Airdrop. You can try again later.
            </Text>
          </>
        )}
      </View>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={onRetry}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <Text style={styles.buttonText}>Loading</Text>
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Retry</Text>
            <ArrowCounterClockwise
              size={20}
              color="#000"
              style={{ marginLeft: 8, transform: [{ scaleX: -1 }] }} // rotateY(180deg)
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
    justifyContent: 'center',
  },
  contentBox: {
    backgroundColor: '#F3F4F6', // light background, adjust for dark mode if needed
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 24,
    textAlign: 'center',
  },
  banner: {
    width: 90,
    height: 90,
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: '500',
    fontSize: 14,
    color: '#222',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#222', // black
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
