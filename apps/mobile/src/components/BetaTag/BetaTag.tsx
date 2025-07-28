import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../text';
import { Colors } from '../../theme/colors';

export const BetaTag = ({ style }: { style?: any }) => {
  return (
    <View style={[styles.absolute, style]}>
      <Text
        size="xs"
        color={Colors.green600}
        style={styles.betaText}
      >
        Beta
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    zIndex: 10,
    borderWidth: 0,
  },
  betaText: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(74, 222, 128, 0.1)', // green-300/10
    borderRadius: 16, // rounded-2xl
    fontWeight: '500',
    color: Colors.green600, // just for fallback
  },
});
