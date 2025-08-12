import React, { useMemo } from 'react';
import { View } from 'react-native';

import { useActiveChain, useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import useQuery from '../../hooks/useQuery';
import { chainTagsStore } from '../../context/chain-infos-store';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';
import {
  aggregateStakeStore,
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from '../../context/stake-store';
import { AggregatedSupportedChain } from '../../types/utility';

import { AggregatedStake } from './components/AggregatedStake';
import StakingUnavailable from './components/StakingUnavailable';
import { StakeHeader } from './stake-header';
import StakePage from './StakePage';

export default function Stake() {
  const pageViewSource = useQuery().get('pageSource') ?? undefined;
  const pageViewAdditionalProperties = useMemo(
    () => ({
      pageViewSource,
    }),
    [pageViewSource],
  );
  // usePageView(PageName.Stake, true, pageViewAdditionalProperties)
  const activeChain = useActiveChain() as AggregatedSupportedChain;

  const isStakeComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'stake',
    platform: 'Extension',
  });

  const isStakeNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'stake',
    platform: 'Extension',
  });

  if (activeChain === AGGREGATED_CHAIN_KEY) {
    return (
      <AggregatedStake
        aggregateStakeStore={aggregateStakeStore}
        rootDenomsStore={rootDenomsStore}
        delegationsStore={delegationsStore}
        validatorsStore={validatorsStore}
        unDelegationsStore={unDelegationsStore}
        claimRewardsStore={claimRewardsStore}
        rootBalanceStore={rootBalanceStore}
        chainTagsStore={chainTagsStore}
      />
    );
  }

  if (isStakeNotSupported || isStakeComingSoon) {
    return (
      <View>
        <StakeHeader />
        <StakingUnavailable
          isStakeComingSoon={isStakeComingSoon}
          isStakeNotSupported={isStakeNotSupported}
        />
      </View>
    );
  }

  return (
    <StakePage
      rootDenomsStore={rootDenomsStore}
      delegationsStore={delegationsStore}
      validatorsStore={validatorsStore}
      unDelegationsStore={unDelegationsStore}
      claimRewardsStore={claimRewardsStore}
      rootBalanceStore={rootBalanceStore}
      chainTagsStore={chainTagsStore}
    />
  );
}
