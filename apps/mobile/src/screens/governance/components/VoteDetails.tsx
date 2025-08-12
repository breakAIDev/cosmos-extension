import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThumbsUp } from 'phosphor-react-native';
import dayjs from 'dayjs';

import Text from '../../../components/text';
import { Proposal, ProposalApi } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { convertTime, voteRatio } from '../utils';
import { ProposalStatusEnum } from './ProposalStatus';

type VoteDetailsProps = {
  proposal: Proposal | ProposalApi;
  currVote: string;
  isLoading: boolean;
  activeChain: SupportedChain;
  onVote: () => void;
  hasMinStaked: boolean;
};

export function VoteDetails({
  currVote,
  proposal,
  isLoading,
  activeChain,
  hasMinStaked,
  onVote,
}: VoteDetailsProps) {
  const [timeLeft, setTimeLeft] = useState<string | undefined>();

  useEffect(() => {
    const getTime = () => {
      const now = dayjs();
      const end = dayjs(
        proposal.status === ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD
          ? proposal.deposit_end_time
          : proposal.voting_end_time,
      );
      const duration = end.diff(now, 'seconds');
      setTimeLeft(convertTime(duration));
    };

    getTime(); // call once immediately
    const i = setInterval(getTime, 1000);
    return () => clearInterval(i);
  }, [proposal]);

  if (
    proposal.status === ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD
  ) {
    return (
      <>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Voting Starts</Text>
            <Text style={styles.bold}>
              {dayjs(proposal.voting_start_time).format('MMM DD, YYYY')}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Voting Ends</Text>
            <Text style={styles.bold}>
              {dayjs(proposal.voting_end_time).format('MMM DD, YYYY')}
            </Text>
          </View>
          {timeLeft ? (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Ending in</Text>
                <Text style={styles.bold}>{timeLeft}</Text>
              </View>
            </>
          ) : null}
        </View>
        {currVote && currVote !== 'NO_VOTE' && (
          <View style={styles.voteChip}>
            <View style={styles.voteChipIcon}>
              <ThumbsUp size={16} color="#22744d" />
            </View>
            <View style={styles.voteChipTextCol}>
              <Text style={styles.voteChipTitle}>Vote submitted</Text>
              <Text style={styles.voteChipSub}>
                Voted {currVote}
              </Text>
            </View>
          </View>
        )}
      </>
    );
  }

  if (proposal.status === ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD) {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Deposit Period Ends</Text>
          <Text style={styles.bold}>
            {dayjs(proposal.deposit_end_time).format('MMM DD, YYYY')}
          </Text>
        </View>
        {timeLeft ? (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Ending in</Text>
              <Text style={styles.bold}>{timeLeft}</Text>
            </View>
          </>
        ) : null}
      </View>
    );
  }

  if (
    proposal.status === ProposalStatusEnum.PROPOSAL_STATUS_PASSED ||
    proposal.status === ProposalStatusEnum.PROPOSAL_STATUS_FAILED ||
    proposal.status === ProposalStatusEnum.PROPOSAL_STATUS_REJECTED
  ) {
    return (
      <View style={[styles.card, { padding: 20 }]}>
        <Text style={[styles.label, { marginBottom: 16, fontWeight: 'bold' }]}>Results</Text>
        <View style={{ flexDirection: 'column', gap: 10 }}>
          {voteRatio((proposal as ProposalApi).tally || proposal.final_tally_result).map((values) => (
            <View key={values.label} style={[styles.resultRow, {
              borderColor: values.selectedBorderColor,
              backgroundColor: values.selectedBackgroundColor ? values.selectedBackgroundColor + '22' : '#fff',
            }]}>
              {/* Color Bar */}
              <View style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: Math.max(4, values.percentage * 3.12),
                backgroundColor: values.selectedBackgroundColor,
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
                opacity: 0.18,
              }} />
              {/* Main content */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', zIndex: 1 }}>
                <Text style={[styles.bold, { marginLeft: 12 }]}>{values.label}</Text>
                <View style={{ flex: 1 }} />
                <Text style={[styles.bold, { marginRight: 12 }]}>{values.percentage.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return <></>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#f2f4fa', // secondary-100
    marginTop: 28,
    flexDirection: 'column',
    overflow: 'hidden',
    paddingVertical: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  label: {
    color: '#22272e', // secondary-800
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
    color: '#22272e',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#d9dbe8', // secondary-300
    marginHorizontal: 20,
  },
  voteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#82d9a2', // bg-green-300
    borderColor: '#29A874',     // border-green-600
    borderWidth: 2,
    borderRadius: 18,
    marginTop: 16,
    marginBottom: 8,
    width: 344,
    alignSelf: 'center',
    padding: 12,
  },
  voteChipIcon: {
    height: 40,
    width: 40,
    backgroundColor: '#A5DFB1', // bg-green-400
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteChipTextCol: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  voteChipTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  voteChipSub: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
    fontWeight: '500',
  },
  resultRow: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
    position: 'relative',
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
});
