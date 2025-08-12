import React, { ReactNode, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BG_RESPONSE, SUGGEST_TOKEN } from '../../../services/config/storage-keys';
import { Colors } from '../../../theme/colors';

export type ChildrenParams = {
  handleRejectBtnClick: () => Promise<void>;
};

type ContainerProps = {
  children: ({ handleRejectBtnClick }: ChildrenParams) => ReactNode;
  suggestKey: typeof SUGGEST_TOKEN;
};

export function SuggestContainer({ children, suggestKey }: ContainerProps) {
  const navigation = useNavigation<any>();

  const handleRejectBtnClick = useCallback(async () => {
    await AsyncStorage.setItem(BG_RESPONSE, JSON.stringify({ error: 'Rejected by the user.' }));

    setTimeout(async () => {
      await AsyncStorage.removeItem(suggestKey);
      await AsyncStorage.removeItem(BG_RESPONSE);
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('Home');
    }, 10);
  }, [navigation, suggestKey]);

  useEffect(() => {
    // Clear any previous BG response on mount
    AsyncStorage.removeItem(BG_RESPONSE);
  }, []);

  return (
    <View style={styles.screenCenter}>
      <View style={styles.panel}>
        <View style={styles.topBar} />
        <View style={styles.content}>
          {children({ handleRejectBtnClick })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenCenter: {
    flex: 1,                     // h-screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    width: '100%',               // panel-width (fill)
    maxWidth: 420,               // optional cap similar to extension panel
    borderRadius: 16,            // enclosing-panel rounded corners
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  topBar: {
    width: '100%',
    height: 4,                   // h-1 (~4px)
    backgroundColor: Colors.cosmosPrimary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    // relative h-full flex flex-col justify-between items-center pt-4 pb-10 px-7
    minHeight: 360,              // rough “panel-height”; adjust as needed
    paddingTop: 16,              // pt-4
    paddingBottom: 40,           // pb-10
    paddingHorizontal: 28,       // px-7
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
