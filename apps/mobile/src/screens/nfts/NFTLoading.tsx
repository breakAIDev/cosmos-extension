import { Images } from '../../../assets/images';
import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { MotiText } from 'moti';
import { transition } from '../../utils/motion-variants';

export const NFTLoading = () => {
  return (
    <View style={styles.container}>
      <View style={styles.loaderBlock}>
        <Image
          source={{uri: Images.Misc.WalletIconGreen}}
          style={styles.walletIcon}
          resizeMode="contain"
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size={60} color="#5df2b7" style={styles.activityIndicator} />
        </View>
      </View>

      <MotiText
        style={styles.loadingText}
        animate={'visible'}
        transition={transition}
      >
        Loading your NFTs...
      </MotiText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 75,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  loaderBlock: {
    position: 'relative',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIcon: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: 18,
    left: 18,
    zIndex: 2,
  },
  loaderContainer: {
    width: 60,
    height: 60,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicator: {
    width: 60,
    height: 60,
  },
  loadingText: {
    color: '#1a222c',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
});
