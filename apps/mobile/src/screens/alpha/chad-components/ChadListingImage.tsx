import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';

type ChadListingImageProps = {
  alt: string | null;
  image: string | null;
};

const getPlaceholderUrl = (alt: string | null) =>
  `https://placehold.co/40x40?text=${alt ? encodeURIComponent(alt) : ''}`;

export default function ChadListingImage({ alt, image }: ChadListingImageProps) {
  const [imgUri, setImgUri] = useState(image || getPlaceholderUrl(alt));

  return (
    <Image
      source={{ uri: imgUri }}
      style={styles.image}
      accessibilityLabel={alt || 'icon'}
      onError={() => setImgUri(getPlaceholderUrl(alt))}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});
