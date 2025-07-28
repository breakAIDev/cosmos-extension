import React from 'react';
import { View, Image, Text, StyleSheet, useColorScheme } from 'react-native';
import { useDefaultTokenLogo } from '../../hooks/utility/useDefaultTokenLogo';

export type EmptyCardProps = {
  src?: string;
  heading?: React.ReactNode;
  subHeading?: React.ReactNode;
  isRounded?: boolean;
  style?: object;
  logoStyle?: object;
  imgContainerStyle?: object;
  testID?: string;
};

export function EmptyCard(props: EmptyCardProps) {
  const defaultTokenLogo = useDefaultTokenLogo();
  const {
    src,
    heading,
    subHeading,
    isRounded = true,
    style,
    logoStyle,
    imgContainerStyle,
    testID,
  } = props;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        isRounded && styles.rounded,
        style,
      ]}
    >
      <View
        style={[
          styles.imgContainer,
          { backgroundColor: isDark ? '#111827' : '#F9FAFB' }, // gray-900 (dark) / gray-50 (light)
          imgContainerStyle,
        ]}
      >
        <Image
          source={src ? { uri: src } : defaultTokenLogo}
          style={[styles.logo, logoStyle]}
          resizeMode="contain"
        />
      </View>
      {heading && (
        <Text
          style={[styles.heading, { color: isDark ? '#F3F4F6' : '#1F2937' }]} // gray-100 (dark) / gray-800 (light)
          testID={testID}
        >
          {heading}
        </Text>
      )}
      {subHeading && (
        <Text style={styles.subHeading}>
          {subHeading}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
    backgroundColor: 'transparent',
  },
  rounded: {
    borderRadius: 16,
  },
  imgContainer: {
    height: 56, // 14 * 4 px
    width: 56,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  logo: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 14,
    color: '#9CA3AF', // gray-400
    textAlign: 'center',
    fontWeight: '500',
  },
});
