import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Text from '../../../components/text';
import { Images } from '../../../../assets/images';

interface EmptyBookmarksProps {
  title: string;
  subTitle: string | React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showRetryButton?: boolean;
}

export default function ZeroStatePlaceholder({
  title,
  subTitle,
  style = {},
  showRetryButton,
}: EmptyBookmarksProps) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={{uri: Images.Misc.FrogSad}}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel="FrogSad"
      />
      <Text size="sm" style={styles.title}>
        {title}
      </Text>
      {typeof subTitle === 'string' ?
        ( <Text size="xs" style={styles.subTitle}>
          {subTitle}
        </Text> ) :
        (React.isValidElement(subTitle) ? subTitle: null)
      }
      
      {/* You can add a retry button here if showRetryButton is true */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
    // If you have a dark mode, override with a parent context or theme
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subTitle: {
    color: '#374151', // gray-800
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});
