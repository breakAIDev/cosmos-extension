import {
  formatTokenAmount,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks';
import { Delegation, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk';
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store';
import BigNumber from 'bignumber.js';
import BottomModal from '../../../components/new-bottom-modal';
import { ValidatorItemSkeleton } from '../../../components/Skeletons/StakeSkeleton';
import { Button } from '../../../components/ui/button';
import currency from 'currency.js';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import useQuery from '../../../hooks/useQuery';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { hideAssetsStore } from '../../../context/hide-assets-store';

import { StakeInputPageState } from '../StakeInputPage';
import ReviewValidatorClaimTx from './ReviewValidatorClaimTx';
import { ValidatorCardView } from './ValidatorCardView';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface StakedValidatorDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchValidator: () => void;
  onUnstake: () => void;
  validator?: Validator;
  delegation?: Delegation;
  rootDenomsStore: RootDenomsStore;
  delegationsStore: DelegationsStore;
  validatorsStore: ValidatorsStore;
  unDelegationsStore: UndelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
  onValidatorClaim: () => void;
}

const StakedValidatorDetails = observer(
  ({
    isOpen,
    onClose,
    onSwitchValidator,
    onUnstake,
    validator,
    delegation,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
    onValidatorClaim,
  }: StakedValidatorDetailsProps) => {
    const _activeChain = useActiveChain();
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

    const _activeNetwork = useSelectedNetwork();
    const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);

    const denoms = rootDenomsStore.allDenoms;
    const chainDelegations = delegationsStore.delegationsForChain(activeChain);
    const chainValidators = validatorsStore.validatorsForChain(activeChain);
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);
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

    const [validatorRewardCurrency, validatorRewardToken, validatorRewardTotal] = useMemo(() => {
      const validatorRewards = chainClaimRewards?.rewards?.rewards?.[validator?.address ?? ''];
      const _validatorRewardCurrency = validatorRewards?.reward.reduce(
        (acc, reward) => acc.plus(new BigNumber(reward.currencyAmount ?? '')),
        new BigNumber(0),
      );
      const rewardCount = validatorRewards?.reward.length ?? 0;
      const nativeReward = validatorRewards?.reward.find((r) => r.denom === activeStakingDenom?.coinMinimalDenom);
      const _validatorRewardToken =
        formatTokenAmount(nativeReward?.amount ?? '', activeStakingDenom?.coinDenom) +
        `${rewardCount > 1 ? ` +${rewardCount - 1} more` : ''}`;

      const _validatorRewardTotal = validatorRewards?.reward.reduce(
        (acc, reward) => acc.plus(new BigNumber(reward.amount)),
        new BigNumber(0),
      );
      return [_validatorRewardCurrency, _validatorRewardToken, _validatorRewardTotal];
    }, [activeStakingDenom, chainClaimRewards, validator]);

    const amountTitleText = useMemo(() => {
      const currencyAmount = new BigNumber(delegation?.balance.currencyAmount ?? '');
      if (currencyAmount.gt(0)) {
        return hideAssetsStore.formatHideBalance(formatCurrency(currencyAmount));
      }

      return hideAssetsStore.formatHideBalance(
        delegation?.balance.formatted_amount || delegation?.balance.amount || '',
      );
    }, [delegation, formatCurrency]);

    const amountSubtitleText = useMemo(() => {
      const currencyAmount = new BigNumber(delegation?.balance.currencyAmount ?? '');
      if (currencyAmount.gt(0)) {
        return hideAssetsStore.formatHideBalance(
          delegation?.balance.formatted_amount || delegation?.balance.amount || '',
        );
      }

      return '';
    }, [delegation]);

    return (
      <BottomModal
        fullScreen
        isOpen={isOpen}
        onClose={onClose}
        title="Validator details"
        containerStyle={styles.modalContainer}
        headerStyle={styles.headerBorder}
      >
        <ScrollView contentContainerStyle={styles.scrollArea}>
          {/* Validator header */}
          <View style={styles.validatorRow}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.validatorImg}
              onError={() => {}}
            />
            <Text style={styles.validatorMoniker}>
              {sliceWord(
                validator?.moniker ?? '',
                10,
                3,
              )}
            </Text>
          </View>

          {/* Stats card */}
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

          {/* Deposited amount */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Your deposited amount</Text>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionAmount}>{amountTitleText}</Text>
              {amountSubtitleText ? (
                <Text style={styles.sectionSubAmount}>({amountSubtitleText})</Text>
              ) : null}
            </View>
          </View>

          {/* Rewards */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Your Rewards</Text>
            <View style={styles.rewardCard}>
              <View>
                <Text style={styles.rewardAmount}>
                  {formatCurrency(validatorRewardCurrency ?? new BigNumber(''))}
                </Text>
                <Text style={styles.rewardToken}>{validatorRewardToken}</Text>
              </View>
              <Button
                size="md"
                variant="secondary"
                style={styles.claimBtn}
                disabled={!validatorRewardTotal || validatorRewardTotal.lt(0.00001)}
                onPress={onValidatorClaim}
              >
                Claim
              </Button>
            </View>
          </View>
        </ScrollView>
        {/* Footer Buttons */}
        <View style={styles.footerBar}>
          <Button style={styles.footerBtn} onPress={onSwitchValidator}>
            Switch validator
          </Button>
          <Button style={styles.footerBtn} variant="mono" onPress={onUnstake}>
            Unstake
          </Button>
        </View>
      </BottomModal>
    );
  },
);

interface ValidatorCardProps {
  validator: Validator;
  delegation: Delegation;
  onClick: (delegation: Delegation) => void;
}

const ValidatorCard = observer(({ validator, delegation, onClick }: ValidatorCardProps) => {
  const [formatCurrency] = useFormatCurrency();
  const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator);
  const imageUrl = validator?.image || validatorImage || Images.Misc.Validator;

  const amountTitleText = useMemo(() => {
    if (new BigNumber(delegation.balance.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(delegation.balance.currencyAmount ?? '')));
    } else {
      return hideAssetsStore.formatHideBalance(delegation.balance.formatted_amount ?? delegation.balance.amount);
    }
  }, [
    delegation.balance.amount,
    delegation.balance.currencyAmount,
    delegation.balance.formatted_amount,
    formatCurrency,
  ]);

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(delegation.balance.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(delegation.balance.formatted_amount ?? delegation.balance.amount);
    }
    return '';
  }, [delegation.balance.amount, delegation.balance.currencyAmount, delegation.balance.formatted_amount]);

  const handleValidatorCardClick = useCallback(() => {
    onClick(delegation);
  }, [onClick, delegation]);

  return (
    <ValidatorCardView
      onClick={handleValidatorCardClick}
      imgSrc={imageUrl}
      moniker={validator.moniker}
      titleAmount={amountTitleText}
      subAmount={amountSubtitleText}
      jailed={validator.jailed}
    />
  );
});

type ValidatorListProps = {
  rootDenomsStore: RootDenomsStore;
  rootBalanceStore: RootBalanceStore;
  delegationsStore: DelegationsStore;
  validatorsStore: ValidatorsStore;
  unDelegationsStore: UndelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void;
};

const ValidatorList = observer(
  ({
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
    rootBalanceStore,
    setClaimTxMode,
  }: ValidatorListProps) => {
    const navigation = useNavigation();
    const [showStakedValidatorDetails, setShowStakedValidatorDetails] = useState(false);
    const [showReviewValidatorClaimTx, setShowReviewValidatorClaimTx] = useState(false);
    const [selectedDelegation, setSelectedDelegation] = useState<Delegation | undefined>();

    const _activeChain = useActiveChain();
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

    const _activeNetwork = useSelectedNetwork();
    const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);

    const denoms = rootDenomsStore.allDenoms;
    const chainDelegations = delegationsStore.delegationsForChain(activeChain);
    const chainValidators = validatorsStore.validatorsForChain(activeChain);
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

    const { delegations, loadingNetwork, loadingDelegations } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    );

    const validators = useMemo(
      () =>
        chainValidators.validatorData.validators?.reduce((acc, validator) => {
          acc[validator.address] = validator;
          return acc;
        }, {} as Record<string, Validator>),
      [chainValidators.validatorData.validators],
    );

    const isLoading = loadingNetwork || loadingDelegations;

    const query = useQuery();
    const paramValidatorAddress = query.get('validatorAddress') ?? undefined;
    const paramAction = query.get('action') ?? undefined;

    useEffect(() => {
      if (paramValidatorAddress && paramAction !== 'DELEGATE') {
        const delegation = Object.values(delegations ?? {}).find(
          (d) => d.delegation.validator_address === paramValidatorAddress,
        );

        if (delegation) {
          setSelectedDelegation(delegation as Delegation);
          setShowStakedValidatorDetails(true);
        }
      }
    }, [delegations, paramAction, paramValidatorAddress]);

    const [activeValidatorDelegations, inactiveValidatorDelegations] = useMemo(() => {
      const _sortedDelegations = Object.values(delegations ?? {}).sort(
        (a, b) => parseFloat(b.balance.amount) - parseFloat(a.balance.amount),
      );

      const _activeValidatorDelegations = _sortedDelegations.filter((d) => {
        const validator = validators?.[d?.delegation?.validator_address];
        if (!validator || validator.active === false) return false;
        return true;
      });

      const _inactiveValidatorDelegations = _sortedDelegations.filter((d) => {
        const validator = validators?.[d?.delegation?.validator_address];
        if (!validator || validator.active !== false) return false;
        return true;
      });

      return [_activeValidatorDelegations, _inactiveValidatorDelegations];
    }, [delegations, validators]);

    const onValidatorClaim = useCallback(() => {
      setShowStakedValidatorDetails(false);
      setShowReviewValidatorClaimTx(true);
    }, []);

    const handleValidatorCardClick = useCallback((delegation: Delegation) => {
      setSelectedDelegation(delegation);
      setShowStakedValidatorDetails(true);
    }, []);
    
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {/* Loading */}
        {isLoading && (
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.header}>Validator</Text>
              <Text style={styles.header}>Amount Staked</Text>
            </View>
            <ValidatorItemSkeleton count={5} />
          </View>
        )}

        {/* Active validators */}
        {!isLoading && validators && activeValidatorDelegations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.header}>Validator</Text>
              <Text style={styles.header}>Amount Staked</Text>
            </View>
            {activeValidatorDelegations.map((d) => {
              const validator = validators?.[d?.delegation?.validator_address];
              return (
                <ValidatorCard
                  key={validator.address}
                  delegation={d}
                  validator={validator}
                  onClick={handleValidatorCardClick}
                />
              );
            })}
          </View>
        )}

        {/* Inactive validators */}
        {!isLoading && validators && inactiveValidatorDelegations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.header}>Inactive validator</Text>
              <Text style={styles.header}>Amount Staked</Text>
            </View>
            {inactiveValidatorDelegations.map((d) => {
              const validator = validators?.[d?.delegation?.validator_address];
              return (
                <ValidatorCard
                  key={validator?.address}
                  delegation={d}
                  validator={validator}
                  onClick={handleValidatorCardClick}
                />
              );
            })}
          </View>
        )}

        <StakedValidatorDetails
          isOpen={!!(showStakedValidatorDetails && selectedDelegation)}
          onClose={() => setShowStakedValidatorDetails(false)}
          onSwitchValidator={() => {
            const state = {
              mode: 'REDELEGATE',
              fromValidator: validators[selectedDelegation?.delegation.validator_address || ''],
              delegation: selectedDelegation,
              forceChain: activeChain,
              forceNetwork: activeNetwork,
            } as StakeInputPageState;

            sessionStorage.setItem('navigate-stake-input-state', JSON.stringify(state));
            navigation.navigate('Stakeinput', {
              state,
            });
          }}
          onUnstake={() => {
            const state = {
              mode: 'UNDELEGATE',
              toValidator: validators[selectedDelegation?.delegation.validator_address || ''],
              delegation: selectedDelegation,
              forceChain: activeChain,
              forceNetwork: activeNetwork,
            } as StakeInputPageState;

            sessionStorage.setItem('navigate-stake-input-state', JSON.stringify(state));
            navigation.navigate('Stakeinput', {
              state,
            });
          }}
          validator={validators?.[selectedDelegation?.delegation?.validator_address || '']}
          delegation={selectedDelegation}
          rootDenomsStore={rootDenomsStore}
          delegationsStore={delegationsStore}
          validatorsStore={validatorsStore}
          unDelegationsStore={unDelegationsStore}
          claimRewardsStore={claimRewardsStore}
          forceChain={activeChain}
          forceNetwork={activeNetwork}
          onValidatorClaim={onValidatorClaim}
        />

        {showReviewValidatorClaimTx && selectedDelegation && (
          <ReviewValidatorClaimTx
            isOpen={showReviewValidatorClaimTx}
            onClose={() => setShowReviewValidatorClaimTx(false)}
            validator={validators?.[selectedDelegation.delegation.validator_address]}
            selectedDelegation={selectedDelegation}
            forceChain={activeChain}
            forceNetwork={activeNetwork}
            setClaimTxMode={setClaimTxMode}
          />
        )}
      </ScrollView>
    );
  },
);

export default ValidatorList;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 24,
    width: '100%',
    paddingHorizontal: 0,
  },
  section: {
    flexDirection: 'column',
    width: '100%',
    gap: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  header: {
    fontSize: 12,
    color: '#64748b',
  },
  modalContainer: {
    padding: 0,
    height: '100%',
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderColor: '#E2E8F0', // secondary-200
  },
  scrollArea: {
    padding: 24,
    flexGrow: 1,
    gap: 14,
  },
  validatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  validatorImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  validatorMoniker: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1e293b',
  },
  statsCard: {
    flexDirection: 'column',
    gap: 12,
    backgroundColor: '#F1F5F9', // secondary-100
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
  statsLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statsValue: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1e293b',
  },
  statsAprValue: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#059669', // accent-success
  },
  sectionBlock: {
    marginTop: 10,
    marginBottom: 4,
    flexDirection: 'column',
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 3,
  },
  sectionCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  sectionAmount: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1e293b',
    marginRight: 6,
  },
  sectionSubAmount: {
    fontSize: 13,
    color: '#64748b',
  },
  rewardCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rewardAmount: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1e293b',
  },
  rewardToken: {
    fontSize: 13,
    color: '#64748b',
  },
  claimBtn: {
    width: 121,
    alignSelf: 'flex-end',
  },
  footerBar: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#E2E8F0', // secondary-200
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  footerBtn: {
    flex: 1,
  },
});
