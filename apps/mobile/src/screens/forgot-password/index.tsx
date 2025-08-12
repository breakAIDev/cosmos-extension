import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ArrowLeft, Lock } from 'phosphor-react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Wallet } from '../../hooks/wallet/useWallet';
// import { Button } from '../../components/ui/button'; // Use TouchableOpacity or your custom RN Button

const ForgotPassword = () => {
  const navigation = useNavigation();
  const { removeAll } = Wallet.useRemoveWallet();

  const handleClearDataAndRestore = () => {
    removeAll(true);
    navigation.replace('OnboardingImport'); // Replace with your actual screen name
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back Navigation */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Lock size={32} color="#312e81" />
          </View>
          <Text style={styles.headerText}>Forgot your password?</Text>
        </View>

        {/* Info Texts */}
        <View style={styles.infoTexts}>
          <Text style={styles.infoText}>
            Clear your data and restore your wallet using your recovery phrase
          </Text>
          <Text style={styles.infoText}>
            We won't be able to recover your password as it's stored securely only on your device.
          </Text>
          <Text style={styles.infoText}>
            To recover the wallet you will have to clear your data which will delete your current wallet and recovery phrase from this device, along with the list of accounts you've curated. After that, you can restore your wallet using your recovery phrase.
          </Text>
        </View>

        {/* Bottom Button */}
        <TouchableOpacity style={styles.restoreBtn} onPress={handleClearDataAndRestore}>
          <Text style={styles.restoreBtnText}>Clear data and restore</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default observer(ForgotPassword);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  backButton: { alignSelf: 'flex-start', padding: 8, borderRadius: 50, marginBottom: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    backgroundColor: '#E0E7FF', // bg-secondary-200
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  infoTexts: { marginTop: 10, marginBottom: 40 },
  infoText: { color: '#6B7280', fontSize: 15, marginBottom: 10, textAlign: 'center' },
  restoreBtn: {
    backgroundColor: '#312e81',
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 'auto',
  },
  restoreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
