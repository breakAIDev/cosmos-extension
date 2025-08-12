import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

import { Token, useChainInfo, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { QueryStatus } from '@tanstack/react-query';

import RewardStrip from '../../../components/alert-strip/RewardStrip';
import { EmptyCard } from '../../../components/empty-card';
import NewChainSupportTooltip from '../../../components/header/NewChainSupportTooltip';
import { LightNodeRunningIndicator } from '../../../components/light-node-running-indicator/LightNodeRunningIndicator';
import ReceiveToken from '../../../components/Receive';
import { AGGREGATED_CHAIN_KEY } from '../../../services/config/constants';
import { usePerformanceMonitor } from '../../../hooks/perf-monitoring/usePerformanceMonitor';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import useActiveWallet from '../../../hooks/settings/useActiveWallet';
import { useSelectedNetwork } from '../../../hooks/settings/useNetwork';
import { useGetWalletAddresses } from '../../../hooks/useGetWalletAddresses';
import { useQueryParams } from '../../../hooks/useQuery';
import usePrevious from '../../../hooks/utility/usePrevious';
import { Images } from '../../../../assets/images';
import EarnFeatHighlight from '../../earnUSDN/EarnFeatHighlight';
import { RewardCard } from '../../initia-vip/components/RewardCard';

import { aggregatedChainsStore, evmBalanceStore } from '../../../context/balance-store';
import { chainInfoStore, chainTagsStore } from '../../../context/chain-infos-store';
import { rootBalanceStore } from '../../../context/root-store';
import { AggregatedSupportedChain } from '../../../types/utility';
import { getLedgerEnabledCosmosChainsKey, getLedgerEnabledEvmChainsKey } from '../../../utils/getLedgerEnabledEvmChains';
import { isLedgerEnabled } from '../../../utils/isLedgerEnabled';
import { queryParams } from '../../../utils/query-params';

import RequestFaucet from '../RequestFaucet';
import SelectWallet from '../SelectWallet/v2';
import { ChainInfoProp } from '../utils';

import { GeneralHomeAlertStrips } from './general-home-alert-strips';
import { GeneralHomeHeader } from './general-home-header';
import { HeroSection } from './HeroSection';
import { BannersLoading } from './home-loading-state';
import {
  AggregatedCopyAddressSheet,
  BitcoinDeposit,
  CopyAddressSheet,
  DepositBTCBanner,
  GlobalBannersAD,
  HomeButtons,
  WalletNotConnected,
} from './index';
import { LedgerNotSupported } from './ledger-not-supported';
import { PrivateKeyNotSupported } from './private-key-not-supported';
import { TokensSection } from './TokensSection';

export function tokenHasBalance(token: Token | undefined) {
  return !!token?.amount && !isNaN(parseFloat(token?.amount)) && parseFloat(token.amount) > 0;
}

export const GeneralHome = observer(() => {
  // Custom hooks
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const prevActiveChain = usePrevious(activeChain);

  const chains = useGetChains();
  const selectedNetwork = useSelectedNetwork();
  const { activeWallet } = useActiveWallet();
  const prevWallet = usePrevious(activeWallet);
  const chain: ChainInfoProp = useChainInfo();
  const walletAddresses = useGetWalletAddresses();

  const evmStatus = evmBalanceStore.evmBalanceForChain(activeChain as SupportedChain)?.status;
  const balanceError =
    activeChain !== 'aggregated' && rootBalanceStore.getErrorStatusForChain(activeChain, selectedNetwork);

  const query = useQueryParams();
  const showCopyAddressSheet = query.get(queryParams.copyAddress) === 'true';

  // Local states
  const [showSelectWallet, setShowSelectWallet] = useState(false);

  // Memoized values
  const ledgerEnabledCosmosChainsKeys = useMemo(
    () => getLedgerEnabledCosmosChainsKey(Object.values(chains)),
    [chains]
  );
  const ledgerEnabledEvmChainsKeys = useMemo(
    () => getLedgerEnabledEvmChainsKey(Object.values(chains)),
    [chains]
  );

  const noAddress = useMemo(
    () => activeChain !== AGGREGATED_CHAIN_KEY && !activeWallet?.addresses[activeChain],
    [activeChain, activeWallet?.addresses]
  );

  const connectLedger = useMemo(
    () =>
      activeChain !== AGGREGATED_CHAIN_KEY &&
      activeWallet?.walletType === WALLETTYPE.LEDGER &&
      noAddress &&
      (ledgerEnabledCosmosChainsKeys.includes(activeChain) ||
        ledgerEnabledEvmChainsKeys.includes(activeChain)),
    [activeChain, activeWallet?.walletType, ledgerEnabledCosmosChainsKeys, ledgerEnabledEvmChainsKeys, noAddress]
  );

  const isTokenLoading = rootBalanceStore.loading;

  // Memoized functions
  const handleCopyAddressSheetClose = useCallback(() => {
    query.remove(queryParams.copyAddress);
  }, [query]);

  const ledgerNotSupported = useMemo(
    () =>
      activeChain !== AGGREGATED_CHAIN_KEY &&
      activeWallet?.walletType === WALLETTYPE.LEDGER &&
      !isLedgerEnabled(activeChain as SupportedChain, chain?.bip44.coinType, Object.values(chains)),
    [activeChain, activeWallet?.walletType, chain?.bip44.coinType, chains]
  );

  const privateKeyNotSupported = useMemo(
    () =>
      activeChain !== AGGREGATED_CHAIN_KEY &&
      activeWallet?.walletType === WALLETTYPE.PRIVATE_KEY &&
      !activeWallet?.addresses?.[activeChain],
    [activeChain, activeWallet?.walletType, activeWallet?.addresses]
  );

  const queryStatus: QueryStatus = rootBalanceStore.loading ? 'loading' : 'success';

  // Perf monitor hooks (safe to keep for analytics even on RN)
  usePerformanceMonitor({
    page: 'home',
    op: 'homePageLoad',
    queryStatus,
    description: 'loading state on home page',
  });
  usePerformanceMonitor({
    page: 'wallet-switch',
    op: 'walletSwitchLoadTime',
    queryStatus,
    description: 'loading state on wallet switch page',
    enabled: !!prevWallet && prevWallet.id !== activeWallet?.id,
  });
  usePerformanceMonitor({
    page: 'chain-switch',
    op: 'chainSwitchLoadTime',
    queryStatus,
    description: 'loading state on chain switch page',
    enabled: !!prevActiveChain && prevActiveChain !== activeChain,
  });

  // Early returns
  if (!activeWallet) {
    return (
      <EmptyCard
        style={styles.fullHeightNoRadius}
        src={Images.Logos.LeapCosmos}
        heading='No wallet found'
      />
    );
  }

  if (!chain && activeChain !== AGGREGATED_CHAIN_KEY) {
    return null;
  }

  // Render
  return (
    <View style={styles.root}>
      <GeneralHomeHeader />

      <NewChainSupportTooltip />

      <WalletNotConnected visible={connectLedger} />

      {ledgerNotSupported ? (
        <LedgerNotSupported />
      ) : privateKeyNotSupported ? (
        <PrivateKeyNotSupported />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, connectLedger && styles.hidden]}
        >
          <GeneralHomeAlertStrips balanceError={balanceError} />

          <LightNodeRunningIndicator />

          <HeroSection />

          {activeChain !== AGGREGATED_CHAIN_KEY && <DepositBTCBanner />}

          {!activeWallet.watchWallet && <HomeButtons />}

          <RewardCard chainTagsStore={chainTagsStore} />

          {isTokenLoading ? <BannersLoading /> : <GlobalBannersAD />}

          {chainInfoStore.chainInfos[activeChain as SupportedChain]?.chainId === 'mantra-hongbai-1' && <RewardStrip />}

          {selectedNetwork === 'testnet' && <RequestFaucet />}

          <TokensSection
            noAddress={noAddress}
            balanceError={balanceError}
            evmStatus={evmStatus}
            isTokenLoading={isTokenLoading}
          />
        </ScrollView>
      )}

      <SelectWallet isVisible={showSelectWallet} onClose={() => setShowSelectWallet(false)} />

      <ReceiveToken />

      {activeChain !== AGGREGATED_CHAIN_KEY && <BitcoinDeposit />}

      {activeChain === AGGREGATED_CHAIN_KEY ? (
        <AggregatedCopyAddressSheet
          isVisible={showCopyAddressSheet}
          onClose={handleCopyAddressSheetClose}
          aggregatedChainsStore={aggregatedChainsStore}
        />
      ) : (
        <CopyAddressSheet
          isVisible={showCopyAddressSheet}
          onClose={handleCopyAddressSheetClose}
          walletAddresses={walletAddresses}
        />
      )}

      <EarnFeatHighlight />
    </View>
  );
});

const styles = StyleSheet.create({
  fullHeightNoRadius: {
    flex: 1,           // Takes full height in RN flexbox layouts
    borderRadius: 0,   // No border radius
  },
  root: {
    flex: 1,
    backgroundColor: '#FFF', // Adjust for your theme/dark mode
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal: 16,
    // paddingTop: 12,
    // paddingBottom: 48,
  },
  hidden: {
    display: 'none',
  },
});

