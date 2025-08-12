import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { NftInfo } from '@leapwallet/cosmos-wallet-store';
import { useChainPageInfo } from '../../../hooks';
import { useChainInfos } from '../../../hooks/useChainInfos';
import React from 'react';
import { View, Text as RNText, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { normalizeImageSrc } from '../../../utils/normalizeImageSrc';
import { sessionStoreItem } from '../../../utils/sessionStorage';

import { useNftContext } from '../context';
import { NftCard, Text, ViewAllButton } from './index';

type TextHeaderCollectionCardProps = {
  nfts: (NftInfo & { chain: SupportedChain })[];
  headerTitle: string;
  noChip?: boolean;
};

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2 - 8; // padding + gap

export function TextHeaderCollectionCard({ nfts, headerTitle, noChip }: TextHeaderCollectionCardProps) {
  const chainInfos = useChainInfos();
  const { topChainColor } = useChainPageInfo();
  const { activePage, setActivePage, setNftDetails, setActiveTab } = useNftContext();
  const isFavoriteHeaderTitle = headerTitle === 'Favorites';

  const handleOnClick = () => {
    if (isFavoriteHeaderTitle) {
      setActiveTab('Favorites');
    }
  };

  // Render 2-column grid (up to 6 NFTs, then ViewAllButton if 'Favorites')
  const renderItem = ({ item, index }: { item: NftInfo & { chain: SupportedChain }, index: number }) => {
    if (isFavoriteHeaderTitle && index === 6) {
      return (
        <View style={styles.cardWrap}>
          <ViewAllButton onPress={handleOnClick} />
        </View>
      );
    }
    if (isFavoriteHeaderTitle && index > 6) return null;

    return (
      <TouchableOpacity
        style={styles.cardWrap}
        key={`${item.tokenId}-${index}`}
        activeOpacity={0.8}
        onPress={() => {
          sessionStoreItem('nftLastActivePage', activePage);
          setActivePage('NftDetails');
          setNftDetails({ ...item, chain: item?.chain ?? '' });
        }}
      >
        <NftCard
          mediaType={item.media_type}
          chain={item.chain}
          imgSrc={normalizeImageSrc(item.image ?? '', item.collection?.address ?? '')}
          textNft={{
            name: item?.domain ?? '',
            description: item.extension?.description ?? `${item.collection?.name ?? ''} - ${item.name}`,
          }}
          chainName={noChip ? undefined : chainInfos[item.chain].chainName}
          chainLogo={noChip ? undefined : chainInfos[item.chain].chainSymbolImageUrl}
          style={{height: 150, width: 150, alignSelf: 'center'}}
        />
        <Text style={styles.nftName}>
          {item.collection?.name ?? item.name ?? ''}
        </Text>
        {(item.tokenId ?? item.name) && (
          <Text style={styles.nftId}>
            #{item.tokenId ?? item.name}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <RNText
          style={[
            styles.headerTitle,
            !isFavoriteHeaderTitle && { color: topChainColor, borderColor: topChainColor },
          ]}
          numberOfLines={1}
        >
          {headerTitle}
        </RNText>
        {isFavoriteHeaderTitle && (
          <View style={styles.headerCountBox}>
            <RNText style={[styles.headerCountText, { color: topChainColor }]}>
              {nfts.length} item{nfts.length > 1 ? 's' : ''}
            </RNText>
          </View>
        )}
      </View>

      <FlatList
        data={nfts.slice(0, isFavoriteHeaderTitle ? 7 : undefined)} // max 7: 6 NFTs + ViewAll
        renderItem={renderItem}
        keyExtractor={(_, idx) => `nft-${idx}`}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#18181b', // fallback, override with dark
    marginBottom: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#18181b', // fallback, override with dark
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: '#18181b',
    fontWeight: 'bold',
    maxWidth: 160,
    fontSize: 16,
    flexShrink: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerCountBox: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#18181b', // fallback, override with dark
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: '#fff',
  },
  headerCountText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  grid: {
    padding: 16,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: CARD_WIDTH,
    marginBottom: 16,
    alignItems: 'center',
  },
  nftName: {
    color: '#18181b',
    fontSize: 15,
    marginTop: 8,
    fontWeight: '500',
  },
  nftId: {
    color: '#d1d5db',
    fontSize: 13,
    marginTop: 2,
  },
});
