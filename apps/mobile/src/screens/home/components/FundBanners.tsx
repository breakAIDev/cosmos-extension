import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useActiveWallet, useChainInfo, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks';
import { type Icon, ShoppingBag, Wallet, ArrowsLeftRight } from 'phosphor-react-native';
import { useHardCodedActions } from '../../../components/search-modal';
import Text from '../../../components/text';
import { ButtonName, ButtonType, EventName, PageName } from '../../../services/config/analytics';
import { AGGREGATED_CHAIN_KEY, LEAPBOARD_URL } from '../../../services/config/constants';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { useAddress } from '../../../hooks/wallet/useAddress';
import mixpanel from '../../../mixpanel';
import { AggregatedSupportedChain } from '../../../types/utility';
import { UserClipboard } from '../../../utils/clipboard';
import { trim } from '../../../utils/strings';

import FundsSheet from './FundSheet';

export type FundBannerData = {
  icon: Icon;
  title: string;
  content: string;
  textColor: string;
  onClick: () => void;
  hide?: boolean;
};

const FundBanners = React.memo(() => {
  const address = useAddress();
  const activeWallet = useActiveWallet();
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const { data: featureFlags } = useFeatureFlags();
  const chain = useChainInfo();
  const { handleSwapClick, handleBuyClick } = useHardCodedActions();
  const [showCopyAddress, setShowCopyAddress] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const token = chain?.denom?.toUpperCase();
  const isAggregatedView = useMemo(() => activeChain === AGGREGATED_CHAIN_KEY, [activeChain]);
  const swapPath = `/swap?sourceChainId=${
    chain?.chainId === 'cosmoshub-4' ? 'osmosis-1' : 'cosmoshub-4'
  }&destinationChainId=${chain?.chainId}&pageSource=${PageName.ZeroState}`;
  const chainId = isAggregatedView ? 'all' : chain?.chainId ?? '';
  const chainName = isAggregatedView ? 'All Chains' : chain?.chainName ?? '';

  useEffect(() => {
    if (showCopyAddress) {
      const timer = setTimeout(() => setShowCopyAddress(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopyAddress]);

  const transactUrl = useCallback(
    (type: 'swap' | 'bridge') => {
      if (type === 'swap') {
        return `${LEAPBOARD_URL}/transact/${type}${isAggregatedView ? '' : `?destinationChainId=${chain?.chainId}`}`;
      }
      if (type === 'bridge') {
        return `https://swapfast.app/bridge${isAggregatedView ? '' : `?destinationChainId=${chain?.chainId}`}`;
      }
    },
    [chain?.chainId, isAggregatedView],
  );

  const trackCTAEvent = useCallback(
    (buttonName: string, redirectURL?: string) => {
      try {
        mixpanel.track(EventName.ButtonClick, {
          buttonType: ButtonType.ADD_FUNDS,
          buttonName,
          redirectURL,
          time: Date.now() / 1000,
          chainId,
          chainName,
        });
      } catch (e) {
        // You may want to use a native crash logger here
      }
    },
    [chainId, chainName],
  );

  const bannerData: FundBannerData[] = useMemo(
    () =>
      [
        {
          icon: Wallet,
          title: 'Receive / Deposit',
          content: isAggregatedView
            ? 'Copy wallet address to deposit Cosmos tokens'
            : `Copy your wallet address to deposit ${token}`,
          textColor: '#FFC770',
          onClick: () => {
            if (isAggregatedView) return;
            if (!activeWallet) return;
            UserClipboard.copyText(address);
            setShowCopyAddress(true);
            trackCTAEvent(ButtonName.RECEIVE_ASSETS);
          },
        },
        {
          icon: ArrowsLeftRight,
          title: 'Swap from Cosmos tokens',
          content: `Swap into ${token} from 300+ other tokens`,
          textColor: '#70B7FF',
          onClick: () => {
            handleSwapClick(transactUrl('swap'), swapPath);
            trackCTAEvent(
              ButtonName.IBC_SWAP,
              featureFlags?.all_chains?.swap === 'redirect' ? transactUrl('swap') : swapPath,
            );
          },
          hide: isAggregatedView,
        },
        {
          icon: ShoppingBag,
          title: 'On-ramp from fiat',
          content: `Buy ${isAggregatedView ? 'Cosmos tokens' : token} using USD, EUR, GBP & others`,
          textColor: '#F47CCE',
          onClick: () => {
            handleBuyClick();
            trackCTAEvent(ButtonName.BUY, '/buy');
          },
        },
        {
          icon: ShoppingBag,
          title: 'Bridge from EVMs, Solana',
          content: 'Swap & bridge tokens from other ecosystems',
          textColor: '#3ACF92',
          onClick: () => {
            // In RN, use Linking.openURL (import { Linking } from 'react-native')
            // Linking.openURL(transactUrl('bridge'));
            trackCTAEvent(ButtonName.BRIDGE, transactUrl('bridge'));
          },
        },
      ].filter((d) => !d?.hide),
    [activeWallet, address, trackCTAEvent, transactUrl, isAggregatedView, token, featureFlags, swapPath, handleBuyClick, handleSwapClick],
  );

  const modalTitle = isAggregatedView ? 'Get started' : `Get started on ${trim(chain?.chainName, 14)}`;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.iconsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {bannerData.map((d: FundBannerData, index: number) => (
            <View key={index} style={styles.iconWrapper}>
              <d.icon size={20} color={d.textColor} />
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.heading}>Nothing here, yet...</Text>
      <Text size="xs" color="text-gray-600" style={styles.subheading}>
        The interchain is more fun with some tokens!{'\n'}
        Use Leap's in-wallet options to get started.
      </Text>
      <FundsSheet
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bannerData={bannerData}
        showCopyAddress={showCopyAddress}
        modalTitle={modalTitle}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    width: 352,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    backgroundColor: '#f9fafb',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
    borderWidth: 1,
    borderColor: '#f1f1f1',
  },
  startButton: {
    backgroundColor: '#f1f1f1',
    borderRadius: 32,
    paddingVertical: 6,
    paddingHorizontal: 24,
    marginLeft: 16,
  },
  startButtonText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 15,
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 18,
    color: '#222',
  },
  subheading: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
});

FundBanners.displayName = 'FundBanners';
export { FundBanners };
