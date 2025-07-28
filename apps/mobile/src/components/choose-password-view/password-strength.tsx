import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PasswordStrengthIndicator = ({ score }: { score: number | null }) => {
  let strength = '';
  let color = '';

  if (score === 4) {
    strength = 'Strong';
    color = '#16A34A'; // accent-success (green)
  } else if (score === 3) {
    strength = 'Medium';
    color = '#FBBF24'; // accent-warning (amber)
  } else if (score !== null && score < 3) {
    strength = 'Weak';
    color = '#EF4444'; // destructive-100 (red)
  }

  if (!strength) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color }]}>{strength}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 18,
    marginBottom: 2,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
