import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import {
  daysLeft,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useSelectedNetwork,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  SupportedChain,
  UnbondingDelegation,
  UnbondingDelegationEntry,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk';
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import currency from 'currency.js';

import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import { Images } from '../../../../assets/images';

import ReviewCancelUnstakeTx from './ReviewCancelUnstakeTx';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import { stakeEpochStore } from '../../../context/epoch-store';
import { timeLeft } from '../../../utils/timeLeft';

interface UnstakedValidatorDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  validator: Validator;
  unbondingDelegation?: UnbondingDelegation;
  unbondingDelegationEntry?: UnbondingDelegationEntry;
  rootDenomsStore: RootDenomsStore;
  rootBalanceStore: RootBalanceStore;
  delegationsStore: DelegationsStore;
  validatorsStore: ValidatorsStore;
  unDelegationsStore: UndelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void;
}

const UnstakedValidatorDetails = observer(({
  isOpen,
  onClose,
  validator,
  unbondingDelegation,
  unbondingDelegationEntry,
  rootDenomsStore,
  rootBalanceStore,
  delegationsStore,
  validatorsStore,
  unDelegationsStore,
  claimRewardsStore,
  forceChain,
  forceNetwork,
  setClaimTxMode,
}: UnstakedValidatorDetailsProps) => {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);

  const denoms = rootDenomsStore.allDenoms;
  const chainDelegations = delegationsStore.delegationsForChain(activeChain);
  const chainValidators = validatorsStore.validatorsForChain(activeChain);
  const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
  const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

  const [formatCurrency] = useFormatCurrency();
  const { network } = useStaking(
    denoms,
    chainDelegations,
    chainValidators,
    chainUnDelegations,
    chainClaimRewards,
    activeChain,
    activeNetwork,
  );
  const aprs = network?.validatorAprs;
  const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator);
  const imageUrl = validator?.image || validatorImage || Images.Misc.Validator;

  const [showReviewCancelUnstakeTx, setShowReviewCancelUnstakeTx] = useState(false);

  // Compute values for display
  const amountTitleText = useMemo(() => {
    if (new BigNumber(unbondingDelegationEntry?.currencyBalance ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(
        formatCurrency(new BigNumber(unbondingDelegationEntry?.currencyBalance ?? '')),
      );
    } else {
      return hideAssetsStore.formatHideBalance(unbondingDelegationEntry?.formattedBalance ?? '');
    }
  }, [formatCurrency, unbondingDelegationEntry]);

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(unbondingDelegationEntry?.currencyBalance ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(unbondingDelegationEntry?.formattedBalance ?? '');
    }
    return '';
  }, [unbondingDelegationEntry]);

  const isCancelledScheduled =
    unbondingDelegation &&
    unbondingDelegationEntry &&
    stakeEpochStore.canceledUnBondingDelegationsMap[unbondingDelegation.validator_address]?.some(
      (ch) => ch === unbondingDelegationEntry.creation_height,
    );

  return (
    <>
      <BottomModal
        isOpen={isOpen}
        onClose={onClose}
        fullScreen
        title="Validator Details"
        containerStyle={styles.modalContainer}
        headerStyle={styles.headerBorder}
      >
        <ScrollView contentContainerStyle={styles.scrollArea}>
          {/* Validator Header */}
          <View style={styles.validatorRow}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.avatar}
              onError={() => {}}
            />
            <Text style={styles.moniker}>
              {sliceWord(
                validator?.moniker ?? '',
                10,
                3,
              )}
            </Text>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Total Staked</Text>
              <Text style={styles.statsValue}>
                {currency(validator?.delegations?.total_tokens_display ?? validator?.tokens ?? '', {
                  symbol: '',
                  precision: 0,
                }).format()}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Commission</Text>
              <Text style={styles.statsValue}>
                {validator?.commission?.commission_rates?.rate
                  ? `${new BigNumber(validator?.commission?.commission_rates?.rate ?? '')
                      .multipliedBy(100)
                      .toFixed(0)}%`
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>APR</Text>
              <Text style={styles.statsAprValue}>
                {aprs && (aprs[validator?.address ?? '']
                  ? `${currency(aprs[validator?.address ?? ''] * 100, {
                      precision: 2,
                      symbol: '',
                    }).format()}%`
                  : 'N/A')}
              </Text>
            </View>
          </View>

          {/* Pending Unstake */}
          <Text style={styles.sectionLabel}>Pending Unstake</Text>
          <View style={styles.unstakeCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.unstakeAmount}>{amountTitleText}</Text>
              <Text style={styles.unstakeSubAmount}>{amountSubtitleText}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.unstakeTime}>
                {timeLeft(unbondingDelegationEntry?.completion_time ?? '')}
              </Text>
              <Text style={styles.unstakeTimeSub}>
                {unbondingDelegationEntry?.completion_time && daysLeft(unbondingDelegationEntry?.completion_time)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {!isCancelledScheduled && (
          <View style={styles.footer}>
            <Button
              onPress={() => {
                setShowReviewCancelUnstakeTx(true);
                onClose();
              }}
              style={styles.cancelBtn}
              variant="mono"
            >
              Cancel Unstake
            </Button>
          </View>
        )}
      </BottomModal>

      <ReviewCancelUnstakeTx
        isOpen={showReviewCancelUnstakeTx}
        onClose={() => setShowReviewCancelUnstakeTx(false)}
        unbondingDelegationEntry={unbondingDelegationEntry}
        validator={validator}
        forceChain={activeChain}
        forceNetwork={activeNetwork}
        setClaimTxMode={setClaimTxMode}
      />
    </>
  );
});

const styles = StyleSheet.create({
  modalContainer: { padding: 0, height: '100%' },
  headerBorder: { borderBottomWidth: 1, borderColor: '#E2E8F0' },
  scrollArea: { padding: 24, flexGrow: 1, gap: 14 },
  validatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  moniker: { fontWeight: 'bold', fontSize: 18, color: '#1e293b' },
  statsCard: {
    flexDirection: 'column',
    gap: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  statsLabel: { fontSize: 14, color: '#64748b' },
  statsValue: { fontWeight: 'bold', fontSize: 14, color: '#1e293b' },
  statsAprValue: { fontWeight: 'bold', fontSize: 14, color: '#059669' },
  sectionLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 3,
  },
  unstakeCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unstakeAmount: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 2,
  },
  unstakeSubAmount: { fontSize: 13, color: '#64748b' },
  unstakeTime: { fontWeight: 'bold', fontSize: 18, color: '#1e293b', marginBottom: 2 },
  unstakeTimeSub: { fontSize: 13, color: '#64748b' },
  footer: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  cancelBtn: { width: '100%' },
});

export default UnstakedValidatorDetails;
