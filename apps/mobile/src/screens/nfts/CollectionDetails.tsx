import { sliceWord } from '@leapwallet/cosmos-wallet-hooks';
import { Collection } from '@leapwallet/cosmos-wallet-store';
import { Heart } from 'phosphor-react-native';
import BottomModal from '../../components/new-bottom-modal';
import Text from '../../components/text';
import { Images } from '../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { favNftStore, hiddenNftStore } from '../../context/manage-nft-store';
import { nftStore } from '../../context/nft-store';
import { useNftContext } from './context';

import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';

const ITEM_SIZE = (Dimensions.get('window').width - 64 - 16) / 2; // 64 = modal horizontal padding, 16 = grid gap

const CollectionDetails = observer(() => {
  const { showCollectionDetailsFor, setShowCollectionDetailsFor, setNftDetails } = useNftContext();
  const collectionData = nftStore.nftDetails.collectionData;

  const { collection, nfts } = useMemo(() => {
    const collection =
      collectionData?.collections.find((collection) => collection.address === showCollectionDetailsFor) ??
      ({} as Collection);

    const collectionNfts = collection
      ? collectionData?.nfts[collection?.chain]?.filter((nft) =>
          [nft.collection?.address ?? ''].includes(collection.address),
        ) ?? []
      : [];

    return { collection, nfts: collectionNfts };
  }, [collectionData?.collections, collectionData?.nfts, showCollectionDetailsFor]);

  if (!nfts?.length) return null;

  if (nfts.length === 1) {
    setNftDetails({ ...nfts[0], chain: collection.chain });
    setShowCollectionDetailsFor('');
  }

  return (
    <BottomModal
      onClose={() => setShowCollectionDetailsFor('')}
      isOpen={!!showCollectionDetailsFor}
      style={styles.modal}
      title={sliceWord(collection.name, 20, 0)}
    >
      <FlatList
        data={nfts}
        numColumns={2}
        keyExtractor={(item, idx) =>
          `${item?.collection.address ?? ''}-:-${item?.tokenId ?? item?.domain ?? ''}-${idx}`
        }
        columnWrapperStyle={{ gap: 16, marginBottom: 16 }}
        renderItem={({ item: nft }) => {
          const nftIndex = `${nft?.collection.address ?? ''}-:-${nft?.tokenId ?? nft?.domain ?? ''}`;
          const isInFavNfts = favNftStore.favNfts.includes(nftIndex);

          return (
            <TouchableOpacity
              activeOpacity={0.84}
              style={styles.nftCard}
              onPress={() => {
                setNftDetails({ ...nft, chain: collection.chain });
                setShowCollectionDetailsFor('');
              }}
            >
              <View style={styles.nftImageContainer}>
                <Image
                  source={{ uri: nft.image ?? Images.Logos.GenericNFT}}
                  style={styles.nftImage}
                  resizeMode="cover"
                />
                {isInFavNfts && (
                  <>
                    <Heart
                      size={26}
                      style={[styles.heartIcon, { position: 'absolute', top: 9, right: 9 }]}
                    />
                    <Heart
                      size={24}
                      weight="fill"
                      color="#D0414F"
                      style={[styles.heartFillIcon, { position: 'absolute', top: 14, right: 14 }]}
                    />
                  </>
                )}
              </View>
              <View style={styles.nftDetails}>
                <Text size="md" style={styles.nftName}>
                  {sliceWord(nft.name, 12, 0)}
                </Text>
                <Text size="sm" style={styles.nftTokenId}>
                  #{sliceWord(nft.tokenId, 12, 3)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 0 }}
        showsVerticalScrollIndicator={false}
      />
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  modal: {
    padding: 24,
    paddingTop: 16,
    flex: 1,
  },
  nftCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 0,
    alignItems: 'center',
    gap: 12,
  },
  nftImageContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f4f6f8',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  nftImage: {
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
  nftDetails: {
    alignItems: 'flex-start',
    gap: 2,
    width: ITEM_SIZE,
    minHeight: 36,
    paddingHorizontal: 2,
  },
  nftName: {
    fontWeight: 'bold',
    color: '#212121',
    lineHeight: 22,
    marginBottom: 2,
  },
  nftTokenId: {
    color: '#999',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default CollectionDetails;
