import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CheckCircle, DotsThreeVertical, Star, TrashSimple } from 'phosphor-react-native';
import { captureException } from '@sentry/react-native';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { EventName } from '../../../services/config/analytics';
import { AGGREGATED_CHAIN_KEY } from '../../../services/config/constants';
import useActiveWallet from '../../../hooks/settings/useActiveWallet';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../assets/images';
import mixpanel from '../../../mixpanel';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { importWatchWalletSeedPopupStore } from '../../../context/import-watch-wallet-seed-popup-store';
import { starredChainsStore } from '../../../context/starred-chains-store';
import { Colors } from '../../../theme/colors';
import { getChainName } from '../../../utils/getChainName';

type Chain = SupportedChain | typeof AGGREGATED_CHAIN_KEY;

type ChainCardProps = {
  img: string;
  handleClick: (chainName: Chain, beta?: boolean) => void;
  handleDeleteClick?: (chainKey: SupportedChain) => void;
  beta?: boolean;
  onPage?: 'AddCollection';
  formattedChainName: string;
  chainName: Chain;
  selectedChain: Chain;
  showNewTag?: boolean;
  showStars?: boolean;
};

const ChainCardView = ({
  img,
  handleClick,
  handleDeleteClick,
  beta,
  formattedChainName,
  chainName,
  selectedChain,
  onPage,
  showNewTag,
  showStars,
}: ChainCardProps) => {
  const { activeWallet } = useActiveWallet();
  const defaultTokenLogo = useDefaultTokenLogo();
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);

  const isStarred = starredChainsStore.chains.includes(chainName);

  const isWatchWalletNotAvailableChain =
    chainName !== 'aggregated' && activeWallet?.watchWallet && !activeWallet?.addresses[chainName];

  const trackCTAEvent = (eventName: EventName) => {
    try {
      mixpanel.track(eventName, {
        chainSelected: formattedChainName,
        time: Date.now() / 1000,
      });
    } catch (e) {
      captureException(e);
    }
  };

  const onStarToggle = (e: any) => {
    e.stopPropagation && e.stopPropagation();
    if (isStarred) {
      starredChainsStore.removeStarredChain(chainName);
      trackCTAEvent(EventName.ChainUnfavorited);
    } else {
      starredChainsStore.addStarredChain(chainName);
      trackCTAEvent(EventName.ChainFavorited);
    }
  };

  const handleToggleDelete = (e: any) => {
    e.stopPropagation && e.stopPropagation();
    setShowDeleteBtn((prev) => !prev);
  };

  const deleteChain = (e: any) => {
    if (handleDeleteClick && chainName !== 'aggregated') {
      e.stopPropagation && e.stopPropagation();
      handleDeleteClick(chainName);
      setShowDeleteBtn(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.8}
      onPress={() => {
        if (isWatchWalletNotAvailableChain) {
          importWatchWalletSeedPopupStore.setShowPopup(true);
        } else {
          handleClick(chainName, beta);
        }
      }}
    >
      <View style={styles.contentRow}>
        {showStars ? (
          <TouchableOpacity onPress={onStarToggle}>
            {isStarred ? (
              <Star size={20} weight="fill" color="#FFD600" />
            ) : (
              <Star size={20} color={Colors.orange600} />
            )}
          </TouchableOpacity>
        ) : null}
        <Image
          source={{ uri: img ?? defaultTokenLogo }}
          style={[
            styles.chainLogo,
            isWatchWalletNotAvailableChain ? { opacity: 0.4 } : {},
          ]}
          defaultSource={{ uri: defaultTokenLogo }}
        />
        <Text
          style={[
            styles.chainName,
            isWatchWalletNotAvailableChain ? { color: Colors.orange600 } : { color: Colors.junoPrimary },
          ]}
        >
          {onPage === 'AddCollection' ? getChainName(formattedChainName) : formattedChainName}
        </Text>
        {(beta !== false || showNewTag) && (
          <View
            style={[
              styles.tag,
              (!activeWallet?.watchWallet || showNewTag)
                ? styles.tagGreen
                : styles.tagGray,
            ]}
          >
            <Text
              style={[
                styles.tagText,
                (!activeWallet?.watchWallet || showNewTag)
                  ? { color: Colors.green500 }
                  : { color: '#888' },
              ]}
            >
              {showNewTag ? 'New' : 'Custom'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.iconsRow}>
        {selectedChain === chainName ? (
          <CheckCircle size={24} weight="fill" color={Colors.green500} style={{ marginLeft: 8 }} />
        ) : null}
        {beta ? (
          <TouchableOpacity onPress={handleToggleDelete}>
            <DotsThreeVertical size={20} color="#BDBDBD" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : null}
        {isWatchWalletNotAvailableChain ? (
          <Image source={{uri: Images.Misc.SyncDisabled}} style={styles.syncDisabled} />
        ) : null}
      </View>

      {showDeleteBtn && (
        <TouchableOpacity style={styles.deleteBtn} onPress={deleteChain}>
          <TrashSimple size={16} weight="fill" color={Colors.black100} style={{ marginRight: 6 }} />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 6,
    position: 'relative',
    minHeight: 56,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chainLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 4,
    backgroundColor: '#e0e0e0',
  },
  chainName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginLeft: 8,
  },
  tagGreen: {
    backgroundColor: '#e6f9ef',
  },
  tagGray: {
    backgroundColor: '#e0e0e0',
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  syncDisabled: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  deleteBtn: {
    position: 'absolute',
    right: 16,
    bottom: -34,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    width: 120,
    height: 42,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
});

export const ChainCard = observer(ChainCardView);
