import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, Image, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Proposal, useStaking } from '@leapwallet/cosmos-wallet-hooks';
import {
  ChainTagsStore,
  ClaimRewardsStore,
  DelegationsStore,
  GovStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store';
import { CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui';
import { CheckCircle } from 'phosphor-react-native';
import Text from '../../../components/text'
import { TestnetAlertStrip } from '../../../components/alert-strip';
import BottomModal from '../../../components/bottom-modal';
import { EmptyCard } from '../../../components/empty-card';
import PopupLayout from '../../../components/layout/popup-layout';
import { LoaderAnimation } from '../../../components/loader/Loader';
import GovCardSkeleton from '../../../components/Skeletons/GovCardSkeleton';
import { useChainPageInfo } from '../../../hooks';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { useChainInfos } from '../../../hooks/useChainInfos';
import Sort from '../../../../assets/icons/sort';
import { Images } from '../../../../assets/images';
import SelectChain from '../../home/SelectChain';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { sliceSearchWord } from '../../../utils/strings';

import { ProposalStatus, RequireMinStaking } from './index';
import { ProposalStatusEnum } from './ProposalStatus';

export type ProposalListProps = {
  onClick: (proposal: string) => void;
  shouldPreferFallback?: boolean;
  governanceStore: GovStore;
  chainTagsStore: ChainTagsStore;
  delegationsStore: DelegationsStore;
  validatorsStore: ValidatorsStore;
  unDelegationsStore: UndelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
};

const filters = [
  { key: 'all', label: 'All Proposals' },
  { key: ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD, label: 'Voting in Progress' },
  { key: ProposalStatusEnum.PROPOSAL_STATUS_PASSED, label: 'Passed' },
  { key: ProposalStatusEnum.PROPOSAL_STATUS_REJECTED, label: 'Rejected' },
];

export const ProposalList = observer(
  ({
    onClick,
    governanceStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    chainTagsStore,
  }: ProposalListProps) => {
    const { status: proposalListStatus, data: _proposalList, fetchMore } = governanceStore.chainProposals;

    const chainInfos = useChainInfos();
    const [propFilter, setPropFilter] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [filter, setFilter] = useState('all');
    const [showChainSelector, setShowChainSelector] = useState(false);
    const activeChain = useActiveChain();
    const activeChainInfo = chainInfos[activeChain];
    const loading = proposalListStatus === 'loading';
    const denoms = rootDenomsStore.allDenoms;

    const chainDelegations = delegationsStore.delegationsForChain(activeChain);
    const chainValidators = validatorsStore.validatorsForChain(activeChain);
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

    const { totalDelegation } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
    );

    const hasMinAmountStaked = useMemo(() => {
      if (activeChain === 'cosmos' || activeChainInfo.chainId === 'atomone-1') {
        return totalDelegation?.gte(1);
      }
      return true;
    }, [activeChain, activeChainInfo.chainId, totalDelegation]);

    const filteredProposalList: Proposal[] = useMemo(
      () =>
        (_proposalList as any[] || [])
          .filter((proposal) => proposal.status !== 'PROPOSAL_STATUS_DEPOSIT_PERIOD')
          .reduce((acc, cur) => {
            if (filter === 'all') {
              if (!propFilter) acc.push(cur);
              else if (
                cur.content?.title?.toLowerCase().includes(propFilter) ||
                cur.title?.toLowerCase().includes(propFilter) ||
                cur.proposal_id?.toLowerCase().includes(propFilter)
              ) {
                acc.push(cur);
              }
            } else {
              if (!propFilter && cur.status === filter) {
                acc.push(cur);
              } else if (
                cur.status === filter &&
                (cur.content?.title?.toLowerCase().includes(propFilter) ||
                  cur.title?.toLowerCase().includes(propFilter) ||
                  cur.proposal_id?.toLowerCase().includes(propFilter))
              ) {
                acc.push(cur);
              }
            }
            return acc;
          }, []),
      [filter, propFilter, _proposalList],
    );

    const onFilterClick = useCallback((key: string) => {
      setFilter(key);
      setShowFilter(false);
    }, []);

    // Infinite scroll for FlatList
    const handleEndReached = () => {
      if (proposalListStatus === 'success' && filteredProposalList.length > 0) {
        fetchMore();
      }
    };

    const { headerChainImgSrc } = useChainPageInfo();

    // UI rendering
    return (
      <View style={styles.root}>
        <PopupLayout
          header={
            <Header
              action={{
                onClick: () => {
                  // Use your navigation.goBack or equivalent
                },
                type: HeaderActionType.BACK,
              }}
              imgSrc={headerChainImgSrc}
              onImgClick={() => setShowChainSelector(true)}
              title={'Governance'}
            />
          }
        >
          <View>
            <TestnetAlertStrip />
            <View style={styles.headerSection}>
              <Text style={styles.headerTitle}>Proposals</Text>
              <Text style={styles.headerSubTitle}>
                List of proposals in {activeChainInfo?.chainName ?? ''}
              </Text>
              {!hasMinAmountStaked && <RequireMinStaking />}
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search proposals..."
                  value={propFilter}
                  onChangeText={text => setPropFilter(text.toLowerCase())}
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(true)}>
                  <Sort size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.listSection}>
              <View style={styles.proposalsListContainer}>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <GovCardSkeleton key={index} isLast={index === 4} />
                  ))
                ) : (filteredProposalList?.length ?? 0) === 0 ? (
                  <EmptyCard
                    isRounded
                    subHeading={propFilter ? 'Please try again with something else' : ''}
                    heading={propFilter ? `No results for “${sliceSearchWord(propFilter)}”` : 'No Proposals'}
                    src={Images.Misc.Explore}
                  />
                ) : (
                  <FlatList
                    data={filteredProposalList}
                    keyExtractor={item => item.proposal_id}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.1}
                    renderItem={({ item, index }) => (
                      <Fragment key={item.proposal_id}>
                        <TouchableOpacity style={styles.cardTouchable} onPress={() => onClick(item.proposal_id)}>
                          <View style={styles.cardContentRow}>
                            <View style={[styles.cardLeft]}>
                              <View>
                                <Text style={styles.cardTitle}>{item?.content?.title ?? item?.content?.title}</Text>
                                <Text style={styles.cardSubtitle}>
                                  #{item.proposal_id} · <ProposalStatus status={item.status as ProposalStatusEnum} />
                                </Text>
                              </View>
                            </View>
                            <Image source={{uri: Images.Misc.RightArrow}} style={styles.cardRightArrow} />
                          </View>
                        </TouchableOpacity>
                        {index < filteredProposalList.length - 1 ? <CardDivider /> : null}
                      </Fragment>
                    )}
                  />
                )}
              </View>
              {proposalListStatus === 'fetching-more' && (
                <View style={styles.loaderRow}>
                  <LoaderAnimation color="white" />
                </View>
              )}
            </View>
          </View>
        </PopupLayout>
        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
        />
        <BottomModal isOpen={showFilter} onClose={() => setShowFilter(false)} title="Filter by">
          <View style={styles.filterModalContainer}>
            {filters.map((_filter, index) => (
              <Fragment key={_filter.label}>
                <TouchableOpacity
                  style={styles.filterModalButton}
                  onPress={() => onFilterClick(_filter.key)}
                >
                  <Text style={styles.filterModalText}>{_filter.label}</Text>
                  {filter === _filter.key ? (
                    <CheckCircle weight="fill" size={24} color="#E18881" />
                  ) : null}
                </TouchableOpacity>
                {index < filters.length - 1 ? <CardDivider /> : null}
              </Fragment>
            ))}
          </View>
        </BottomModal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  headerSection: { paddingTop: 24, paddingBottom: 10, paddingHorizontal: 16 },
  headerTitle: { fontSize: 28, color: '#222', fontWeight: 'bold', marginBottom: 2 },
  headerSubTitle: { fontSize: 14, color: '#666', fontWeight: 'bold', marginBottom: 8 },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 12 },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222',
    borderWidth: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  listSection: { paddingHorizontal: 16, flex: 1 },
  proposalsListContainer: {
    borderRadius: 16,
    backgroundColor: '#fff',
    paddingVertical: 6,
    // You might want to add elevation/shadow for card effect
  },
  cardTouchable: { paddingVertical: 12 },
  cardContentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { width: 272 },
  cardLeftPanel: { width: '95%' },
  cardTitle: { color: '#222', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  cardSubtitle: { color: '#666', fontSize: 12 },
  cardRightArrow: { width: 20, height: 20, marginLeft: 16 },
  loaderRow: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  filterModalContainer: {
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  filterModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
  },
  filterModalText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
});

