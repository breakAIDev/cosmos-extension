import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { BigNumber } from 'bignumber.js';

// Images.Logos.GenericDark should be a require/import if local asset, or a remote URL string
import { Images } from '../../../../../assets/images';

function imgOnError(defaultLogo: string) {
  return (event: any) => {
    event.target?.setNativeProps
      ? event.target.setNativeProps({ src: [defaultLogo] })
      : (event.target.src = defaultLogo);
  };
}

export default function DefiRow({ token }: { token: any }) {
  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  const productName = token?.productName;

  // Parse logos logic
  const logos =
    productName?.includes('/')
      ? productName?.split('/').join(' ').split(' ').slice(0, 2)
      : productName?.includes('(')
      ? [productName?.replace('(', '').replace(')', '').split(' ')[1]]
      : [productName?.split(' ')[0]];

  // Compose the APR color based on value
  const aprColor =
    new BigNumber(token?.apr ?? '0').gte(0) ? styles.green : styles.red;

  // Defensive for tvl/formatter for RN
  let tvlDisplay = '$0';
  try {
    tvlDisplay = `$${formatter.format(token?.tvl)}`;
  } catch {
    tvlDisplay = `$${token?.tvl ?? 0}`;
  }

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => {
        if (token?.productWebsite) {
          Linking.openURL(token.productWebsite);
        }
      }}
    >
      {/* Logos + Name */}
      <View style={styles.nameCol}>
        <View style={styles.logos}>
          {logos?.map((d: string, i: number) => (
            <Image
              key={i}
              source={{ uri: `https://assets.leapwallet.io/${d.toLowerCase()}.svg` }}
              onError={imgOnError(Images.Logos.GenericDark)}
              style={[styles.logoImg, i > 0 && { marginLeft: -20 }]}
              resizeMode="cover"
            />
          ))}
        </View>
        <View style={styles.nameTextCol}>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.category}>
            {token?.dappCategory?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? 'NA'}
          </Text>
        </View>
      </View>
      {/* TVL */}
      <View style={styles.centerCol}>
        <Text style={styles.tvl}>{tvlDisplay}</Text>
      </View>
      {/* APR */}
      <View style={styles.centerCol}>
        <Text style={[styles.apr, aprColor]}>
          {(token.apr * 100)?.toFixed(2)}%
        </Text>
      </View>
      {/* Caret Icon */}
      <View style={styles.caretCol}>
        <CaretRight size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    backgroundColor: '#18181B', // dark background
    borderBottomColor: '#27272A',
    borderBottomWidth: 1,
    paddingHorizontal: 0,
    marginVertical: 1,
    marginHorizontal: 0,
  },
  nameCol: {
    flex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    gap: 8,
  },
  logos: {
    flexDirection: 'row',
    width: 45,
    alignItems: 'center',
  },
  logoImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 0,
  },
  nameTextCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    lineHeight: 20,
  },
  category: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'capitalize',
    lineHeight: 12,
    fontWeight: '500',
  },
  centerCol: {
    flex: 2,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  tvl: {
    fontSize: 12,
    color: '#F59E42', // orange-300
    fontWeight: '500',
    lineHeight: 20,
  },
  apr: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 20,
  },
  green: { color: '#22C55E' }, // green-500
  red: { color: '#B91C1C' },   // red-700
  caretCol: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
});
