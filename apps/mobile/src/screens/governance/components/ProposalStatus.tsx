import React from 'react';
import { Text, StyleSheet } from 'react-native';

export enum ProposalStatusEnum {
  PROPOSAL_STATUS_IN_PROGRESS = 'PROPOSAL_STATUS_IN_PROGRESS',
  PROPOSAL_STATUS_DEPOSIT_PERIOD = 'PROPOSAL_STATUS_DEPOSIT_PERIOD',
  PROPOSAL_STATUS_VOTING_PERIOD = 'PROPOSAL_STATUS_VOTING_PERIOD',
  PROPOSAL_STATUS_PASSED = 'PROPOSAL_STATUS_PASSED',
  PROPOSAL_STATUS_EXECUTED = 'PROPOSAL_STATUS_EXECUTED',
  PROPOSAL_STATUS_FAILED = 'PROPOSAL_STATUS_FAILED',
  PROPOSAL_STATUS_REJECTED = 'PROPOSAL_STATUS_REJECTED',
  PROPOSAL_STATUS_UNSPECIFIED = 'PROPOSAL_STATUS_UNSPECIFIED',
}

export type ProposalStatusProps = {
  status: ProposalStatusEnum;
};

export function ProposalStatus({ status }: ProposalStatusProps): JSX.Element {
  switch (status) {
    case ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD:
      return <Text style={[styles.status, styles.orange]}>Deposit Period</Text>;
    case ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD:
      return <Text style={[styles.status, styles.orange]}>Voting Period</Text>;
    case ProposalStatusEnum.PROPOSAL_STATUS_PASSED:
      return <Text style={[styles.status, styles.green]}>Passed</Text>;
    case ProposalStatusEnum.PROPOSAL_STATUS_FAILED:
      return <Text style={[styles.status, styles.red]}>Failed</Text>;
    case ProposalStatusEnum.PROPOSAL_STATUS_REJECTED:
      return <Text style={[styles.status, styles.red]}>Rejected</Text>;
    case ProposalStatusEnum.PROPOSAL_STATUS_UNSPECIFIED:
      return <Text style={[styles.status, styles.gray]}>Unspecified</Text>;
    default:
      return <Text style={[styles.status, styles.gray]}>Unspecified</Text>;
  }
}

const styles = StyleSheet.create({
  status: {
    fontWeight: '600',
    fontSize: 14,
  },
  orange: {
    color: '#f59e42', // Orange-600
  },
  green: {
    color: '#29A874',
  },
  red: {
    color: '#FF707E',
  },
  gray: {
    color: '#8e99af',
  },
});
