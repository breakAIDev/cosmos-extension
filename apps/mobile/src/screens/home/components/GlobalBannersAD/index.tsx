import {
  NumiaBannerAttribute,
  NumiaTrackAction,
  postNumiaEvent,
  useActiveWallet,
  useAddress,
  useBannerConfig,
  useChainInfo,
  useCustomChains,
  useGetBannerData,
  useGetNumiaBanner,
} from '@leapwallet/cosmos-wallet-hooks';
import { bech32ToEthAddress, ChainInfo } from '@leapwallet/cosmos-wallet-sdk';
import { captureException } from '@sentry/react-native';
import { EventName } from '../../../../services/config/analytics';
import { AGGREGATED_CHAIN_KEY } from '../../../../services/config/constants';
import { DISABLE_BANNER_ADS } from '../../../../services/config/storage-keys';
import { useActiveChain, useSetActiveChain } from '../../../../hooks/settings/useActiveChain';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { useQueryParams } from '../../../../hooks/useQuery';
import { observer } from 'mobx-react-lite';
import AddFromChainStore from '../../../home/AddFromChainStore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AggregatedSupportedChain } from '../../../../types/utility';
import { uiErrorTags } from '../../../../utils/sentry';
import { mixpanelTrack } from '../../../../utils/tracking';
import { tryCatch, tryCatchSync } from '../../../../utils/try-catch';

import { BannersLoading } from '../home-loading-state';
import { BannerAdCard } from './ad-card';
import { BannerControls } from './controls';
import { useCarousel } from './use-carousel';
import {
  getDisplayAds,
  getMixpanelBannerId,
  getMixpanelPositionId,
  MIXPANEL_BANNER_VIEWS_INFO,
  NUMIA_IMPRESSION_INFO,
} from './utils';

import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GlobalBannersAD = React.memo(({ show = true }: { show?: boolean }) => {
  const chain = useChainInfo();
  const chainInfos = useChainInfos();
  const customChains = useCustomChains();
  const setActiveChain = useSetActiveChain();
  const walletAddress = useAddress();
  const activeWallet = useActiveWallet();
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const query = useQueryParams();
  const [newChain, setNewChain] = useState<string | null>(null);
  const [disabledBannerAds, setDisableBannerAds] = useState(new Set<string>());

  const osmoWalletAddress = activeWallet?.addresses?.osmosis;
  const cosmosWalletAddress = activeWallet?.addresses?.cosmos;
  const seiWalletAddress = activeWallet?.addresses?.seiTestnet2;
  const ethWalletAddress = bech32ToEthAddress(activeWallet?.addresses?.ethereum ?? '');

  const isAggregatedView = activeChain === AGGREGATED_CHAIN_KEY;
  const chainId = isAggregatedView ? 'all' : chain?.chainId ?? '';
  const chainName = isAggregatedView ? 'All Chains' : chain?.chainName ?? '';

  const { data: bannerConfig, status: bannerConfigStatus } = useBannerConfig();
  const { leapBanners, isLeapBannersLoading } = useGetBannerData(chain?.chainId);

  const { data: numiaBanners, status: numiaStatus } = useGetNumiaBanner(
    [osmoWalletAddress ?? '', ethWalletAddress ?? ''],
    bannerConfig?.extension['position-ids'] ?? [],
    bannerConfigStatus,
  );

  const bannerAds = useMemo(() => {
    if (numiaStatus === 'loading' || isLeapBannersLoading) {
      return [];
    }

    return [...(numiaBanners ?? []), ...(leapBanners ?? [])].filter(
      (banner) => banner?.visibleOn === 'ALL' || banner?.visibleOn === 'EXTENSION',
    );
  }, [isLeapBannersLoading, leapBanners, numiaBanners, numiaStatus]);

  const displayADs = useMemo(() => {
    return getDisplayAds(bannerAds, Array.from(disabledBannerAds));
  }, [bannerAds, disabledBannerAds]);

  const {
    activeBannerIndex,
  } = useCarousel(displayADs.length, bannerConfig?.extension?.['auto-scroll-duration']);

  const activeBannerData = displayADs[activeBannerIndex];
  const activeBannerId = activeBannerData?.id;

  useEffect(() => {
    if (!activeBannerId || isNaN(activeBannerIndex)) return;

    if (activeBannerData?.id !== activeBannerId) return;

    const storedMixpanelBannerViewsInfo = sessionStorage.getItem(MIXPANEL_BANNER_VIEWS_INFO);
    const [mixpanelBannerViewsInfo] = tryCatchSync(() => JSON.parse(storedMixpanelBannerViewsInfo ?? '{}'));

    if (!mixpanelBannerViewsInfo) {
      return;
    }

    if (!mixpanelBannerViewsInfo[walletAddress]?.includes(activeBannerId)) {
      mixpanelTrack(EventName.BannerView, {
        bannerId: getMixpanelBannerId(activeBannerId, activeBannerData.attributes?.campaign_id),
        bannerIndex: activeBannerIndex,
        chainId,
        chainName,
        positionId: getMixpanelPositionId(activeBannerId, activeBannerData),
        time: Date.now() / 1000,
        walletAddress,
      });

      sessionStorage.setItem(
        MIXPANEL_BANNER_VIEWS_INFO,
        JSON.stringify({
          ...mixpanelBannerViewsInfo,
          [walletAddress]: [...(mixpanelBannerViewsInfo[walletAddress] ?? []), activeBannerId],
        }),
      );

      return;
    }

    if (activeBannerId.includes('numia')) {
      const storedNumiaImpressionInfo = sessionStorage.getItem(NUMIA_IMPRESSION_INFO);
      const [numiaImpressionInfo] = tryCatchSync(() => JSON.parse(storedNumiaImpressionInfo ?? '{}'));

      if (!numiaImpressionInfo) {
        return;
      }

      if (!numiaImpressionInfo[walletAddress]?.includes(activeBannerId)) {
        sessionStorage.setItem(
          NUMIA_IMPRESSION_INFO,
          JSON.stringify({
            ...numiaImpressionInfo,
            [walletAddress]: [...(numiaImpressionInfo[walletAddress] ?? []), activeBannerId],
          }),
        );

        if (activeBannerData && activeBannerData.attributes && osmoWalletAddress) {
          tryCatch(postNumiaEvent(osmoWalletAddress, NumiaTrackAction.VIEWED, activeBannerData.attributes));
        }
      }
    }
  }, [
    walletAddress,
    activeBannerId,
    activeBannerData,
    activeBannerIndex,
    cosmosWalletAddress,
    osmoWalletAddress,
    chainId,
    chainName,
  ]);

  const handleAddChainClick = useCallback(
    (chain: string) => {
      const item = customChains.find((customChain) => customChain.chainRegistryPath === chain);
      let chainKey;
      for (const [key, chainInfo] of Object.entries(chainInfos)) {
        if (chainInfo.chainRegistryPath === item?.chainRegistryPath || chainInfo.key === item?.chainRegistryPath) {
          chainKey = key;
          break;
        }
      }
      if (chainKey) {
        setActiveChain(chainKey as AggregatedSupportedChain, item);
      } else if (item) {
        setNewChain(item.chainName);
      } else {
        captureException(`${chain} chain not found when clicked on banners`, {
          tags: uiErrorTags,
        });
      }
    },
    [chainInfos, customChains, setActiveChain],
  );

  const handleSwitchChainClick = useCallback(
    (chainRegistryPath: string) => {
      let chainKey;
      for (const [key, chainInfo] of Object.entries(chainInfos)) {
        if (chainInfo.chainRegistryPath === chainRegistryPath || chainInfo.key === chainRegistryPath) {
          chainKey = key;
          break;
        }
      }
      if (chainKey) {
        setActiveChain(chainKey as AggregatedSupportedChain);
      } else {
        captureException(`${chainRegistryPath} chain not found when clicked on banners`, {
          tags: uiErrorTags,
        });
      }
    },
    [chainInfos, setActiveChain],
  );

  const handleBannerClose = useCallback(
    async (bannerId: string, bannerIndex: number) => {
      const newDisabledBannerAds = new Set(disabledBannerAds);
      newDisabledBannerAds.add(bannerId);

      const storedDisabledBannerAds = await getStoredJSON(DISABLE_BANNER_ADS);
      const addressToUse = seiWalletAddress;
      const [parsedDisabledAds] = tryCatchSync(() => JSON.parse(storedDisabledBannerAds[DISABLE_BANNER_ADS] ?? '{}'));

      await setStoredJSON(DISABLE_BANNER_ADS, JSON.stringify({
          ...parsedDisabledAds,
          [addressToUse ?? '']: Array.from(newDisabledBannerAds),
        }));

      const banner = bannerAds.find((_banner) => _banner.id === bannerId);
      mixpanelTrack(EventName.BannerClose, {
        bannerId: getMixpanelBannerId(bannerId, banner?.attributes?.campaign_id),
        bannerIndex,
        chainId,
        chainName,
        positionId: getMixpanelPositionId(bannerId, banner),
        time: Date.now() / 1000,
        walletAddress,
      });

      setDisableBannerAds(newDisabledBannerAds);
    },
    [disabledBannerAds, seiWalletAddress, bannerAds, chainId, chainName, walletAddress],
  );

  const handleBannerClick = useCallback(
    (bannerId: string, bannerIndex: number) => {
      const banner = bannerAds.find((_banner) => _banner.id === bannerId);
      if (!banner) {
        return;
      }

      mixpanelTrack(EventName.BannerClick, {
        bannerId: getMixpanelBannerId(bannerId, banner?.attributes?.campaign_id),
        bannerIndex,
        chainId,
        chainName,
        positionId: getMixpanelPositionId(bannerId, banner),
        time: Date.now() / 1000,
        walletAddress,
      });

      if (banner.id.includes('numia') && banner && osmoWalletAddress) {
        tryCatch(
          postNumiaEvent(osmoWalletAddress, NumiaTrackAction.CLICKED, banner.attributes as NumiaBannerAttribute),
        );

        return;
      }

      if (banner.id.trim().toLowerCase().includes('nbtc-banner')) {
        query.set('btcDeposit', 'true');
        return;
      }

      if (banner.banner_type === 'redirect-interanlly') {
        const bannerId = getMixpanelBannerId(banner?.id, banner?.attributes?.campaign_id);
       Linking.openURL(
          banner.redirect_url.includes('?')
            ? `${banner.redirect_url}&bannerId=${bannerId}`
            : `${banner.redirect_url}?bannerId=${bannerId}`,
        );

        return;
      }

      if (banner.banner_type === 'add-chain') {
        handleAddChainClick(banner.redirect_url);
        return;
      }

      if (banner.banner_type === 'switch-chain') {
        handleSwitchChainClick(banner.redirect_url);
        return;
      }

      if (banner?.redirect_url && banner?.redirect_url !== '#') {
        Linking.openURL(banner.redirect_url)
      }

      return;
    },
    [bannerAds, chainId, chainName, handleAddChainClick, handleSwitchChainClick, osmoWalletAddress, query, walletAddress],
  );

  useEffect(() => {
    const fn = async () => {
      const disabledBannerAds = await getStoredJSON(DISABLE_BANNER_ADS);
      const parsedDisabledAds = JSON.parse(disabledBannerAds[DISABLE_BANNER_ADS] ?? '{}');
      const addressToUse = seiWalletAddress;

      setDisableBannerAds(new Set(parsedDisabledAds[addressToUse ?? ''] ?? []));
    };

    // eslint-disable-next-line no-console
    fn().catch(console.error);
  }, [cosmosWalletAddress, seiWalletAddress]);

  if (displayADs.length === 0 && (numiaStatus === 'loading' || isLeapBannersLoading)) {
    return <BannersLoading />;
  }
  // For scroll, use a ref:
  const scrollableContainerRef = useRef<ScrollView>(null);

  // Instead of sessionStorage, use AsyncStorage:
  const getStoredJSON = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : {};
    } catch {
      return {};
    }
  };
  const setStoredJSON = async (key: string, obj: any) => {
    await AsyncStorage.setItem(key, JSON.stringify(obj));
  };

  // handle scroll: ScrollView's onMomentumScrollEnd/onScroll
  const handleScroll = (event: any) => {
    // your handle scroll logic...
  };

  if (displayADs.length === 0 && (numiaStatus === 'loading' || isLeapBannersLoading)) {
    return <BannersLoading />;
  }

  return (
    <GlobalBannersWrapper items={displayADs.length} show={show}>
      {displayADs.length > 0 ? (
        <View style={styles.inner}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={scrollableContainerRef}
            style={styles.carousel}
            onMomentumScrollEnd={handleScroll}
            // no onMouseEnter/onMouseLeave on native
          >
            {displayADs.map((bannerData, index) => (
              <BannerAdCard
                key={bannerData.id}
                index={index}
                bannerData={bannerData}
                chain={chain}
                onClick={handleBannerClick}
                onClose={handleBannerClose}
                activeIndex={activeBannerIndex}
              />
            ))}
          </ScrollView>
          {displayADs.length > 1 && (
            <BannerControls
              activeBannerIndex={activeBannerIndex}
              activeBannerId={activeBannerId}
              totalItems={displayADs.length}
              handleContainerScroll={(idx) => {
                // scroll to page idx
                scrollableContainerRef.current?.scrollTo({ x: idx, animated: true });
              }}
            />
          )}
        </View>
      ) : null}
      <AddFromChainStore
        isVisible={!!newChain}
        onClose={() => setNewChain(null)}
        newAddChain={customChains.find((d) => d.chainName === newChain) as ChainInfo}
      />
    </GlobalBannersWrapper>
  );
});

GlobalBannersAD.displayName = 'GlobalBannersAD';

const GlobalBannersWrapper = observer(
  (props: { items: number; show: boolean; children: React.ReactNode }) => {
    const show = props.items > 0 && props.show;
    const height = show ? (props.items === 1 ? 84 : 105) : 0;

    return (
      <View style={[styles.wrapper, { height }]}>
        {props.children}
      </View>
    );
  }
);
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  carousel: {
    width: '100%',
    height: 84, // or 105 if controls
    flexDirection: 'row',
  },
});