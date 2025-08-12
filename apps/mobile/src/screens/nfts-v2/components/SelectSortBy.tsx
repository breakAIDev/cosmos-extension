import { useDisabledNFTsCollections } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { NftStore } from '@leapwallet/cosmos-wallet-store';
import { Card } from '@leapwallet/leap-ui';
import BottomModal from '../../../components/bottom-modal';
import { CustomCardDivider } from '../../../components/custom-card-divider';
import { useChainInfos } from '../../../hooks/useChainInfos';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { ScrollView, Image, View, StyleSheet } from 'react-native';
import { hiddenNftStore } from '../../../context/manage-nft-store';
import { getChainName } from '../../../utils/getChainName';

type SelectSortByProps = {
  readonly isVisible: boolean;
  readonly onClose: VoidFunction;
  readonly selectedSortsBy: SupportedChain[];
  readonly setSelectedSortsBy: React.Dispatch<React.SetStateAction<SupportedChain[]>>;
  readonly nftStore: NftStore;
};

export const SelectSortBy = observer(
  ({ isVisible, onClose, selectedSortsBy, setSelectedSortsBy, nftStore }: SelectSortByProps) => {
    const disabledNFTsCollections = useDisabledNFTsCollections();
    const sortedCollectionChains = nftStore.getSortedCollectionChains(
      disabledNFTsCollections,
      hiddenNftStore.hiddenNfts,
    );
    const defaultTokenLogo = useDefaultTokenLogo();
    const chainInfos = useChainInfos();

    return (
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        title={'Filter by Chain'}
        closeOnBackdropClick={true}
      >
        <View style={styles.container}>
          <View style={styles.innerContainer}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {sortedCollectionChains.map((chain, index) => {
                const chainInfo = chainInfos[chain as SupportedChain];
                const isSelected = selectedSortsBy.includes(chain);

                return (
                  <React.Fragment key={`${chain}-${index}`}>
                    {index !== 0 && <CustomCardDivider />}
                    <Card
                      iconSrc={isSelected ? Images.Misc.CheckCosmos : undefined}
                      size="sm"
                      title={getChainName(chainInfo.chainName)}
                      style={styles.card}
                      onPress={() =>
                        setSelectedSortsBy((prevValue) => {
                          // toggle logic: remove if exists, add if not
                          if (prevValue.includes(chain)) {
                            return prevValue.filter((prevChain) => prevChain !== chain);
                          } else {
                            return [...prevValue, chain];
                          }
                        })
                      }
                      avatar={
                        <Image
                          source={{ uri: chainInfo.chainSymbolImageUrl ?? defaultTokenLogo}}
                          style={styles.avatar}
                          resizeMode="cover"
                        />
                      }
                    />
                  </React.Fragment>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </BottomModal>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  innerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: 300,
    overflow: 'hidden',
    marginTop: 0,
  },
  scroll: {
    flexGrow: 0,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 0,
  },
  card: {
    backgroundColor: '#fff',
    // For dark mode, override as needed
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
});
