import { Proposal, ProposalApi } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

type GovProposal = Proposal | ProposalApi;

export function sortProposal(
  itemA: GovProposal,
  itemB: GovProposal,
  chains: Record<SupportedChain, { chainName: string }>
) {
  const chainA = (itemA.chain ?? 'cosmos') as SupportedChain;
  const chainB = (itemB.chain ?? 'cosmos') as SupportedChain;

  const chainNameA = chains[chainA].chainName;
  const chainNameB = chains[chainB].chainName;

  const nameCmp = chainNameA.localeCompare(chainNameB);
  if (nameCmp !== 0) return nameCmp;

  const idA = Number(itemA.proposal_id ?? 0);
  const idB = Number(itemB.proposal_id ?? 0);
  return idB - idA; // newer proposals first
}