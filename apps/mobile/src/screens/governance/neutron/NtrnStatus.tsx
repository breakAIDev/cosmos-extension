import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { ProposalStatusEnum } from '../components';

export enum NtrnProposalStatus {
  OPEN = 'open',
  EXECUTED = 'executed',
  PASSED = 'passed',
  REJECTED = 'rejected',
}

type NtrnStatusProps = {
  status: NtrnProposalStatus | ProposalStatusEnum;
};

export function NtrnStatus({ status }: NtrnStatusProps) {
  switch (status) {
    case NtrnProposalStatus.OPEN:
    case ProposalStatusEnum.PROPOSAL_STATUS_IN_PROGRESS:
    case ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD:
      return (
        <Text style={[styles.status, styles.inProgress]}>
          In Progress
        </Text>
      );
    case NtrnProposalStatus.PASSED:
    case NtrnProposalStatus.EXECUTED:
    case ProposalStatusEnum.PROPOSAL_STATUS_PASSED:
    case ProposalStatusEnum.PROPOSAL_STATUS_EXECUTED:
      return (
        <Text style={[styles.status, styles.executed]}>
          Executed
        </Text>
      );
    case ProposalStatusEnum.PROPOSAL_STATUS_FAILED:
    case ProposalStatusEnum.PROPOSAL_STATUS_REJECTED:
    case NtrnProposalStatus.REJECTED:
      return (
        <Text style={[styles.status, styles.rejected]}>
          Rejected
        </Text>
      );
    default:
      return (
        <Text style={[styles.status, styles.unspecified]}>
          Unspecified
        </Text>
      );
  }
}

const styles = StyleSheet.create({
  status: {
    fontWeight: '600',
    fontSize: 14,
  },
  inProgress: {
    color: '#ea8800', // orange-600
    // If you want to handle dark mode, you can inject a prop or use a hook (see below)
  },
  executed: {
    color: '#29A874', // green-600
  },
  rejected: {
    color: '#FF707E', // red-300
  },
  unspecified: {
    color: '#BDBDBD', // gray-400
  },
});