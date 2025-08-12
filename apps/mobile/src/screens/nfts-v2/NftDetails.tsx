import {
  FractionalizedNftInformation,
  Key,
  NftPage,
  useFractionalizedNftContracts,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui';
import { UploadSimple } from 'phosphor-react-native';
import { AlertStrip } from '../../components/alert-strip';
import PopupLayout from '../../components/layout/popup-layout';
import { useChainPageInfo } from '../../hooks';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { useChainInfos } from '../../hooks/useChainInfos';
import { Wallet } from '../../hooks/wallet/useWallet';
import { Images } from '../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, ScrollView } from 'react-native';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { favNftStore, hiddenNftStore } from '../../context/manage-nft-store';
import { rootBalanceStore } from '../../context/root-store';
import { Colors } from '../../theme/colors';
import { getChainName } from '../../utils/getChainName';
import { normalizeImageSrc } from '../../utils/normalizeImageSrc';
import { sessionGetItem, sessionRemoveItem } from '../../utils/sessionStorage';

import {
  Chip,
  FractionalizedNftDescription,
  NftCardCarousel,
  NftDetailsMenu,
  NonFractionalizedNftDescription,
} from './components';
import { SendNftCard } from './components/send-nft';
import { useNftContext } from './context';

export const NftDetails = observer(() => {
  const chainInfos = useChainInfos();
  const fractionalizedNftContracts = useFractionalizedNftContracts();

  const { topChainColor } = useChainPageInfo();
  const { activeWallet, setActiveWallet } = useActiveWallet();
  const [alertMsg, setAlertMsg] = useState({ body: '', status: '' });

  const [showMenu, setShowMenu] = useState(false);
  const [coverImage, setCoverImage] = useState(true);
  const { setActivePage, nftDetails, setNftDetails } = useNftContext();
  const [showSendNFT, setShowSendNFT] = useState(false);

  const giveSendOption = useMemo(() => {
    return ['mainCoreum', 'coreum'].includes(nftDetails?.chain ?? '');
  }, [nftDetails?.chain]);

  const isFractionalizedNft = useMemo(() => {
    return fractionalizedNftContracts.includes(nftDetails?.collection.address ?? '');
  }, [fractionalizedNftContracts, nftDetails?.collection.address]);

  const nftImages = useMemo(() => {
    if (isFractionalizedNft) {
      const _nftDetails = nftDetails as unknown as FractionalizedNftInformation;
      if (_nftDetails?.Images && _nftDetails.Images.length > 0) {
        return _nftDetails.Images.map((image) => normalizeImageSrc(image, nftDetails?.collection.address ?? ''));
      }
    }
    return [normalizeImageSrc(nftDetails?.image ?? '', nftDetails?.collection.address ?? '')];
  }, [isFractionalizedNft, nftDetails]);

  const nftIndex = useMemo(() => {
    return `${nftDetails?.collection.address ?? ''}-:-${nftDetails?.tokenId ?? nftDetails?.domain ?? ''}`;
  }, [nftDetails?.collection.address, nftDetails?.domain, nftDetails?.tokenId]);

  const isInFavNfts = favNftStore.favNfts.includes(nftIndex);

  const isInProfile = useMemo(() => {
    return activeWallet?.avatarIndex === nftIndex;
  }, [activeWallet?.avatarIndex, nftIndex]);

  const isInHiddenNfts = hiddenNftStore.hiddenNfts.includes(nftIndex);

  const showProfileOption = useMemo(() => {
    return !!nftDetails?.image && !nftDetails.image.includes('mp4') && !nftDetails.media_type?.includes('mp4');
  }, [nftDetails?.image, nftDetails?.media_type]);

  const handleFavNftClick = async () => {
    if (!activeWallet) {
      return;
    }

    if (isInFavNfts) {
      await favNftStore.removeFavNFT(nftIndex, activeWallet.id);
      setAlertMsg({ status: 'remove', body: 'Removed from favourites' });
    } else {
      await favNftStore.addFavNFT(nftIndex, activeWallet.id);
      setAlertMsg({ status: 'add', body: 'Added to favourites' });
    }
  };

  const handleProfileClick = async () => {
    if (activeWallet) {
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
      // React Native: replace with your navigation logic
      // navigation.navigate('Home', { walletAvatarChanged: true });
    }
  };

  const handleHideNftClick = async () => {
    if (!activeWallet) return;

    if (isInHiddenNfts) {
      await hiddenNftStore.removeHiddenNFT(nftIndex, activeWallet.id);
      setAlertMsg({ status: 'remove', body: 'Removed from hidden' });
    } else {
      await hiddenNftStore.addHiddenNFT(nftIndex, activeWallet.id);
      setAlertMsg({ status: 'add', body: 'Added to hidden' });
    }
  };

  // --- Render
  return (
    <View style={styles.root}>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => {
                if (showSendNFT) {
                  setShowSendNFT(false);
                } else {
                  const lastActivePage = sessionGetItem('nftLastActivePage') ?? 'ShowNfts';
                  setActivePage(lastActivePage as NftPage);
                  sessionRemoveItem('nftLastActivePage');
                  setNftDetails(null);
                }
              },
              type: HeaderActionType.BACK,
            }}
            title={
              <View style={styles.headerRow}>
                <Text
                  numberOfLines={1}
                  style={styles.headerTitle}
                >
                  {showSendNFT ? 'Send' : nftDetails?.name ?? ''}
                </Text>
              </View>
            }
          />
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {alertMsg.body.length > 0 && (
            <View>
              <AlertStrip
                message={alertMsg.body}
                bgColor={alertMsg.status === 'add' ? Colors.green600 : Colors.red300}
                alwaysShow={false}
                onHide={() => setAlertMsg({ body: '', status: '' })}
                style={styles.alertWrap}
                timeOut={1000}
              />
            </View>
          )}

          <NftCardCarousel
            chain={(nftDetails?.chain ?? '') as SupportedChain}
            mediaType={nftDetails?.media_type}
            textNft={{
              name: nftDetails?.domain ?? '',
              description:
                nftDetails?.extension?.description ?? `${nftDetails?.collection?.name ?? ''} - ${nftDetails?.name}`,
            }}
            style={{
              height: 200,
              width: '100%',
              resizeMode: coverImage ? 'cover' : 'contain',
              alignSelf: 'center',
            }}
            handleExpandClick={() => setCoverImage(!coverImage)}
            showExpand={true}
            images={nftImages}
          />

          <View style={styles.nftHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.nftTitle]}
                numberOfLines={1}
              >
                {nftDetails?.name ?? ''}
              </Text>
              {nftDetails?.tokenId && (
                <Text
                  style={[styles.nftSub]}
                  numberOfLines={1}
                >
                  #{nftDetails.tokenId}
                </Text>
              )}
            </View>
            {nftDetails?.chain && (
              <Chip style={styles.chip}>
                <Chip.Image
                  style={{ width: 24, height: 24, marginRight: 6 }}
                  src={chainInfos[nftDetails.chain].chainSymbolImageUrl}
                />
                <Chip.Text
                  style={styles.chipText}
                >
                  {getChainName(chainInfos[nftDetails.chain].chainName)}
                </Chip.Text>
              </Chip>
            )}
          </View>

          <CardDivider />

          {!!showSendNFT && giveSendOption && nftDetails && (
            <SendNftCard
              rootDenomsStore={rootDenomsStore}
              nftDetails={nftDetails}
              rootBalanceStore={rootBalanceStore}
              forceNetwork="mainnet"
            />
          )}

          {!showSendNFT && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.marketButton,
                  { opacity: nftDetails?.tokenUri ? 1 : 0.5, backgroundColor: '#f3f4f6' },
                ]}
                onPress={() => {
                  if (nftDetails?.tokenUri) {
                    Linking.openURL(normalizeImageSrc(nftDetails?.tokenUri ?? '', nftDetails?.collection?.address ?? ''));
                  }
                }}
                disabled={!nftDetails?.tokenUri}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image source={{uri: Images.Misc.OpenLink}} style={{ width: 18, height: 18, marginRight: 8, tintColor: '#333' }} />
                  <Text style={{ fontWeight: '500', fontSize: 16 }}>View</Text>
                </View>
                <Text style={{ marginLeft: 4 }}>
                  {isFractionalizedNft ? 'details' : 'on marketplace'}
                </Text>
              </TouchableOpacity>

              {giveSendOption && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowSendNFT(true)}
                >
                  <UploadSimple size={18} weight="bold" color="#111" />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.iconButton} onPress={handleFavNftClick}>
                <Image
                  source={{uri: isInFavNfts ? Images.Misc.FilledFavStar : Images.Misc.OutlinedFavStar}}
                  style={{ width: 20, height: 20, tintColor: isInFavNfts ? '#F59E42' : '#aaa' }}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={() => setShowMenu(!showMenu)}>
                <Image source={{uri: Images.Misc.VerticalDots}} style={{ width: 20, height: 20, tintColor: '#888' }} />
              </TouchableOpacity>
            </View>
          )}

          {!showSendNFT && (
            <>
              <CardDivider />
              {showMenu && (
                <NftDetailsMenu
                  handleProfileClick={handleProfileClick}
                  isInProfile={isInProfile}
                  showProfileOption={showProfileOption}
                  handleHideNftClick={handleHideNftClick}
                  isInHiddenNfts={isInHiddenNfts}
                />
              )}

              {nftDetails && (
                <>
                  {isFractionalizedNft ? (
                    <FractionalizedNftDescription nftDetails={nftDetails} color={topChainColor} />
                  ) : (
                    <NonFractionalizedNftDescription nftDetails={nftDetails} color={topChainColor} />
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      </PopupLayout>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 200,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    maxWidth: 150,
  },
  alertWrap: {
    position: 'absolute',
    top: 10,
    left: 40,
    zIndex: 10,
    width: 320,
    padding: 8,
    borderRadius: 16,
  },
  nftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    justifyContent: 'space-between',
  },
  nftTitle: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 20,
    maxWidth: 200,
    marginBottom: 2,
  },
  nftSub: {
    color: '#a1a1aa',
    fontSize: 15,
    marginTop: 2,
    maxWidth: 180,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  chipText: {
    color: '#18181b',
    fontSize: 14,
    maxWidth: 90,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    justifyContent: 'space-between',
  },
  marketButton: {
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 10,
    backgroundColor: '#f3f4f6',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
});
