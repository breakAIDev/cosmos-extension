import React from 'react';
import { TouchableOpacity, Image, StyleSheet, ViewStyle } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Images } from '../../../assets/images';
import { globalSheetsStore } from '../../context/global-sheets-store';
import { lightNodeStore } from '../../context/light-node-store';

type Props = {
  style?: ViewStyle | ViewStyle[];
};

export const LightNodeRunningIndicator = observer(({ style }: Props) => {
  if (!lightNodeStore.isLightNodeRunning) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={() =>
        globalSheetsStore.toggleSideNav({ openLightNodePage: true })
      }
      style={[styles.container, style]}
    >
      <Image source={Images.Misc.Sampling} style={styles.icon} resizeMode="contain" />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48, // equivalent to top-12
    right: 0,
    backgroundColor: 'rgba(209,213,219,0.1)', // Tailwind's gray-300/10
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    zIndex: 10,
  },
  icon: {
    width: 16,
    height: 16,
  },
});
