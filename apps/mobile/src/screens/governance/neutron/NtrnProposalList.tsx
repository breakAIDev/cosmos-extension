import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { observer } from 'mobx-react-lite';

import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { useChainInfos } from '../../../hooks/useChainInfos';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui';
import { CheckCircle } from 'phosphor-react-native';

import PopupLayout from '../../../components/layout/popup-layout';
import BottomModal from '../../../components/bottom-modal';
import { EmptyCard } from '../../../components/empty-card';
import GovCardSkeleton from '../../../components/Skeletons/GovCardSkeleton';
import { SearchInput } from '../../../components/ui/input/search-input';
import SelectChain from '../../home/SelectChain';
import { NtrnStatus } from './index';
import { NtrnProposalStatus } from './NtrnStatus';
import { getId, getStatus, getTitle } from './utils';
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store';
import { TestnetAlertStrip } from '../../../components/alert-strip';

const FILTERS = [
  { key: 'all', label: 'All Proposals' },
  { key: NtrnProposalStatus.OPEN, label: 'In Progress' },
  { key: NtrnProposalStatus.EXECUTED, label: 'Executed' },
  { key: NtrnProposalStatus.REJECTED, label: 'Rejected' },
];

type NtrnProposalListProps = {
  onClick: (proposal: string) => void;
  
  proposalList: any[];
  proposalListStatus: 'success' | 'error' | 'loading' | 'fetching-more';
  fetchMore: () => void;
  chainTagsStore: ChainTagsStore;
  shouldPreferFallback?: boolean;
};

export const NtrnProposalList = observer(({
  proposalList: _proposalList,
  proposalListStatus,
  onClick,
  shouldPreferFallback,
  fetchMore,
  chainTagsStore,
}: NtrnProposalListProps) => {
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [propFilter, setPropFilter] = useState('');
  const [filter, setFilter] = useState('all');

  const chainInfos = useChainInfos();
  const activeChain = useActiveChain();
  const defaultTokenLogo = useDefaultTokenLogo();

  const loading = proposalListStatus === 'loading';
  const activeChainInfo = chainInfos[activeChain];

  // Filtering logic
  const filteredProposalList = useMemo(() => {
    return _proposalList?.reduce((acc, curr) => {
      if (filter === 'all') {
        if (!propFilter) acc.push(curr);
        else if (
          getTitle(curr, shouldPreferFallback ?? false)
            .toLowerCase()
            .includes(propFilter) ||
          String(curr.id) === propFilter
        ) {
          acc.push(curr);
        }
      } else {
        if (!propFilter && getStatus(curr, shouldPreferFallback ?? false) === filter) {
          acc.push(curr);
        } else if (
          getStatus(curr, shouldPreferFallback ?? false) === filter &&
          (getTitle(curr, shouldPreferFallback ?? false)
            .toLowerCase()
            .includes(propFilter) ||
            String(curr.id) === propFilter)
        ) {
          acc.push(curr);
        }
      }
      return acc;
    }, []);
  }, [_proposalList, filter, propFilter, shouldPreferFallback]);

  // Infinite scroll handler (for FlatList)
  const handleEndReached = () => {
    if (proposalListStatus === 'success') fetchMore();
  };

  return (
    <View style={styles.root}>
      {/* Custom PopupLayout/Header */}
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => {/* handle go back with navigation */},
              type: HeaderActionType.BACK,
            }}
            imgSrc={activeChainInfo?.chainSymbolImageUrl ?? defaultTokenLogo}
            onImgClick={() => setShowChainSelector(true)}
            title='Governance'
          />
        }
      >
        {<TestnetAlertStrip />}

        <View style={styles.headerSection}>
          <Text style={styles.proposalsTitle}>Proposals</Text>
          <Text style={styles.chainName}>List of proposals in {activeChain.toUpperCase()}</Text>
          <View style={styles.searchFilterRow}>
            <SearchInput
              placeholder='Search proposals...'
              onChangeText={text => setPropFilter(text.toLowerCase())}
              value={propFilter}
              onClear={() => setPropFilter('')}
            />
            <TouchableOpacity
              style={styles.sortBtn}
              onPress={() => setShowFilter(true)}
            >
              {/* Replace with your Sort icon */}
              <Text>Sort</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listSection}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <GovCardSkeleton key={i} isLast={i === 4} />)
          ) : (filteredProposalList?.length ?? 0) === 0 ? (
            <EmptyCard
              isRounded
              subHeading={propFilter ? 'Please try again with something else' : ''}
              heading={propFilter ? `No results for “${propFilter}”` : 'No Proposals'}
              src={'../../../../assets/images/explore.png'}
            />
          ) : (
            <FlatList
              data={filteredProposalList}
              keyExtractor={item => String(getId(item, shouldPreferFallback ?? false))}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.8}
              renderItem={({ item, index }) => (
                <View key={getId(item, shouldPreferFallback ?? false)}>
                  <TouchableOpacity
                    style={styles.proposalRow}
                    onPress={() => onClick(getId(item, shouldPreferFallback ?? false))}
                  >
                    <View style={styles.proposalTextCol}>
                      <Text style={styles.proposalTitle}>{getTitle(item, shouldPreferFallback ?? false)}</Text>
                      <Text style={styles.proposalSubtitle}>
                        #{getId(item, shouldPreferFallback ?? false)} ·
                        <NtrnStatus status={getStatus(item, shouldPreferFallback ?? false)} />
                      </Text>
                    </View>
                    {/* Right arrow, replace with your asset */}
                    <Image style={styles.arrowImg} source={{uri: '../../../../assets/images/right-arrow.png'}} />
                  </TouchableOpacity>
                  {index < filteredProposalList.length - 1 && <CardDivider />}
                </View>
              )}
              ListFooterComponent={proposalListStatus === 'fetching-more' ? (
                <View style={styles.loaderRow}>
                  <ActivityIndicator size="small" color="#000" />
                </View>
              ) : null}
            />
          )}
        </View>
      </PopupLayout>

      {/* Chain selector modal */}
      <SelectChain
        isVisible={showChainSelector}
        onClose={() => setShowChainSelector(false)}
        chainTagsStore={chainTagsStore}
      />

      {/* Filter modal */}
      <BottomModal isOpen={showFilter} onClose={() => setShowFilter(false)} title="Filter by">
        <View style={styles.filterModal}>
          {FILTERS.map((_filter, idx) => (
            <React.Fragment key={_filter.label}>
              <TouchableOpacity
                style={styles.filterRow}
                onPress={() => {
                  setFilter(_filter.key);
                  setShowFilter(false);
                }}
              >
                <Text style={styles.filterLabel}>{_filter.label}</Text>
                {filter === _filter.key ? (
                  <CheckCircle size={24} weight="fill" color="#E18881" />
                ) : null}
              </TouchableOpacity>
              {idx < FILTERS.length - 1 && <CardDivider />}
            </React.Fragment>
          ))}
        </View>
      </BottomModal>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  proposalsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  chainName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 2,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sortBtn: {
    width: 40,
    height: 40,
    marginLeft: 12,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  proposalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  proposalTextCol: {
    flex: 1,
  },
  proposalTitle: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  proposalSubtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  arrowImg: {
    marginLeft: 20,
    width: 18,
    height: 18,
    tintColor: '#888',
  },
  loaderRow: {
    padding: 16,
    alignItems: 'center',
  },
  filterModal: {
    borderRadius: 18,
    backgroundColor: '#FFF',
    paddingVertical: 8,
    width: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default NtrnProposalList;
