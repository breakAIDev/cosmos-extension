import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export const Loader = () => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color="#224874" />
  </View>
);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
