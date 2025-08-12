import { sliceWord, useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { Buttons } from '@leapwallet/leap-ui';
import { Info } from 'phosphor-react-native';
import Text from '../../../components/text';
import React from 'react';
import { Colors, getChainColor } from '../../../theme/colors';
import { View, StyleSheet } from 'react-native';

export function CopyViewingKey(props: { generatedViewingKey: string; onCopy: () => Promise<void> }) {
  const activeChain = useActiveChain();

  return (
    <View style={styles.container}>
      <View style={styles.noteContainer}>
        <Info size={16} color={Colors.Indigo300} style={styles.iconMargin} />
        <Text size="md" style={styles.noteText}>
          Note down the viewing key
        </Text>
      </View>
      <View style={styles.keyContainer}>
        <Text size="md" style={styles.keyText}>
          {sliceWord(props.generatedViewingKey ?? '')}
        </Text>
      </View>
      <Buttons.CopyToClipboard color={getChainColor(activeChain)} onCopy={props.onCopy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // Replace with dark mode logic if you have it
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  iconMargin: {
    marginRight: 12,
  },
  noteText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // Replace with dark mode logic if needed
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  keyText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
