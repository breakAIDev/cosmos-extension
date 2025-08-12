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
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';

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
        ?.sort((a, b) => {
          const nameA = a.name.toUpperCase();
          const nameB = b.name.toUpperCase();
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
      _disabledNFTsCollections = disabledNFTsCollections.filter(
        (collection) => collection !== collectionAddress
      );
    } else {
      if (!disabledNFTsCollections.includes(collectionAddress)) {
        _disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress];
      }
    }
    await setDisabledNFTsCollections(_disabledNFTsCollections);
  };

  return (
    <BottomModal
      style={styles.modal}
      isOpen={isVisible}
      onClose={handleBottomSheetClose}
      title={'Manage Collections'}
    >
      <View style={styles.container}>
        <View style={styles.searchInputWrap}>
          <SearchInput
            value={searchedText}
            onChangeText={setSearchedText}
            placeholder="Search by collection or name"
            onClear={() => setSearchedText('')}
          />
        </View>

        {filteredCollections.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <MagnifyingGlassMinus size={48} color="#18181b" />
            </View>
            <View style={styles.emptyTextWrap}>
              <Text style={styles.noResultText}>
                {`No results for “${sliceSearchWord(searchedText)}”`}
              </Text>
              <Text style={styles.tryAgainText}>
                Please try again with something else
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView style={styles.scrollList}>
            {filteredCollections.map((filteredCollection, index, array) => {
              const isLast = index === array.length - 1;
              const { name, address, image, chain } = filteredCollection;
              const isChecked = !disabledNFTsCollections.includes(address);

              return (
                <React.Fragment key={`${address}-${index}`}>
                  <View style={styles.itemRow}>
                    <View style={styles.rowLeft}>
                      <Image
                        source={{ uri: image ?? Images.Logos.GenericNFT}}
                        style={styles.nftImg}
                        onError={() => {
                          // fallback, if needed
                        }}
                      />
                      <Text style={styles.nftName}>
                        {name ? sliceWord(name, 26, 0) : '-'}
                      </Text>
                    </View>
                    <Switch
                      value={isChecked}
                      onValueChange={(checked) =>
                        handleToggleClick(checked, address, chain)
                      }
                      thumbColor={isChecked ? '#22c55e' : '#a1a1aa'} // accent-green-200
                      trackColor={{ false: '#d1d5db', true: '#bbf7d0' }}
                      style={styles.switch}
                    />
                  </View>
                  {!isLast && <View style={styles.itemDivider} />}
                </React.Fragment>
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
    paddingHorizontal: 24,
    paddingBottom: 0,
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    gap: 20,
    paddingTop: 12,
  },
  searchInputWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyWrap: {
    flex: 1,
    height: 340,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyIcon: {
    backgroundColor: '#e5e7eb',
    padding: 20,
    borderRadius: 48,
    marginBottom: 8,
  },
  emptyTextWrap: {
    alignItems: 'center',
    gap: 6,
  },
  noResultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 2,
  },
  tryAgainText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollList: {
    width: '100%',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  nftImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#d1d5db',
  },
  nftName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    flexShrink: 1,
    maxWidth: 160,
  },
  switch: {
    marginLeft: 10,
  },
  itemDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#f3f4f6',
  },
});
