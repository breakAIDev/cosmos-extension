import { useDisabledNFTsCollections, useFractionalizedNftContracts } from '@leapwallet/cosmos-wallet-hooks';
import { NftStore } from '@leapwallet/cosmos-wallet-store';
import { useChainPageInfo } from '../../../hooks';
import { useChainInfos } from '../../../hooks/useChainInfos';
import { RightArrow } from '../../../../assets/images/misc';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { getChainName } from '../../../utils/getChainName';

import { useNftContext } from '../context';
import { Chip, CollectionAvatar, Text } from './index';
import {
  View,
  Text as RNText,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';

type CollectionsProps = {
  setShowManageCollections: React.Dispatch<React.SetStateAction<boolean>>;
  nftStore: NftStore;
};

export const Collections = observer(({ setShowManageCollections, nftStore }: CollectionsProps) => {
  const { topChainColor } = useChainPageInfo();
  const chainInfos = useChainInfos();

  const fractionalizedNftContracts = useFractionalizedNftContracts();
  const { setActivePage, setShowCollectionDetailsFor } = useNftContext();
  const collectionData = nftStore.nftDetails.collectionData;
  const disabledNftsCollections = useDisabledNFTsCollections();

  const sortedCollections = useMemo(() => {
    return collectionData?.collections.slice().sort((a, b) => {
      const nameA = a.name.toLowerCase().trim();
      const nameB = b.name.toLowerCase().trim();
      if (nameA > nameB) return 1;
      if (nameA < nameB) return -1;
      return 0;
    });
  }, [collectionData?.collections]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <RNText style={styles.headerTitle}>Your collections</RNText>
        <TouchableOpacity
          onPress={() => setShowManageCollections(true)}
          style={styles.manageBtn}
        >
          <RNText style={[styles.manageBtnText, { color: topChainColor }]}>
            Manage collections
          </RNText>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {sortedCollections?.map((collection, index, array) => {
          const { chain, name, image, totalNfts, address } = collection;
          let nftCount = totalNfts;

          if (fractionalizedNftContracts.includes(address)) {
            const fractionalizedNft = collectionData?.nfts?.[chain].filter(
              (nft) => nft.collection.address === address
            );
            nftCount = fractionalizedNft?.length ?? nftCount;
          }

          if (disabledNftsCollections.includes(address)) return null;
          const chainInfo = chainInfos[chain];

          return (
            <TouchableOpacity
              key={address}
              style={[
                styles.row,
                index + 1 !== array.length && styles.rowBorder,
              ]}
              activeOpacity={0.85}
              onPress={() => {
                setActivePage('CollectionDetails');
                setShowCollectionDetailsFor(address);
              }}
            >
              <CollectionAvatar
                image={image}
                bgColor={chainInfo.theme.primaryColor}
                style={styles.avatar}
              />

              <View style={styles.colInfo}>
                <Text
                  style={[
                    styles.collectionName,
                  ]}
                  numberOfLines={1}
                >
                  {name ?? ''}
                </Text>
                <View style={[styles.countBadge, { borderColor: topChainColor }]}>
                  <RNText style={[styles.countBadgeText, { color: topChainColor }]}>
                    {nftCount} item{(nftCount ?? 1) > 1 ? 's' : ''}
                  </RNText>
                </View>
              </View>

              <View style={styles.chipWrap}>
                <Chip style={styles.chip}>
                  <Chip.Image
                    source={{ uri: chainInfo.chainSymbolImageUrl }}
                    style={styles.chipImg}
                  />
                  <Chip.Text style={styles.chipText} numberOfLines={1}>
                    {getChainName(chainInfo.chainName)}
                  </Chip.Text>
                </Chip>
                <Image source={{uri: RightArrow}} style={styles.arrow} resizeMode="contain" />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#16181d',
    marginBottom: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#16181d',
  },
  headerTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: 'bold',
  },
  manageBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  manageBtnText: {
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderColor: '#16181d',
  },
  avatar: {
    width: 30,
    height: 30,
    marginRight: 12,
    borderRadius: 15,
  },
  colInfo: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  collectionName: {
    color: '#18181b',
    marginTop: 2,
    fontSize: 15,
    fontWeight: 'bold',
    maxWidth: 150,
  },
  countBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 12,
    marginTop: 2,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipWrap: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  chipImg: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  chipText: {
    color: '#18181b',
    fontSize: 12,
    maxWidth: 90,
  },
  arrow: {
    width: 16,
    height: 16,
    marginLeft: 8,
  },
});
