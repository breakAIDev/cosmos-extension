import {
  ArrowFatLineUp,
  ArrowLeft,
  ArrowsOutSimple,
  ArrowSquareOut,
  Eye,
  EyeSlash,
  Heart,
  Smiley,
  X,
} from 'phosphor-react-native';
import Text from '../../components/text';
import { Button } from '../../components/ui/button';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { Wallet } from '../../hooks/wallet/useWallet';
import { Images } from '../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useState } from 'react';
import { favNftStore } from '../../context/manage-nft-store';
import { normalizeImageSrc } from '../../utils/normalizeImageSrc';
import { sliceWord } from '../../utils/strings';
import { useNftContext } from './context';

import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';
import { Key, useDisabledNFTsCollections, useSetDisabledNFTsInStorage } from '@leapwallet/cosmos-wallet-hooks';

const ITEM_SIZE = Math.min(Dimensions.get('window').width, 400) - 40;

export const NftDetails = observer(() => {
  const [showSelectRecipient, setShowSelectRecipient] = useState(false);
  const { activeWallet, setActiveWallet } = useActiveWallet();
  const [toast, setToast] = useState('');
  const [showImage, setShowImage] = useState(false);
  const { nftDetails, setNftDetails } = useNftContext();

  const disabledNFTsCollections = useDisabledNFTsCollections();
  const setDisabledNFTsCollections = useSetDisabledNFTsInStorage();

  const nftIndex = useMemo(() => {
    return `${nftDetails?.collection.address ?? ''}-:-${nftDetails?.tokenId ?? nftDetails?.domain ?? ''}`;
  }, [nftDetails?.collection.address, nftDetails?.domain, nftDetails?.tokenId]);

  const isInFavNfts = favNftStore.favNfts.includes(nftIndex);

  const isInProfile = useMemo(() => {
    return activeWallet?.avatarIndex === nftIndex;
  }, [activeWallet?.avatarIndex, nftIndex]);

  const isInHiddenNfts = disabledNFTsCollections.includes(nftDetails?.collection.address ?? '');

  const showProfileOption = useMemo(() => {
    return !!nftDetails?.image && !nftDetails.image.includes('mp4') && !nftDetails.media_type?.includes('mp4');
  }, [nftDetails?.image, nftDetails?.media_type]);

  const giveSendOption = false;

  const handleFavNftClick = async () => {
    if (!activeWallet) {
      return;
    }

    if (isInFavNfts) {
      await favNftStore.removeFavNFT(nftIndex, activeWallet.id);
      setToast('Removed from favourites');
    } else {
      await favNftStore.addFavNFT(nftIndex, activeWallet.id);
      setToast('Added to favourites');
    }
  };

  const handleProfileClick = async () => {
    if (activeWallet && showProfileOption) {
      let newWallet: Key = {
        ...activeWallet,
        avatar: normalizeImageSrc(nftDetails?.image ?? '', nftDetails?.collection.address ?? ''),
        avatarIndex: nftIndex,
      };
      if (isInProfile) {
        newWallet = {
          ...activeWallet,
          avatar: undefined,
          avatarIndex: undefined,
        };
      }

      setActiveWallet(newWallet);
      await Wallet.storeWallets({ [newWallet.id]: newWallet });
      setToast('Profile picture updated!');
    }
  };

  const handleToggleClick = async (isEnabled: boolean, collectionAddress: string, chain: string) => {
    let _disabledNFTsCollections: string[] = [];

    if (isEnabled) {
      _disabledNFTsCollections = disabledNFTsCollections.filter((collection) => collection !== collectionAddress);
      setToast('Removed from hidden');
    } else {
      if (!_disabledNFTsCollections.includes(collectionAddress)) {
        _disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress];
      }
      setToast('Added to hidden');
    }

    await setDisabledNFTsCollections(_disabledNFTsCollections);
  };

  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [toast]);

  if (!nftDetails) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Full-screen image modal */}
      <Modal
        visible={showImage}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImage(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.imageModalBackdrop}
          onPress={() => setShowImage(false)}
        >
          <X
            size={28}
            color="#777"
            weight="regular"
            style={styles.imageModalClose}
          />
        </TouchableOpacity>
        <Image
          source={{ uri: nftDetails.image ?? Images.Logos.GenericNFT}}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </Modal>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.imageModalBackdrop}
            onPress={() => setNftDetails(null)}
          >
            <ArrowLeft
              size={28}
              color="#aaa"
              weight="regular"
              style={styles.headerBack}
            />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>
              {sliceWord(nftDetails?.collection.name ?? '', 15, 0)}
            </Text>
            <Text style={styles.headerTitleMuted}>#{sliceWord(nftDetails?.tokenId ?? '', 5, 0)}</Text>
          </View>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.nftImageBlock}>
          <Image
            source={{ uri: nftDetails.image ?? Images.Logos.GenericNFT}}
            style={styles.nftImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.expandIcon} onPress={() => setShowImage(true)}>
            <ArrowsOutSimple size={32} color="#222" weight="regular" />
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.controlBlock}>
            <TouchableOpacity onPress={handleFavNftClick}>
              <Heart
                size={54}
                weight="fill"
                color={isInFavNfts ? "#D0414F" : "#222"}
                style={[styles.controlIcon, isInFavNfts && { backgroundColor: "#ffe6ea" }]}
              />
            </TouchableOpacity>
            <Text size="sm" style={styles.controlLabel}>Favorite</Text>
          </View>
          {giveSendOption && (
            <View style={styles.controlBlock}>
              <TouchableOpacity onPress={() => setShowSelectRecipient(true)}>
                <ArrowFatLineUp size={54} color="#222" weight="fill" style={styles.controlIcon} />
              </TouchableOpacity>
              <Text size="sm" style={styles.controlLabel}>Send</Text>
            </View>
          )}
          <View style={styles.controlBlock}>
            <TouchableOpacity onPress={handleProfileClick}>
              <Smiley
                size={54}
                color={isInProfile ? "#D0414F" : "#222"}
                style={[styles.controlIcon, isInProfile && { backgroundColor: "#ffe6ea" }]}
              />
            </TouchableOpacity>
            <Text size="sm" style={styles.controlLabel}>Avatar</Text>
          </View>
          <View style={styles.controlBlock}>
            {isInHiddenNfts ? (
              <TouchableOpacity onPress={() => {
                if (nftDetails) {
                  handleToggleClick(true, nftDetails.collection.address, nftDetails.chain);
                }
              }}>
                <Eye size={54} color="#222" weight="fill" style={styles.controlIcon} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => {
                if (nftDetails) {
                  handleToggleClick(false, nftDetails.collection.address, nftDetails.chain);
                }
              }}>
                <EyeSlash size={54} color="#222" weight="fill" style={styles.controlIcon} />
              </TouchableOpacity>
            )}
            <Text size="sm" style={styles.controlLabel}>{isInHiddenNfts ? 'Unhide' : 'Hide'}</Text>
          </View>
        </View>

        {/* Marketplace button */}
        <Button
          style={{ width: '100%', marginTop: 16 }}
          onPress={() => {
            if (nftDetails?.tokenUri) {
              Linking.openURL(
                normalizeImageSrc(nftDetails.tokenUri, nftDetails.collection?.address ?? '')
              );
            }
          }}
          disabled={!nftDetails?.tokenUri}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ArrowSquareOut size={20} color="#222" />
            <Text size="md" style={{ fontWeight: 'bold', color: '#222' }}>
              View on marketplace
            </Text>
          </View>
        </Button>

        {/* Description and attributes */}
        {(nftDetails?.description || (nftDetails?.attributes && nftDetails.attributes.length > 0)) && (
          <View style={{ marginTop: 20, gap: 16 }}>
            {nftDetails?.description && (
              <View style={{ gap: 6 }}>
                <Text size="sm" style={{ fontWeight: '600', color: '#888' }}>Description</Text>
                <Text size="sm" style={{ color: '#222' }}>{nftDetails?.description}</Text>
              </View>
            )}
            {nftDetails?.attributes && nftDetails.attributes.some(item => !!item.trait_type || !!item.value) && (
              <>
                <View style={{ height: 1, width: '100%', backgroundColor: '#eee', marginVertical: 10 }} />
                <View>
                  <Text size="sm" style={{ fontWeight: '600', color: '#888' }}>Features</Text>
                  <View style={styles.attributeWrap}>
                    {nftDetails?.attributes?.map((attribute, idx) => {
                      if (!attribute.trait_type || !attribute.value) return null;
                      return (
                        <View
                          key={attribute.trait_type + idx}
                          style={styles.attributeBox}
                        >
                          <Text size="sm" style={{ color: '#888' }}>{attribute.trait_type}</Text>
                          <Text size="sm" style={{ fontWeight: 'bold', color: '#222' }}>
                            {attribute.value}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Toast */}
        {!!toast && (
          <View style={styles.toastContainer}>
            <Text size="sm" style={{ fontWeight: '500', color: '#fff', flex: 1 }}>{toast}</Text>
            <TouchableOpacity onPress={() => setToast('')}>
              <X size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerBack: {
    alignSelf: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    marginRight: 4,
  },
  headerTitleMuted: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#999',
  },
  nftImageBlock: {
    alignItems: 'center',
    marginVertical: 6,
    justifyContent: 'center',
    position: 'relative',
  },
  nftImage: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
  },
  expandIcon: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 2 },
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 10,
  },
  controlBlock: {
    alignItems: 'center',
    gap: 8,
  },
  controlIcon: {
    backgroundColor: '#edf3f3',
    borderRadius: 50,
    padding: 12,
  },
  controlLabel: {
    fontWeight: '500',
    color: '#222',
    marginTop: 2,
  },
  attributeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  attributeBox: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#fafbfc',
    maxWidth: 140,
    alignItems: 'flex-start',
    gap: 2,
  },
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: '#222c',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageModalClose: {
    position: 'absolute',
    top: 24,
    right: 28,
    zIndex: 10,
  },
  fullImage: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginTop: 20,
    alignSelf: 'center',
  },
});

export default NftDetails;
