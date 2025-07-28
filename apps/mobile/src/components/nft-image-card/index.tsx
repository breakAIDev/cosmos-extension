import React, { useState } from 'react';
import {
  View,
  Image,
  Text as RNText,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Video,
} from 'react-native';
import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { useActiveChain } from '../../hooks/settings/useActiveChain';
import Text from '../text';
import { Images } from '../../../assets/images';

export type NFTProps = {
  onClick?: (NftMetadata: object) => void;
  imgSrc: string;
  textNft?: {
    name: string;
    description: string;
  };
};

export default function NFTImageCard({ imgSrc, textNft, onClick }: NFTProps) {
  const [imageIsLoading, setImageIsLoading] = useState(!!imgSrc);
  const [errorInLoadingMP4NFT, setErrorInLoadingMP4NFT] = useState(false);
  const activeChain = useActiveChain();
  const chainInfo = useChainInfo(activeChain);

  const isVideo = imgSrc?.includes('mp4') && !errorInLoadingMP4NFT;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onClick?.({ imgSrc, ...textNft })}
      activeOpacity={0.8}
    >
      {imageIsLoading && (
        <View style={styles.loadingContainer}>
          <Image source={Images.Misc.NFTImageLoading} style={styles.loadingSpinner} />
        </View>
      )}

      {!imageIsLoading && isVideo ? (
        <Video
          source={{ uri: imgSrc }}
          style={styles.media}
          repeat
          resizeMode="cover"
          muted
          onError={() => setErrorInLoadingMP4NFT(true)}
          onLoad={() => setImageIsLoading(false)}
        />
      ) : imgSrc && !isVideo ? (
        <Image
          source={{ uri: imgSrc }}
          style={styles.media}
          onError={() => setImageIsLoading(false)}
          onLoad={() => setImageIsLoading(false)}
          defaultSource={Images.Misc.NFTFallBackImage}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { backgroundColor: chainInfo?.theme?.primaryColor || '#ccc' },
          ]}
        >
          <Text size="md" style={styles.fallbackText}>
            {textNft?.name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 1,
    width: '100%',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  loadingContainer: {
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: 16,
  },
  loadingSpinner: {
    width: 32,
    height: 32,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    aspectRatio: 1,
    borderRadius: 16,
    flexWrap: 'wrap',
  },
  fallbackText: {
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});
