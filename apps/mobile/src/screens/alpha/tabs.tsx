import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

import AlphaHome from './AlphaHome';
import ChadExclusives from './ChadExclusives';

export const Tabs = (props: { activeTab: string }) => {
  const { activeTab } = props;

  return (
    <View style={styles.container}>
      {activeTab === 'all' ? <AlphaHome /> : <ChadExclusives />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // takes available space
    // If you want to set a minHeight or padding, add here
    minHeight: Dimensions.get('window').height - (72 + 30 + 41),
  },
});
