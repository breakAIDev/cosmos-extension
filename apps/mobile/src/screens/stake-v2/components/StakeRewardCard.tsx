import {
  formatTokenAmount,
  SelectedNetwork,
  useActiveChain,
  useActiveStakingDenom,
  useDualStaking,
  useFeatureFlags,
  useSelectedNetwork,
  useStaking,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store';
import { CaretDown } from 'phosphor-react-native';
import BigNumber from 'bignumber.js';
import Text from '../../../components/text';
import useActiveWallet from '../../../hooks/settings/useActiveWallet';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';

interface StakeRewardCardProps {
  onClaim?: () => void;
  onClaimAndStake?: () => void;
  rootDenomsStore: RootDenomsStore;
  delegationsStore: DelegationsStore;
  validatorsStore: ValidatorsStore;
  unDelegationsStore: UndelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
}

const StakeRewardCard = observer(({
  onClaim,
  onClaimAndStake,
  rootDenomsStore,
  delegationsStore,
  validatorsStore,
  unDelegationsStore,
  claimRewardsStore,
  forceChain,
  forceNetwork,
}: StakeRewardCardProps) => {
  const { theme } = useTheme();
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
  const { data: featureFlags } = useFeatureFlags();
  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);

  const denoms = rootDenomsStore.allDenoms;
  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);
  const chainDelegations = delegationsStore.delegationsForChain(activeChain);
  const chainValidators = validatorsStore.validatorsForChain(activeChain);
  const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
  const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

  const [formatCurrency] = useFormatCurrency();
  const { activeWallet } = useActiveWallet();
  const { rewards: providerRewards } = useDualStaking();
  const { totalRewards, totalRewardsDollarAmt, loadingRewards, rewards } = useStaking(
    denoms,
    chainDelegations,
    chainValidators,
    chainUnDelegations,
    chainClaimRewards,
    activeChain,
    activeNetwork,
  );

  const isClaimDisabled = useMemo(() => {
    if (activeChain === 'evmos' && activeWallet?.walletType === WALLETTYPE.LEDGER) {
      return true;
    }
    return !totalRewards || new BigNumber(totalRewards).lt(0.00001);
  }, [activeChain, activeWallet?.walletType, totalRewards]);

  const nativeTokenReward = useMemo(() => {
    if (rewards) {
      return rewards.total?.find((token) => token.denom === activeStakingDenom?.coinMinimalDenom);
    }
  }, [activeStakingDenom?.coinMinimalDenom, rewards]);

  const formattedRewardAmount = useMemo(() => {
    if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
      return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)));
    } else {
      const rewardsCount = rewards?.total?.length ?? 0;
      return hideAssetsStore.formatHideBalance(
        `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom)} ${
          rewardsCount > 1 ? `+${rewardsCount - 1} more` : ''
        }`,
      );
    }
  }, [
    activeStakingDenom?.coinDenom,
    formatCurrency,
    nativeTokenReward?.amount,
    rewards?.total?.length,
    totalRewardsDollarAmt,
  ]);

  // Button color logic
  const bgColor = theme === ThemeName.DARK ? '#18181c' : '#f5f6fa';
  const btnColor = theme === ThemeName.DARK ? '#2e2f39' : '#ededed';
  const textColor = theme === ThemeName.DARK ? '#fff' : '#111';
  const btnTextColor = theme === ThemeName.DARK ? '#fff' : '#222';

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.column}>
        <Text style={{ color: theme === ThemeName.DARK ? '#bcbcbc' : '#666' }} size="xs">
          You have earned
        </Text>
        {loadingRewards ? (
          <ActivityIndicator size="small" color={theme === ThemeName.DARK ? '#fff' : '#000'} style={{ marginTop: 2 }} />
        ) : (
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15, marginTop: 1 }} size="sm">
            {formattedRewardAmount}
          </Text>
        )}
      </View>
      {loadingRewards ? (
        <ActivityIndicator size="small" color={theme === ThemeName.DARK ? '#fff' : '#000'} style={{ marginLeft: 10 }} />
      ) : activeChain === 'lava' && featureFlags?.restaking?.extension === 'active' ? (
        <TouchableOpacity
          disabled={isClaimDisabled && new BigNumber(providerRewards.totalRewards).lt(0.00001)}
          onPress={onClaim}
          style={[
            styles.claimBtn,
            {
              backgroundColor: btnColor,
              opacity: (isClaimDisabled && new BigNumber(providerRewards.totalRewards).lt(0.00001)) ? 0.6 : 1,
            },
          ]}
        >
          <Text style={[styles.claimText, { color: btnTextColor }]}>Claim</Text>
          <CaretDown size={14} color={btnTextColor} />
        </TouchableOpacity>
      ) : (
        <View style={[styles.splitBtn, { backgroundColor: btnColor, opacity: isClaimDisabled ? 0.6 : 1 }]}>
          <TouchableOpacity
            disabled={isClaimDisabled}
            onPress={onClaim}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 12 }}
          >
            <Text style={[styles.claimText, { color: btnTextColor, paddingRight: 2 }]}>Claim</Text>
          </TouchableOpacity>
          <View style={{ width: 1, height: 18, backgroundColor: theme === ThemeName.DARK ? '#444' : '#ccc' }} />
          <TouchableOpacity
            disabled={isClaimDisabled}
            onPress={onClaimAndStake}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 8 }}
          >
            <CaretDown size={14} color={btnTextColor} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  column: {
    flexDirection: 'column',
    gap: 2,
    minWidth: 120,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    gap: 8,
    marginLeft: 4,
  },
  claimText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  splitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    overflow: 'hidden',
    marginLeft: 4,
  },
});

export default StakeRewardCard;
