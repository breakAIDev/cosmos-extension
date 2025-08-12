import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { AirdropEligibilityInfo } from '@leapwallet/cosmos-wallet-hooks';
import { Button } from '../../../components/ui/button';
import { ArrowSquareOut } from 'phosphor-react-native'; // Replace with RN vector icon if needed
import { captureException } from '@sentry/react-native';
import { ButtonName, ButtonType, EventName } from '../../../services/config/analytics';
import { LEAPBOARD_URL } from '../../../services/config/constants';
import mixpanel from '../../../mixpanel';

interface ClaimButtonProps {
  selectedAirdrop: AirdropEligibilityInfo;
}

export default function ClaimButton({ selectedAirdrop }: ClaimButtonProps) {
  const redirectURL =
    selectedAirdrop?.CTAInfo?.type === 'internal'
      ? `${LEAPBOARD_URL}${selectedAirdrop?.CTAInfo?.href}`
      : selectedAirdrop?.CTAInfo?.href;

  const trackCTAEvent = () => {
    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonType: ButtonType.AIRDROPS,
        buttonName: ButtonName.CLAIM_AIRDROP,
        redirectURL,
        time: Date.now() / 1000,
      });
    } catch (e) {
      captureException(e);
    }
  };

  const handlePress = () => {
    trackCTAEvent();
    if (redirectURL) {
      Linking.openURL(redirectURL).catch(captureException);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        size="default"
        style={styles.button}
        textStyle={styles.buttonText}
        onPress={handlePress}
        disabled={!redirectURL}
      >
        <View style={styles.contentRow}>
          <View>
            {/* You can adjust the text style as needed */}
            <ArrowSquareOut size={20} color="#fff" style={{ marginRight: 8 }} />
          </View>
          {selectedAirdrop?.CTAInfo?.text}
        </View>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    backgroundColor: '#111827', // black-100
    borderRadius: 999,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff', // white-100
    fontWeight: 'bold',
    fontSize: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
