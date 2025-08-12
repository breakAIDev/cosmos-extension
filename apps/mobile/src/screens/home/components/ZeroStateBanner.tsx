import { ZeroStateBanner as ZeroStateBannerType } from '@leapwallet/cosmos-wallet-store';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Linking } from 'react-native';

import { FundBanners } from './FundBanners';

export const ZeroStateBanner = observer(
  ({ zeroStateBanner }: { zeroStateBanner: ZeroStateBannerType | undefined }) => {
    if (zeroStateBanner) {
      return (
        <TouchableOpacity
          style={styles.bannerContainer}
          activeOpacity={0.8}
          onPress={() => {
            Linking.openURL(zeroStateBanner.redirectUrl);
          }}
        >
          <Image
            source={{ uri: zeroStateBanner.bgUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
            accessibilityLabel={zeroStateBanner.chainIds.join(',')}
          />
        </TouchableOpacity>
      );
    }
    return <FundBanners />;
  }
);

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    paddingHorizontal: 24, // px-6 = 24px
  },
  bannerImage: {
    width: '100%',
    height: 160, // or whatever fits your design (can be made dynamic if needed)
    borderRadius: 12,
  },
});
