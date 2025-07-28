import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, ImageStyle, ViewStyle, TextStyle } from 'react-native';

type Props = {
  assetImg?: string;
  text: string;
  altText?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  imageStyle?: ImageStyle;
};

export default function TokenImageWithFallback({
  assetImg,
  text,
  altText,
  containerStyle,
  textStyle,
  imageStyle,
}: Props) {
  const [useImgFallback, setUseImgFallback] = useState(false);

  return assetImg && !useImgFallback ? (
    <Image
      source={{ uri: assetImg }}
      alt={altText}
      onError={() => setUseImgFallback(true)}
      style={[styles.image, imageStyle]}
    />
  ) : (
    <View style={[styles.fallbackContainer, containerStyle]}>
      <Text style={[styles.fallbackText, textStyle]}>{text.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  fallbackContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb', // gray-200
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#374151', // gray-700
    fontWeight: 'bold',
    fontSize: 14,
  },
});
