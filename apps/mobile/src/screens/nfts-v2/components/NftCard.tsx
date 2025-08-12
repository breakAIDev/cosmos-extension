import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import Text from'../../../components/text';
import { useChainInfos } from '../../../hooks/useChainInfos';
import { Images } from '../../../../assets/images';
import React, { useState } from 'react';
import { getChainColor } from '../../../theme/colors';
import { getChainName } from '../../../utils/getChainName';
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, ImageStyle, StyleProp } from 'react-native';
import { ResizeMode, Video } from 'expo-av'; // Use expo-av for video playback in React Native
import { Chip } from './index';

export type NftCardProps = {
  chain: SupportedChain;
  imgSrc?: string;
  textNft?: {
    name: string;
    description: string;
  };
  chainName?: string;
  chainLogo?: string;
  mediaType?: string;
  style?: StyleProp<ImageStyle>;
  handleExpandClick?: VoidFunction;
  showExpand?: boolean;
};

export function NftCard({
  chain,
  imgSrc,
  textNft,
  chainName,
  chainLogo,
  mediaType,
  style,
  handleExpandClick,
  showExpand,
}: NftCardProps) {
  const [imageIsLoading, setImageIsLoading] = useState(!!imgSrc);
  const [errorInLoadingMP4NFT, setErrorInLoadingMP4NFT] = useState(false);
  const [imageError, setImageError] = useState(false);
  const chainInfos = useChainInfos();

  // Video or GIF check
  const isVideo =
    (!!imgSrc && imgSrc.toLowerCase().includes('mp4')) ||
    ['video/mp4', 'image/gif'].includes(mediaType ?? '');

  // Fallback if image fails
  const imgSource =
    imgSrc && !imageError
      ? { uri: imgSrc }
      : {uri: Images.Misc.NFTFallBackImage || '../../../../assets/images/nft_fallback.png'};

  return (
    <View style={styles.root}>
      {/* Loading Spinner */}
      {imageIsLoading && (
        <View style={styles.loadingWrap}>
          <View style={styles.loadingBg}>
            <ActivityIndicator size="small" color="#a1a1aa" />
            {/* Optionally, use Image for spinner: 
            <Image source={Images.Misc.NFTImageLoading} style={styles.loadingImg} />
            */}
          </View>
        </View>
      )}

      {/* NFT media: Video, Image, or Fallback Name */}
      <View style={[styles.imgHolder, imageIsLoading && { display: 'none' }]}>
        {isVideo && !errorInLoadingMP4NFT ? (
          <Video
            source={{ uri: imgSrc! }}
            rate={1.0}
            volume={1.0}
            isMuted
            resizeMode={"cover" as ResizeMode}
            shouldPlay
            isLooping
            style={[styles.img, style]}
            onReadyForDisplay={() => setImageIsLoading(false)}
            onError={() => setErrorInLoadingMP4NFT(true)}
            useNativeControls={Platform.OS === 'web'} // Only show controls on web
          />
        ) : imgSrc && !imageError ? (
          <Image
            source={imgSource}
            style={[styles.img, style]}
            resizeMode="contain"
            onError={() => {
              setImageError(true);
              setImageIsLoading(false);
            }}
            onLoadEnd={() => setImageIsLoading(false)}
          />
        ) : (
          <View
            style={[
              styles.fallbackHolder,
              { backgroundColor: getChainColor(chain, chainInfos[chain]) },
              style,
            ]}
          >
            <Text style={styles.fallbackText}>
              {textNft?.name}
            </Text>
          </View>
        )}
      </View>

      {/* Expand button */}
      {showExpand && (
        <TouchableOpacity style={styles.expandBtn} onPress={handleExpandClick} activeOpacity={0.8}>
          <Image
            source={{uri: Images.Misc.ExpandContent}}
            style={styles.expandIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {/* Chain chip */}
      {chainName && chainLogo && (
        <View style={styles.chipWrap}>
          <Chip style={styles.chip}>
            <Chip.Image source={{ uri: chainLogo }} style={styles.chipImg} />
            <Chip.Text style={styles.chipText} numberOfLines={1}>
              {getChainName(chainName)}
            </Chip.Text>
          </Chip>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  loadingWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBg: {
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgHolder: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  fallbackHolder: {
    flex: 1,
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#a1a1aa',
  },
  fallbackText: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 120,
  },
  expandBtn: {
    position: 'absolute',
    width: 30,
    height: 30,
    right: 8,
    bottom: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  expandIcon: {
    width: 20,
    height: 20,
  },
  chipWrap: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    zIndex: 20,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipImg: {
    width: 12,
    height: 12,
    marginRight: 4,
    borderRadius: 6,
  },
  chipText: {
    color: '#18181b',
    fontSize: 10,
    maxWidth: 90,
  },
});
