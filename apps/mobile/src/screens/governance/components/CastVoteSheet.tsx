import {
  useActiveChain,
  useChainInfo,
  useSelectedNetwork,
  useSimulateVote,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  GasPrice,
  getSimulationFee,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { Prohibit, ThumbsDown, ThumbsUp } from 'phosphor-react-native';
import { captureException } from '@sentry/react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Colors } from '../../../theme/colors';
import { DisplayFee } from '../../../components/gas-price-options/display-fee';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { Button } from '../../../components/ui/button';

export enum VoteOptions {
  YES = 'Yes',
  NO = 'No',
  NO_WITH_VETO = 'No with Veto',
  ABSTAIN = 'Abstain',
}

export type CastVoteSheetProps = {
  feeDenom: NativeDenom;
  gasLimit: string;
  gasPrice: GasPrice;
  onSubmitVote: (option: VoteOptions) => void;
  setShowFeesSettingSheet: React.Dispatch<React.SetStateAction<boolean>>;
  setRecommendedGasLimit: React.Dispatch<React.SetStateAction<string>>;
  proposalId: string;
  setGasLimit: React.Dispatch<React.SetStateAction<string>>;
  forceChain?: SupportedChain;
  forceNetwork?: 'mainnet' | 'testnet';
  isProposalInVotingPeriod: boolean;
};

export function CastVoteSheet({
  onSubmitVote,
  setShowFeesSettingSheet,
  setRecommendedGasLimit,
  proposalId,
  isProposalInVotingPeriod,
  setGasLimit,
  feeDenom,
  forceChain,
  forceNetwork,
}: CastVoteSheetProps): React.ReactElement {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
  const activeChainInfo = useChainInfo(activeChain);
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [_selectedNetwork, forceNetwork]);
  const simulateVote = useSimulateVote(activeChain, selectedNetwork);
  const firstTime = useRef(true);
  const [simulating, setSimulating] = useState(true);
  const [selectedOption, setSelectedOption] = useState<VoteOptions | undefined>(undefined);

  const VoteOptionsList = useMemo(() => {
    const data = [
      {
        label: VoteOptions.YES,
        icon: <ThumbsUp size={20} color="#22c55e" />,
        selectedStyle: styles.yesSelected,
      },
      {
        label: VoteOptions.NO,
        icon: <ThumbsDown size={20} color="#ef4444" />,
        selectedStyle: styles.noSelected,
      },
    ];
    if (activeChainInfo.chainId !== 'atomone-1') {
      data.push({
        label: VoteOptions.NO_WITH_VETO,
        icon: <ThumbsDown size={20} color="#6366f1" />,
        selectedStyle: styles.vetoSelected,
      });
    }
    data.push({
      label: VoteOptions.ABSTAIN,
      icon: <Prohibit size={20} color="#eab308" />,
      selectedStyle: styles.abstainSelected,
    });
    return data;
  }, [activeChainInfo.chainId]);

  useEffect(() => {
    let cancelled = false;

    const simulate = async () => {
      try {
        const fee = getSimulationFee(feeDenom.coinMinimalDenom);
        const result = await simulateVote({
          proposalId,
          voteOption: VoteOptions.YES,
          fee,
        });

        if (result !== null && !cancelled) {
          const _estimate = result.gasUsed.toString();
          setRecommendedGasLimit(_estimate);

          if (firstTime.current) {
            setGasLimit(_estimate);
            firstTime.current = false;
          }
        }
      } catch {
        //
      } finally {
        setSimulating(false);
      }
    };

    if (isProposalInVotingPeriod) {
      simulate().catch(captureException);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeDenom.coinMinimalDenom, proposalId, simulateVote, isProposalInVotingPeriod]);

  return (
    <View style={styles.sheetContainer}>
      <View style={styles.voteOptionsWrapper}>
        {VoteOptionsList.map((option) => {
          const isSelected = selectedOption === option.label;
          return (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.voteOption,
                isSelected ? option.selectedStyle : styles.voteOptionUnselected,
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedOption(option.label)}
            >
              <View style={styles.iconWrap}>{option.icon}</View>
              <Text
                style={[
                  styles.voteOptionText,
                  isSelected ? styles.voteOptionTextSelected : {},
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!simulating ? (
        <View style={{ width: '100%', marginTop: 16 }}>
          <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />
        </View>
      ) : (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
          <LoaderAnimation color={Colors.green600} />
        </View>
      )}

      <Button
        style={styles.submitBtn}
        disabled={!selectedOption || simulating}
        onPress={() => onSubmitVote(selectedOption as VoteOptions)}
      >
        Submit
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  voteOptionsWrapper: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  voteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  voteOptionUnselected: {
    backgroundColor: '#f3f4f6', // secondary-100
    borderColor: 'transparent',
  },
  yesSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  noSelected: {
    backgroundColor: '#fca5a5',
    borderColor: '#ef4444',
  },
  vetoSelected: {
    backgroundColor: '#c7d2fe',
    borderColor: '#6366f1',
  },
  abstainSelected: {
    backgroundColor: '#fde68a',
    borderColor: '#eab308',
  },
  iconWrap: {
    marginRight: 12,
  },
  voteOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b', // default
  },
  voteOptionTextSelected: {
    color: '#fff',
  },
  submitBtn: {
    width: '100%',
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
  },
});
