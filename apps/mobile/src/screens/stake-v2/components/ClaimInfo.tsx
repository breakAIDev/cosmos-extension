import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { MotiView } from 'moti';
import BigNumber from 'bignumber.js';

import { formatTokenAmount, SelectedNetwork, useActiveChain, useActiveStakingDenom, useSelectedNetwork, useStaking } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import { claimRewardsStore, delegationsStore, unDelegationsStore, validatorsStore } from '../../../context/stake-store';
import BottomModal from '../../../components/bottom-modal';

// -- Card
export function ClaimCard({
  titleAmount,
  secondaryAmount,
  button,
}: {
  titleAmount: string;
  secondaryAmount: string;
  button: React.ReactNode;
}) {
  return (
    <View
      style={styles.card}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{titleAmount}</Text>
        <Text style={styles.cardSubtitle}>{secondaryAmount}</Text>
      </View>
      {React.isValidElement(button) ? button : <View/>}
    </View>
  );
}

// -- Main Modal
function ClaimInfo({
  isOpen,
  onClose,
  onClaim,
  onClaimAndStake,
  forceChain,
  forceNetwork,
}: {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
  onClaimAndStake: () => void;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
}) {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;

  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = forceNetwork || _activeNetwork;

  const [formatCurrency] = useFormatCurrency();

  const denoms = rootDenomsStore.allDenoms;
  const chainDelegations = delegationsStore.delegationsForChain(activeChain);
  const chainValidators = validatorsStore.validatorsForChain(activeChain);
  const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
  const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);
  const { totalRewardsDollarAmt, rewards } = useStaking(
    denoms,
    chainDelegations,
    chainValidators,
    chainUnDelegations,
    chainClaimRewards,
    activeChain,
    activeNetwork,
  );

  const nativeTokenReward = useMemo(() => {
    if (rewards) {
      return rewards.total?.find(token => token.denom === activeStakingDenom?.coinMinimalDenom);
    }
  }, [activeStakingDenom?.coinMinimalDenom, rewards]);

  const isClaimAndStakeDisabled = useMemo(
    () => !nativeTokenReward || new BigNumber(nativeTokenReward.amount).lt(0.00001),
    [nativeTokenReward]
  );

  const formattedNativeTokenReward = useMemo(() => {
    return hideAssetsStore.formatHideBalance(
      formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom),
    );
  }, [activeStakingDenom?.coinDenom, nativeTokenReward?.amount]);

  const nativeRewardTitle = useMemo(() => {
    if (new BigNumber(nativeTokenReward?.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(
        formatCurrency(new BigNumber(nativeTokenReward?.currencyAmount ?? '')),
      );
    } else {
      return formattedNativeTokenReward;
    }
  }, [formatCurrency, formattedNativeTokenReward, nativeTokenReward?.currencyAmount]);

  const nativeRewardSubtitle = useMemo(() => {
    if (new BigNumber(nativeTokenReward?.currencyAmount ?? '').gt(0)) {
      return formattedNativeTokenReward;
    }
    return '';
  }, [formattedNativeTokenReward, nativeTokenReward?.currencyAmount]);

  const formattedTokenReward = useMemo(() => {
    const rewardCount = rewards?.total?.length ?? 0;
    return hideAssetsStore.formatHideBalance(
      `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom)} ${
        rewardCount > 1 ? `+${rewardCount - 1} more` : ''
      }`,
    );
  }, [activeStakingDenom?.coinDenom, nativeTokenReward?.amount, rewards?.total?.length]);

  const totalRewardTitle = useMemo(() => {
    if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
      return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)));
    } else {
      return formattedTokenReward;
    }
  }, [formatCurrency, formattedTokenReward, totalRewardsDollarAmt]);

  const totalRewardSubtitle = useMemo(() => {
    if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
      return formattedTokenReward;
    }
    return '';
  }, [formattedTokenReward, totalRewardsDollarAmt]);

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={"Claim rewards"}
      style={{ justifyContent: 'center', margin: 0 }}
    >
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>{`Claim rewards on ${activeStakingDenom.coinDenom}`}</Text>
        <ClaimCard
          titleAmount={totalRewardTitle}
          secondaryAmount={totalRewardSubtitle}
          button={
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClaim}>
              <Text style={styles.secondaryBtnText}>Claim</Text>
            </TouchableOpacity>
          }
        />

        <View style={{ height: 18 }} />

        <Text style={styles.modalTitle}>Auto stake the rewards earned</Text>
        <ClaimCard
          titleAmount={nativeRewardTitle}
          secondaryAmount={nativeRewardSubtitle}
          button={
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                isClaimAndStakeDisabled && { backgroundColor: '#DDD' },
              ]}
              onPress={onClaimAndStake}
              disabled={isClaimAndStakeDisabled}
            >
              <Text style={styles.primaryBtnText}>Claim &amp; stake</Text>
            </TouchableOpacity>
          }
        />

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
}

export default ClaimInfo;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    margin: 18,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#666',
    fontSize: 15,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    width: '100%',
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  secondaryBtn: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginLeft: 8,
  },
  secondaryBtnText: {
    fontWeight: '600',
    color: '#111',
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: '#34d399',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  closeBtn: {
    marginTop: 18,
    padding: 6,
  },
  closeBtnText: {
    color: '#1e40af',
    fontWeight: '700',
    fontSize: 16,
  },
});
