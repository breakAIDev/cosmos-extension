import { NftPage, useDisabledNFTsCollections } from '@leapwallet/cosmos-wallet-hooks';
import { NftStore } from '@leapwallet/cosmos-wallet-store';
import { ArrowCounterClockwise, Faders, MagnifyingGlassMinus } from 'phosphor-react-native';
import { WalletButtonV2 } from '../../components/button';
import { PageHeader } from '../../components/header/PageHeaderV2';
import { SideNavMenuOpen } from '../../components/header/sidenav-menu';
import Text from '../../components/text';
import { Button } from '../../components/ui/button';
import { SearchInput } from '../../components/ui/input/search-input';
import { MotiView } from 'moti';
import { useWalletInfo } from '../../hooks';
import useQuery from '../../hooks/useQuery';
import { Images } from '../../../assets/images';
import { observer } from 'mobx-react-lite';
import SelectWallet from '../home/SelectWallet/v2';
import React, { useEffect, useMemo, useState } from 'react';
import { FavNftStore, favNftStore } from '../../context/manage-nft-store';
import { nftStore } from '../../context/nft-store';

import CollectionDetails from './CollectionDetails';
import CollectionList from './CollectionList';
import { ManageCollections } from './components/ManageCollections';
import { NftContextProvider, useNftContext } from './context';
import { NftDetails } from './NFTDetails';
import { NFTLoading } from './NFTLoading';
import TxPage, { TxType } from './send-nft/TxPage';

import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';

const NFTs = observer(({ nftStore, favNftStore }: { nftStore: NftStore; favNftStore: FavNftStore }) => {
  const query = useQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const collectionData = nftStore.nftDetails.collectionData;
  const isLoading = nftStore.nftDetails.loading;
  const disabledNftsCollections = useDisabledNFTsCollections();
  const { nftDetails, setNftDetails, showTxPage, setShowTxPage } = useNftContext();

  const noNFTFound = useMemo(
    () => isLoading === false && Object.values(collectionData?.nfts ?? {}).length === 0,
    [isLoading, collectionData?.nfts],
  );

  const filteredCollections = useMemo(() => {
    const searchedNFTs = Object.values(collectionData?.nfts ?? {})
      .flat()
      .filter(
        (nft) =>
          nft.name.trim().toLowerCase().includes(searchQuery.toLowerCase()) ||
          `#${nft.tokenId ?? nft.domain}`.trim().toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const searchedNFTCollectionAddresses = searchedNFTs.map((nft) => nft.collection.address);

    return collectionData?.collections
      .filter(
        (item) =>
          !disabledNftsCollections.includes(item.address) &&
          (item.name.trim().toLowerCase().includes(searchQuery.toLowerCase()) ||
            searchedNFTCollectionAddresses.includes(item.address)),
      )
      .sort((collectionA, collectionB) => {
        const nameA = collectionA.name.toLowerCase().trim();
        const nameB = collectionB.name.toLowerCase().trim();
        if (nameA > nameB) return 1;
        if (nameA < nameB) return -1;
        return 0;
      })
      .sort((collectionA, collectionB) => {
        const isCollectionAFav = favNftStore.favNfts.some((item) => item.includes(collectionA.address));
        const isCollectionBFav = favNftStore.favNfts.some((item) => item.includes(collectionB.address));
        if (isCollectionAFav && !isCollectionBFav) return -1;
        if (!isCollectionAFav && isCollectionBFav) return 1;
        return 0;
      });
  }, [collectionData?.collections, collectionData?.nfts, disabledNftsCollections, favNftStore.favNfts, searchQuery]);

  const hasToShowNetworkErrorView = useMemo(() => {
    return (
      isLoading === false && Object.values(collectionData?.nfts ?? {}).length === 0 && nftStore.nftDetails.networkError
    );
  }, [isLoading, collectionData?.nfts, nftStore.nftDetails.networkError]);

  useEffect(() => {
    setSearchQuery('');
    setNftDetails(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (showTxPage) {
    return (
      <TxPage
        isOpen={showTxPage}
        onClose={() => setShowTxPage(false)}
        txType={TxType.NFTSEND}
      />
    );
  }

  if (isLoading) {
    return <NFTLoading />;
  }

  if (hasToShowNetworkErrorView) {
    return (
      <View style={styles.centeredPanel}>
        <View style={{ alignItems: 'center', gap: 18 }}>
          <View style={styles.failedIconContainer}>
            <Image source={{uri: Images.Misc.Warning}} style={styles.failedIcon} />
          </View>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text size="lg" style={styles.boldText}>Failed to load NFTs</Text>
            <Text size="sm" style={styles.secondaryTextCenter}>
              We were unable to load your NFTs at the moment due to some technical failure. Please try again in some time.
            </Text>
          </View>
        </View>
        <Button
          style={{ width: '100%', marginTop: 32 }}
          onPress={() => nftStore.loadNfts()}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ArrowCounterClockwise size={16} color="#1a222c" />
            <Text size="sm" style={styles.boldText}>Reload NFTs</Text>
          </View>
        </Button>
      </View>
    );
  }

  if (noNFTFound) {
    return (
      <View style={styles.noNftsPanel}>
        <MagnifyingGlassMinus size={64} color="#101013" style={styles.noNftsIcon} />
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text size="lg" style={styles.boldText}>No NFTs found</Text>
          <Text size="sm" style={styles.secondaryTextCenter}>
            Looks like we couldn't find any NFTs in your wallet.
          </Text>
        </View>
      </View>
    );
  }

  if (nftDetails) {
    return <NftDetails />;
  }

  return (
    <>
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 120 }}>
        <SearchInput
          value={searchQuery}
          autoFocus={false}
          onChangeText={setSearchQuery}
          placeholder="Search by collection or name"
          onClear={() => setSearchQuery('')}
          style={{ marginBottom: 16 }}
        />
        {filteredCollections?.length > 0 ? (
          <CollectionList collections={filteredCollections} />
        ) : (
          <View style={styles.noNftsInnerPanel}>
            <MagnifyingGlassMinus size={64} color="#101013" style={styles.noNftsIcon} />
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text size="lg" style={styles.boldText}>No NFTs found</Text>
              <Text size="sm" style={styles.secondaryTextCenter}>
                We couldn’t find a match. Try searching again or use a different keyword.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      <CollectionDetails />
    </>
  );
});

const NFTPage = observer(() => {
  const [activePage, setActivePage] = useState<NftPage>('ShowNfts');
  const value = { activePage, setActivePage };
  const [showSelectWallet, setShowSelectWallet] = useState(false);
  const [showManageCollections, setShowManageCollections] = useState(false);
  const walletInfo = useWalletInfo();
  const collectionData = nftStore.nftDetails.collectionData;

  return (
    <NftContextProvider value={value}>
      <SafeAreaView style={styles.safePanel}>
        <MotiView style={styles.panelBody}>
          <PageHeader>
            <SideNavMenuOpen style={{ paddingVertical: 8, paddingHorizontal: 12 }} />
            <WalletButtonV2
              showDropdown
              showWalletAvatar
              style={styles.walletBtn}
              walletName={walletInfo.walletName}
              walletAvatar={walletInfo.walletAvatar}
              handleDropdownClick={() => setShowSelectWallet(true)}
            />
            {collectionData?.collections?.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowManageCollections(true)}
                style={styles.fadersBtn}
              >
                <Faders size={20} color="#222" style={{ transform: [{ rotate: '90deg' }] }} />
              </TouchableOpacity>
            )}
          </PageHeader>
          <NFTs nftStore={nftStore} favNftStore={favNftStore} />
          <SelectWallet isVisible={showSelectWallet} onClose={() => setShowSelectWallet(false)} title="Your Wallets" />
          <ManageCollections isVisible={showManageCollections} onClose={() => setShowManageCollections(false)} />
        </MotiView>
      </SafeAreaView>
    </NftContextProvider>
  );
});

const styles = StyleSheet.create({
  safePanel: {
    flex: 1,
    backgroundColor: '#f4f6fa',
  },
  panelBody: {
    flex: 1,
    backgroundColor: '#f4f6fa',
  },
  centeredPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 36,
    paddingTop: 40,
    paddingBottom: 80,
  },
  failedIconContainer: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: '#e6555a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  failedIcon: {
    width: 28,
    height: 28,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#101013',
    textAlign: 'center',
  },
  secondaryTextCenter: {
    color: '#757580',
    textAlign: 'center',
  },
  noNftsPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 44,
    paddingTop: 40,
    paddingBottom: 80,
  },
  noNftsIcon: {
    padding: 10,
    borderRadius: 32,
    backgroundColor: '#e9f6f4',
    marginBottom: 8,
  },
  noNftsInnerPanel: {
    paddingTop: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 12,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  walletBtn: {
    position: 'absolute',
    top: 10,
    right: 60,
    zIndex: 2,
  },
  fadersBtn: {
    backgroundColor: '#e7eaf3',
    borderRadius: 100,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
});

export default NFTPage;
