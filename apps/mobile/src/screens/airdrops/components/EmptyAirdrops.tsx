import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ArrowCounterClockwise } from 'phosphor-react-native';
import { captureException } from '@sentry/react-native';
// import classNames from 'classnames'; // not used in RN
import Text from '../../../components/text';
import { ButtonName, ButtonType, EventName } from '../../../services/config/analytics';
import { useAirdropsData } from '../../../hooks/useAirdropsData';
import { Images } from '../../../../assets/images';
import mixpanel from '../../../mixpanel';

import GoToLeapboard from './GoToLeapboard';

interface EmptyAirdropsProps {
  title: string;
  subTitle: string | React.ReactNode;
  showLeapBoardButton?: boolean;
  showRetryButton?: boolean;
  style?: object;
}

export default function EmptyAirdrops({
  title,
  subTitle,
  showRetryButton = false,
  showLeapBoardButton = false,
  style = {},
}: EmptyAirdropsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [numberOfRetries, setNumberOfRetries] = useState<number>(1);
  const fetchAirdropsData = useAirdropsData();

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
    setTimeout(() => {
      setIsLoading(false);
    }, 10000);
    setNumberOfRetries((prevState) => prevState + 1);
    fetchAirdropsData();
    trackCTAEvent();
  };

  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#2DD4BF" />
          <Text style={styles.loadingText}>Loading Airdrop</Text>
        </View>
      ) : (
        <>
          <Image
            source={{uri: Images?.Misc?.FrogSad}}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subTitle}>{subTitle}</Text>
        </>
      )}
      {showLeapBoardButton && (
        <View style={styles.leapboardBtn}>
          <GoToLeapboard />
        </View>
      )}
      {showRetryButton && (
        <TouchableOpacity
          style={[
            styles.retryBtn,
            isLoading ? styles.retryBtnDisabled : {},
          ]}
          disabled={isLoading}
          onPress={onRetry}
        >
          <View style={styles.retryContent}>
            <Text style={styles.retryBtnText}>
              {isLoading ? 'Loading' : 'Retry'}
            </Text>
            {!isLoading && (
              <ArrowCounterClockwise
                size={20}
                color="#fff"
                style={{ marginLeft: 6, transform: [{ scaleX: -1 }] }}
              />
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff', // white-100
    borderRadius: 16,
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  loaderWrap: {
    minHeight: 208,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 32,
    fontSize: 16,
    fontWeight: '400',
    color: '#222',
    textAlign: 'center',
  },
  image: {
    width: 56,
    height: 56,
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
    color: '#222',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  leapboardBtn: {
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 24,
  },
  retryBtn: {
    backgroundColor: '#111', // black-100
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    flexDirection: 'row',
    paddingVertical: 14,
  },
  retryBtnDisabled: {
    opacity: 0.5,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  retryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
