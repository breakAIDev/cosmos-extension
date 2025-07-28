import React from 'react';
import { View, StyleSheet } from 'react-native';
import Loader from '../loader/Loader'; // assumed to be RN-compatible

export function AppInitLoader() {
  return (
    <View style={styles.container}>
      <Loader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: '#ffffff', // or use themed background if available
    justifyContent: 'center',
    alignItems: 'center',
  },
});
