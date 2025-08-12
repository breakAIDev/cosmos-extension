import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Proposal, ProposalApi, useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import Text from '../../../components/text'; // Assuming your custom Text component
import { ProposalStatus, ProposalStatusEnum } from './ProposalStatus';

type ProposalCardProps = {
  proposal: Proposal | ProposalApi;
  style?: ViewStyle;
  handleClick: () => void;
};

export function ProposalCard({ proposal, style, handleClick }: ProposalCardProps) {
  const chainInfo = useChainInfo((proposal.chain ?? 'cosmos') as SupportedChain);

  const proposalTitle =
    (proposal as ProposalApi)?.title ?? (proposal as Proposal)?.content?.title;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handleClick}
      activeOpacity={0.85}
    >
      <Text style={styles.chainName}>
        {chainInfo?.chainName ?? 'Unknown Chain'}
      </Text>
      <Text style={styles.title} numberOfLines={2}>
        {proposalTitle}
      </Text>
      <View style={styles.statusRow}>
        <Text style={styles.statusText}>
          #{proposal.proposal_id} ·{' '}
        </Text>
        <ProposalStatus status={proposal.status as ProposalStatusEnum} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 20,
    width: '100%',
    backgroundColor: '#f2f4fa', // secondary-100
    borderRadius: 16,
    marginBottom: 24,
    // You can use elevation or shadow for iOS/Android
    // elevation: 1,
  },
  chainName: {
    color: '#8e99af', // text-muted-foreground
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  title: {
    color: '#22272e', // text-foreground
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#8e99af', // text-muted-foreground
    fontSize: 14,
    fontWeight: '500',
  },
});
