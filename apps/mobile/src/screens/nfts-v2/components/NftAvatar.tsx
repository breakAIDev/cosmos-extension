import { Images } from '../../../../assets/images';
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { normalizeImageSrc } from '../../../utils/normalizeImageSrc';

type NftAvatarProps = {
  image?: string;
};

export function NftAvatar({ image }: NftAvatarProps) {
  const isVideo = !!image && image.includes('mp4');
  const imgSource = image
    ? { uri: normalizeImageSrc(image) }
    : {uri: Images.Misc.Sell};

  return (
    <View style={styles.root}>
      {isVideo ? (
        <Video
          source={{ uri: normalizeImageSrc(image!) }}
          shouldPlay
          isMuted
          isLooping
          resizeMode={"cover" as ResizeMode}
          style={styles.media}
        />
      ) : (
        <Image
          source={imgSource}
          style={styles.media}
          resizeMode="cover"
          onError={() => {
            // Optionally show fallback if needed
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f9fafb', // bg-gray-50
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});
