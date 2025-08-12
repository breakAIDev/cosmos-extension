import React from 'react';
import { Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // npm install react-native-linear-gradient
import { useTheme } from '@leapwallet/leap-ui';
import { useQueryParams } from '../../../hooks/useQuery';
import { Images } from '../../../../assets/images';
import { queryParams } from '../../../utils/query-params';

export function YouAreNotChadBanner() {
  const params = useQueryParams();
  const { theme } = useTheme();

  // Define gradient colors for light/dark
  const gradientColors = theme === 'light'
    ? ['rgb(115,151,136)', 'rgb(24,97,68)']
    : ['#053F27', '#022718'];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.title}>You're not a Leap Chad, yet</Text>
      <Text style={styles.subtitle}>
        The more you use Leap, the closer{'\n'}
        to Chad status!{' '}
        <TouchableOpacity
          onPress={() => params.set(queryParams.chadEligibility, 'true')}
          activeOpacity={0.8}
        >
          <Text style={styles.learnMore}>Learn more</Text>
        </TouchableOpacity>
      </Text>
      <Image
        source={{uri: Images.Alpha.chadHighlightBanner}}
        style={styles.bannerImage}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16, // px-4
    paddingTop: 24, // pt-6
    paddingBottom: 20, // pb-5
    borderWidth: 1,
    borderColor: '#3664F4', // primary color (customize)
    overflow: 'hidden',
    borderRadius: 16,
    flexDirection: 'column',
    gap: 4,
    position: 'relative',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
    marginBottom: 2,
  },
  subtitle: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '400',
    lineHeight: 18,
  },
  learnMore: {
    color: '#32DA6D', // accent-success
    fontWeight: '500',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 86,   // h-[5.375rem]
    width: 176,   // w-[11rem]
    zIndex: -1,
  },
});
