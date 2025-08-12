import type { DappData, ProductData } from '@leapwallet/cosmos-wallet-hooks';
import BigNumber from 'bignumber.js';
import { LEAPBOARD_URL } from '../../../services/config/constants';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { RightArrow } from '../../../../assets/images/misc'; // Make sure this is imported as a valid React Native image (require or import)
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';

type InvestmentProductItemProps = {
  product: ProductData;
  productDapp: DappData;
};

export const InvestmentProductItem: React.FC<InvestmentProductItemProps> = ({ product, productDapp }) => {
  const defaultLogo = useDefaultTokenLogo();
  const [logoSource, setLogoSource] = useState({ uri: productDapp.logo });

  // Choose destination URL
  const url =
    product.dappCategory === 'liquidStaking'
      ? `${LEAPBOARD_URL}/staking/liquid`
      : product.productWebsite;

  // Handle image load error
  const onLogoError = () => {
    setLogoSource(defaultLogo ? { uri: defaultLogo } : {uri: '../../../../assets/images/your-fallback-logo.png'});
  };

  // Handle external link
  const handlePress = async () => {
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (e) {
        // Optionally handle error
      }
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.leftSection}>
        <Image
          source={logoSource}
          onError={onLogoError}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.productName} numberOfLines={2}>
          {product.productName}
        </Text>
      </View>

      <Text style={styles.tvl}>
        {Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
        }).format(product.tvl)}
      </Text>

      <Text
        style={[
          styles.apr,
          { color: product.apr > 0 ? '#22c55e' : '#fca5a5' }, // green-500 : red-300
        ]}
      >
        {new BigNumber(product.apr * 100).toFixed(2)}%
      </Text>

      <Image source={{uri: RightArrow}} style={styles.rightArrow} resizeMode="contain" />
    </TouchableOpacity>
  );
};

// --------- Styles ---------
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6', // gray-100 (or dark: '#1f2937')
    backgroundColor: 'transparent', // For touch highlight
  },
  leftSection: {
    flex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    height: 32,
    width: 32,
    marginRight: 8,
  },
  productName: {
    color: '#111827', // gray-900
    fontWeight: 'bold',
    fontSize: 12,
    flexShrink: 1,
    width: 160,
    lineHeight: 16,
  },
  tvl: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fdba74', // orange-300
    fontSize: 12,
  },
  apr: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rightArrow: {
    marginLeft: 8,
    opacity: 0.5,
    height: 16,
    width: 16,
  },
});
