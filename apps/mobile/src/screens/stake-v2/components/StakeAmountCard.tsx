import {
  formatTokenAmount,
  SelectedNetwork,
  useActiveChain,
  useActiveStakingDenom,
  useActiveWallet,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { WALLETTYPE } from '@leapwallet/cosmos-wallet-store';
import BigNumber from 'bignumber.js';
import { Button } from '../../../components/ui/button';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import { claimRewardsStore, delegationsStore, unDelegationsStore, validatorsStore } from '../../../context/stake-store';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';

import { StakeInputPageState } from '../StakeInputPage';
import { AnimatePresence, MotiText, MotiView } from 'moti';

type StakeAmountCardProps = {
  onClaim: () => void;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
};

const AmountCard = ({
  loading,
  title,
  children,
}: {
  loading: boolean;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <View style={styles.amountCard}>
      <Text style={styles.amountCardTitle}>{title}</Text>
      <AnimatePresence>
        {loading ? (
          <MotiView
            key="loading"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 6 }}
          >
            <ActivityIndicator size="small" color="#888" />
          </MotiView>
        ) : (
          <MotiView
            key="loaded"
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0 }}
            style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}
          >
            {children}
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
};

function AnimatedNumber({ value, style }: { value: number; style?: any }) {
  const rounded = Number(value?.toFixed(2) || '0');
  return (
    <MotiText
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 700 }}
      style={style}
    >
      {rounded}
    </MotiText>
  );
}

const StakeAmountCard = observer(({ onClaim, forceChain, forceNetwork }: StakeAmountCardProps) => {
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;

  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = forceNetwork ?? _activeNetwork;

  const { theme } = useTheme();
  const denoms = rootDenomsStore.allDenoms;
  const chainDelegations = delegationsStore.delegationsForChain(activeChain);
  const chainValidators = validatorsStore.validatorsForChain(activeChain);
  const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
  const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);
  const {
    totalRewardsDollarAmt,
    loadingDelegations,
    currencyAmountDelegation,
    totalDelegationAmount,
    loadingRewards,
    totalRewards,
    rewards,
  } = useStaking(
    denoms,
    chainDelegations,
    chainValidators,
    chainUnDelegations,
    chainClaimRewards,
    activeChain,
    activeNetwork,
  );
  const [formatCurrency] = useFormatCurrency();
  const activeWallet = useActiveWallet();
  const navigation = useNavigation();

  const formattedCurrencyAmountDelegation = useMemo(() => {
    if (currencyAmountDelegation && new BigNumber(currencyAmountDelegation).gt(0)) {
      return formatCurrency(new BigNumber(currencyAmountDelegation));
    }
  }, [currencyAmountDelegation, formatCurrency]);

  const isClaimDisabled = useMemo(() => {
    if (activeChain === 'evmos' && activeWallet?.walletType === WALLETTYPE.LEDGER) {
      return true;
    }
    return !totalRewards || new BigNumber(totalRewards).lt(0.00001);
  }, [activeChain, activeWallet?.walletType, totalRewards]);

  const formattedRewardAmount = useMemo(() => {
    const nativeTokenReward = rewards?.total?.find((token) => token.denom === activeStakingDenom?.coinMinimalDenom);
    if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
      return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)));
    }
    const rewardsCount = rewards?.total?.length ?? 0;
    return hideAssetsStore.formatHideBalance(
      `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom)} ${
        rewardsCount > 1 ? `+${rewardsCount - 1} more` : ''
      }`,
    );
  }, [activeStakingDenom, formatCurrency, rewards, totalRewardsDollarAmt]);

  // Card color
  const cardColor = theme === ThemeName.DARK ? '#242438' : '#f4f5f8';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 24 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0 }}
      style={[styles.container, { backgroundColor: cardColor }]}
      transition={{ type: 'timing', duration: 400 }}
    >
      <View style={styles.topRow}>
        <AmountCard title="Deposited Amount" loading={loadingDelegations}>
          <View style={{ flexDirection: 'column' }}>
            <AnimatedNumber
              value={Number(formattedCurrencyAmountDelegation?.replace(/[^0-9.]/g, '') || '0')}
              style={styles.amountText}
            />
            <Text style={styles.amountSubText}>
              ({hideAssetsStore.formatHideBalance(totalDelegationAmount ?? '-')})
            </Text>
          </View>
        </AmountCard>
        <AmountCard title="Total Earnings" loading={loadingRewards}>
          <AnimatedNumber
            value={Number((formattedRewardAmount || '0').replace(/[^0-9.]/g, ''))}
            style={[styles.amountText, { color: '#26ad6f' }]}
          />
        </AmountCard>
      </View>

      <View style={styles.bottomRow}>
        <Button
          size="md"
          onPress={() => {
            const state: StakeInputPageState = {
              mode: 'DELEGATE',
              forceChain: activeChain,
              forceNetwork: activeNetwork,
            };
            navigation.navigate('StakeInput', { state });
          }}
        >
          Stake
        </Button>
        <Button
          variant="secondary"
          size="md"
          style={styles.claimButton}
          onPress={onClaim}
          disabled={isClaimDisabled}
        >
          Claim
        </Button>
      </View>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    width: '100%',
    padding: 20,
    gap: 24,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    marginBottom: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 10,
  },
  amountCard: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    marginRight: 4,
  },
  amountCardTitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 3,
  },
  amountText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  amountSubText: {
    fontSize: 13,
    color: '#999',
    marginTop: 1,
  },
  claimButton: {
    backgroundColor: '#e5e5e8',
  },
});

export default StakeAmountCard;
