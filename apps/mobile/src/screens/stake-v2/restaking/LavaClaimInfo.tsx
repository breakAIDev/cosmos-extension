import { formatTokenAmount, useActiveStakingDenom, useDualStaking, useStaking } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
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
import { Button } from '../../../components/ui/button';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { SelectedNetwork, useSelectedNetwork } from '../../../hooks/settings/useNetwork';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { hideAssetsStore } from '../../../context/hide-assets-store';

import { ClaimCard } from '../components/ClaimInfo';
import Text from '../../../components/text';
import { GenericCard } from '@leapwallet/leap-ui';

interface LavaClaimInfoProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimValidatorRewards: () => void;
  onClaimProviderRewards: () => void;
  rootDenomsStore: RootDenomsStore;
  rootBalanceStore: RootBalanceStore;
  delegationsStore: DelegationsStore;
  validatorsStore: ValidatorsStore;
  unDelegationsStore: UndelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
}

const LavaClaimInfo = observer(
  ({
    isOpen,
    onClose,
    onClaimValidatorRewards,
    onClaimProviderRewards,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
  }: LavaClaimInfoProps) => {
    const [formatCurrency] = useFormatCurrency();
    const denoms = rootDenomsStore.allDenoms;

    const _activeChain = useActiveChain();
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

    const _activeNetwork = useSelectedNetwork();
    const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);
    const chainDelegations = delegationsStore.delegationsForChain(activeChain);
    const chainValidators = validatorsStore.validatorsForChain(activeChain);
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

    const {
      totalRewardsDollarAmt = 0,
      rewards = { total: [] },
      totalRewards,
    } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    );
    const isClaimDisabled = useMemo(() => !totalRewards || new BigNumber(totalRewards).lt(0.00001), [totalRewards]);
    const { rewards: providerRewards } = useDualStaking();

    const isProviderClaimDisabled = useMemo(
      () => !providerRewards?.totalRewards || new BigNumber(providerRewards?.totalRewards).lt(0.00001),
      [providerRewards?.totalRewards],
    );
    const nativeTokenReward = useMemo(() => {
      if (rewards) {
        return rewards?.total?.find((token) => token.denom === activeStakingDenom?.coinMinimalDenom);
      }
    }, [activeStakingDenom?.coinMinimalDenom, rewards]);

    const formattedTokenProviderReward = useMemo(() => {
      if (providerRewards) {
        const rewardItems = providerRewards.rewards
          ?.flatMap((reward) => reward.amount)
          .reduce((acc, curr) => {
            acc[curr.denom] = acc[curr.denom]
              ? new BigNumber(acc[curr.denom]).plus(new BigNumber(curr.amount))
              : new BigNumber(curr.amount);
            return acc;
          }, {} as Record<string, BigNumber>);
        const rewardsLength = Object.keys(rewardItems ?? {}).length;
        return hideAssetsStore.formatHideBalance(
          `${providerRewards.formattedTotalRewards} ${rewardsLength > 1 ? `+${rewardsLength - 1} more` : ''}`,
        );
      }
    }, [providerRewards]);

    const formattedTokenReward = useMemo(() => {
      return hideAssetsStore.formatHideBalance(
        `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom.coinDenom)} ${
          rewards?.total?.length > 1 ? `+${rewards?.total?.length - 1} more` : ''
        }`,
      );
    }, [activeStakingDenom?.coinDenom, nativeTokenReward?.amount, rewards?.total.length]);

    const validatorRewardTitle = useMemo(() => {
      if (new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)));
      } else {
        return formattedTokenReward;
      }
    }, [formatCurrency, formattedTokenReward, totalRewardsDollarAmt]);

    const validatorRewardSubtitle = useMemo(() => {
      if (new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return formattedTokenReward;
      }
      return '';
    }, [formattedTokenReward, totalRewardsDollarAmt]);

    const providerRewardTitle = useMemo(() => {
      if (new BigNumber(providerRewards?.totalRewardsDollarAmt).gt(0)) {
        return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(providerRewards?.totalRewardsDollarAmt)));
      } else {
        return formattedTokenProviderReward;
      }
    }, [formatCurrency, formattedTokenProviderReward, providerRewards?.totalRewardsDollarAmt]);

    const providerRewardSubtitle = useMemo(() => {
      if (new BigNumber(providerRewards?.totalRewardsDollarAmt).gt(0)) {
        return formattedTokenProviderReward;
      }
      return '';
    }, [formattedTokenProviderReward, providerRewards?.totalRewardsDollarAmt]);

    return (
      <BottomModal
        isOpen={isOpen}
        onClose={onClose}
        title="Claim rewards"
        containerStyle={styles.modalContainer}
        contentStyle={styles.modalContent}
      >
        <View style={styles.columnCenter}>
          {/* Validator Rewards */}
          <View style={styles.cardBlock}>
            <Text size="xs" style={styles.sectionLabel} color="text-gray-700">
              Validator Rewards
            </Text>
            <GenericCard
              title={
                <Text size="sm" style={styles.cardTitle} color="text-gray-800">
                  {validatorRewardTitle}
                </Text>
              }
              subtitle={
                <Text size="xs" style={styles.cardSubtitle} color="text-gray-600">
                  {validatorRewardSubtitle}
                </Text>
              }
              size="md"
              isRounded
              // containerStyle={styles.cardContainer}
              title2={
                <TouchableOpacity
                  onPress={onClaimValidatorRewards}
                  disabled={isClaimDisabled}
                  style={[
                    styles.claimBtn,
                    isClaimDisabled && styles.claimBtnDisabled,
                  ]}
                >
                  <Text
                    size="xs"
                    style={[
                      styles.claimBtnText,
                      isClaimDisabled && styles.claimBtnTextDisabled,
                    ]}
                  >
                    Claim
                  </Text>
                </TouchableOpacity>
              }
            />
          </View>

          {/* Provider Rewards */}
          <View style={styles.cardBlock}>
            <Text size="xs" style={styles.sectionLabel} color="text-gray-700">
              Provider Rewards
            </Text>
            <GenericCard
              title={
                <Text size="sm" style={styles.cardTitle} color="text-black-100">
                  {providerRewardTitle}
                </Text>
              }
              subtitle={
                <Text size="xs" style={styles.cardSubtitle} color="text-gray-600">
                  {providerRewardSubtitle}
                </Text>
              }
              size="md"
              isRounded
              // containerStyle={styles.cardContainer}
              title2={
                <TouchableOpacity
                  onPress={onClaimProviderRewards}
                  disabled={isProviderClaimDisabled}
                  style={[
                    styles.claimBtn,
                    isProviderClaimDisabled && styles.claimBtnDisabled,
                  ]}
                >
                  <Text
                    size="xs"
                    style={[
                      styles.claimBtnText,
                      isProviderClaimDisabled && styles.claimBtnTextDisabled,
                    ]}
                  >
                    Claim
                  </Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>
        <View style={styles.rewardBlock}>
          <Text size="sm" style={styles.sectionTitle} color="text-gray-600">
            Validator Rewards
          </Text>
          <ClaimCard
            titleAmount={validatorRewardTitle}
            secondaryAmount={validatorRewardSubtitle}
            button={
              <Button
                onPress={onClaimValidatorRewards}
                disabled={isClaimDisabled}
                size="md"
                variant="secondary"
                style={styles.claimBtn}
              >
                Claim
              </Button>
            }
          />
        </View>
        <View style={styles.rewardBlock}>
          <Text size="sm" style={styles.sectionTitle} color="text-gray-600">
            Provider Rewards
          </Text>
          <ClaimCard
            titleAmount={providerRewardTitle ?? ''}
            secondaryAmount={providerRewardSubtitle ?? ''}
            button={
              <Button
                onPress={onClaimProviderRewards}
                disabled={isProviderClaimDisabled}
                size="md"
                variant="secondary"
                style={styles.claimBtn}
              >
                Claim
              </Button>
            }
          />
        </View>
      </BottomModal>
    );
  },
);

const styles = StyleSheet.create({
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  cardBlock: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    marginBottom: 4,
  },
  sectionLabel: {
    marginBottom: 2,
    color: '#475569', // Tailwind gray-700, adjust for dark mode if needed
  },
  cardContainer: {
    backgroundColor: '#fff', // or dark: '#09090b'
    borderRadius: 14,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#1e293b', // gray-800 or white-100
  },
  cardSubtitle: {
    fontWeight: '500',
    color: '#475569', // gray-600
  },
  claimBtn: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#0f172a',
    alignSelf: 'flex-start',
    marginTop: 6,
    width: 120,
  },
  claimBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  claimBtnDisabled: {
    opacity: 0.7,
    backgroundColor: '#e2e8f0',
  },
  claimBtnTextDisabled: {
    color: '#a1a1aa', // gray-400 or gray-900 for dark
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginTop: 12,
  },
  modalContent: {
    flex: 1,
    gap: 24,
  },
  rewardBlock: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#64748b',
    marginBottom: 4,
    fontSize: 14,
  },
});

export default LavaClaimInfo;
