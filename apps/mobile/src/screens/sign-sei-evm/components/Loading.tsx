import PopupLayout from '../../../components/layout/popup-layout';
import Text from '../../../components/text';
import { LoaderAnimation } from '../../../components/loader/Loader';
import React from 'react';
import { View, StyleSheet } from 'react-native';

export function Loading() {
  return (
    <PopupLayout
      style={styles.centered}
      header={<Text>Sign Transaction</Text>}
    >
      <View style={styles.flex}>
        <LoaderAnimation color="white" />
      </View>
    </PopupLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignSelf: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  flex: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
