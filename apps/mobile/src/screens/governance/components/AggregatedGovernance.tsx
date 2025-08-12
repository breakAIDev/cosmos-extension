import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { CompassIcon } from '../../../../assets/icons/compass-icon';

import { filterSearchedProposal, sortProposal } from '../utils';
import GenericProposalDetails from './GenericProposalDetails';

import { useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ChainTagsStore, GovStore } from '@leapwallet/cosmos-wallet-store';
import { ProposalCard } from './index';

const NETWORK = 'mainnet';

export type ProposalsProps = {
  governanceStore: GovStore;
  chainTagsStore: ChainTagsStore;
};

export const AggregatedGovernance = observer(({ governanceStore, chainTagsStore }: ProposalsProps) => {
  const [searchedText, setSearchedText] = useState('');
  const [selectedProposalId, setSelectedProposalId] = useState<string | undefined>();
  const [shouldUseFallback, setShouldUseFallback] = useState(false);const [selectedProposalChain, setSelectedProposalChain] = useState<SupportedChain | undefined>();


  // Replace with your MobX state logic as needed
  const { votingProposals, nonVotingProposals, perChainShouldUseFallback } = governanceStore.aggregatedGov;
  const isLoading = governanceStore.aggregatedGovStatus;
  const chains = useGetChains();; // replace with useGetChains or MobX observable, as needed

  // Filtering & sorting logic remains the same
  const allProposals = useMemo(() => {
    const formattedVotingProposals = votingProposals
      .filter((proposal) => filterSearchedProposal(proposal, searchedText, chains))
      .sort((a, b) => sortProposal(a, b, chains));

    const formattedNonVotingProposals = nonVotingProposals
      .filter((proposal) => filterSearchedProposal(proposal, searchedText, chains))
      .sort((a, b) => sortProposal(a, b, chains));

    return [...formattedVotingProposals, ...formattedNonVotingProposals];
  }, [votingProposals, nonVotingProposals, searchedText, chains]);

  const handleProposalCardClick = useCallback((proposalId: string, chain: SupportedChain) => {
    setSelectedProposalId(proposalId);
    setShouldUseFallback(perChainShouldUseFallback[chain]);
    setSelectedProposalChain(chain);
  }, [perChainShouldUseFallback]);

  const handleProposalDetailsBack = useCallback(() => {
    setSelectedProposalId(undefined);
    setSelectedProposalChain(undefined);
    setShouldUseFallback(false);
  }, []);

  if (selectedProposalId && selectedProposalChain) {
    return (
      <GenericProposalDetails
        selectedProposalChain={selectedProposalChain}
        selectedProposalId={selectedProposalId}
        handleProposalDetailsBack={handleProposalDetailsBack}
        allProposals={allProposals}
        forceNetwork={NETWORK}
        shouldUseFallback={shouldUseFallback}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header (Replace with your custom header if needed) */}
      {/* <GovHeader /> */}
      <Text style={styles.headerText}>Governance Proposals</Text>
      
      {/* Search input */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search proposal"
          value={searchedText}
          onChangeText={setSearchedText}
          style={styles.input}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Proposals list or skeleton */}
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View>
            {/* Show 5 skeletons */}
            {[...Array(5)].map((_, i) => (
              <View style={{ marginBottom: 8 }} key={i}>
                {/* <GovCardSkeleton isLast={i === 4} aggregatedView /> */}
                <View style={styles.skeletonBox} />
              </View>
            ))}
          </View>
        ) : allProposals.length > 0 ? (
          <FlatList
            data={allProposals}
            keyExtractor={(item) => String(item.proposal_id)}
            renderItem={({ item }) => (
              <ProposalCard
                proposal={item}
                handleClick={() =>
                  handleProposalCardClick(
                    item.proposal_id,
                    (item?.chain || 'cosmos') as SupportedChain,
                  )
                }
              />
            )}
            style={{ flexGrow: 1 }}
          />
        ) : (
          <View style={styles.emptyBox}>
            <View style={styles.iconCircle}>
              <CompassIcon size={40} color="#a1a1aa" />
            </View>
            <Text style={styles.noProposalText}>No proposals found</Text>
            {searchedText.trim().length > 0 ? (
              <Text style={styles.noMatchText}>
                We couldn't find a match. Try searching again or use a different keyword.
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 30 },
  headerText: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  searchBox: { marginBottom: 20 },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  skeletonBox: {
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    marginVertical: 4,
  },
  cardBox: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    marginTop: 40,
  },
  iconCircle: {
    backgroundColor: '#e0e7ff',
    borderRadius: 100,
    padding: 12,
    marginBottom: 12,
  },
  noProposalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b',
    textAlign: 'center',
    marginBottom: 4,
  },
  noMatchText: {
    fontSize: 12,
    color: '#52525b',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default AggregatedGovernance;
