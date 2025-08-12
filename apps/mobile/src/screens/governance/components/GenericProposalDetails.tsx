import { Proposal, ProposalApi } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import React from 'react';

import { NtrnProposalDetails } from '../neutron';        // <- should be your React Native version
import { ProposalDetails } from './index';               // <- should be your React Native version

type GenericProposalDetailsProps = {
  selectedProposalChain: SupportedChain;
  selectedProposalId: string;
  handleProposalDetailsBack: () => void;
  allProposals: (Proposal | ProposalApi)[];
  shouldUseFallback: boolean;
  forceNetwork: 'mainnet' | 'testnet';
};

export default function GenericProposalDetails({
  selectedProposalChain,
  selectedProposalId,
  handleProposalDetailsBack,
  allProposals,
  shouldUseFallback,
  forceNetwork,
}: GenericProposalDetailsProps) {
  if (selectedProposalChain === 'neutron') {
    return (
      <NtrnProposalDetails
        selectedProp={selectedProposalId}
        onBack={handleProposalDetailsBack}
        proposalList={allProposals}
        shouldUseFallback={shouldUseFallback}
        forceChain={selectedProposalChain}
        forceNetwork={forceNetwork}
      />
    );
  }

  return (
    <ProposalDetails
      selectedProp={selectedProposalId}
      onBack={handleProposalDetailsBack}
      forceChain={selectedProposalChain}
      forceNetwork={forceNetwork}
      governanceStore={{
        chainProposals: {
          data: allProposals as ProposalApi[] | Proposal[],
          shouldUseFallback,
        },
      }}
    />
  );
}
