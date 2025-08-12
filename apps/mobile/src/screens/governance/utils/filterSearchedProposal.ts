import { Proposal, ProposalApi } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export function filterSearchedProposal(
  proposal: Proposal | ProposalApi,
  searchedText: string,
  chains: Record<SupportedChain, { chainName: string }>,
): boolean {
  if (!searchedText) return true;

  const formatted = searchedText.trim().toLowerCase();

  // 1. Match chain name
  const chainName = proposal.chain
    ? chains[proposal.chain as SupportedChain]?.chainName ?? ''
    : '';
  if (chainName.toLowerCase().includes(formatted)) return true;

  // 2. Match proposal title
  const proposalTitle =
    (proposal as ProposalApi)?.title ??
    (proposal as Proposal)?.content?.title ??
    '';
  if (proposalTitle.toLowerCase().includes(formatted)) return true;

  // 3. Match proposal_id
  if (proposal?.proposal_id?.toString().includes(formatted)) return true;

  // 4. Match status
  if ((proposal?.status ?? '').toString().toLowerCase().includes(formatted)) return true;

  return false;
}
