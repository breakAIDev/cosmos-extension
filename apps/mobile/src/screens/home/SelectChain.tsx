import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useChainsStore, useCustomChains } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import { MagnifyingGlassMinus, Plus } from 'phosphor-react-native';
import BottomModal from '../../components/new-bottom-modal';
import { SearchInput } from '../../components/ui/input/search-input';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { BETA_CHAINS, CONNECTIONS } from '../../services/config/storage-keys';
import { disconnect } from '../../context/utils';
import { useIsAllChainsEnabled } from '../../hooks/settings';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { useChainInfos } from '../../hooks/useChainInfos';
import { useNonNativeCustomChains } from '../../hooks/useNonNativeCustomChains';
import { Images } from '../../../assets/images';
import { observer } from 'mobx-react-lite';
import AddChain from '../suggestChain/addChain';
import { chainTagsStore as defaultChainTagsStore } from '../../context/chain-infos-store';
import { globalSheetsStore } from '../../context/global-sheets-store';
import { ManageChainSettings, manageChainsStore } from '../../context/manage-chains-store';
import { popularChainsStore } from '../../context/popular-chains-store';
import { rootStore } from '../../context/root-store';
import { starredChainsStore } from '../../context/starred-chains-store';
import { AggregatedSupportedChain } from '../../types/utility';

import { useActiveChain, useSetActiveChain } from '../../hooks/settings/useActiveChain';
import AddFromChainStore from './AddFromChainStore';
import { ChainCardWrapper } from './ChainCardWrapper';
import { ChainCard } from './components';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ListChainsProps = {
  onChainSelect: (chainName: SupportedChain) => void;
  selectedChain: SupportedChain;
  chainTagsStore: ChainTagsStore;
  onPage?: 'AddCollection';
  chainsToShow?: string[];
  searchedChain?: string;
  setSearchedChain?: (val: string) => void;
  showAggregatedOption?: boolean;
  handleAddNewChainClick?: VoidFunction | null;
  defaultFilter?: string;
};

export const ListChains = observer(({
  onChainSelect,
  selectedChain,
  onPage,
  chainsToShow,
  searchedChain: paramsSearchedChain,
  setSearchedChain: paramsSetSearchedChain,
  showAggregatedOption = false,
  handleAddNewChainClick,
  chainTagsStore,
  defaultFilter = 'Popular',
}: ListChainsProps) => {

  const [newChain, setNewChain] = useState<string | null>(null);
  const searchInputRef = useRef<View>(null);
  const [newSearchedChain, setNewSearchedChain] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);
  const { activeWallet } = useActiveWallet();
  const setChains = useChainsStore((store) => store.setChains);
  const activeChain = useActiveChain();
  const setActiveChain = useSetActiveChain();

  const isAllChainsEnabled = useIsAllChainsEnabled();
  const { theme } = useTheme();

  const s3PriorityChains = popularChainsStore.popularChains;
  const s3DeprioritizedChains = popularChainsStore.deprioritizedChains;

  const uniqueTags = chainTagsStore.uniqueTags;
  const allChainTags = chainTagsStore.allChainTags;

  const filterOptions = useMemo(() => {
    const chainTagsForVisibleChains = Object.fromEntries(
      Object.entries(allChainTags).filter(([chainId]) =>
        manageChainsStore.chains.some((chain) => chain.chainId === chainId),
      ),
    );
    const uniqueTagsForVisibleChains = new Set(Object.values(chainTagsForVisibleChains).flat());
    const filteredTags = uniqueTags.filter((tag) => uniqueTagsForVisibleChains.has(tag));
    return [{ label: 'Popular' }, ...filteredTags.map((tag) => ({ label: tag }))];
  }, [allChainTags, uniqueTags]);

  const getChainTags = useCallback(
    (chain: ManageChainSettings) => {
      let tags = allChainTags?.[chain.chainId] ?? [];
      if (!tags || tags.length === 0) {
        tags = allChainTags?.[chain.testnetChainId ?? ''] ?? [];
      }
      if (!tags || tags.length === 0) {
        tags = allChainTags?.[chain.evmChainId ?? ''] ?? [];
      }
      if (!tags || tags.length === 0) {
        tags = allChainTags?.[chain.evmChainIdTestnet ?? ''] ?? [];
      }
      if ((!tags || tags.length === 0) && chain.evmOnlyChain) {
        tags = ['EVM'];
      }
      return tags;
    },
    [allChainTags],
  );

  const customChains = useCustomChains();

  const searchedChain = paramsSearchedChain ?? newSearchedChain;
  const setSearchedChain = paramsSetSearchedChain ?? setNewSearchedChain;
  const nonNativeCustomChains = useNonNativeCustomChains();
  const chainInfos = useChainInfos();
  const allNativeChainID = Object.values(chainInfos)
    .filter((chain) => chain.enabled)
    .map((chain) => {
      if (chain.testnetChainId && chain.chainId !== chain.testnetChainId) {
        return [chain.chainId, chain.testnetChainId];
      }
      return [chain.chainId];
    })
    .flat();

  const _customChains: ManageChainSettings[] = customChains
    .filter((d) => !allNativeChainID.includes(d.chainId))
    .filter((d) => !manageChainsStore.chains.map((chain) => chain.chainId).includes(d.chainId))
    .sort((a, b) => a.chainName.localeCompare(b.chainName))
    .map((d, index) => ({
      active: d.enabled,
      beta: undefined,
      chainName: d.key,
      denom: d.denom,
      id: 100 + index,
      preferenceOrder: 100 + index,
      chainId: d.chainId,
      testnetChainId: d.testnetChainId,
      evmOnlyChain: d.evmOnlyChain,
    }));

  const showChains = useMemo(() => [...manageChainsStore.chains, ..._customChains], [_customChains]);

  const newChainToAdd = useMemo(() => customChains.find((d) => d.key === newChain), [customChains, newChain]);

  const _filteredChains = useMemo(() => {
    return showChains.filter(function (chain) {
      if (
        !chain.active ||
        (onPage === 'AddCollection' &&
          ['omniflix', 'stargaze', 'forma', 'manta', 'aura', 'mainCoreum', 'coreum', 'lightlink'].includes(
            chain.chainName,
          ))
      ) {
        return false;
      }

      if (
        chainsToShow &&
        chainsToShow.length &&
        !chainsToShow.includes(chainInfos[chain.chainName]?.chainRegistryPath)
      ) {
        return false;
      }

      const chainName =
        chainInfos[chain.chainName]?.chainName ??
        nonNativeCustomChains?.[chain.chainName]?.chainName ??
        chain.chainName;
      return chainName.toLowerCase().includes(searchedChain.toLowerCase());
    });
  }, [showChains, onPage, chainsToShow, chainInfos, nonNativeCustomChains, searchedChain]);

  const filteredChains = useMemo(() => {
    let chains = _filteredChains;

    if (!searchedChain && selectedFilter !== 'Popular') {
      chains = chains.filter((chain) => {
        const tags = getChainTags(chain);
        return tags?.includes(selectedFilter);
      });
    }

    const favouriteChains = chains
      .filter((chain) => starredChainsStore.chains.includes(chain.chainName))
      .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName));

    const priorityChains = chains
      .filter(
        (chain) => s3PriorityChains.includes(chain.chainName) && !starredChainsStore.chains.includes(chain.chainName),
      )
      .sort(
        (chainA, chainB) => s3PriorityChains.indexOf(chainA.chainName) - s3PriorityChains.indexOf(chainB.chainName),
      );

    const deprioritizedChains = chains
      .filter(
        (chain) =>
          s3DeprioritizedChains.includes(chain.chainName) && !starredChainsStore.chains.includes(chain.chainName),
      )
      .sort(
        (chainA, chainB) => s3PriorityChains.indexOf(chainA.chainName) - s3PriorityChains.indexOf(chainB.chainName),
      );

    const otherChains = chains
      .filter(
        (chain) =>
          !starredChainsStore.chains.includes(chain.chainName) &&
          !s3PriorityChains.includes(chain.chainName) &&
          !s3DeprioritizedChains.includes(chain.chainName),
      )
      .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName));

    const chainsList = [...favouriteChains, ...priorityChains, ...otherChains, ...deprioritizedChains];
    if (activeWallet?.watchWallet) {
      const walletChains = new Set(Object.keys(activeWallet.addresses));
      return chainsList.sort((a, b) =>
        walletChains.has(a.chainName) === walletChains.has(b.chainName) ? 0 : walletChains.has(a.chainName) ? -1 : 1,
      );
    }

    return chainsList;
  }, [_filteredChains, activeWallet?.addresses, activeWallet?.watchWallet, getChainTags, s3DeprioritizedChains, s3PriorityChains, searchedChain, selectedFilter]);

  const tagWiseChains = useMemo(() => {
    return _filteredChains.reduce((acc, chain) => {
      const tags = getChainTags(chain);
      const tag = tags?.[0] ?? 'Others';
      acc[tag] = acc[tag] || [];
      acc[tag].push(chain);
      return acc;
    }, {} as Record<string, ManageChainSettings[]>);
  }, [_filteredChains, getChainTags]);

  const handleClick = (chainName: AggregatedSupportedChain, beta?: boolean) => {
    if (beta === undefined) {
      setNewChain(chainName);
      return;
    }

    setSearchedChain('');
    onChainSelect(chainName as SupportedChain);
  };

  const handleDeleteClick = useCallback(
    async (chainKey: SupportedChain) => {
      if (activeChain === chainKey) {
        await setActiveChain('aggregated');
      }
      const oldChains = chainInfos;
      const chainInfo = oldChains[chainKey];
      delete oldChains[chainKey];
      setChains(oldChains);
      rootStore.setChains(oldChains);

      chainTagsStore.removeBetaChainTags(chainKey);

      try {
        const betaChainsRaw = AsyncStorage.getItem(BETA_CHAINS);
        const connectionsRaw = AsyncStorage.getItem(CONNECTIONS);
        let betaChains = typeof betaChainsRaw === 'string' ? JSON.parse(betaChainsRaw) : {};
        delete betaChains[chainKey];

        let connections = typeof connectionsRaw === 'string' ? JSON.parse(connectionsRaw) : {};
        if (!connections) {
          connections = {};
        }
        Object.values(connections).forEach((wallet: any) => {
          const originConnections = wallet[chainInfo.chainId];
          if (originConnections && originConnections.length > 0) {
            originConnections.forEach((origin: any) => disconnect({ chainId: chainInfo.chainId, origin }));
          }
        });

        AsyncStorage.setItem(BETA_CHAINS, JSON.stringify(betaChains));
      } catch (error) {
        //
      }
    },
    [activeChain, chainInfos, chainTagsStore, setActiveChain, setChains],
  );

  useEffect(() => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 200);
  }, [setSearchedChain]);

  return (
    <View style={styles.container}>
      {/* Search Input and Add Button Row */}
      <View style={styles.row}>
        <SearchInput
          ref={searchInputRef}
          value={searchedChain}
          onChangeText={setSearchedChain}
          placeholder="Search by chain name"
          onClear={() => setSearchedChain('')}
          style={styles.searchInput}
        />

        {handleAddNewChainClick && (
          <TouchableOpacity style={styles.addBtn} onPress={handleAddNewChainClick}>
            <Plus size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {!searchedChain ? (
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.label}
                style={[
                  styles.filterPill,
                  selectedFilter === filter.label ? styles.filterPillActive : null,
                ]}
                onPress={() => setSelectedFilter(filter.label)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.label ? styles.filterTextActive : null,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Aggregated Option */}
      {selectedFilter === 'Popular' && !searchedChain && showAggregatedOption && isAllChainsEnabled ? (
        <View style={styles.aggregatedCard}>
          <ChainCard
            beta={false}
            handleClick={handleClick}
            formattedChainName="All chains"
            chainName={AGGREGATED_CHAIN_KEY}
            selectedChain={selectedChain}
            img={theme === ThemeName.DARK ? Images.Misc.AggregatedViewDarkSvg : Images.Misc.AggregatedViewSvg}
            showStars
          />
        </View>
      ) : null}

      {/* Chain Results */}
      {filteredChains.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <View style={styles.noResultsIcon}>
            <MagnifyingGlassMinus size={24} color="#64748b" />
          </View>
          <Text style={styles.noResultsText}>No results found</Text>
        </View>
      ) : !searchedChain ? (
        <FlatList
          data={filteredChains}
          keyExtractor={(chain, idx) => chain.chainName + idx}
          renderItem={({ item, index }) => (
            <ChainCardWrapper
              key={item.chainName + index}
              chain={item}
              handleClick={handleClick}
              handleDeleteClick={handleDeleteClick}
              selectedChain={selectedChain}
              onPage={onPage}
              index={index}
              showStars
            />
          )}
        />
      ) : (
        // Grouped by tag if searching
        [...filterOptions, { label: 'Others' }].map(({ label: tag }) => {
          const tagChains = tagWiseChains[tag];
          if (!tagChains || tagChains.length === 0) return null;
          return (
            <View key={tag} style={styles.tagSection}>
              <Text style={styles.tagTitle}>
                {tag} <Text style={styles.tagCount}>{tagChains?.length}</Text>
              </Text>
              {tagChains.map((chain, index) => (
                <ChainCardWrapper
                  key={chain.chainName + index}
                  chain={chain}
                  handleClick={handleClick}
                  handleDeleteClick={handleDeleteClick}
                  selectedChain={selectedChain}
                  onPage={onPage}
                  index={index}
                  showStars
                />
              ))}
            </View>
          );
        })
      )}

      <AddFromChainStore
        isVisible={!!newChain}
        onClose={() => setNewChain(null)}
        newAddChain={newChainToAdd as ChainInfo}
        successCallback={() => globalSheetsStore.toggleChainSelector()}
      />
    </View>
  );
});

type ChainSelectorProps = {
  readonly isVisible: boolean;
  readonly onClose: VoidFunction;
  readonly chainTagsStore?: ChainTagsStore;
  readonly defaultFilter?: string;
  readonly onChainSelect?: (chainName: AggregatedSupportedChain) => void;
  readonly selectedChain?: SupportedChain;
  readonly showAggregatedOption?: boolean;
};

const SelectChain = observer(({
  isVisible,
  onClose,
  chainTagsStore = defaultChainTagsStore,
  defaultFilter,
  onChainSelect: onChainSelectProp,
  selectedChain: selectedChainProp,
  showAggregatedOption: showAggregatedOptionProp = true,
}: ChainSelectorProps) => {
  const navigation = useNavigation();
  const route = useRoute();
  const selectedChain = useActiveChain();
  const setActiveChain = useSetActiveChain();
  const [searchedChain, setSearchedChain] = useState('');
  const [isAddChainOpen, setIsAddChainOpen] = useState<boolean>(false);

  const onChainSelect = async (chainName: AggregatedSupportedChain) => {
    if (onChainSelectProp) {
      onChainSelectProp(chainName);
      return;
    }
    await setActiveChain(chainName);
    if (route.name !== 'Home') {
      navigation.navigate('Home');
    }
    onClose();
  };

  const handleAddNewChainClick = useCallback(() => {
    setIsAddChainOpen(true);
  }, []);

  const handleAddChainClose = useCallback(() => {
    setIsAddChainOpen(false);
  }, []);

  return (
    <>
      <BottomModal isOpen={isVisible} onClose={onClose} fullScreen title="Switch chain">
        <ListChains
          onChainSelect={onChainSelect}
          selectedChain={selectedChainProp || selectedChain}
          searchedChain={searchedChain}
          setSearchedChain={setSearchedChain}
          showAggregatedOption={showAggregatedOptionProp}
          handleAddNewChainClick={handleAddNewChainClick}
          chainTagsStore={chainTagsStore}
          defaultFilter={defaultFilter}
        />
      </BottomModal>
      <AddChain isOpen={isAddChainOpen} onClose={handleAddChainClose} />
    </>
  );
});

export default SelectChain;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  filterContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterPill: {
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  filterPillActive: {
    backgroundColor: '#d1fae5',
    borderColor: '#22c55e',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  caretLeft: {
    position: 'absolute',
    left: 0,
    top: '45%',
    zIndex: 1,
  },
  caretRight: {
    position: 'absolute',
    right: 0,
    top: '45%',
    zIndex: 1,
  },
  aggregatedCard: {
    backgroundColor: '#e8f1ff',
    borderRadius: 16,
    maxHeight: 100,
    width: '100%',
    marginBottom: 14,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  noResultsIcon: {
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    textAlign: 'center',
  },
  tagSection: {
    marginBottom: 14,
  },
  tagTitle: {
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  tagCount: {
    fontWeight: 'normal',
    color: '#64748b',
    fontSize: 15,
  },
});
