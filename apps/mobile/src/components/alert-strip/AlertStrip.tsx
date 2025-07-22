import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AlertStrip: React.FC<{ children: React.ReactNode; type?: 'warning' | 'error' | 'info' }> = ({ children, type = 'info' }) => (
  <View style={[styles.strip, type === 'warning' && styles.warning, type === 'error' && styles.error]}>
    <Text style={styles.text}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  strip: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
    marginVertical: 8,
  },
  warning: {
    backgroundColor: '#FFEDD1',
  },
  error: {
    backgroundColor: '#FF707E',
  },
  text: {
    color: '#383838',
  },
});
