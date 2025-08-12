import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Info } from 'phosphor-react-native';

export default function InactiveValidatorCard() {
  return (
    <View style={styles.container}>
      <Info size={16} color="#EA580C" /> {/* orange-500 */}
      <Text style={styles.text}>
        You are staking with an{' '}
        <Text style={styles.bold}>inactive validator</Text>
        {' '}and won’t earn any rewards as long as the validator is inactive.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FED7AA', // orange-200
    padding: 16,
    borderRadius: 18,
    width: '100%',
    marginBottom: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#52525B', // gray-600
    flex: 1,
    flexWrap: 'wrap',
  },
  bold: {
    color: '#11181C', // black-100
    fontWeight: 'bold',
  },
});
