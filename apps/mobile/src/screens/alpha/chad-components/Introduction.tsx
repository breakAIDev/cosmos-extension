import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../../../components/text';
import { ButtonName, EventName, PageName } from '../../../services/config/analytics';
import { Images } from '../../../../assets/images';
import { mixpanelTrack } from '../../../utils/tracking';

type IntroductionProps = {
  onJoinClick: () => void;
  pageName: PageName;
};

export function Introduction({ onJoinClick, pageName }: IntroductionProps) {
  const handleJoinClick = () => {
    onJoinClick();
    mixpanelTrack(EventName.ButtonClick, {
      buttonName: ButtonName.JOIN_CHAD,
      ButtonPageName: pageName,
    });
  };

  return (
    <View style={[styles.container, { gap: 8 }]}>
      <Image source={Images.Alpha.chadDefaultBanner} style={styles.bannerImg} resizeMode="contain" />
      <Text size="sm" style={styles.heading}>Introducing Leap Chads</Text>
      <View style={[styles.centeredCol, { gap: 4, marginTop: 8 }]}>
        <Text size="sm" style={styles.subtext}>Exclusive rewards for loyal Leap users.</Text>
        <Text size="sm" style={[styles.subtext, styles.leading5]}>
          NFTs, WL Spots, Early Access, Points, Airdrops and so much more!
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleJoinClick}>
        <Text style={styles.buttonText}>Join the Chads</Text>
      </TouchableOpacity>
    </View>
  );
}

export function VerifyingEligibility() {
  return (
    <View style={[styles.container, { gap: 16 }]}>
      <Image source={Images.Alpha.chadDefaultBanner} style={styles.bannerImg} resizeMode="contain" />
      <Text size="sm" style={styles.heading}>Verifying your eligibility</Text>
      <View style={styles.centeredCol}>
        <Text size="sm" style={styles.subtext}>Exclusive rewards for loyal Leap users.</Text>
        <Text size="sm" style={[styles.subtext, styles.leading5]}>
          NFTs, WL Spots, Early Access, Points, Airdrops and so much more!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  bannerImg: {
    marginBottom: 24,
    width: 200,
    height: 80,
  },
  heading: {
    fontWeight: '500',
    fontSize: 18,
    marginBottom: 0,
    color: '#222',
    textAlign: 'center',
  },
  centeredCol: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  subtext: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
  },
  leading5: {
    lineHeight: 21,
  },
  button: {
    width: '100%',
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#16a34a', // green-600
    alignItems: 'center',
  },
  buttonText: {
    color: '#f1f5f9',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
