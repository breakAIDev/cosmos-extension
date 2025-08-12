import { sliceWord } from '@leapwallet/cosmos-wallet-hooks';
import { Collection } from '@leapwallet/cosmos-wallet-store';
import { Heart } from 'phosphor-react-native';
import Text from '../../components/text';
import { Images } from '../../../assets/images';
import React from 'react';
import { favNftStore } from '../../context/manage-nft-store';
import { useNftContext } from './context';

import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';

const ITEM_SIZE = (Dimensions.get('window').width - 64 - 16) / 2; // adjust padding/gap as needed

const CollectionList = ({ collections }: { collections: Collection[] }) => {
  const { setShowCollectionDetailsFor } = useNftContext();

  return (
    <FlatList
      data={collections}
      numColumns={2}
      keyExtractor={(item, idx) => `${item.address}-${idx}`}
      columnWrapperStyle={{ gap: 16, marginBottom: 16 }}
      renderItem={({ item: c }) => {
        const isCollectionFav = favNftStore.favNfts.some((item) => item.includes(c.address));
        return (
          <TouchableOpacity
            activeOpacity={0.84}
            style={styles.card}
            onPress={() => setShowCollectionDetailsFor(c.address)}
          >
            <Image
              source={{ uri: c.image ?? Images.Logos.GenericNFT}}
              style={styles.image}
              resizeMode="cover"
            />
            {isCollectionFav && (
              <>
                <Heart
                  size={26}
                  style={[styles.heartIcon, { position: 'absolute', top: 9, right: 9 }]}
                />
                <Heart
                  size={24}
                  weight="fill"
                  color="#D0414F"
                  style={[styles.heartFillIcon, { position: 'absolute', top: 16, right: 16 }]}
                />
              </>
            )}
            <View style={styles.bottomLeftInfo}>
              <Text size="xs" style={styles.nameText}>
                {sliceWord(c.name, 12, 0)}
              </Text>
              <Text size="xs" style={styles.countText}>
                ({c.totalNfts})
              </Text>
            </View>
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#edf3f3',
    marginBottom: 0,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  heartIcon: {
    zIndex: 2,
  },
  heartFillIcon: {
    zIndex: 3,
  },
  bottomLeftInfo: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f4f4f8cc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  nameText: {
    fontWeight: 'bold',
    color: '#222',
    marginRight: 2,
  },
  countText: {
    fontWeight: 'bold',
    color: '#888',
  },
});

export default CollectionList;
