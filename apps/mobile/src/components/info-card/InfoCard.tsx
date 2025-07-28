import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Info } from 'phosphor-react-native'; // React Native version of Phosphor Icons

type InfoCardProps = {
  message: ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function InfoCard({ message, style }: InfoCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Info size={20} color="#ffffff" weight="regular" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#002142',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8, // Requires React Native 0.71+. Otherwise use `marginRight`.
  },
  icon: {
    marginRight: 8,
    padding: 1,
  },
  message: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
    fontWeight: '500',
    flexShrink: 1,
  },
});
