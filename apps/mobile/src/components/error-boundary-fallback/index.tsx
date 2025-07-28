import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // <-- Make sure you use react-navigation!
import { Header } from '@leapwallet/leap-ui';
import PopupLayout from '../layout/popup-layout';
import { Images } from '../../../assets/images';

const ErrorBoundaryFallback = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation(); // <-- React Navigation hook

  // Implement your own state reset logic here if needed
  const resetState = () => {
    // Example: dispatch({ type: 'RESET_APP' }); or whatever your state management uses.
  };

  const reload = async () => {
    try {
      await AsyncStorage.multiSet([
        ['ACTIVE_CHAIN', 'cosmos'],
        ['SELECTED_NETWORK', 'mainnet'],
      ]);
      resetState(); // <-- If you have app state to reset
      navigation.navigate('Home'); // <-- Adjust route name as needed!
    } catch (e) {
      console.error('Error setting storage:', e);
    }
  };

  return (
    <View style={styles.root}>
      <PopupLayout header={<Header title="Leap Wallet" />} skipWatchingWalletHeader>
        <View style={[styles.content, { backgroundColor: isDark ? '#18181B' : '#fff' }]}>
          <View style={styles.logoRow}>
            <Image
              source={Images.Logos.LeapLogo}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.oops}>Oops!</Text>
          </View>
          <Text style={[styles.subtitle, { color: isDark ? '#F3F4F6' : '#1F2937' }]}>
            Something went wrong
          </Text>
          <Text style={[styles.description, { color: isDark ? '#F3F4F6' : '#1F2937' }]}>
            You can try reloading the app.
          </Text>
          <TouchableOpacity style={styles.reloadBtn} onPress={reload}>
            <Text style={styles.reloadBtnText}>Reload</Text>
          </TouchableOpacity>
          <Text style={[styles.support, { color: isDark ? '#E5E7EB' : '#374151' }]}>
            Our systems will auto report this issue. If the issue persists you can contact us at{' '}
            <Text
              style={styles.email}
              onPress={() => Linking.openURL('mailto:support@leapwallet.io')}
            >
              support@leapwallet.io
            </Text>{' '}
            for any further assistance.
          </Text>
          <View style={{ marginTop: 48 }} />
        </View>
      </PopupLayout>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 12,
  },
  oops: {
    fontSize: 32, // 'xxl'
    fontWeight: 'bold',
    color: '#E54f47',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 20, // 'lg'
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    marginTop: 24,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  reloadBtn: {
    backgroundColor: '#818CF8', // indigo-300
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 16,
  },
  reloadBtnText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  support: {
    marginTop: 32,
    paddingHorizontal: 16,
    fontSize: 12,
    textAlign: 'center',
  },
  email: {
    color: '#818CF8',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default ErrorBoundaryFallback;
