import React from 'react';
import { PageName } from '../../services/config/analytics';
import { usePageView } from '../../hooks/analytics/usePageView';
import { View, StyleSheet } from 'react-native';

import { AirdropsHeader } from './AirdropsHeader';
import AirdropsHome from './AirdropsHome';

export default function Airdrops() {
  // usePageView(PageName.Airdrops)

  return (
    <View style={styles.root}>
      <AirdropsHeader />
      <View style={styles.content}>
        <AirdropsHome />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB', // secondary-50
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 28,
    // Height: subtracting 64px header height if needed
    // Use flex for better compatibility across devices
  },
});
