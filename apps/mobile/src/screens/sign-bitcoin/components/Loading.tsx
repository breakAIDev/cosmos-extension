import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Header } from '@leapwallet/leap-ui';
import PopupLayout from '../../../components/layout/popup-layout';
import { LoaderAnimation } from '../../../components/loader/Loader';

export function Loading() {
  return (
    <PopupLayout header={<Header title="Sign Transaction" />}>
      <View style={styles.centeredPanel}>
        <LoaderAnimation color="white" />
      </View>
    </PopupLayout>
  );
}

const styles = StyleSheet.create({
  centeredPanel: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16, // Modern RN only; otherwise use marginBottom on children
  },
});
