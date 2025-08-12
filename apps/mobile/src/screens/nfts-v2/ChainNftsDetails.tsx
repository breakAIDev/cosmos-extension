import { useDisabledNFTsCollections } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { NftInfo, NftStore } from '@leapwallet/cosmos-wallet-store';
import { Header, HeaderActionType } from '@leapwallet/leap-ui';
import PopupLayout from '../../components/layout/popup-layout';
import { useChainInfos } from '../../hooks/useChainInfos';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getChainName } from '../../utils/getChainName';

import { CollectionAvatar, TextHeaderCollectionCard } from './components';
import { useNftContext } from './context';

type ChainNftsDetailsProps = {
  nftStore: NftStore;
};

export const ChainNftsDetails = observer(({ nftStore }: ChainNftsDetailsProps) => {
  const { setActivePage, showChainNftsFor } = useNftContext();
  const collectionData = nftStore.nftDetails.collectionData;
  const chainInfos = useChainInfos();
  const chainInfo = chainInfos[showChainNftsFor];
  const disabledNFTsCollections = useDisabledNFTsCollections();

  const nfts = useMemo(() => {
    return (collectionData?.nfts[showChainNftsFor] ?? []).reduce(
      (_nfts: (NftInfo & { chain: SupportedChain })[], nft) => {
        if (disabledNFTsCollections.includes(nft.collection?.address ?? '')) {
          return _nfts;
        }
        return [
          ..._nfts,
          {
            ...nft,
            chain: showChainNftsFor,
          },
        ];
      },
      [],
    );
  }, [collectionData?.nfts, disabledNFTsCollections, showChainNftsFor]);

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
                <CollectionAvatar style={styles.avatar} image={chainInfo.chainSymbolImageUrl} />
                <Text
                  style={styles.chainName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {getChainName(chainInfo.chainName)}
                </Text>
              </View>
            }
          />
        }
      >
        <View style={styles.content}>
          <TextHeaderCollectionCard
            headerTitle={`${nfts.length} NFT${nfts.length > 1 ? 's' : ''}`}
            nfts={nfts}
            noChip={true}
          />
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
    // panel-height: handle with parent if needed
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
  chainName: {
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
