import {
  sliceSearchWord,
  useDisabledNFTsCollections,
  useSetDisabledNFTsInStorage,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { MagnifyingGlassMinus } from 'phosphor-react-native';
import BottomModal from '../../../components/new-bottom-modal';
import Text from '../../../components/text';
import { SearchInput } from '../../../components/ui/input/search-input';
import { Images } from '../../../../assets/images';
import React, { useMemo, useState } from 'react';
import { nftStore } from '../../../context/nft-store';
import { sliceWord } from '../../../utils/strings';

import { View, Image, Switch, ScrollView, StyleSheet } from 'react-native';

export type ManageCollectionsProps = {
  isVisible: boolean;
  onClose: VoidFunction;
};

export function ManageCollections({ isVisible, onClose }: ManageCollectionsProps) {
  const collectionData = nftStore.nftDetails.collectionData;
  const collections = useMemo(() => {
    return collectionData?.collections ?? [];
  }, [collectionData?.collections]);

  const [searchedText, setSearchedText] = useState('');
  const disabledNFTsCollections = useDisabledNFTsCollections();
  const setDisabledNFTsCollections = useSetDisabledNFTsInStorage();

  const filteredCollections = useMemo(() => {
    return (
      collections
        ?.filter((collection) => {
          const lowercasedSearchedText = searchedText.trim().toLowerCase();
          const { name, address, chain } = collection;

          if (
            name.trim().toLowerCase().includes(lowercasedSearchedText) ||
            address.trim().toLowerCase().includes(lowercasedSearchedText) ||
            chain.trim().toLowerCase().includes(lowercasedSearchedText)
          ) {
            return true;
          }

          return false;
        })
        ?.sort((collectionA, collectionB) => {
          const nameA = collectionA.name.toUpperCase();
          const nameB = collectionB.name.toUpperCase();

          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        }) ?? []
    );
  }, [collections, searchedText]);

  const handleBottomSheetClose = () => {
    onClose();
    setSearchedText('');
  };

  const handleToggleClick = async (
    isEnabled: boolean,
    collectionAddress: string,
    chain: SupportedChain
  ) => {
    let _disabledNFTsCollections: string[] = [];

    if (isEnabled) {
      _disabledNFTsCollections = disabledNFTsCollections.filter((collection) => collection !== collectionAddress);
    } else {
      if (!disabledNFTsCollections.includes(collectionAddress)) {
        _disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress];
      } else {
        _disabledNFTsCollections = disabledNFTsCollections;
      }
    }
    await setDisabledNFTsCollections(_disabledNFTsCollections);
  };

  if (collections.length === 0) return null;

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={handleBottomSheetClose}
      title={'Manage Collections'}
      fullScreen
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <SearchInput
            value={searchedText}
            onChangeText={setSearchedText}
            placeholder="Search by collection or name"
            onClear={() => setSearchedText('')}
          />
        </View>
        {filteredCollections.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <MagnifyingGlassMinus
              size={64}
              color="#111"
              style={styles.iconBackground}
            />
            <View style={styles.noResultsTextGroup}>
              <Text size="lg" style={styles.noResultsMainText}>
                {`No results for “${sliceSearchWord(searchedText)}”`}
              </Text>
              <Text size="sm" style={styles.noResultsSubText}>
                Please try again with something else
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView style={styles.scrollList}>
            {filteredCollections.map((filteredCollection, index) => {
              const isLast = index === filteredCollections.length - 1;
              const { name, address, image, chain } = filteredCollection;

              return (
                <View key={`${address}-${index}`}>
                  <View style={styles.collectionRow}>
                    <View style={styles.collectionInfo}>
                      <Image
                        source={{ uri: image ?? Images.Logos.GenericNFT}}
                        style={styles.collectionImage}
                      />
                      <Text size="md" style={styles.collectionName}>
                        {name ? sliceWord(name, 26, 0) : '-'}
                      </Text>
                    </View>
                    <Switch
                      value={!disabledNFTsCollections.includes(address)}
                      onValueChange={(checked) => handleToggleClick(checked, address, chain)}
                      thumbColor={disabledNFTsCollections.includes(address) ? '#666' : '#5df2b7'}
                      trackColor={{ false: '#eee', true: '#d1ffe7' }}
                    />
                  </View>
                  {!isLast && <View style={styles.divider} />}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  modal: {
    padding: 24,
    paddingBottom: 0,
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    gap: 24,
  },
  searchContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  noResultsContainer: {
    flex: 1,
    height: '70%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  iconBackground: {
    backgroundColor: '#edf3f3',
    padding: 20,
    borderRadius: 32,
  },
  noResultsTextGroup: {
    alignItems: 'center',
    gap: 8,
  },
  noResultsMainText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212121',
    fontSize: 18,
    lineHeight: 22,
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollList: {
    width: '100%',
    flex: 1,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  collectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
    minWidth: 0,
  },
  collectionImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  collectionName: {
    fontWeight: 'bold',
    color: '#222',
    flexShrink: 1,
    maxWidth: 170,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#eee',
    marginVertical: 2,
  },
});
