import React, { useCallback, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { sliceWord } from '@leapwallet/cosmos-wallet-hooks';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import Text from '../../../components/text';
import { ImgNotAvailableDark, ImgNotAvailableLight } from '../../../../assets/images/logos';

export type AssetCardProps = {
  id?: string;
  symbol: string;
  chainName: string;
  assetImg?: string;
  chainSymbolImageUrl?: string;
  onClick: () => void;
  isSelected: boolean;
};

export default function AssetCard({
  symbol,
  assetImg,
  onClick,
  chainSymbolImageUrl,
  chainName,
  isSelected,
}: AssetCardProps) {
  const { theme } = useTheme();
  const [imgSource, setImgSource] = useState(
    assetImg
      ? { uri: assetImg }
      : theme === ThemeName.DARK
      ? ImgNotAvailableDark
      : ImgNotAvailableLight
  );

  const handleAssetSelect = useCallback(() => {
    if (isSelected) return;
    onClick();
  }, [isSelected, onClick]);

  return (
    <TouchableOpacity
      activeOpacity={isSelected ? 1 : 0.7}
      style={[
        styles.container,
        isSelected
          ? styles.selected
          : styles.unselected,
      ]}
      onPress={handleAssetSelect}
      disabled={isSelected}
    >
      <View style={styles.imageWrap}>
        <Image
          source={imgSource}
          onError={() =>
            setImgSource(
              theme === ThemeName.DARK
                ? ImgNotAvailableDark
                : ImgNotAvailableLight
            )
          }
          style={styles.assetImg}
          width={36}
          height={36}
        />
        {chainSymbolImageUrl ? (
          <Image
            source={{ uri: chainSymbolImageUrl }}
            style={styles.chainIcon}
            width={15}
            height={15}
          />
        ) : null}
      </View>
      <View style={styles.textWrap}>
        <Text size="md" color="text-monochrome" style={{ fontWeight: 'bold' }}>
          {sliceWord(symbol)}
        </Text>
        <Text size="xs" color="text-secondary-800">
          {sliceWord(chainName)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: '#E0E7EF', // bg-secondary-200
    borderColor: '#4B6EAF',     // border-secondary-600
  },
  unselected: {
    backgroundColor: '#F6F8FA', // bg-secondary-100
  },
  imageWrap: {
    position: 'relative',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetImg: {
    borderRadius: 18,
    width: 36,
    height: 36,
  },
  chainIcon: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#FFF', // bg-background
    bottom: -2,
    right: -2,
    borderWidth: 1,
    borderColor: '#E0E7EF',
  },
  textWrap: {
    flexDirection: 'column',
  },
});
