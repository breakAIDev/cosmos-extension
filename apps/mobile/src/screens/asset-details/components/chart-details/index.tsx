import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, ScrollView, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { APTOS_COIN, APTOS_FA } from '@aptos-labs/ts-sdk';
import {
  currencyDetail,
  formatPercentAmount,
  formatTokenAmount,
  getKeyToUseForDenoms,
  LeapWalletApi,
  Token,
  useActiveStakingDenom,
  useAssetDetails,
  useAssetSocials,
  useChainInfo,
  useFeatureFlags,
  useformatCurrency,
  useIsFeatureExistForChain,
  useLiquidStakingProviders,
  useSelectedNetwork,
  useUserPreferredCurrency,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  aptosChainNativeFATokenMapping,
  aptosChainNativeTokenMapping,
  ChainInfos,
  fromSmall,
  getNobleClaimYield,
  NativeDenom,
  SupportedChain,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk';
import {
  ChainTagsStore,
  DenomsStore,
  PercentageChangeDataStore,
  PriceStore,
  RootDenomsStore,
} from '@leapwallet/cosmos-wallet-store';
import { ArrowLeft, Globe, X, XLogo } from 'phosphor-react-native';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import classNames from 'classnames';
import ClickableIcon from '../../../../components/clickable-icons-v2';
import { PageHeader } from '../../../../components/header/PageHeaderV2';
import ReadMoreText from '../../../../components/read-more-text';
import ReceiveToken from '../../../../components/Receive';
import { useHardCodedActions } from '../../../../components/search-modal';
import Text from '../../../../components/text';
import { TokenImageWithFallback } from '../../../../components/token-image-with-fallback';
import { Button } from '../../../../components/ui/button';
import { EventName, PageName } from '../../../../services/config/analytics';
import { differenceInDays } from 'date-fns';
import { useChainPageInfo } from '../../../../hooks';
import { usePageView } from '../../../../hooks/analytics/usePageView';
import useGetTopCGTokens from '../../../../hooks/explore/useGetTopCGTokens';
import { useActiveChain } from '../../../../hooks/settings/useActiveChain';
import useActiveWallet from '../../../../hooks/settings/useActiveWallet';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { useDontShowSelectChain } from '../../../../hooks/useDontShowSelectChain';
import useQuery, { useQueryParams } from '../../../../hooks/useQuery';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Wallet } from '../../../../hooks/wallet/useWallet';
import { DollarIconV2 } from '../../../../../assets/icons/dollar-icon-v2';
import { ReceiveIcon } from '../../../../../assets/icons/receive-icon';
import { SwapIconV2 } from '../../../../../assets/icons/swap-icon-v2';
import { UploadIconV2 } from '../../../../../assets/icons/upload-icon-v2';
import { Images } from '../../../../../assets/images';
import mixpanel from '../../../../mixpanel';
import { observer } from 'mobx-react-lite';
import ReviewClaimTxSheet from '../../../earnUSDN/ReviewClaimTx';
import TxPage from '../../../earnUSDN/TxPage';
import SelectChain from '../../../home/SelectChain';
import StakeSelectSheet from '../../../stake-v2/components/StakeSelectSheet';
import { StakeInputPageState } from '../../../stake-v2/StakeInputPage';
import useAssets from '../../../swaps-v2/hooks/useAssets';
import { hasCoinType } from '../../../swaps-v2/utils';
import Skeleton from 'react-loading-skeleton';
import { coingeckoIdsStore } from '../../../../context/balance-store';
import { miscellaneousDataStore } from '../../../../context/chain-infos-store';
import { denomsStore } from '../../../../context/denoms-store-instance';
import { earnBannerShowStore } from '../../../../context/earn-banner-show';
import { earnFeatureShowStore } from '../../../../context/earn-feature-show';
import { manageChainsStore } from '../../../../context/manage-chains-store';
import { claimRewardsStore, delegationsStore, unDelegationsStore, validatorsStore } from '../../../../context/stake-store';
import { AggregatedSupportedChain } from '../../../../types/utility';
import { capitalize } from '../../../../utils/strings';

import ChartSkeleton from '../chart-skeleton/ChartSkeleton';
import SendToStakeModal from './SendToStakeModal';
import { TokensChart } from './token-chart';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TokenDetailsProps = {
  denomsStore: DenomsStore;
  rootDenomsStore: RootDenomsStore;
  chainTagsStore: ChainTagsStore;
  percentageChangeDataStore: PercentageChangeDataStore;
  priceStore: PriceStore;
};

const TokensDetails = observer(
  ({ rootDenomsStore, chainTagsStore, percentageChangeDataStore, priceStore }: TokenDetailsProps) => {
    const navigation = useNavigation();
    const assetType = undefined;
    const queryParam = useQueryParams();
    const query = useQuery();
    const chainInfos = useChainInfos();
    const _activeChain = useActiveChain();
    const { activeWallet } = useActiveWallet();
    const assetsId = (typeof query.get === 'function' ? query.get('assetName') : query.assetName) ?? undefined;
    const tokenChain = (typeof query.get === 'function' ? query.get('tokenChain') : query.tokenChain) ?? undefined;
    const pageSource = (typeof query.get === 'function' ? query.get('pageSource') : query.pageSource) ?? undefined;
    const { data: cgTokens = [] } = useGetTopCGTokens();
    const { data: featureFlags } = useFeatureFlags();
    const percentageChangeData = percentageChangeDataStore.data ?? {};
    const [earnBannerVisible, setEarnBannerVisible] = useState(earnBannerShowStore.show === 'true');
    const [claimAmount, setClaimAmount] = useState('');
    const getWallet = Wallet.useGetWallet();
    const [showReviewTxSheet, setShowReviewTxSheet] = useState(false);
    const [txHash, setTxHash] = useState<string>();
    const nobleChainInfo = useChainInfo('noble');

    const [assetDetailsState, setAssetDetailsState] = useState<Token | null>(null);
    useEffect(() => {
      // Load the session value once on mount
      (async () => {
        try {
          const value = await AsyncStorage.getItem('navigate-assetDetails-state');
          setAssetDetailsState(value ? JSON.parse(value) : null);
        } catch (e) {
          setAssetDetailsState(null);
        }
      })();
    }, []);

    // Get portfolio from navigation param or loaded session value
    const portfolio = useMemo(() => {
      return ((typeof query.get === 'function' ? query.get('state') : query.state) ?? assetDetailsState) as Token;
    }, [assetDetailsState, query]);

    const activeChain = useMemo(() => {
      return portfolio?.tokenBalanceOnChain ?? _activeChain;
    }, [_activeChain, portfolio?.tokenBalanceOnChain]);

    const { headerChainImgSrc } = useChainPageInfo();

    const { data: addSkipAssets } = useAssets();

    const skipAssets = useMemo(() => {
      return addSkipAssets?.[chainInfos?.[activeChain]?.chainId ?? ''];
    }, [activeChain, addSkipAssets, chainInfos]);

    const cgToken = useMemo(() => {
      if (assetType === 'cg') {
        return cgTokens?.find((t: { id: string }) => t.id === assetsId);
      }
    }, [assetType, assetsId, cgTokens]);

    const skipSupportsToken = useMemo(() => {
      const assetToFind: string[] = [];
      if (assetsId) {
        assetToFind.push(assetsId);
      }
      if (portfolio?.coinMinimalDenom) {
        assetToFind.push(portfolio?.coinMinimalDenom);
      }
      if (portfolio?.ibcDenom) {
        assetToFind.push(portfolio?.ibcDenom);
      }

      return (
        skipAssets &&
        skipAssets?.length > 0 &&
        !!skipAssets?.find((skipAsset) => {
          if (skipAsset.denom === 'ethereum-native') {
            return assetToFind.includes('wei');
          }
          if (assetToFind.some((asset) => Object.values(aptosChainNativeTokenMapping).includes(asset))) {
            return hasCoinType(skipAsset) && skipAsset.coinType === APTOS_COIN;
          }
          if (assetToFind.some((asset) => Object.values(aptosChainNativeFATokenMapping).includes(asset))) {
            return skipAsset.denom === APTOS_FA || (hasCoinType(skipAsset) && skipAsset.coinType === APTOS_COIN);
          }
          return (
            assetToFind.includes(skipAsset.denom.replace(/(cw20:|erc20\/)/g, '')) ||
            assetToFind.includes(skipAsset.denom.replace(/(cw20:|erc20\/)/g, '').toLowerCase()) ||
            (!!skipAsset.evmTokenContract &&
              (assetToFind.includes(skipAsset.evmTokenContract.replace(/(cw20:|erc20\/)/g, '')) ||
                assetToFind.includes(skipAsset.evmTokenContract.replace(/(cw20:|erc20\/)/g, '').toLowerCase()))) ||
            (hasCoinType(skipAsset) &&
              (assetToFind.includes(skipAsset.coinType) || assetToFind.includes(skipAsset.coinType.toLowerCase())))
          );
        })
      );
    }, [assetsId, portfolio?.coinMinimalDenom, portfolio?.ibcDenom, skipAssets]);

    const [showChainSelector, setShowChainSelector] = useState(false);
    const [showSendToStakeModal, setShowSendToStakeModal] = useState(false);
    const [showStakeSelectSheet, setShowStakeSelectSheet] = useState(false);
    const [formatCurrency] = useformatCurrency();
    const { handleSwapClick } = useHardCodedActions();

    // TODO: Remove this once we have a proper way to handle denoms, why rootDenomsStore.allDenoms not have denoms added to denomsStore.denoms post loading?
    const denoms = useMemo(() => {
      return Object.assign({}, rootDenomsStore.allDenoms, denomsStore.denoms);
    }, [rootDenomsStore.allDenoms]);

    const {
      info,
      ChartDays,
      chartData: data,
      loadingCharts,
      loadingPrice,
      errorCharts,
      errorInfo,
      setSelectedDays,
      selectedDays,
      denomInfo: _denomInfo,
    } = useAssetDetails({
      denoms,
      denom: assetsId as unknown as SupportedDenoms,
      tokenChain: (tokenChain ?? 'cosmos') as unknown as SupportedChain,
      compassParams: { isCompassWallet: false },
      coingeckoIdsStore,
      percentageChangeDataStore,
      priceStore: priceStore,
    });

    const denomInfo: NativeDenom = _denomInfo ?? {
      chain: portfolio?.chain ?? '',
      coinDenom: portfolio?.symbol ?? portfolio?.name ?? portfolio?.coinMinimalDenom ?? '',
      coinMinimalDenom: portfolio?.coinMinimalDenom ?? '',
      coinDecimals: portfolio?.coinDecimals ?? 6,
      icon: portfolio?.img ?? '',
      coinGeckoId: portfolio?.coinGeckoId ?? '',
    };
    const assetImg = denomInfo?.icon ?? cgToken?.image;
    usePageView(PageName.AssetDetails, true, {
      pageViewSource: pageSource,
      tokenName: denomInfo.coinDenom,
    });

    const [preferredCurrency] = useUserPreferredCurrency();
    const { data: socials } = useAssetSocials(denomInfo?.coinGeckoId);
    const [websiteUrl, twitterUrl] = useMemo(() => {
      const website = socials?.find((item) => item.type === 'website')?.url;
      const twitter = socials?.find((item) => item.type === 'twitter')?.url;
      return [website, twitter];
    }, [socials]);

    const isSwapDisabled = useMemo(() => {
      if (denomInfo.chain === 'noble' && denomInfo.coinMinimalDenom === 'uusdn') return true;
      return !skipSupportsToken || featureFlags?.all_chains?.swap === 'disabled';
    }, [denomInfo.chain, denomInfo.coinMinimalDenom, skipSupportsToken, featureFlags?.all_chains?.swap]);

    const {
      data: chartDataCGTokens,
      isLoading: loadingChartsCGTokens,
      error: errorChartsCGTokens,
    } = useReactQuery(
      ['chartData', cgToken?.id, selectedDays],
      async () => {
        if (selectedDays && cgToken?.id) {
          try {
            const date = new Date();
            date.setDate(1);
            date.setMonth(1);
            date.setFullYear(date.getFullYear());

            const YTD = differenceInDays(new Date(), date);

            const response = await LeapWalletApi.getMarketChart(
              cgToken?.id,
              /**
               * Please change 'cosmos' to '' once package update is done.
               */
              (denomInfo?.chain ?? 'cosmos') as SupportedChain,
              selectedDays === 'YTD' ? YTD : ChartDays[selectedDays],
              currencyDetail[preferredCurrency].currencyPointer,
            );

            if (response) {
              const { data, minMax } = response;
              return { chartData: data, minMax };
            }
          } catch (e) {
            //   console.error({ error: e, selectedDays, tokenId: cgToken?.id })
            //
          }
        }
      },
      { enabled: !!cgToken?.id, retry: 2, staleTime: 0 * 60 * 1000, cacheTime: 5 * 60 * 1000 },
    );

    const { chartsData, chartsLoading, chartsErrors } = useMemo(() => {
      if (assetType === 'cg') {
        return {
          chartsData: chartDataCGTokens,
          chartsLoading: loadingChartsCGTokens,
          chartsErrors: errorChartsCGTokens,
        };
      }
      return { chartsData: data, chartsLoading: loadingCharts, chartsErrors: errorCharts };
    }, [assetType, chartDataCGTokens, data, errorCharts, errorChartsCGTokens, loadingCharts, loadingChartsCGTokens]);

    const { price, details, priceChange } = {
      price: info?.price ?? cgToken?.current_price ?? portfolio?.usdPrice,
      details: info?.details,
      priceChange: info?.priceChange ?? cgToken?.price_change_percentage_24h,
    };

    const { chartData, minMax } = chartsData ?? { chartData: undefined, minMax: undefined };
    const totalHoldingsInUsd = portfolio?.usdValue;
    const filteredChartDays = ChartDays;
    const displayChain =
      chainInfos[portfolio?.tokenBalanceOnChain as SupportedChain]?.chainName ??
      portfolio?.tokenBalanceOnChain ??
      chainInfos[tokenChain as SupportedChain]?.chainName ??
      tokenChain;

    const chainIcon = useMemo(() => {
      return (
        chainInfos[portfolio?.tokenBalanceOnChain as SupportedChain]?.chainSymbolImageUrl ??
        ChainInfos[portfolio?.tokenBalanceOnChain as SupportedChain]?.chainSymbolImageUrl ??
        chainInfos[denomInfo?.chain as SupportedChain]?.chainSymbolImageUrl ??
        ChainInfos[denomInfo?.chain as SupportedChain]?.chainSymbolImageUrl
      );
    }, [chainInfos, denomInfo?.chain, portfolio?.tokenBalanceOnChain]);

    const dontShowSelectChain = useDontShowSelectChain(manageChainsStore);
    const defaultIconLogo = useDefaultTokenLogo();

    const _activeNetwork = useSelectedNetwork();
    const activeNetwork = useMemo(() => {
      if ((_activeChain as AggregatedSupportedChain) === 'aggregated') {
        return 'mainnet';
      }

      return _activeNetwork;
    }, [_activeNetwork, _activeChain]);
    const [activeStakingDenom] = useActiveStakingDenom(
      rootDenomsStore.allDenoms,
      denomInfo.chain as SupportedChain,
      activeNetwork,
    );

    const isStakeComingSoon = useIsFeatureExistForChain({
      checkForExistenceType: 'comingSoon',
      feature: 'stake',
      platform: 'Extension',
      forceChain: portfolio?.ibcDenom ? (portfolio?.chain as SupportedChain) : activeChain,
      forceNetwork: activeNetwork,
    });

    const isStakeNotSupported = useIsFeatureExistForChain({
      checkForExistenceType: 'notSupported',
      feature: 'stake',
      platform: 'Extension',
      forceChain: portfolio?.ibcDenom ? (portfolio?.chain as SupportedChain) : activeChain,
      forceNetwork: activeNetwork,
    });
    const isStakeDisabled = useMemo(() => {
      return (
        isStakeComingSoon ||
        isStakeNotSupported ||
        !!chainInfos[activeChain]?.evmOnlyChain ||
        activeStakingDenom?.coinMinimalDenom !== portfolio?.coinMinimalDenom
      );
    }, [
      activeChain,
      activeStakingDenom?.coinMinimalDenom,
      chainInfos,
      isStakeComingSoon,
      isStakeNotSupported,
      portfolio?.coinMinimalDenom,
    ]);
    const { data: lsProviders = {} } = useLiquidStakingProviders();
    const tokenLSProviders = lsProviders[activeStakingDenom?.coinDenom];

    const percentChange = useMemo(() => {
      if (selectedDays === '1D' && !!priceChange) {
        return Number(priceChange);
      }
      if (chartData && chartData.length > 0) {
        const firstPrice = chartData[0].smoothedPrice;
        const lastPrice = price;
        const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;

        return percentChange;
      }
    }, [chartData, price, priceChange, selectedDays]);

    const changeInPrice = useMemo(() => {
      const olderPrice = new BigNumber(price ?? 0).dividedBy(1 + (percentChange ?? 0) / 100);

      return new BigNumber(price ?? 0).minus(olderPrice).toNumber();
    }, [price, percentChange]);

    const chain = useChainInfo(activeChain);

    const handleStakeClick = async () => {
      const state: StakeInputPageState = {
        mode: 'DELEGATE',
        forceChain: activeChain,
        forceNetwork: activeNetwork,
      };
      await AsyncStorage.setItem('navigate-stake-input-state', JSON.stringify(state));

      if ((validatorsStore.validatorsForChain(activeChain).validatorData?.validators ?? []).length === 0) {
        validatorsStore.loadValidators(activeChain, activeNetwork);
      }
      navigation.navigate('StakeInput', { state }); // Use your screen name here!
      // Optionally track analytics here as before
    };

    const handleCloseBanner = () => {
      setEarnBannerVisible(false);
      earnBannerShowStore.setShow('false');
    };

    const handleEarnBannerClick = () => {
      if (earnFeatureShowStore.show !== 'false') {
        navigation.navigate('Home', { openEarnUSDN: true }); // Replace with your Home screen name
      } else {
        navigation.navigate('EarnUSDN'); // Replace with your EarnUSDN screen name
      }
    };

    const handleBack = async () => {
      await AsyncStorage.removeItem('navigate-assetDetails-state');
      navigation.goBack();
    };

    useEffect(() => {
      async function getEarnYield() {
        try {
          const wallets = await getWallet('noble');
          const address = (await wallets.getAccounts())[0].address;
          const res = await getNobleClaimYield(nobleChainInfo?.apis.rest ?? '', address);
          const amount = new BigNumber(res?.claimable_amount);
          if (amount.gt(0)) {
            setClaimAmount(fromSmall(amount.toFixed(0)));
          } else {
            setClaimAmount('0');
          }
        } catch (error) {
          //
        }
      }
      if (denomInfo.chain === 'noble' && denomInfo.coinMinimalDenom === 'uusdn') {
        getEarnYield();
      }
    }, [denomInfo.chain, denomInfo.coinMinimalDenom, getWallet, nobleChainInfo?.apis.rest, txHash]);

    if (txHash && denomInfo.chain === 'noble' && denomInfo.coinMinimalDenom === 'uusdn') {
      return (
        <TxPage
          onClose={() => {
            setTxHash(undefined);
            setShowReviewTxSheet(false);
          }}
          txHash={txHash}
          txType={'claim'}
        />
      );
    }

    return (
      <>
        <PageHeader style={{ position: 'absolute' }}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <ArrowLeft size={24} color="#888" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {capitalize(portfolio?.symbol ?? denomInfo?.coinDenom ?? denomInfo?.name ?? cgToken?.symbol)}
          </Text>
          <View style={{ width: 36, height: 36 }} />
        </PageHeader>
        <ScrollView style={{ flex: 1, backgroundColor: '#f7f8fa', paddingTop: 64 }}>
          {/* Banner */}
          {denomInfo.chain === 'noble' && denomInfo.coinMinimalDenom === 'uusdc' && earnBannerVisible && (
            <TouchableOpacity
              style={styles.banner}
              onPress={handleEarnBannerClick}
              activeOpacity={0.8}
            >
              <View style={styles.bannerContent}>
                <Image source={Images.Logos.USDCLogo} style={styles.bannerImage} />
                <Text style={styles.bannerText}>
                  Earn up to{' '}
                  <Text style={styles.bannerAPY}>
                    {parseFloat(miscellaneousDataStore.data?.noble?.usdnEarnApy) > 0
                      ? new BigNumber(miscellaneousDataStore.data.noble.usdnEarnApy).multipliedBy(100).toFixed(2) + '%'
                      : '-'}
                    {' '}APY
                  </Text>
                  {' '}with USDC
                </Text>
                <TouchableOpacity onPress={handleCloseBanner}>
                  <X size={18} color="#a0a0a0" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}

          {/* Chart */}
          <View style={styles.chartSection}>
            {((assetType !== 'cg' && !loadingPrice) || (assetType === 'cg' && cgToken)) ? (
              <>
                <Text style={styles.price}>
                  {price && new BigNumber(price).gt(0) ? formatCurrency(new BigNumber(price), 5) : '-'}
                </Text>
                {chartsLoading ? (
                  <ActivityIndicator style={{ height: 24 }} />
                ) : (
                  !!percentChange && (
                    <Text
                      style={[
                        styles.percentChange,
                        percentChange < 0
                          ? { color: '#f44' }
                          : { color: '#1ad36b' },
                      ]}
                    >
                      {`${changeInPrice > 0 ? '+' : '-'}${formatCurrency(
                        new BigNumber(changeInPrice).abs(),
                        2,
                      )} (${formatPercentAmount(new BigNumber(percentChange).toString(), 2)}%)`}
                    </Text>
                  )
                )}
              </>
            ) : (
              <>
                <View style={styles.skeleton} />
                <View style={styles.skeletonSmall} />
              </>
            )}
          </View>

          <View style={styles.flexColCenter}>
            {/* Chart / Days */}
            {!chartsErrors && !errorInfo && (
              <>
                {chartsLoading ? (
                  <ChartSkeleton />
                ) : chartData && chartData.length > 0 ? (
                  <TokensChart
                    chainColor={'#70B7FF'}
                    chartData={chartData}
                    loadingCharts={chartsLoading}
                    price={price}
                    minMax={minMax}
                    key={selectedDays}
                    selectedDays={selectedDays}
                  />
                ) : null}
              </>
            )}

            {/* Days Switcher */}
            {!chartsLoading && chartData && chartData.length > 0 && price && (
              <ScrollView
                horizontal
                style={styles.daySwitchScroll}
                showsHorizontalScrollIndicator={false}
              >
                {Object.keys(filteredChartDays).map((val, index) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.daySwitchBtn,
                      val === selectedDays
                        ? styles.daySwitchBtnActive
                        : styles.daySwitchBtnInactive,
                    ]}
                    onPress={() => setSelectedDays(val)}
                  >
                    <Text
                      style={[
                        styles.daySwitchText,
                        val === selectedDays
                          ? styles.daySwitchTextActive
                          : styles.daySwitchTextInactive,
                      ]}
                    >
                      {val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Action Row + Balances */}
            <View style={styles.actionBalanceSection}>
              {denomInfo.chain !== 'noble' || denomInfo.coinMinimalDenom !== 'uusdn' ? (
                <>
                  {activeWallet?.walletType !== WALLETTYPE.WATCH_WALLET && (
                    <View style={styles.actionRow}>
                      <ClickableIcon
                        label="Send"
                        icon={UploadIconV2}
                        onPress={() => {
                        const denomKey = getKeyToUseForDenoms(
                          portfolio?.ibcDenom || denomInfo?.coinMinimalDenom || '',
                          chainInfos[(denomInfo?.chain ?? '') as SupportedChain]?.chainId ?? '',
                        );
                        const chainId = chainInfos[activeChain]?.chainId;
                        let searchQuery = `assetCoinDenom=${denomKey}`;
                        if (chainId) {
                          searchQuery += `&chainId=${chainId}`;
                        }
                        // navigation.navigate('Send', {
                        //   ...parseQueryString(searchQuery), // see below
                        //   ...location.state, // if you want to pass previous state/props
                        // });
                      }}
                      />
                      <ClickableIcon
                        label="Receive"
                        icon={ReceiveIcon}
                        onPress={() => queryParam.set('receive', 'true')}
                      />
                      <ClickableIcon
                        label="Swap"
                        icon={SwapIconV2}
                        onPress={() => {
                          // ...as per your code
                        }}
                        disabled={isSwapDisabled}
                      />
                      <ClickableIcon
                        label="Stake"
                        icon={DollarIconV2}
                        onPress={() => {
                          // ...as per your code
                        }}
                        disabled={isStakeDisabled}
                      />
                    </View>
                  )}

                  {/* Balances */}
                  <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Your Balance</Text>
                    <View style={styles.balanceRow}>
                      <View style={styles.assetIconContainer}>
                        <TokenImageWithFallback
                          assetImg={assetImg}
                          text={denomInfo?.coinDenom}
                          altText={denomInfo?.coinDenom}
                          // ...props to style as circle
                        />
                        <Image
                          source={{ uri: chainIcon }}
                          style={styles.chainBadge}
                        />
                      </View>
                      <View style={styles.balanceAssetName}>
                        <Text style={styles.assetNameText}>
                          {denomInfo?.name ?? denomInfo?.coinDenom}
                        </Text>
                        <Text style={styles.assetChainText}>
                          {displayChain ?? cgToken?.name}
                        </Text>
                      </View>
                      <View style={styles.balanceAmountColumn}>
                        <Text style={styles.balanceAmountText}>
                          {totalHoldingsInUsd
                            ? formatCurrency(new BigNumber(totalHoldingsInUsd), 5)
                            : '-'}
                        </Text>
                        <Text style={styles.balanceAmountSmallText}>
                          {formatTokenAmount(
                            portfolio?.amount?.toString() ?? '',
                            denomInfo?.coinDenom,
                            5
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.balanceSpecialCard}>
                  <Text style={styles.balanceLabel}>Your Balance</Text>
                  {/* ...the rest is similar, use View, TouchableOpacity, Text for Deposit, Withdraw, Send */}
                </View>
              )}

              {/* Details Section */}
              {!loadingPrice && details && (denomInfo.coinMinimalDenom !== 'uusdn' || denomInfo.chain !== 'noble') && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsTitle}>
                    About {denomInfo?.name ?? capitalize(denomInfo?.chain)}
                  </Text>
                  <ReadMoreText textProps={{ style: styles.detailsText }}>
                    {details}
                  </ReadMoreText>
                </View>
              )}

              {/* Website & Twitter Links */}
              {!(denomInfo.coinMinimalDenom === 'uusdn' && denomInfo.chain === 'noble') && (
                <View style={styles.linksRow}>
                  {websiteUrl && (
                    <TouchableOpacity
                      style={styles.linkBtn}
                      onPress={() => Linking.openURL(websiteUrl)}
                    >
                      <Globe size={20} color="#333" />
                      <Text style={styles.linkBtnText}>Website</Text>
                    </TouchableOpacity>
                  )}
                  {twitterUrl && (
                    <TouchableOpacity
                      style={styles.linkBtn}
                      onPress={() => Linking.openURL(twitterUrl)}
                    >
                      <XLogo size={20} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
        <ReceiveToken forceChain={portfolio?.tokenBalanceOnChain} />
        <StakeSelectSheet
          isVisible={showStakeSelectSheet}
          title='Stake'
          onClose={() => setShowStakeSelectSheet(false)}
          tokenLSProviders={tokenLSProviders}
          handleStakeClick={handleStakeClick}
          rootDenomsStore={rootDenomsStore}
          delegationsStore={delegationsStore}
          validatorsStore={validatorsStore}
          unDelegationsStore={unDelegationsStore}
          claimRewardsStore={claimRewardsStore}
          forceChain={activeChain}
          forceNetwork={activeNetwork}
        />
        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
        />
        {showSendToStakeModal && portfolio && (
          <SendToStakeModal
            isVisible={showSendToStakeModal}
            ibcDenom={portfolio}
            onClose={() => setShowSendToStakeModal(false)}
            nativeDenom={activeStakingDenom}
          />
        )}
        {showReviewTxSheet && denomInfo.chain === 'noble' && denomInfo.coinMinimalDenom === 'uusdn' && (
          <ReviewClaimTxSheet
            amount={claimAmount}
            denom={denomInfo}
            isOpen={showReviewTxSheet}
            onClose={() => setShowReviewTxSheet(false)}
            setTxHash={(val: string) => setTxHash(val)}
          />
        )}
      </>
    );
  },
);

export default TokensDetails;

const styles = StyleSheet.create({
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  banner: { backgroundColor: '#ffe2c6', padding: 14, paddingLeft: 20, marginBottom: 18, flexDirection: 'row', alignItems: 'center' },
  bannerContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bannerImage: { width: 36, height: 36, marginRight: 12 },
  bannerText: { fontSize: 15, color: '#111', fontWeight: 'bold', flex: 1 },
  bannerAPY: { color: '#1ad36b', fontWeight: 'bold' },
  chartSection: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 },
  price: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  percentChange: { fontSize: 13, fontWeight: 'bold' },
  skeleton: { width: 90, height: 36, backgroundColor: '#eee', borderRadius: 8, marginBottom: 8 },
  skeletonSmall: { width: 80, height: 20, backgroundColor: '#eee', borderRadius: 8 },
  flexColCenter: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  daySwitchScroll: { width: '100%', marginVertical: 8 },
  daySwitchBtn: { borderRadius: 16, paddingVertical: 8, paddingHorizontal: 18, marginHorizontal: 4 },
  daySwitchBtnActive: { backgroundColor: '#f2f2f2' },
  daySwitchBtnInactive: { backgroundColor: 'transparent' },
  daySwitchText: { fontSize: 13, fontWeight: 'bold' },
  daySwitchTextActive: { color: '#222' },
  daySwitchTextInactive: { color: '#8a8a8a', fontWeight: 'normal' },
  actionBalanceSection: { width: '100%', padding: 20, flexDirection: 'column' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  balanceCard: { marginVertical: 14, backgroundColor: '#f9fafb', borderRadius: 14, padding: 14 },
  balanceLabel: { fontSize: 14, fontWeight: 'bold', color: '#868686', marginBottom: 6 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  assetIconContainer: { width: 40, height: 40, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  chainBadge: { width: 15, height: 15, position: 'absolute', bottom: 3, right: 3, borderRadius: 7.5 },
  balanceAssetName: { flex: 1, flexDirection: 'column', marginRight: 8 },
  assetNameText: { fontSize: 15, fontWeight: 'bold', color: '#191919' },
  assetChainText: { fontSize: 12, color: '#8a8a8a' },
  balanceAmountColumn: { alignItems: 'flex-end', justifyContent: 'space-between', height: 40 },
  balanceAmountText: { fontSize: 14, fontWeight: 'bold', color: '#191919' },
  balanceAmountSmallText: { fontSize: 11, color: '#9b9b9b' },
  balanceSpecialCard: { /* similar pattern as above, but adjust for your special balances */ },
  detailsSection: { marginTop: 14, marginBottom: 6 },
  detailsTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 3 },
  detailsText: { fontSize: 13, color: '#2a2a2a' },
  linksRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#e1e1e1', paddingVertical: 7, paddingHorizontal: 16, marginRight: 10 },
  linkBtnText: { fontSize: 12, marginLeft: 5, color: '#333', fontWeight: '500' },
});