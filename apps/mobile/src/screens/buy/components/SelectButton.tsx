import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { sliceWord } from '@leapwallet/cosmos-wallet-hooks';
import TokenImageWithFallback from '../../../components/token-image-with-fallback'; // Your RN version!
import { Images } from '../../../../assets/images';
import { GenericLight } from '../../../../assets/images/logos';

type SelectButtonProps = {
  title: string;
  subtitle?: string;
  chainImg?: string;
  logo?: string;
  onClick: () => void;
};

export function SelectCurrencyButton({ onClick, logo, title }: SelectButtonProps) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onClick}>
      <Image
        source={logo ? { uri: logo } : {uri: GenericLight}}
        onError={() => GenericLight}
        style={styles.currencyLogo}
      />
      <View style={styles.textContainer}>
        <Text style={styles.currencyTitle}>{sliceWord(title)}</Text>
      </View>
      <Image source={{uri: Images.Misc.ArrowDown}} style={styles.arrowDown} />
    </TouchableOpacity>
  );
}

export function SelectAssetButton({ onClick, logo, title, subtitle, chainImg }: SelectButtonProps) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onClick}>
      <View style={styles.assetLogoWrap}>
        <TokenImageWithFallback
          assetImg={logo}
          text={title}
          altText={title}
          imageStyle={styles.tokenImage}
          // for RN, use style prop below!
          style={styles.assetLogo}
          containerStyle={styles.tokenImage}
          textStyle={styles.tinyText}
        />
        {chainImg && (
          <Image
            source={{ uri: chainImg }}
            style={styles.chainImg}
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.assetTitle}>{sliceWord(title)}</Text>
        <Text style={styles.assetSubtitle}>{sliceWord(subtitle)}</Text>
      </View>
      <View style={styles.divider} />
      <Image source={{uri: Images.Misc.ArrowDown}} style={styles.arrowDownAsset} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tinyText: {
    fontSize: 7,
    // add other styles if needed
  },
  tokenImage: {
    width: 24,
    height: 24,
    marginRight: 4,
    borderRadius: 12,
    // add backgroundColor as needed
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  currencyLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 4,
    backgroundColor: '#F7F7F7',
  },
  assetLogoWrap: {
    position: 'relative',
    width: 24,
    height: 24,
    marginRight: 6,
  },
  assetLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#181818',
  },
  chainImg: {
    position: 'absolute',
    width: 12,
    height: 12,
    right: -2,
    bottom: -2,
    borderRadius: 6,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#fff',
  },
  textContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingRight: 8,
  },
  currencyTitle: {
    color: '#181818',
    fontWeight: 'bold',
    fontSize: 12,
  },
  assetTitle: {
    color: '#181818',
    fontWeight: 'bold',
    fontSize: 12,
  },
  assetSubtitle: {
    color: '#6B7280',
    fontSize: 10,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  arrowDown: {
    marginLeft: 10,
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  arrowDownAsset: {
    marginLeft: 12,
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});
