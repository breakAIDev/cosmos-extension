import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks';
import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk';
import { NftStore } from '@leapwallet/cosmos-wallet-store';
import { Images } from '../../../../assets/images';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  Linking,
  ScrollView,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Buttons, GenericCard } from '@leapwallet/leap-ui';
import { useTheme } from '@react-navigation/native';

type CantSeeNftsProps = {
  openAddCollectionSheet: () => void;
  style?: StyleProp<ViewStyle>;
  nftStore: NftStore;
};

// Main component
export function CantSeeNfts({ openAddCollectionSheet, style, nftStore }: CantSeeNftsProps) {
  const activeWallet = useActiveWallet();
  const [showDetails, setShowDetails] = useState(false);
  const scrollViewRef = useRef(null);
const { colors, dark } = useTheme();
  // External platforms links
  const externalPlatforms = useMemo(() => {
    const stargaze = {
      title: 'Stargaze',
      account: `https://www.stargaze.zone/p/${activeWallet?.addresses.stargaze}/tokens`,
    };
    const omniflix = {
      title: 'OmniFlix',
      account: `https://omniflix.market/account/${activeWallet?.addresses.omniflix}/nfts`,
    };
    const forma = {
      title: 'Forma',
      account: `https://modularium.art/my-collection`,
    };
    const manta = {
      title: 'Manta',
      account: 'https://nft.manta.network',
    };
    const lightlink = {
      title: 'Lightlink',
      account: `https://nft.lightlink.io/users/${pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.lightlink)}`,
    };
    return [stargaze, omniflix, forma, manta, lightlink];
  }, [activeWallet?.addresses.omniflix, activeWallet?.addresses.stargaze, activeWallet?.pubKeys?.lightlink]);

  // Animate expand/collapse
  useEffect(() => {
    if (Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    if (showDetails && scrollViewRef.current) {
      // Scroll to bottom when showing details
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [showDetails]);

  return (
    <View style={[styles.container, style]}>
      <GenericCard
        onClick={() => setShowDetails(!showDetails)}
        title="Can't see your NFTs?"
        style={[{
          backgroundColor: '#fff',
          width: '100%',
          // Optionally, set a minHeight if needed
        }, dark && {
          backgroundColor: '#0a0a0a', // your gray-950 value
        }]}
        icon={
          <Image
            style={[
              styles.downArrow,
              showDetails ? { transform: [{ rotate: '180deg' }] } : {},
            ]}
            source={{uri: Images.Misc.DownArrow}}
            resizeMode="contain"
          />
        }
      />
      {showDetails && (
        <ScrollView
          style={styles.details}
          contentContainerStyle={{ padding: 16 }}
          ref={scrollViewRef}
        >
          <Text style={styles.sectionHeader}>It could be because:</Text>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <View style={styles.listContent}>
              <Text style={styles.itemText}>
                Your NFT collection is not in our auto-fetch list. Add it manually to view your NFTs.
              </Text>
              <Buttons.Generic
                onClick={openAddCollectionSheet}
                style={{ width: '100%', height: 44, marginTop: 8 }}
              >
                Add your collection
              </Buttons.Generic>
            </View>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <View style={styles.listContent}>
              <Text style={styles.itemText}>
                We're temporarily unable to fetch your NFTs from some platforms. You can still view them on the marketplace.
              </Text>
              <View style={styles.platformList}>
                {externalPlatforms.map((platform) => (
                  <TouchableOpacity
                    key={platform.title}
                    onPress={() => Linking.openURL(platform.account)}
                    style={styles.platformLinkBox}
                  >
                    <Text style={styles.platformLink}>
                      {platform.title} ↗
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff', // white-100
    borderRadius: 16,
    width: 344,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    alignSelf: 'center',
    marginVertical: 18,
  },
  card: {
    backgroundColor: '#fff', // white-100
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
  },
  cardTitle: {
    flex: 1,
    color: '#7a7a7a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  downArrow: {
    width: 18,
    height: 18,
    marginLeft: 8,
  },
  details: {
    backgroundColor: '#fff', // white-100
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionHeader: {
    fontSize: 15,
    marginBottom: 12,
    color: '#222',
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 22,
    marginRight: 8,
    color: '#a3a3a3',
    lineHeight: 22,
  },
  listContent: {
    flex: 1,
  },
  itemText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  buttonText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
  platformList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 10,
  },
  platformLinkBox: {
    marginRight: 12,
    marginTop: 4,
  },
  platformLink: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
