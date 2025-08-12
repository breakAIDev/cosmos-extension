import {
  Proposal,
  ProposalApi,
  useActiveChain,
  useAddress,
  useChainApis,
  useChainsStore,
} from '@leapwallet/cosmos-wallet-hooks';
import { getNeutronProposalVote, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Buttons } from '@leapwallet/leap-ui';
import { ArrowSquareOut, ThumbsUp, User } from 'phosphor-react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ProposalDescription } from '../../../components/proposal-description';
import Text from '../../../components/text';
import { Button } from '../../../components/ui/button';
import dayjs from 'dayjs';
import useActiveWallet from '../../../hooks/settings/useActiveWallet';
import { useSelectedNetwork } from '../../../hooks/settings/useNetwork';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import Vote from '../../../../assets/icons/vote';
import React, { useEffect, useMemo, useState } from 'react';
import { importWatchWalletSeedPopupStore } from '../../../context/import-watch-wallet-seed-popup-store';
import { Colors, getChainColor } from '../../../theme/colors';

import { ProposalStatusEnum, ShowVotes, Turnout } from '../components';
import GovHeader from '../components/GovHeader';
import { convertTime, getPercentage, voteRatio } from '../utils';
import { NtrnCastVote, NtrnStatus } from './index';
import { NtrnProposalStatus } from './NtrnStatus';
import {
  getDescription,
  getEndTime,
  getId,
  getProposer,
  getQuorum,
  getStatus,
  getTitle,
  getTurnout,
  getVotes,
  VoteOptions,
} from './utils';

import { View, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import PieChart from 'react-native-pie-chart';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type VoteDetailsProps = {
  proposal: any;
  onVote: () => void;
  currVote: string;
  isLoading: boolean;
  shouldUseFallback: boolean;
  forceChain?: SupportedChain;
};

export function VoteDetails({
  proposal,
  onVote,
  currVote,
  isLoading,
  shouldUseFallback,
  forceChain,
}: VoteDetailsProps) {
  const [timeLeft, setTimeLeft] = useState<string | undefined>();

  useEffect(() => {
    const getTime = () => {
      const now = dayjs();
      const end = dayjs(getEndTime(proposal, shouldUseFallback));
      const duration = end.diff(now, 'seconds');
      setTimeLeft(convertTime(duration));
    };
    getTime();
    const intervalId = setInterval(getTime, 1000);
    return () => clearInterval(intervalId);
  }, [proposal, shouldUseFallback]);

  const status = getStatus(proposal, shouldUseFallback);

  if (
    status === NtrnProposalStatus.OPEN ||
    status === ProposalStatusEnum.PROPOSAL_STATUS_IN_PROGRESS ||
    status === ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD
  ) {
    return (
      <>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Voting Ends</Text>
            <Text style={styles.bold}>
              {dayjs(getEndTime(proposal, shouldUseFallback)).format('MMM DD, YYYY')}
            </Text>
          </View>
          <Text style={styles.timeLeft}>
            {timeLeft && `Ending in ${timeLeft}`}
          </Text>
        </View>
        {isLoading ? (
          <View style={styles.skelRow}>
            <View style={styles.skelIcon}>
              <ActivityIndicator size="small" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.skelLine} />
              <View style={styles.skelLineShort} />
            </View>
          </View>
        ) : null}

        {currVote && currVote !== 'NO_VOTE' && (
          <View style={styles.voteChip}>
            <View style={styles.voteChipIcon}>
              <ThumbsUp size={16} color="#22744d" />
            </View>
            <View style={styles.voteChipTextCol}>
              <Text style={styles.voteChipTitle}>Vote submitted</Text>
              <Text style={styles.voteChipSub}>Voted {currVote.toUpperCase()}</Text>
            </View>
          </View>
        )}

        <Buttons.Generic
          color="#29A874"
          size="normal"
          style={styles.voteBtn}
          onClick={onVote}
        >
          <View style={styles.voteBtnContent}>
            <ThumbsUp size={16} style={{ marginRight: 6 }} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Vote</Text>
          </View>
        </Buttons.Generic>
      </>
    );
  }
  if (
    status === NtrnProposalStatus.EXECUTED ||
    status === NtrnProposalStatus.PASSED ||
    status === NtrnProposalStatus.REJECTED ||
    status === ProposalStatusEnum.PROPOSAL_STATUS_PASSED ||
    status === ProposalStatusEnum.PROPOSAL_STATUS_EXECUTED ||
    status === ProposalStatusEnum.PROPOSAL_STATUS_FAILED ||
    status === ProposalStatusEnum.PROPOSAL_STATUS_REJECTED
  ) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Results</Text>
          <View />
        </View>
        <View style={{ padding: 16 }}>
          {voteRatio(getVotes(proposal, shouldUseFallback))
            .filter((vote) => vote.label !== VoteOptions.NO_WITH_VETO)
            .map((values) => (
              <View style={styles.container}>
                {/* Background bar */}
                <View
                  style={[
                    styles.bgBar,
                    { width: Math.max(values.percentage * 3.12, 8)},
                    values.selectedBorderStyle
                  ]}
                />

                {/* Label left box */}
                <View style={[styles.labelBox, values.selectedBorderStyle]}>
                  <Text style={styles.labelText}>{values.label}</Text>
                </View>

                {/* Percentage right box */}
                <View style={[styles.percentBox, values.selectedBackgroundStyle]}>
                  <Text style={styles.percentText}>{values.percentage.toFixed(2)}</Text>
                </View>
              </View>
            ))}
        </View>
      </View>
    );
  }

  return <></>;
}

type NtrnProposalDetailsProps = {
  selectedProp: string | undefined;
  onBack: () => void;
  
  proposalList: any[];
  shouldUseFallback: boolean;
  forceChain?: SupportedChain;
  forceNetwork?: 'mainnet' | 'testnet';
};

export function NtrnProposalDetails({
  selectedProp,
  onBack,
  proposalList,
  shouldUseFallback,
  forceChain,
  forceNetwork,
}: NtrnProposalDetailsProps) {
  
  const insets = useSafeAreaInsets(); // For safe area support
  const { chains } = useChainsStore();
  const { activeWallet } = useActiveWallet();
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [_selectedNetwork, forceNetwork]);

  const address = useAddress(activeChain);
  const chain = chains[activeChain];
  const { rpcUrl, txUrl } = useChainApis(activeChain, selectedNetwork);
  const defaultTokenLogo = useDefaultTokenLogo();
  const [showCastVoteSheet, setShowCastVoteSheet] = useState(false);

  const proposal = useMemo(
    () => proposalList.find((_proposal) => (shouldUseFallback ? _proposal.id : _proposal.proposal_id) === selectedProp),
    [proposalList, selectedProp, shouldUseFallback],
  );
  const { abstain, yes, no } = shouldUseFallback ? proposal.proposal.votes : proposal.tally;
  const totalVotes = [yes, no, abstain].reduce((sum, val) => sum + Number(val), 0);

  const isProposalInVotingPeriod = useMemo(() => {
    return [
      NtrnProposalStatus.OPEN,
      ProposalStatusEnum.PROPOSAL_STATUS_IN_PROGRESS,
      ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD,
    ].includes(getStatus(proposal, shouldUseFallback));
  }, [proposal, shouldUseFallback]);

  const dataMock = useMemo(() => {
    return !totalVotes
      ? [{ title: 'loading', value: 1, color: '#ccc', percent: '0%' }]
      : [
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
          {
            title: 'Abstain',
            value: +abstain,
            color: '#D1A700',
            percent: getPercentage(+abstain, totalVotes),
          },
        ];
  }, [abstain, no, totalVotes, yes]);

  const tallying = useMemo(() => {
    return [
      {
        label: 'Turnout',
        value: getTurnout(proposal, totalVotes, shouldUseFallback),
      },
      {
        label: 'Quorum',
        value: getQuorum(proposal, shouldUseFallback),
      },
    ];
  }, [proposal, shouldUseFallback, totalVotes]);

  const {
    data: currVote,
    refetch,
    isLoading,
  } = useQuery(
    ['neutron-currVote', activeChain, address, selectedProp, rpcUrl],
    async function () {
      try {
        const { data } = await axios.post(
          `${process.env.LEAP_WALLET_BACKEND_API_URL}/gov/vote/${chain.chainId}/${selectedProp}`,
          { userAddress: address },
        );
        return { vote: data };
      } catch (err) {
        return await getNeutronProposalVote(rpcUrl ?? '', Number(selectedProp ?? ''), address);
      }
    },
    {
      retry: (failureCount) => failureCount <= 2,
      enabled: isProposalInVotingPeriod && !!rpcUrl,
    },
  );

  return (
    <View style={styles.root}>
      <GovHeader onBack={onBack} title="Proposal" />

      <ScrollView contentContainerStyle={styles.scrollContent} style={{ flex: 1 }}>
        {/* Status row */}
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.statusLine}>
            #{getId(proposal, shouldUseFallback)} · <NtrnStatus status={getStatus(proposal, shouldUseFallback)} />
          </Text>
          <Text style={styles.proposalTitle}>
            {getTitle(proposal, shouldUseFallback)}
          </Text>
        </View>

        <VoteDetails
          proposal={proposal}
          onVote={() => setShowCastVoteSheet(true)}
          currVote={currVote?.vote}
          isLoading={isLoading}
          shouldUseFallback={shouldUseFallback}
          forceChain={forceChain}
        />

        {/* Chart and votes */}
        {totalVotes > 0 && (
          <>
            <View style={styles.chartBlock}>
              <PieChart
                widthAndHeight={180}
                series={[]}
                cover={{radius: 0.65, color: Colors.white100}}
              />
              <Text style={styles.currentStatus}>Current Status</Text>
            </View>
            <ShowVotes dataMock={dataMock} chain={chain} />
            <Turnout tallying={tallying} />
          </>
        )}

        {/* Proposer box */}
        {isProposalInVotingPeriod && (
          <View style={styles.proposerBox}>
            <View style={styles.proposerAvatarBox}>
              <User size={18} color="#B9972B" />
              <Image
                source={{ uri: chain.chainSymbolImageUrl ?? defaultTokenLogo }}
                style={styles.chainImage}
              />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.proposerLabel}>Proposer</Text>
              <Text style={styles.proposerAddress}>
                {`${getProposer(proposal, shouldUseFallback).slice(0, 5)}...${getProposer(proposal, shouldUseFallback).slice(-6)}`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.proposerLinkBtn}
              onPress={() =>
                Linking.openURL(`${txUrl?.replace('txs', 'account')}/${getProposer(proposal, shouldUseFallback)}`)
              }
            >
              <ArrowSquareOut size={18} color="#888" />
            </TouchableOpacity>
          </View>
        )}

        {/* Description */}
        {!!getDescription(proposal, shouldUseFallback) && (
          <View style={{ marginTop: 20 }}>
            <ProposalDescription
              description={getDescription(proposal, shouldUseFallback)}
              title="Description"
              btnColor={getChainColor(activeChain, chain)}
              forceChain={forceChain}
            />
          </View>
        )}

        <View style={{ height: 80 + insets.bottom }} /> {/* Spacer for sticky bar */}
      </ScrollView>

      {/* Sticky Vote Bar */}
      {proposal?.status === ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD && (
        <View style={[styles.stickyBar, { paddingBottom: insets.bottom }]}>
          <Button
            style={styles.stickyVoteBtn}
            onPress={() => {
              if (activeWallet?.watchWallet) {
                importWatchWalletSeedPopupStore.setShowPopup(true);
              } else {
                setShowCastVoteSheet(true);
              }
            }}
          >
            <View style={styles.stickyBtnRow}>
              <Vote size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.stickyVoteText}>Vote</Text>
            </View>
          </Button>
        </View>
      )}

      <NtrnCastVote
        refetchVote={refetch}
        proposalId={getId(proposal, shouldUseFallback)}
        isProposalInVotingPeriod={isProposalInVotingPeriod}
        showCastVoteSheet={showCastVoteSheet}
        setShowCastVoteSheet={setShowCastVoteSheet}
        forceChain={forceChain}
        forceNetwork={forceNetwork}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 10,
    height: 44,
    position: 'relative',
  },
  bgBar: {
    position: 'absolute',
    left: 0,
    top: 2,
    height: 40,
    borderRadius: 16,
    zIndex: 0,
  },
  labelBox: {
    width: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderWidth: 2,
    borderRightWidth: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
  labelText: {
    marginLeft: 16,
    color: '#1b1d23',
    fontWeight: 'bold',
    fontSize: 16,
    maxHeight: 40,
  },
  percentBox: {
    flex: 1,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 2,
    borderLeftWidth: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 18,
    zIndex: 1,
  },
  percentText: {
    fontWeight: 'bold',
    color: '#1b1d23',
    fontSize: 16,
  },
  root: { flex: 1, backgroundColor: '#f9fafd' },
  scrollContent: { padding: 20, paddingBottom: 0 },
  statusLine: {
    color: '#888',
    fontSize: 13,
    marginBottom: 3,
    fontWeight: '600',
  },
  proposalTitle: {
    color: '#222',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chartBlock: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  currentStatus: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  proposerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFECA8',
    borderRadius: 18,
    padding: 15,
    marginTop: 28,
    marginBottom: 0,
  },
  proposerAvatarBox: {
    backgroundColor: '#FFECA8',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  chainImage: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  proposerLabel: { color: '#222', fontWeight: 'bold', fontSize: 13 },
  proposerAddress: { color: '#888', fontSize: 11, marginTop: 2 },
  proposerLinkBtn: { padding: 4, marginLeft: 12 },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f2f4fa',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { height: -2, width: 0 },
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyVoteBtn: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#29A874',
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  stickyBtnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stickyVoteText: { color: '#fff', fontWeight: 'bold', fontSize: 17, letterSpacing: 1 },
  card: {
    borderRadius: 20,
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: '#2b2c34', fontSize: 15, fontWeight: 'bold' },
  bold: { color: '#2b2c34', fontWeight: 'bold', fontSize: 15 },
  timeLeft: { color: '#72747a', fontSize: 12, marginTop: 6, minHeight: 20 },
  skelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#fff', borderRadius: 18, padding: 12 },
  skelIcon: { width: 40, height: 40, backgroundColor: '#e0e0e0', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  skelLine: { height: 14, backgroundColor: '#e0e0e0', marginBottom: 6, borderRadius: 5, width: '70%' },
  skelLineShort: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, width: '40%' },
  voteChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#82d9a2', borderColor: '#29A874', borderWidth: 2, borderRadius: 18, marginTop: 16, marginBottom: 8, alignSelf: 'center', padding: 12, width: 320 },
  voteChipIcon: { height: 40, width: 40, backgroundColor: '#A5DFB1', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  voteChipTextCol: { marginLeft: 16, justifyContent: 'center' },
  voteChipTitle: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  voteChipSub: { fontSize: 13, color: '#444', marginTop: 2, fontWeight: '500' },
  voteBtn: { width: 320, alignSelf: 'center', marginTop: 20, borderRadius: 20, overflow: 'hidden' },
  voteBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  headerLabel: {
    color: '#888',
    width: 200,
    fontSize: 12,
    fontWeight: 'bold',
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    height: 44,
    position: 'relative',
    overflow: 'visible',
  },
  backgroundBar: {
    position: 'absolute',
    left: 0,
    top: 2,
    height: 40,
    borderRadius: 16,
    zIndex: 0,
  },
  voteLabelBox: {
    width: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderWidth: 2,
    borderRightWidth: 0,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    zIndex: 1,
    justifyContent: 'center',
  },
  voteLabelText: {
    marginLeft: 16,
    color: '#1b1d23',
    fontWeight: 'bold',
    fontSize: 16,
    maxHeight: 40,
  },
  votePercentBox: {
    flex: 1,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 2,
    borderLeftWidth: 0,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 18,
    marginLeft: -2,
  },
  votePercentText: {
    fontWeight: 'bold',
    color: '#1b1d23',
    fontSize: 16,
  },
});
