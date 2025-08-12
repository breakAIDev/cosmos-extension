import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { RocketLaunch } from 'phosphor-react-native';
import { captureException } from '@sentry/react-native';
import Text from '../../../components/text';
import { ButtonName, ButtonType, EventName } from '../../../services/config/analytics';
import { LEAPBOARD_URL } from '../../../services/config/constants';
import mixpanel from '../../../mixpanel';

const redirectURL = `${LEAPBOARD_URL}/airdrops`;

export default function GoToLeapboard({ style = {} }) {
  const trackCTAEvent = () => {
    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonType: ButtonType.AIRDROPS,
        buttonName: ButtonName.GO_TO_LEAPBOARD,
        redirectURL,
        time: Date.now() / 1000,
      });
    } catch (e) {
      captureException(e);
    }
  };

  const handlePress = async () => {
    try {
      await Linking.openURL(redirectURL);
      trackCTAEvent();
    } catch (e) {
      captureException(e);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: 'https://assets.leapwallet.io/Leapboard.png' }}
        style={styles.logo}
      />
      <Text size="xs" style={styles.label}>
        Go to Leap Dashboard
      </Text>
      <RocketLaunch size={16} color="#111" style={styles.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6', // gray-100
    borderRadius: 24,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  logo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  icon: {
    marginLeft: 6,
    // color: use dark mode handling if needed
  },
});
