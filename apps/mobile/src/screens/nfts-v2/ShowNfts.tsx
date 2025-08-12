import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';

import { useDisabledNFTsCollections } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ChainTagsStore, NftStore } from '@leapwallet/cosmos-wallet-store';
// Assume LineDivider is compatible with RN or replaced with View style.
import { LineDivider } from '@leapwallet/leap-ui';
import PopupLayout from '../../components/layout/popup-layout'; // Your custom RN-compatible layout
import { useChainPageInfo } from '../../hooks';
import { Images } from '../../../assets/images';
import { hiddenNftStore } from '../../context/manage-nft-store';

import {
  AddCollection,
  All,
  CantSeeNfts,
  ChainChips,
  CollectionCardLoading,
  Collections,
  Favourites,
  Filter,
  Hidden,
  ManageCollections,
  NoNft,
  SelectedSortsByChips,
  SelectSortBy,
} from './components';
import NetworkErrorInNft from './components/NetworkErrorInNft';
import { useNftContext } from './context';

type ShowNftsProps = {
  nftStore: NftStore;
  chainTagsStore: ChainTagsStore;
};

export const ShowNfts = observer(({ nftStore, chainTagsStore }: ShowNftsProps) => {
  const navigation = useNavigation();
  const { setActiveTab, activeTab } = useNftContext();
  const [searchedText, setSearchedText] = useState('');
  const [showSelectSortBy, setShowSelectSortBy] = useState(false);

  const { topChainColor } = useChainPageInfo();
  const [showManageCollections, setShowManageCollections] = useState(false);
  const [selectedSortsBy, setSelectedSortsBy] = useState<SupportedChain[]>([]);
  const [showAddCollectionSheet, setShowAddCollectionSheet] = useState(false);

  const disabledNfts = useDisabledNFTsCollections();

  const _isLoading = nftStore.nftDetails.loading;
  const collectionData = nftStore.nftDetails.collectionData;
  const sortedCollectionChains = nftStore.getSortedCollectionChains(disabledNfts, hiddenNftStore.hiddenNfts);
  const areAllNftsHidden = nftStore.getAreAllNftsHidden(hiddenNftStore.hiddenNfts);

  const hasToShowNetworkErrorView = useMemo(() => {
    return (
      _isLoading === false &&
      Object.values(collectionData?.nfts ?? {}).length === 0 &&
      nftStore.nftDetails.networkError
    );
  }, [_isLoading, collectionData?.nfts, nftStore.nftDetails.networkError]);

  return (
    <View style={styles.container}>
      <PopupLayout
        header={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>NFT Collections</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Home'); // Use the correct route name
              }}
              style={styles.closeBtn}
            >
              <Image source={Images.Misc.Cross} style={styles.closeImg} />
            </TouchableOpacity>
            <View style={styles.lineDividerWrap}>
              <LineDivider />
            </View>
            <View style={[styles.headerBar, { backgroundColor: topChainColor }]} />
          </View>
        }
      >
        {hasToShowNetworkErrorView ? (
          <NetworkErrorInNft
            title="NFTs can’t be loaded"
            subTitle="NFTs can’t be loaded due to a technical failure, Kindly try again later."
            showRetryButton={true}
            nftStore={nftStore}
            setShowAddCollectionSheet={setShowAddCollectionSheet}
          />
        ) : (
          <>
            {_isLoading === false && Object.values(collectionData?.nfts ?? {}).length === 0 ? (
              <NoNft
                openManageCollectionsSheet={() => setShowManageCollections(true)}
                openAddCollectionSheet={() => setShowAddCollectionSheet(true)}
                nftStore={nftStore}
              />
            ) : (
              <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'All' && sortedCollectionChains.length > 0 && (
                  <Filter
                    searchedText={searchedText}
                    setSearchedText={setSearchedText}
                    onClickSortBy={() => setShowSelectSortBy(true)}
                  />
                )}

                <ChainChips
                  handleTabClick={(selectedTab: string) => {
                    setActiveTab(selectedTab);
                    setSearchedText('');
                  }}
                  nftStore={nftStore}
                />
                {activeTab === 'All' && selectedSortsBy.length > 0 && (
                  <SelectedSortsByChips selectedSortsBy={selectedSortsBy} setSelectedSortsBy={setSelectedSortsBy} />
                )}

                {activeTab === 'All' && (
                  <All searchedText={searchedText.trim()} selectedSortsBy={selectedSortsBy} nftStore={nftStore} />
                )}
                {activeTab === 'Favorites' && <Favourites nftStore={nftStore} />}
                {activeTab === 'Collections' && (
                  <Collections setShowManageCollections={setShowManageCollections} nftStore={nftStore} />
                )}

                {activeTab === 'Hidden' && <Hidden nftStore={nftStore} />}
                {activeTab === 'All' && (
                  <>
                    {_isLoading && !areAllNftsHidden && <CollectionCardLoading />}
                    {_isLoading === false ? (
                      <CantSeeNfts
                        openAddCollectionSheet={() => setShowAddCollectionSheet(true)}
                        style={styles.fullWidth}
                        nftStore={nftStore}
                      />
                    ) : null}
                  </>
                )}
              </ScrollView>
            )}
          </>
        )}
      </PopupLayout>

      <SelectSortBy
        isVisible={showSelectSortBy}
        onClose={() => setShowSelectSortBy(false)}
        selectedSortsBy={selectedSortsBy}
        setSelectedSortsBy={setSelectedSortsBy}
        nftStore={nftStore}
      />
      {/* 
      <ManageCollections
        isVisible={showManageCollections}
        onClose={() => setShowManageCollections(false)}
        openAddCollectionSheet={() => setShowAddCollectionSheet(true)}
        nftStore={nftStore}
      />
      */}
      <AddCollection
        chainTagsStore={chainTagsStore}
        isVisible={showAddCollectionSheet}
        onClose={() => setShowAddCollectionSheet(false)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    width: '100%',
    backgroundColor: '#fff', // Update as needed for dark mode
  },
  header: {
    position: 'relative',
    height: 72,
    width: 400,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#171717',
    fontSize: 20,
    fontWeight: '500',
    // Add dark mode logic if needed
  },
  closeBtn: {
    // Style as needed
  },
  closeImg: {
    width: 20,
    height: 20,
    tintColor: '#171717', // Invert for dark mode if needed
  },
  lineDividerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
  },
  headerBar: {
    position: 'absolute',
    width: '100%',
    height: 4,
    left: 0,
    top: 0,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  fullWidth: {
    width: '100%',
  },
});

