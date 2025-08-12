import React from 'react';
import { View, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { normalizeImageSrc } from '../../../utils/normalizeImageSrc';

type CollectionAvatarProps = {
  image?: string;
  style?: StyleProp<ViewStyle>;
  bgColor?: string;
};

export function CollectionAvatar({ image, style, bgColor }: CollectionAvatarProps) {
  const isVideo = !!image && image.includes('mp4');
  const avatarSrc = image ? normalizeImageSrc(image) : undefined;

  return (
    <View
      style={[
        styles.avatar,
        { backgroundColor: bgColor || '#d4d4d4' },
        style,
      ]}
    >
      {avatarSrc &&
        (isVideo ? (
          <Video
            source={{ uri: avatarSrc }}
            shouldPlay
            isMuted
            isLooping
            resizeMode={"cover" as ResizeMode}
            style={styles.media}
          />
        ) : (
          <Image
            source={{ uri: avatarSrc }}
            style={styles.media}
            resizeMode="cover"
            onError={() => {
              // Optionally: Hide image or show fallback
            }}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 999,
    marginRight: 8,
    width: 40,
    height: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
});
