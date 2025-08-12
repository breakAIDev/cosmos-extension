import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Text from '../../../components/text';
import { Images } from '../../../../assets/images';
import GoToLeapboard from './GoToLeapboard';

export default function MoreAirdrops() {

  return (
    <View style={styles.container}>
      <Text size="sm" style={styles.header}>
        Looking for more?
      </Text>
      <Text size="xs" style={styles.subtext}>
        View upcoming airdrops and check{'\n'}eligibility for other addresses.
      </Text>
      <GoToLeapboard style={styles.leapboardBtn} />
      <Image
        source={{uri: Images.Misc.FrogHappy}}
        style={[
          styles.frog,
          {
            width: '40%',
            maxWidth: 120,
            minWidth: 60,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F3F4F6', // white-100; swap for dark mode as needed
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 130,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
  },
  subtext: {
    fontWeight: '500',
    color: '#222',
    opacity: 0.85,
    marginBottom: 12,
    lineHeight: 20,
    fontSize: 12,
  },
  leapboardBtn: {
    position: 'relative',
    zIndex: 2,
    marginBottom: 8,
  },
  frog: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: 60,
    zIndex: 1,
  },
});
