import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Linking, ScrollView, Platform } from 'react-native';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useChainInfo,
  useGetProposal,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import { axiosWrapper, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { GovStore, Proposal, ProposalApi } from '@leapwallet/cosmos-wallet-store';
import { ArrowSquareOut } from 'phosphor-react-native';
import { captureException } from '@sentry/react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ProposalDescription } from '../../../components/proposal-description';
import Text from '../../../components/text';
import { Button } from '../../../components/ui/button';
import { useChainPageInfo } from '../../../hooks';
import useActiveWallet from '../../../hooks/settings/useActiveWallet';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import Vote from '../../../../assets/icons/vote';
import { observer } from 'mobx-react-lite';
// Use a React Native skeleton and chart library!
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { PieChart } from 'react-native-svg-charts';
import { importWatchWalletSeedPopupStore } from '../../../context/import-watch-wallet-seed-popup-store';
import { delegationsStore } from '../../../context/stake-store';
import { getPercentage } from '../utils';
import GovHeader from './GovHeader';
import { CastVote, RequireMinStaking, ShowVotes, Turnout, VoteDetails } from './index';
import { ProposalStatus, ProposalStatusEnum } from './ProposalStatus';

export type ProposalDetailsProps = {
  selectedProp: string | undefined;
  onBack: () => void;
  forceChain?: SupportedChain;
  forceNetwork?: 'mainnet' | 'testnet';
  governanceStore: GovStore;
};

const activeProposalStatusTypes = [
  ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD,
  ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD,
];

export const ProposalDetails = observer(
  ({ selectedProp, onBack, forceChain, forceNetwork, governanceStore }: ProposalDetailsProps) => {
    const { data: proposalList, shouldUseFallback } = governanceStore.chainProposals;

    const _activeChain = useActiveChain();
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
    const _selectedNetwork = useSelectedNetwork();
    const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [_selectedNetwork, forceNetwork]);
    const { activeWallet } = useActiveWallet();
    const address = useAddress(activeChain);
    const activeChainInfo = useChainInfo(activeChain);
    const { lcdUrl, txUrl } = useChainApis(activeChain, selectedNetwork);
    const [showCastVoteSheet, setShowCastVoteSheet] = useState<boolean>(false);
    const defaultTokenLogo = useDefaultTokenLogo();

    const { delegationInfo } = delegationsStore.delegationsForChain(activeChain);
    const hasMinAmountStaked = useMemo(() => {
      if (activeChain === 'cosmos' || activeChainInfo.chainId === 'atomone-1') {
        return delegationInfo?.totalDelegation?.gte(1);
      }
      return true;
    }, [activeChain, delegationInfo?.totalDelegation, activeChainInfo.chainId]);

    const { topChainColor } = useChainPageInfo();
    const proposal = useMemo(
      () => (proposalList as any[]).find((prop) => prop.proposal_id === selectedProp),
      [proposalList, selectedProp],
    );

    const isProposalInVotingPeriod = useMemo(() => {
      return [
        ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD,
        ProposalStatusEnum.PROPOSAL_STATUS_IN_PROGRESS,
      ].includes(proposal.status);
    }, [proposal.status]);

    const {
      data: currVote,
      refetch,
      isLoading,
    } = useQuery(
      ['currVote', activeChain, address, selectedProp],
      async (): Promise<string | undefined> => {
        if (activeChain) {
          try {
            const { data } = await axios.post(
              `${process.env.LEAP_WALLET_BACKEND_API_URL}/gov/vote/${activeChainInfo.chainId}/${selectedProp}`,
              { userAddress: address },
            );
            return data;
          } catch (error: any) {
            try {
              let prefix = '/cosmos';
              if (activeChainInfo?.chainId === 'govgen-1') {
                prefix = '/govgen';
              }
              if (activeChainInfo?.chainId === 'atomone-1') {
                prefix = '/atomone';
              }
              const data = await axiosWrapper(
                {
                  baseURL: lcdUrl ?? '',
                  method: 'get',
                  url: `${prefix}/gov/v1beta1/proposals/${selectedProp}/votes/${address}`,
                },
                1,
                'proposals-votes',
              );
              const voteOption = data.data.vote.options[0].option;
              return voteOption.replace('VOTE_OPTION_', '');
            } catch (error: any) {
              if (error.response.data.code === 3 || error.response.data.error?.code === -32700) {
                return 'NO_VOTE';
              } else {
                captureException(error);
                throw new Error(error);
              }
            }
          }
        }
      },
      {
        retry: (failureCount) => failureCount !== 2,
        enabled: isProposalInVotingPeriod,
      },
    );

    let { data: _proposalVotes, status } = useGetProposal(
      proposal.proposal_id,
      shouldUseFallback,
      activeChain,
      selectedNetwork,
    );

    status = shouldUseFallback ? status : 'success';
    const { yes, no, abstain, no_with_veto } = (proposal.tally || _proposalVotes || proposal.final_tally_result) as any;
    const totalVotes = [yes, no, abstain, no_with_veto].reduce((sum, val) => sum + Number(val ?? 0), 0) || 1;

    const dataMock = useMemo(() => {
      if (!totalVotes) {
        return [{ title: 'loading', value: 1, color: '#ccc', percent: '0%' }];
      }
      const data = [
        {
          title: 'YES',
          value: +yes,
          color: '#29A874',
          percent: getPercentage(+yes, totalVotes),
        },
        {
          title: 'NO',
          value: +no,
          color: '#FF707E',
          percent: getPercentage(+no, totalVotes),
        },
      ];
      if (activeChainInfo.chainId !== 'atomone-1') {
        data.push({
          title: 'No with Veto',
          value: +no_with_veto,
          color: '#8583EC',
          percent: getPercentage(+no_with_veto, totalVotes),
        });
      }
      data.push({
        title: 'Abstain',
        value: +abstain,
        color: '#D1A700',
        percent: getPercentage(+abstain, totalVotes),
      });
      return data;
    }, [abstain, no, no_with_veto, totalVotes, yes, activeChainInfo.chainId]);

    const tallying = useMemo(() => {
      let votingPower = (_proposalVotes as any)?.bonded_tokens;
      if (
        ['initia', 'initiaEvm'].includes(activeChain) &&
        Array.isArray(votingPower) &&
        Array.isArray((_proposalVotes as any)?.voting_power_weights)
      ) {
        const bondedTokens: { amount: string; denom: string }[] = (_proposalVotes as any)?.bonded_tokens;
        const votingPowerWeights = (_proposalVotes as any)?.voting_power_weights;
        votingPower = bondedTokens
          .reduce((acc: bigint, val: { amount: string; denom: string }) => {
            const individualVotingPowerWeight = votingPowerWeights?.find(
              (votingPowerWeight: { amount: string; denom: string }) => votingPowerWeight.denom === val.denom,
            )?.amount;
            if (!individualVotingPowerWeight) {
              return acc;
            }
            acc += BigInt(parseInt(val.amount)) * BigInt(parseInt(individualVotingPowerWeight));
            return acc;
          }, BigInt(0))
          ?.toString();
      }

      return [
        {
          label: 'Turnout',
          value: !shouldUseFallback ? proposal.turnout : (totalVotes / votingPower) * 100,
        },
        {
          label: 'Quorum',
          value: !shouldUseFallback ? proposal.quorum : (_proposalVotes as any)?.quorum * 100,
        },
      ];
    }, [_proposalVotes, activeChain, proposal.quorum, proposal.turnout, shouldUseFallback, totalVotes]);

    const proposer = useMemo(() => {
      if (!shouldUseFallback) {
        return proposal?.proposer?.address
          ? {
              address: proposal?.proposer?.address,
              url: proposal?.proposer?.url ?? `${txUrl?.replace('txs', 'account')}/${proposal?.proposer?.address}`,
            }
          : undefined;
      }
      return _proposalVotes?.proposer?.depositor
        ? {
            address: _proposalVotes?.proposer?.depositor as string,
            url: _proposalVotes?.proposerTxUrl as string | undefined,
          }
        : undefined;
    }, [
      _proposalVotes?.proposer?.depositor,
      _proposalVotes?.proposerTxUrl,
      proposal?.proposer?.address,
      proposal?.proposer?.url,
      shouldUseFallback,
      txUrl,
    ]);

    return (
      <View style={styles.container}>
        <GovHeader onBack={onBack} title="Proposal" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.statusText}>
              #{proposal.proposal_id} · <ProposalStatus status={proposal.status as ProposalStatusEnum} />
            </Text>
          </View>
          <Text style={styles.proposalTitle}>
            {proposal?.title ?? proposal?.content?.title}
          </Text>

          {proposal.status === ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD && !hasMinAmountStaked && (
            <RequireMinStaking forceChain={activeChain} forceNetwork={selectedNetwork} />
          )}

          <VoteDetails
            proposal={proposal}
            activeChain={activeChain}
            onVote={() => {
              if (activeWallet?.watchWallet) {
                importWatchWalletSeedPopupStore.setShowPopup(true);
              } else {
                setShowCastVoteSheet(true);
              }
            }}
            currVote={currVote ?? ''}
            isLoading={isLoading}
            hasMinStaked={hasMinAmountStaked}
          />

          {/* Pie Chart and voting details */}
          {proposal.status !== ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD && totalVotes ? (
            <>
              <View style={styles.pieChartContainer}>
                {status !== 'success' ? (
                  <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item width={180} height={180} borderRadius={90} />
                  </SkeletonPlaceholder>
                ) : (
                  <PieChart style={{ height: 180, width: 180 }} data={dataMock} innerRadius={70} />
                )}
                <Text style={styles.currentStatusLabel}>Current Status</Text>
              </View>
              <ShowVotes dataMock={dataMock} chain={activeChainInfo} />
              <Turnout tallying={tallying} />
            </>
          ) : null}

          {/* Proposer section */}
          {activeProposalStatusTypes.includes(proposal.status) && proposer?.address && (
            <View style={[styles.proposerCard, proposal.status !== ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD && { marginTop: 28 }]}>
              <View style={styles.proposerInfoRow}>
                <View style={styles.avatarContainer}>
                  <Text style={{ fontSize: 22 }}>👤</Text>
                  <Image
                    source={{ uri: activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo }}
                    onError={() => {}} // Add your imgOnError logic
                    style={styles.chainLogo}
                  />
                </View>
                <View style={styles.proposerTextCol}>
                  <Text style={styles.proposerTitle}>Proposer</Text>
                  {proposer ? (
                    <Text style={styles.proposerAddress}>
                      {`${proposer.address.slice(0, 5)}...${proposer.address.slice(-6)}`}
                    </Text>
                  ) : (
                    <SkeletonPlaceholder>
                      <SkeletonPlaceholder.Item width={150} height={16} />
                    </SkeletonPlaceholder>
                  )}
                </View>
              </View>
              {proposer?.url && (
                <TouchableOpacity style={styles.linkIcon} onPress={() => Linking.openURL(proposer.url)}>
                  <ArrowSquareOut size={18} color="#8e99af" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Description */}
          {(proposal?.description || proposal?.content?.description) && (
            <ProposalDescription
              description={proposal?.description || proposal?.content?.description}
              title="Description"
              btnColor={topChainColor}
              forceChain={activeChain}
            />
          )}
        </ScrollView>

        {/* Sticky Vote Button */}
        {(proposal as Proposal | ProposalApi).status === ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD && (
          <View style={styles.stickyFooter}>
            <Button
              style={styles.voteButton}
              onPress={() => {
                if (activeWallet?.watchWallet) {
                  importWatchWalletSeedPopupStore.setShowPopup(true);
                } else {
                  setShowCastVoteSheet(true);
                }
              }}
              disabled={!hasMinAmountStaked}
            >
              <View style={styles.voteButtonContent}>
                <Vote size={20} style={styles.voteIcon} />
                <Text style={styles.voteText}>Vote</Text>
              </View>
            </Button>
          </View>
        )}

        {/* Cast Vote Sheet */}
        <CastVote
          refetchVote={refetch}
          proposalId={proposal.proposal_id}
          isProposalInVotingPeriod={isProposalInVotingPeriod}
          showCastVoteSheet={showCastVoteSheet}
          setShowCastVoteSheet={setShowCastVoteSheet}
          forceChain={activeChain}
          forceNetwork={selectedNetwork}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20 },
  headerRow: { marginBottom: 8 },
  statusText: { color: '#8e99af', fontSize: 14, fontWeight: '500' },
  proposalTitle: { color: '#22272e', fontWeight: 'bold', fontSize: 18, marginBottom: 12 },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 12,
    position: 'relative',
  },
  currentStatusLabel: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: '#22272e',
  },
  proposerCard: {
    borderRadius: 24,
    height: 80,
    width: '100%',
    padding: 20,
    backgroundColor: '#f2f4fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  proposerInfoRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    backgroundColor: '#FFECA8',
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chainLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  proposerTextCol: { marginLeft: 12, flexDirection: 'column' },
  proposerTitle: { fontWeight: 'bold', color: '#22272e', fontSize: 14 },
  proposerAddress: { color: '#8e99af', fontSize: 12 },
  linkIcon: { padding: 8 },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 24 : 0,
    backgroundColor: '#f2f4fa',
    padding: 16,
  },
  voteButton: { width: '100%', borderRadius: 12 },
  voteButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  voteIcon: { marginRight: 8 },
  voteText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

