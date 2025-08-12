import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { Button } from '../../../components/ui/button';
import { KeyIcon } from '../../../../assets/icons/key-icon';
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import CreateImportActions from '../SelectWallet/CreateImportActions';

export const PrivateKeyNotSupported = () => {
  const chainInfo = useChainInfo();
  const [showCreateImportActions, setShowCreateImportActions] = useState(false);

  return (
    <>
      <View style={styles.section}>
        <View style={styles.iconWrapper}>
          <KeyIcon size={24} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            Imported private key not{'\n'}supported on {chainInfo?.chainName}
          </Text>
          <Text style={styles.subtitle}>
            In the meanwhile, you can import your wallet using a{'\n'}recovery phrase or a supported private key{'\n'}to access {chainInfo?.chainName}.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <Button style={styles.button} onPress={() => setShowCreateImportActions(true)}>
            Import wallet
          </Button>
        </View>
      </View>

      <CreateImportActions
        title="Create / Import Wallet"
        isVisible={showCreateImportActions}
        onClose={() => setShowCreateImportActions(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    margin: 24,
    height: 427,
    borderRadius: 24,
    backgroundColor: '#F3F4F6', // bg-secondary-100
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    borderRadius: 999,
    width: 64,
    height: 64,
    backgroundColor: '#E5E7EB', // bg-secondary-200
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 18, // mdl
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280', // text-secondary-800
    textAlign: 'center',
  },
  buttonRow: {
    width: '100%',
    paddingHorizontal: 48,
  },
  button: {
    width: '100%',
    height: 44,
  },
});
