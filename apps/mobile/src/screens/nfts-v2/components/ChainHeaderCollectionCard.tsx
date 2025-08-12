import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { NftInfo } from '@leapwallet/cosmos-wallet-store';
import { EyeSlash } from 'phosphor-react-native';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { useChainPageInfo } from '../../../hooks';
import { useChainInfos } from '../../../hooks/useChainInfos';
import React from 'react';
import { getChainName } from '../../../utils/getChainName';
import { normalizeImageSrc } from '../../../utils/normalizeImageSrc';
import { sessionStoreItem } from '../../../utils/sessionStorage';

import { useNftContext } from '../context';
import { Chip, NftCard, Text, ViewAllButton } from './index';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type ChainHeaderCollectionCardProps = {
  chain: SupportedChain;
  nfts: NftInfo[];
  nftsCount: number;
  haveToShowLoader?: boolean;
  isFetchingMore?: boolean;
};

export function ChainHeaderCollectionCard({
  chain,
  nfts,
  nftsCount,
  haveToShowLoader,
  isFetchingMore,
}: ChainHeaderCollectionCardProps) {
  const chainInfos = useChainInfos();
  const { topChainColor } = useChainPageInfo();
  const { activePage, setActivePage, setNftDetails, activeTab, setShowChainNftsFor } = useNftContext();
  const chainInfo = chainInfos[chain];

  const handleViewOnClick = () => {
    setShowChainNftsFor(chain);
    setActivePage('ChainNftsDetails');
  };

  if (activePage !== 'CollectionDetails' && nfts.length === 0) {
    return <View/>;
  }

  // Render hidden NFTs state
  if (activePage === 'CollectionDetails' && nfts.length === 0) {
    return (
      <View style={styles.hiddenContainer}>
        <View style={styles.hiddenIconCircle}>
          <EyeSlash size={24} color="#e5e7eb" />
        </View>
        <Text style={styles.hiddenTitle}>NFTs hidden</Text>
        <Text style={styles.hiddenDesc}>All NFTs are hidden of this collection</Text>
      </View>
    );
  }

  // Main card
  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <Chip style={styles.chip}>
          <Chip.Image
            source={{ uri: chainInfo.chainSymbolImageUrl }}
            style={styles.chipImg}
          />
          <Chip.Text style={styles.chipText}>
            {getChainName(chainInfo.chainName)}
          </Chip.Text>
        </Chip>

        <View style={styles.headerRight}>
          <View style={[styles.nftsCount, { borderColor: topChainColor }]}>
            <Text style={[styles.nftsCountText, { color: topChainColor }]}>
              {nftsCount} item{nftsCount > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* NFT Cards grid */}
      <View style={styles.grid}>
        {nfts.map((nft, index) => {
          // Show "View All" button at index 6 if tab is "All"
          if (activeTab === 'All') {
            if (index === 6) {
              return (
                <ViewAllButton
                  key={`${nft.tokenId}-${index}`}
                  onPress={handleViewOnClick}
                />
              );
            }
            if (index > 6) return null;
          }

          const nftName =
            activePage === 'CollectionDetails' ? nft.name : nft.collection?.name ?? nft.name;
          const nftId =
            activePage === 'CollectionDetails' ? nft.tokenId : nft.tokenId ?? nft.name;

          return (
            <TouchableOpacity
              key={`${nft.tokenId}-${index}`}
              onPress={() => {
                sessionStoreItem('nftLastActivePage', activePage);
                setActivePage('NftDetails');
                setNftDetails({ ...nft, chain: chain as SupportedChain });
              }}
              style={styles.nftCardTouchable}
              activeOpacity={0.8}
            >
              <NftCard
                mediaType={nft.media_type}
                chain={chain as SupportedChain}
                imgSrc={normalizeImageSrc(nft.image ?? '', nft.collection?.address ?? '')}
                textNft={{
                  name: nft?.domain ?? '',
                  description:
                    nft.extension?.description ??
                    `${nft.collection?.name ?? ''} - ${nft.name}`,
                }}
                style={styles.nftCard}
              />
              <Text style={styles.nftNameText} numberOfLines={1}>
                {nftName ?? ''}
              </Text>
              {!!nftId && (
                <Text style={styles.nftIdText} numberOfLines={1}>
                  #{nftId}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Loader for more NFTs */}
        {haveToShowLoader && (
          <View style={styles.loaderWrapper}>
            <View style={{ marginTop: 6 }}>
              {/* Loader ID for testing, optional */}
            </View>
            {isFetchingMore && (
              <View style={styles.loaderSpinner}>
                <LoaderAnimation color={topChainColor} />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#16181d', // dark:border-gray-900 (fallback for light mode too)
    marginBottom: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#16181d',
    backgroundColor: '#fff',
  },
  chip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 3,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
  },
  chipImg: {
    width: 16,
    height: 16,
    marginRight: 6,
    borderRadius: 8,
  },
  chipText: {
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  nftsCount: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  nftsCountText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  nftCardTouchable: {
    width: '48%', // grid 2 columns
    marginBottom: 14,
  },
  nftCard: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  nftNameText: {
    color: '#1f2937',
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 15,
  },
  nftIdText: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 2,
  },
  loaderWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  loaderSpinner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  hiddenContainer: {
    borderRadius: 18,
    backgroundColor: '#18181b', // bg-gray-900
    padding: 32,
    margin: 16,
    alignItems: 'center',
    textAlign: 'center',
  },
  hiddenIconCircle: {
    borderRadius: 50,
    backgroundColor: '#27272a', // bg-gray-800
    padding: 18,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginTop: 10,
    marginBottom: 2,
  },
  hiddenDesc: {
    color: '#b0b0b0',
    fontWeight: '500',
    fontSize: 13,
  },
});
