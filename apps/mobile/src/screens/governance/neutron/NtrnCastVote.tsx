import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Prohibit, ThumbsDown, ThumbsUp } from 'phosphor-react-native';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import Text from '../../../components/text';
import { DisplayFee } from '../../../components/gas-price-options/display-fee';
import { Wallet } from '../../../hooks/wallet/useWallet';
import { useCaptureTxError } from '../../../hooks/utility/useCaptureTxError';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';

import { FeeTokenData, GasOptions, TxCallback, useNtrnGov } from '@leapwallet/cosmos-wallet-hooks';
import GasPriceOptions, { useDefaultGasPrice } from '../../../components/gas-price-options';
import { FeesSettingsSheet } from '../../../components/gas-price-options/fees-settings-sheet';
import { NtrnReviewVoteCast } from './NtrnReviewVoteCast';
import { VoteTxnSheet } from '../components/VoteTxnSheet';
import { VoteOptions } from './utils';

import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { rootBalanceStore } from '../../../context/root-store';
import { GasPriceOptionValue } from '../../../components/gas-price-options/context';
import { CastVoteProps } from '../components';

const useGetWallet = Wallet.useGetWallet;

type CastVoteSheetProps = {
  proposalId: string;
  isProposalInVotingPeriod: boolean;
  onSubmitVote: (option: VoteOptions) => void;
  setShowFeesSettingSheet: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  onCloseHandler: () => void;
  showFeesSettingSheet: boolean;
  gasError: string;
  forceChain?: SupportedChain;
  simulateNtrnVote: (wallet: OfflineSigner, proposalId: number, option: VoteOptions) => Promise<void>;
};

const VoteOptionsList = [
  {
    label: VoteOptions.YES,
    icon: <ThumbsUp size={20} color="#fff" />,
    selectedColor: '#29A874',
  },
  {
    label: VoteOptions.NO,
    icon: <ThumbsDown size={20} color="#fff" />,
    selectedColor: '#FF707E',
  },
  {
    label: VoteOptions.ABSTAIN,
    icon: <Prohibit size={20} color="#fff" />,
    selectedColor: '#FFD600',
  },
];

function CastVoteSheet({
  proposalId,
  isProposalInVotingPeriod,
  isOpen,
  setShowFeesSettingSheet,
  onCloseHandler,
  onSubmitVote,
  showFeesSettingSheet,
  gasError,
  forceChain,
  simulateNtrnVote,
}: CastVoteSheetProps) {
  const [selectedOption, setSelectedOption] = useState<VoteOptions | undefined>(undefined);
  const [simulateError, setSimulateError] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const getWallet = useGetWallet(forceChain);

  // Simulate on vote option selection
  useEffect(() => {
    if (proposalId && selectedOption && isProposalInVotingPeriod) {
      (async () => {
        try {
          setIsSimulating(true);
          const wallet = await getWallet();
          await simulateNtrnVote(wallet, Number(proposalId), selectedOption as VoteOptions);
          await new Promise((res) => setTimeout(res, 800));
        } catch (_error) {
          const error = _error as Error;
          setSimulateError(error.message);
        } finally {
          setIsSimulating(false);
        }
      })();
    }
  }, [proposalId, selectedOption, isProposalInVotingPeriod, getWallet, simulateNtrnVote]);

  // Error display can be handled with your ErrorCard or a simple Text
  useCaptureTxError(simulateError);

  return (
    <BottomModal isOpen={isOpen} onClose={onCloseHandler} title="Call your Vote">
      <View style={styles.optionsRoot}>
        {VoteOptionsList.map((option) => {
          const selected = selectedOption === option.label;
          return (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.voteBtn,
                selected
                  ? { backgroundColor: option.selectedColor + '22', borderColor: option.selectedColor }
                  : { backgroundColor: '#f2f4fa', borderColor: '#e0e1ed' },
              ]}
              activeOpacity={0.75}
              onPress={() => setSelectedOption(option.label)}
              disabled={isSimulating}
            >
              <View style={[styles.iconCircle, selected && { backgroundColor: option.selectedColor }]}>
                {option.icon}
              </View>
              <Text style={[styles.voteLabel, selected && { color: option.selectedColor }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <DisplayFee style={{ marginTop: 16 }} setShowFeesSettingSheet={setShowFeesSettingSheet} />

      {gasError && !showFeesSettingSheet ? (
        <Text style={styles.gasErrorText}>{gasError}</Text>
      ) : null}

      <Button
        style={{ width: '100%', marginTop: 24 }}
        disabled={!selectedOption || !!gasError || isSimulating}
        onPress={() => onSubmitVote(selectedOption as VoteOptions)}
      >
        {isSimulating ? <ActivityIndicator size="small" color="#fff" /> : 'Submit'}
      </Button>
    </BottomModal>
  );
}

export const NtrnCastVote = observer(({
  isProposalInVotingPeriod,
  proposalId,
  refetchVote,
  showCastVoteSheet,
  setShowCastVoteSheet,
  forceChain,
  forceNetwork,
}: CastVoteProps) => {
  // All your existing hooks, unchanged:
  const [showTxPage, setShowTxPage] = useState(false);
  const getWallet = useGetWallet(forceChain);
  const denoms = rootDenomsStore.allDenoms;
  const defaultGasPrice = useDefaultGasPrice(denoms, {
    activeChain: forceChain,
    selectedNetwork: forceNetwork,
  });

  const {
    setFeeDenom,
    userPreferredGasPrice,
    userPreferredGasLimit,
    setGasOption,
    gasOption,
    gasEstimate,
    setUserPreferredGasLimit,
    setUserPreferredGasPrice,
    clearTxError,
    txError,
    memo,
    setMemo,
    isVoting,
    handleVote,
    simulateNtrnVote,
  } = useNtrnGov(denoms, forceChain, forceNetwork);

  const [selectedVoteOption, setSelectedVoteOption] = useState<VoteOptions | undefined>(undefined);
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false);
  const [gasError, setGasError] = useState<string | null>(null);
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: GasOptions.LOW,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  });

  const handleGasPriceOptionChange = useCallback(
    (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
      setGasPriceOption(value);
      setFeeDenom(feeBaseDenom.denom);
    },
    [setFeeDenom],
  );

  const modifiedCallback: TxCallback = useCallback(
    (status) => {
      setShowTxPage(true);
    },
    [setShowTxPage],
  );

  // Initialize gasPriceOption with correct defaultGasPrice.gasPrice
  useEffect(() => {
    setGasPriceOption({
      option: gasOption,
      gasPrice: defaultGasPrice.gasPrice,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGasPrice.gasPrice]);

  useEffect(() => {
    setGasOption(gasPriceOption.option);
    setUserPreferredGasPrice(gasPriceOption.gasPrice);
  }, [gasPriceOption, setGasOption, setUserPreferredGasPrice]);

  const handleCloseReviewVoteCastSheet = useCallback(() => {
    setSelectedVoteOption(undefined);
    setShowCastVoteSheet(false);
    clearTxError();
  }, [clearTxError, setShowCastVoteSheet]);

  const submitVote = async () => {
    clearTxError();

    try {
      const wallet = await getWallet();
      await handleVote({
        wallet,
        callback: modifiedCallback,
        voteOption: selectedVoteOption as VoteOptions,
        proposalId: Number(proposalId),
      });
      return true;
    } catch (err: unknown) {
      return false;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main gas options and voting UI */}
      <GasPriceOptions
        recommendedGasLimit={gasEstimate.toString()}
        gasLimit={userPreferredGasLimit?.toString() ?? gasEstimate.toString()}
        setGasLimit={(gasLimit: number | string | BigNumber) =>
          setUserPreferredGasLimit(Number(gasLimit.toString()))
        }
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={handleGasPriceOptionChange}
        error={gasError}
        setError={setGasError}
        chain={forceChain}
        network={forceNetwork}
        rootDenomsStore={rootDenomsStore}
        rootBalanceStore={rootBalanceStore}
      >
        <CastVoteSheet
          proposalId={proposalId}
          isProposalInVotingPeriod={isProposalInVotingPeriod}
          isOpen={showCastVoteSheet}
          setShowFeesSettingSheet={setShowFeesSettingSheet}
          onCloseHandler={() => setShowCastVoteSheet(false)}
          onSubmitVote={setSelectedVoteOption}
          showFeesSettingSheet={showFeesSettingSheet}
          gasError={gasError ?? ''}
          simulateNtrnVote={simulateNtrnVote}
          forceChain={forceChain}
        />

        <FeesSettingsSheet
          showFeesSettingSheet={showFeesSettingSheet}
          onClose={() => setShowFeesSettingSheet(false)}
          gasError={gasError}
        />

        <NtrnReviewVoteCast
          isOpen={selectedVoteOption !== undefined}
          proposalId={proposalId}
          error={txError}
          loading={isVoting}
          memo={memo}
          setMemo={setMemo}
          selectedVote={selectedVoteOption}
          onSubmitVote={submitVote}
          refetchCurrVote={refetchVote}
          onCloseHandler={handleCloseReviewVoteCastSheet}
          gasOption={gasPriceOption.option}
          forceChain={forceChain}
        />

        {showTxPage && (
          <VoteTxnSheet
            isOpen={showTxPage}
            onClose={() => setShowTxPage(false)}
            forceChain={forceChain}
            forceNetwork={forceNetwork}
            refetchVote={refetchVote}
          />
        )}
      </GasPriceOptions>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: 'transparent', // Adjust as needed
  },
  optionsRoot: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    marginTop: 8,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 2,
    justifyContent: 'flex-start',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#c8ccd7',
  },
  voteLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#22272e',
  },
  gasErrorText: {
    color: '#ff707e',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
});
