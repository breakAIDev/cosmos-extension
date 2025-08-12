import React from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { Images } from '../../../../../assets/images';

const { width, height } = Dimensions.get('window');

export const CreatingWalletLoader = ({ title }: { title?: string }) => {
  return (
    <AnimatePresence>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 500, type: 'timing' }}
        style={[styles.container, styles.overlay]}
      >
        <View style={styles.iconWrap}>
          <Image
            source={{uri: Images.Misc.WalletIconGreen}}
            style={styles.icon}
            resizeMode="contain"
          />
          <View style={styles.loaderContainer}>
            {/* Use ActivityIndicator as a native spinning loader */}
            <ActivityIndicator size="large" color="#13c47b" style={styles.loader} />
          </View>
        </View>
        <MotiText
          from={{ opacity: 0, translateY: 32 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 500, type: 'timing' }}
          style={styles.title}
        >
          {title || 'Creating your wallet'}
        </MotiText>
      </MotiView>
    </AnimatePresence>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    zIndex: 10,
    left: 0,
    top: 0,
    width,
    height,
    backgroundColor: '#f8fafc', // 'bg-secondary' (adapt as needed for theme)
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    height: '100%',
  },
  iconWrap: {
    position: 'relative',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    width: 24,
    height: 24,
    left: 12,
    top: 12,
    zIndex: 1,
  },
  loaderContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 48,
    height: 48,
  },
  title: {
    color: '#334155', // 'text-secondary-foreground'
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 32,
  },
});

