import React from 'react';
import { View, Image, StyleSheet, useColorScheme } from 'react-native';
import { Images } from '../../../assets/images';

type CustomCardDividerProps = {
  style?: object;
};

export function CustomCardDivider({ style }: CustomCardDividerProps) {
  const colorScheme = useColorScheme(); // 'dark' or 'light'
  const src = colorScheme === 'dark' ? Images.Misc.CardDividerDarkMode : Images.Misc.CardDividerLightMode;

  return (
    <View
      style={[
        styles.container,
        colorScheme === 'dark' ? styles.bgDark : styles.bgLight,
        style,
      ]}
    >
      <Image source={src} style={styles.image} resizeMode="cover" accessibilityLabel="CardDivider" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 344,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16, // px-4 in Tailwind = 16
    // height: ... // set if you need a fixed height
  },
  bgLight: {
    backgroundColor: '#F3F4F6', // Example for white-100
  },
  bgDark: {
    backgroundColor: '#0f172a', // Example for gray-950
  },
  image: {
    width: '100%',
    height: 8, // Or your preferred divider height
  },
});
