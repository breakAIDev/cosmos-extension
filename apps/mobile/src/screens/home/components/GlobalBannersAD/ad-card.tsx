import React, { useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { X } from 'phosphor-react-native';
import { MotiView } from 'moti'; // for scale animation
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk';

import { BannerADData } from './utils';

type BannerAdCardProps = {
  bannerData: BannerADData;
  chain: ChainInfo;
  index: number;
  onClick: (bannerId: string, index: number) => void;
  onClose: (bannerId: string, index: number) => void;
  activeIndex: number;
};

export const BannerAdCard = observer(({
  bannerData,
  chain,
  index,
  onClick,
  onClose,
  activeIndex,
}: BannerAdCardProps) => {
  const handleClick = useCallback(() => onClick?.(bannerData.id, index), [bannerData, index, onClick]);
  const handleClose = useCallback((event: any) => {
    event.stopPropagation?.();
    onClose(bannerData.id, index);
  }, [bannerData, index, onClose]);

  // Animation for scale
  const isActive = activeIndex === index;
  const scale = isActive ? 1 : 0.875;

  // For origin animation: set transformOrigin manually via style if you want more native effect (optional)
  const originAlign = activeIndex < index ? 'flex-start' : 'flex-end';

  return (
    <View style={styles.cardWrapper}>
      <MotiView
        from={{ scale: 0.875 }}
        animate={{ scale }}
        transition={{ type: 'timing', duration: 300 }}
        style={[
          styles.animatedCard,
          { alignItems: originAlign }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.touchArea}
          onPress={handleClick}
        >
          {bannerData?.image_url ? (
            <Image
              source={{ uri: bannerData.image_url }}
              style={styles.bannerImg}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.innerRow}>
              <Image
                source={{ uri: bannerData?.logo ?? chain?.chainSymbolImageUrl }}
                style={[
                  styles.logo,
                  { borderColor: chain?.theme?.primaryColor ?? '#ffbc00' }
                ]}
                resizeMode="contain"
              />
              <Text style={styles.titleText}>{bannerData.title}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          hitSlop={10}
        >
          <X size={12} color="#222" />
        </TouchableOpacity>
      </MotiView>
    </View>
  );
});

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    aspectRatio: 11 / 2,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  animatedCard: {
    width: '100%',
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000', // slight shadow for elevation (optional)
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    position: 'relative',
  },
  touchArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  bannerImg: {
    width: '100%',
    height: 64,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },
  logo: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 2.5,
    marginRight: 10,
  },
  titleText: {
    fontSize: 13,
    color: '#7A869A', // muted foreground
  },
  closeBtn: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
