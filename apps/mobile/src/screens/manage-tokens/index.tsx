import { useChainApis } from '@leapwallet/cosmos-wallet-hooks';
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import { Plus } from 'phosphor-react-native';
import { SearchInput } from '../../components/ui/input/search-input';
import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { activeChainStore } from '../../context/active-chain-store';
import { cw20TokenBalanceStore, erc20TokenBalanceStore } from '../../context/balance-store';
import { chainInfoStore } from '../../context/chain-infos-store';
import {
  autoFetchedCW20DenomsStore,
  betaCW20DenomsStore,
  betaERC20DenomsStore,
  betaNativeDenomsStore,
  cw20DenomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
  erc20DenomsStore,
  interactedDenomsStore,
} from '../../context/denoms-store-instance';
import { selectedNetworkStore } from '../../context/selected-network-store';
import { getContractInfo } from '../../utils/getContractInfo';
import { DeleteTokenSheet, SupportedToken } from './components';
import ManageTokensHeader from './components/ManageTokensHeader';
import { ManageTokensTabs } from './components/ManageTokensTab';
import { sortBySymbols } from './utils';
import { TextInput } from 'react-native-gesture-handler';

const ManageTokens = observer(() => {
  const { activeChain } = activeChainStore;
  const { selectedNetwork } = selectedNetworkStore;
  const { disabledCW20Denoms } = disabledCW20DenomsStore;
  const { enabledCW20Denoms } = enabledCW20DenomsStore;
  const betaCW20Denoms = betaCW20DenomsStore.betaCW20Denoms;
  const { cw20Denoms } = cw20DenomsStore;
  const { interactedDenoms } = interactedDenomsStore;
  const betaNativeDenoms = betaNativeDenomsStore.betaNativeDenoms;
  const betaERC20Denoms = betaERC20DenomsStore.betaERC20Denoms;
  const { erc20Denoms } = erc20DenomsStore;
  const { autoFetchedCW20Denoms } = autoFetchedCW20DenomsStore;

  const { cw20Tokens: cw20TokensBalances } = cw20TokenBalanceStore;
  const { erc20Tokens: erc20TokensBalances } = erc20TokenBalanceStore;

  const navigation = useNavigation();
  const { lcdUrl } = useChainApis();

  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<NativeDenom>();

  const [searchedText, setSearchedText] = useState('');
  const [fetchedTokens, setFetchedTokens] = useState<string[]>([]);
  const [fetchingContract, setFetchingContract] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout>(undefined);
  const [manuallyAddedTokens, setManuallyAddedTokens] = useState<NativeDenom[]>([]);
  const searchInputRef = useRef<TextInput>(null);
  const [activeTab, setActiveTab] = useState('supported');

  // ----------- Supported Tokens Logic (Same as web) -----------
  const supportedTokens = useMemo(() => {
    let _supportedTokens: SupportedToken[] = [];
    const _nativeCW20Tokens = Object.values(cw20Denoms)?.map((token) => {
      const tokenBalance = cw20TokensBalances?.find((balance) => balance.coinMinimalDenom === token.coinMinimalDenom);
      return {
        ...token,
        enabled:
          !tokenBalance || String(tokenBalance?.amount) === '0'
            ? enabledCW20Denoms?.includes(token.coinMinimalDenom)
            : !disabledCW20Denoms?.includes(token.coinMinimalDenom),
        verified: true,
      };
    }) ?? [];
    const _autoFetchedCW20Tokens = Object.values(autoFetchedCW20Denoms)?.map((token) => ({
      ...token,
      enabled: enabledCW20Denoms?.includes(token.coinMinimalDenom),
      verified: false,
    })) ?? [];
    const _nativeERC20Tokens = Object.values(erc20Denoms)?.map((token) => {
      const tokenBalance = erc20TokensBalances?.find(
        (balance) => balance.coinMinimalDenom === token.coinMinimalDenom,
      );
      return {
        ...token,
        enabled:
          !tokenBalance || String(tokenBalance?.amount) === '0'
            ? enabledCW20Denoms?.includes(token.coinMinimalDenom)
            : !disabledCW20Denoms?.includes(token.coinMinimalDenom),
        verified: true,
      };
    }) ?? [];
    _supportedTokens = [..._supportedTokens, ..._nativeCW20Tokens, ..._autoFetchedCW20Tokens, ..._nativeERC20Tokens];
    return _supportedTokens;
  }, [
    autoFetchedCW20Denoms,
    cw20Denoms,
    cw20TokensBalances,
    disabledCW20Denoms,
    enabledCW20Denoms,
    erc20Denoms,
    erc20TokensBalances,
  ]);

  // ----------- MobX Reaction for manually added tokens -----------
  useEffect(
    () =>
      autorun(() => {
        let _manuallyAddedTokens: NativeDenom[] = [];
        if (betaNativeDenoms) {
          _manuallyAddedTokens = [..._manuallyAddedTokens, ...(Object.values(betaNativeDenoms) ?? [])];
        }
        if (betaCW20Denoms) {
          _manuallyAddedTokens = [..._manuallyAddedTokens, ...(Object.values(betaCW20Denoms) ?? [])];
        }
        if (betaERC20Denoms) {
          _manuallyAddedTokens = [..._manuallyAddedTokens, ...(Object.values(betaERC20Denoms) ?? [])];
        }
        setManuallyAddedTokens(_manuallyAddedTokens);
      }),
    [betaCW20Denoms, betaERC20Denoms, betaNativeDenoms],
  );

  useEffect(() => {
    setFetchedTokens((prevValue) => {
      return (prevValue ?? []).filter((tokenDenom) => !disabledCW20Denoms.includes(tokenDenom));
    });
  }, [disabledCW20Denoms, disabledCW20Denoms.length]);

  const filteredManuallyAddedTokens = useMemo(() => {
    return (
      manuallyAddedTokens
        ?.filter((token) => {
          const lowercasedSearchedText = searchedText.trim().toLowerCase();
          return (
            (token.name ?? '').toLowerCase().includes(lowercasedSearchedText) ||
            token.coinDenom.toLowerCase().includes(lowercasedSearchedText) ||
            token.coinMinimalDenom.toLowerCase().includes(lowercasedSearchedText)
          );
        })
        ?.sort((tokenA, tokenB) => {
          const symbolA = tokenA.coinDenom.toUpperCase();
          const symbolB = tokenB.coinDenom.toUpperCase();

          if (symbolA < symbolB) return -1;
          if (symbolA < symbolB) return 1;
          return 0;
        }) ?? []
    );
  }, [manuallyAddedTokens, searchedText]);

  const filteredSupportedTokens = useMemo(() => {
    return (
      supportedTokens
        ?.filter((token) => {
          const lowercasedSearchedText = searchedText.trim().toLowerCase();
          return (
            (token.name ?? '').toLowerCase().includes(lowercasedSearchedText) ||
            token.coinDenom.toLowerCase().includes(lowercasedSearchedText) ||
            token.coinMinimalDenom.toLowerCase().includes(lowercasedSearchedText)
          );
        })
        ?.sort((tokenA, tokenB) => {
          const isEnabledA = tokenA.enabled;
          const isEnabledB = tokenB.enabled;
          if (isEnabledA && !isEnabledB) return -1;
          if (!isEnabledA && isEnabledB) return 1;
          return sortBySymbols(tokenA, tokenB);
        }) ?? []
    );
  }, [supportedTokens, searchedText]);

  // ----------- Fetch contract info -----------
  useEffect(() => {
    if (searchedText.length !== 0 && filteredSupportedTokens.length === 0 && filteredManuallyAddedTokens.length === 0) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(async () => {
        try {
          setFetchingContract(true);
          const result = await getContractInfo(lcdUrl ?? '', searchedText);
          if (typeof result !== 'string' && result.symbol) {
            setFetchedTokens((prevValue) => [...prevValue, searchedText]);
            setManuallyAddedTokens((prevValue) => [
              ...prevValue,
              {
                name: result.name,
                coinDecimals: result.decimals,
                coinMinimalDenom: searchedText,
                coinDenom: result.symbol,
                icon: '',
                coinGeckoId: '',
                chain: activeChain,
              },
            ]);
          }
        } catch (_) {
          //
        } finally {
          setFetchingContract(false);
        }
      }, 100);
    }
  }, [searchedText, filteredManuallyAddedTokens.length, lcdUrl, activeChain, filteredSupportedTokens.length]);

  // ----------- Handle Add New Token -----------
  const handleAddNewTokenClick = useCallback(() => {
    // In RN, you usually use navigation params instead of browser popups
    navigation.navigate('AddToken', { coinMinimalDenom: searchedText });
  }, [navigation, searchedText]);

  // ----------- Handle Toggle -----------
  const handleToggleChange = useCallback(
    async (isEnabled: boolean, coinMinimalDenom: string) => {
      const hasUserInteracted = interactedDenoms.some((token) => token === coinMinimalDenom);
      if (!hasUserInteracted) {
        await interactedDenomsStore.setInteractedDenoms([...interactedDenoms, coinMinimalDenom]);
      }
      let _disabledCW20Tokens: string[] = [];
      let _enabledCW20Denoms: string[] = [];
      let hasToUpdateBetaCW20Tokens = false;
      if (isEnabled) {
        _disabledCW20Tokens = disabledCW20Denoms.filter((token) => token !== coinMinimalDenom);
        _enabledCW20Denoms = [...enabledCW20Denoms, coinMinimalDenom];
        const tokenInfo = manuallyAddedTokens.find((token) => token.coinMinimalDenom === coinMinimalDenom);
        if (fetchedTokens.includes(coinMinimalDenom) && tokenInfo) {
          hasToUpdateBetaCW20Tokens = true;
        }
        if (activeChain !== 'aggregated') {
          cw20TokenBalanceStore.fetchCW20TokenBalances(activeChain, selectedNetwork, [coinMinimalDenom]);
        }
        // Fetch balance if chain is not 'aggregated'
        // Call to your MobX store fetcher, if needed
      } else {
        _disabledCW20Tokens = [..._disabledCW20Tokens, coinMinimalDenom];
        _enabledCW20Denoms = enabledCW20Denoms.filter((token) => token !== coinMinimalDenom);
      }

      await disabledCW20DenomsStore.setDisabledCW20Denoms(_disabledCW20Tokens);
      await enabledCW20DenomsStore.setEnabledCW20Denoms(_enabledCW20Denoms);
      if (hasToUpdateBetaCW20Tokens) {
        const tokenInfo = manuallyAddedTokens.find(
          (token) => token.coinMinimalDenom === coinMinimalDenom,
        ) as NativeDenom;
        const _fetchTokens = fetchedTokens.filter((tokenDenom) => tokenDenom !== coinMinimalDenom);

        setFetchedTokens(_fetchTokens);

        await betaCW20DenomsStore.setBetaCW20Denoms(
          coinMinimalDenom,
          {
            chain: activeChain,
            name: tokenInfo.name,
            coinDenom: tokenInfo.coinDenom,
            coinMinimalDenom: tokenInfo.coinMinimalDenom,
            coinDecimals: tokenInfo.coinDecimals,
            icon: tokenInfo?.icon,
            coinGeckoId: tokenInfo?.coinGeckoId,
          },
          activeChain,
        );
      }
    },
    [activeChain, disabledCW20Denoms, enabledCW20Denoms, fetchedTokens, interactedDenoms, manuallyAddedTokens, selectedNetwork],
  );

  const onCloseDeleteTokenSheet = useCallback(() => {
    setShowDeleteSheet(false);
    setTokenToDelete(undefined);
  }, []);

  const onDeleteClick = useCallback((token: NativeDenom) => {
    setShowDeleteSheet(true);
    setTokenToDelete(token);
  }, []);

  useEffect(() => {
    searchInputRef.current?.focus?.();
  }, []);

  return (
    <View style={styles.container}>
      <ManageTokensHeader />
      <View style={styles.searchRow}>
        <SearchInput
          ref={searchInputRef}
          value={searchedText}
          onChangeText={setSearchedText}
          placeholder="Search by token name"
          onClear={() => setSearchedText('')}
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddNewTokenClick}>
          <Plus size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
      <ManageTokensTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fetchingContract={fetchingContract}
        filteredSupportedTokens={filteredSupportedTokens}
        filteredManuallyAddedTokens={filteredManuallyAddedTokens}
        fetchedTokens={fetchedTokens}
        handleToggleChange={handleToggleChange}
        onDeleteClick={onDeleteClick}
        handleAddNewTokenClick={handleAddNewTokenClick}
        searchedText={searchedText}
      />
      <DeleteTokenSheet
        activeChainStore={activeChainStore}
        chainInfosStore={chainInfoStore}
        betaNativeDenomsStore={betaNativeDenomsStore}
        betaERC20DenomsStore={betaERC20DenomsStore}
        betaCW20DenomsStore={betaCW20DenomsStore}
        isOpen={showDeleteSheet}
        onClose={onCloseDeleteTokenSheet}
        tokenToDelete={tokenToDelete}
      />
    </View>
  );
});

export default ManageTokens;

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 16,
    color: '#2d3142',
  },
  addBtn: {
    marginLeft: 10,
    backgroundColor: '#e3e9f4',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
