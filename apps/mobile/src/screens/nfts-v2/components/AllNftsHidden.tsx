import { EyeSlash } from 'phosphor-react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function AllNftsHidden() {
  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        <View style={styles.iconCircle}>
          <EyeSlash size={24} color="#e5e7eb" weight="regular" />
        </View>
        <Text style={styles.title}>NFTs Hidden</Text>
        <Text style={styles.subtitle}>Looks like your all NFTs are hidden</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1f2937', // Tailwind gray-800
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#1f2937', // Tailwind gray-800
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#d1d5db', // Tailwind gray-300
    marginTop: 4,
    fontSize: 14,
    textAlign: 'center',
  },
});
