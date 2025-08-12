import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MotiView } from 'moti';
import { observer } from 'mobx-react-lite';
import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { Header, HeaderActionType, useTheme } from '@leapwallet/leap-ui';
import PopupLayout from '../../components/layout/popup-layout';
import { useChainPageInfo } from '../../hooks';
import { usePerformanceMonitor } from '../../hooks/perf-monitoring/usePerformanceMonitor';
import { useSetActiveChain } from '../../hooks/settings/useActiveChain';
import { useChainInfos } from '../../hooks/useChainInfos';
import { useDontShowSelectChain } from '../../hooks/useDontShowSelectChain';
import useQuery from '../../hooks/useQuery';
import SelectChain from '../home/SelectChain';
import { aptosCoinDataStore, chainFeatureFlagsStore, evmBalanceStore } from '../../context/balance-store';
import { chainTagsStore } from '../../context/chain-infos-store';
import { rootCW20DenomsStore, rootDenomsStore, rootERC20DenomsStore } from '../../context/denoms-store-instance';
import { manageChainsStore } from '../../context/manage-chains-store';
import { rootBalanceStore } from '../../context/root-store';
import { AmountCard } from './components/amount-card';
import ErrorWarning from './components/error-warning';
import { Memo } from './components/memo';
import { RecipientCard } from './components/recipient-card';
import { ReviewTransfer } from './components/reivew-transfer';
import { SendContextProvider } from './context';

const Send = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const chainInfos = useChainInfos();
  const activeChain = useActiveChain();
  const setActiveChain = useSetActiveChain();

  const [showChainSelector, setShowChainSelector] = useState(false);
  const { headerChainImgSrc } = useChainPageInfo();
  const { theme } = useTheme();

  // If your useQuery() is based on react-router, replace with:
  //   const chainId = route.params?.chainId ?? undefined;
  // Or adapt your useQuery() for React Navigation.
  const chainId = useQuery().get('chainId') ?? undefined;
  const dontShowSelectChain = useDontShowSelectChain(manageChainsStore);
  const isAllAssetsLoading = rootBalanceStore.loading;

  useEffect(() => {
    if (chainId) {
      const chainKey = Object.values(chainInfos).find((chain) => chain.chainId === chainId)?.key;
      chainKey && setActiveChain(chainKey);
    }
  }, [chainId, chainInfos, setActiveChain]);

  usePerformanceMonitor({
    page: 'send',
    queryStatus: isAllAssetsLoading ? 'loading' : 'success',
    op: 'sendPageLoad',
    description: 'loading state on send page',
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#181818' : '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <MotiView style={{ flex: 1 }}>
          <PopupLayout
            header={
              <Header
                action={{
                  onClick: () => navigation.navigate('Home' as never), // update 'Home' if your home route name is different
                  type: HeaderActionType.BACK,
                }}
                imgSrc={headerChainImgSrc}
                onImgClick={dontShowSelectChain ? undefined : () => setShowChainSelector(true)}
                title={route.name === 'Ibc' ? 'IBC' : 'Send'}
              />
            }
          >
            <SendContextProvider
              activeChain={activeChain}
              rootDenomsStore={rootDenomsStore}
              rootCW20DenomsStore={rootCW20DenomsStore}
              rootERC20DenomsStore={rootERC20DenomsStore}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
                keyboardShouldPersistTaps="handled"
              >
                <RecipientCard
                  themeColor={theme === 'dark' ? '#9e9e9e' : '#696969'}
                  rootERC20DenomsStore={rootERC20DenomsStore}
                  rootCW20DenomsStore={rootCW20DenomsStore}
                  chainTagsStore={chainTagsStore}
                  chainFeatureFlagsStore={chainFeatureFlagsStore}
                />

                <AmountCard
                  rootBalanceStore={rootBalanceStore}
                  isAllAssetsLoading={isAllAssetsLoading}
                  rootDenomsStore={rootDenomsStore}
                  rootCW20DenomsStore={rootCW20DenomsStore}
                  rootERC20DenomsStore={rootERC20DenomsStore}
                  evmBalanceStore={evmBalanceStore}
                  aptosCoinDataStore={aptosCoinDataStore}
                />

                <Memo />
                <ErrorWarning />
                <View style={{ height: 100 }} />

                <ReviewTransfer
                  rootBalanceStore={rootBalanceStore}
                  rootDenomsStore={rootDenomsStore}
                  rootERC20DenomsStore={rootERC20DenomsStore}
                />
              </ScrollView>
            </SendContextProvider>

            <SelectChain
              isVisible={showChainSelector}
              onClose={() => setShowChainSelector(false)}
              chainTagsStore={chainTagsStore}
            />
          </PopupLayout>
        </MotiView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

Send.displayName = 'Send';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    // You can set padding if you want
  },
  scrollContent: {
    padding: 16,
    gap: 16, // replaces space-y-4
    // MinHeight, height calc, and scroll bar styling can be handled here if needed
    paddingBottom: 100, // to allow for bottom space
  },
});

export default observer(Send);
