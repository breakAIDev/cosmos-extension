import { Collection } from '@leapwallet/cosmos-wallet-hooks';
import { NftStore } from '@leapwallet/cosmos-wallet-store';
import { Header, HeaderActionType } from '@leapwallet/leap-ui';
import PopupLayout from '../../components/layout/popup-layout';
import { useChainInfos } from '../../hooks/useChainInfos';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { hiddenNftStore } from '../../context/manage-nft-store';
import { normalizeImageSrc } from '../../utils/normalizeImageSrc';

import { ChainHeaderCollectionCard, CollectionAvatar } from './components';
import { useNftContext } from './context';

type CollectionDetailsProps = {
  nftStore: NftStore;
};

export const CollectionDetails = observer(({ nftStore }: CollectionDetailsProps) => {
  const { setActivePage, showCollectionDetailsFor } = useNftContext();
  const collectionData = nftStore.nftDetails.collectionData;
  const chainInfos = useChainInfos();

  const { collection, nfts } = useMemo(() => {
    const collection =
      collectionData?.collections.find((collection) => collection.address === showCollectionDetailsFor) ??
      ({} as Collection);

    const collectionNfts = collection
      ? collectionData?.nfts[collection?.chain].filter((nft) =>
          [nft.collection?.address ?? ''].includes(collection.address),
        ) ?? []
      : [];

    const nfts = collectionNfts.filter(
      (nft) =>
        !hiddenNftStore.hiddenNfts.some((hiddenNft) => {
          const [address, tokenId] = hiddenNft.split('-:-');
          return [nft.collection.address ?? ''].includes(address) && (nft.tokenId ?? nft.domain) === tokenId;
        }),
    );

    return { collection, nfts };
  }, [collectionData?.collections, collectionData?.nfts, showCollectionDetailsFor]);

  return (
    <View style={styles.container}>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => setActivePage('ShowNfts'),
              type: HeaderActionType.BACK,
            }}
            title={
              <View style={styles.headerTitle}>
                <CollectionAvatar
                  style={styles.avatar}
                  bgColor={chainInfos[collection.chain ?? '']?.theme?.primaryColor ?? ''}
                  image={normalizeImageSrc(collection?.image ?? '', collection?.address ?? '')}
                />
                <Text
                  style={styles.collectionName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {collection.name ?? ''}
                </Text>
              </View>
            }
          />
        }
      >
        <View style={styles.content}>
          <ChainHeaderCollectionCard nfts={nfts} chain={collection.chain} nftsCount={nfts.length} />
        </View>
      </PopupLayout>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    flex: 1,
    overflow: 'hidden',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 210,
    flexShrink: 1,
  },
  avatar: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  collectionName: {
    flexShrink: 1,
    maxWidth: 150,
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
});
