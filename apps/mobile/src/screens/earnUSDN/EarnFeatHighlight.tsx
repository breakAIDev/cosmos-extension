import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import BigNumber from 'bignumber.js';
import Text from '../../components/text';
import useEarnHighlightFeature from '../../hooks/useEarnHighlightFeature';
import { Images } from '../../../assets/images';
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Install with: npm install react-native-linear-gradient
import { useNavigation } from '@react-navigation/native'; // For navigation

import { miscellaneousDataStore } from '../../context/chain-infos-store';

const { width, height } = Dimensions.get('window');

const EarnFeatHighlight = () => {
  const { hideFeature, showFeature } = useEarnHighlightFeature();
  const navigation = useNavigation();
  const chainInfo = useChainInfo('noble');

  const handleStartEarningClick = () => {
    hideFeature();
    navigation.navigate('EarnUSDN'); // adjust this to your route name
  };

  if (!showFeature) return null;

  // Fallback for APY
  const apy =
    parseFloat(miscellaneousDataStore.data?.noble?.usdnEarnApy) > 0
      ? new BigNumber(miscellaneousDataStore.data.noble.usdnEarnApy).multipliedBy(100).toFixed(2) + '%'
      : '-';

  return (
    <View style={styles.overlay}>
      <View style={styles.centeredView}>
        <LinearGradient
          colors={['#001A33', '#0059B2']}
          style={styles.gradientCard}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.iconRow}>
            <Image
              source={{uri: Images.Logos.USDCLogo}}
              style={[styles.coinLogo, { left: 0, position: 'absolute' }]}
              resizeMode="contain"
            />
            <Image
              source={
                chainInfo.chainSymbolImageUrl
                  ? {uri: chainInfo.chainSymbolImageUrl}
                  : {uri: Images.Logos.GenericDark}
              }
              style={[styles.coinLogo, styles.rightCoinLogo]}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerText}>
            Earn real-time rewards with USDC
          </Text>
          <Text style={styles.subText}>
            Put your stable asset to work and{' '}
            <Text style={styles.strongWhite}>
              earn up to {apy} APY
            </Text>
            . effortless and simple!
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={handleStartEarningClick}
          >
            <Text style={styles.ctaButtonText}>Start earning now</Text>
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity onPress={hideFeature}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EarnFeatHighlight;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width,
    height,
    backgroundColor: '#000C', // #000000cc overlay
    zIndex: 10,
    justifyContent: 'flex-end',
  },
  centeredView: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  gradientCard: {
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 38,
    paddingHorizontal: 16,
  },
  iconRow: {
    width: 148,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    position: 'relative',
  },
  coinLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  rightCoinLogo: {
    right: 0,
    position: 'absolute',
    backgroundColor: '#fff',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    color: '#fff',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  subText: {
    fontWeight: '300',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  strongWhite: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ctaButton: {
    backgroundColor: '#fff',
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: 230,
    marginTop: 16,
    marginBottom: 8,
  },
  ctaButtonText: {
    color: '#222', // black-100
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  dismissText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // or '#fff' for dark mode
    marginTop: 32,
    textAlign: 'center',
  },
});
