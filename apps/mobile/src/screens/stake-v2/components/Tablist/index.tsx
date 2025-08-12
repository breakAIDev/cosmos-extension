import {
  SelectedNetwork,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useDualStaking,
  useFeatureFlags,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { AnimatePresence, MotiView } from 'moti';
import { observer } from 'mobx-react-lite';
import ProviderList from '../../../stake-v2/restaking/ProviderList';
import React, { useMemo, useState } from 'react';
import { rootDenomsStore } from '../../../../context/denoms-store-instance';
import { stakeEpochStore } from '../../../../context/epoch-store';
import { rootBalanceStore } from '../../../../context/root-store';
import { claimRewardsStore, delegationsStore, unDelegationsStore, validatorsStore } from '../../../../context/stake-store';
import { transition150 } from '../../../../utils/motion-variants';
import { slideVariants } from '../../../../utils/motion-variants/global-layout-motions';

import PendingUnstakeList from '../PendingUnstakeList';
import ValidatorList from '../ValidatorList';
import { TabSelectors } from './tab-list-selector';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export enum TabElements {
  YOUR_DELEGATIONS = 'Your delegations',
  PENDING_UNSTAKE = 'Pending unstake',
  YOUR_PROVIDERS = 'Your providers',
}

const TabList = observer(
  ({
    forceChain,
    forceNetwork,
    setClaimTxMode,
  }: {
    forceChain?: SupportedChain;
    forceNetwork?: SelectedNetwork;
    setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void;
  }) => {
    const _activeChain = useActiveChain();
    const _activeNetwork = useSelectedNetwork();
    const activeChain = forceChain ?? _activeChain;
    const activeNetwork = forceNetwork ?? _activeNetwork;

    const denoms = rootDenomsStore.allDenoms;
    const chainDelegations = delegationsStore.delegationsForChain(activeChain);
    const chainValidators = validatorsStore.validatorsForChain(activeChain);
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

    const { delegations, unboundingDelegationsInfo, loadingDelegations, loadingUnboundingDelegations } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    );
    const { delegations: providerDelegations } = useDualStaking();
    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);

    const [selectedTab, setSelectedTab] = useState<{ label: TabElements }>();
    const isLoading = loadingDelegations || loadingUnboundingDelegations;

    const { data: featureFlags } = useFeatureFlags();

    const tabs = useMemo(() => {
      const pendingDelegations = stakeEpochStore.getDelegationEpochMessages(activeStakingDenom);
      const pendingUnDelegations = stakeEpochStore.getUnDelegationEpochMessages(activeStakingDenom);

      const _tabs = [];
      if (Object.values(delegations ?? {}).length > 0 || pendingDelegations.length > 0) {
        _tabs.push({ label: TabElements.YOUR_DELEGATIONS });
      }
      if (
        Object.values(providerDelegations ?? {}).length > 0 &&
        featureFlags?.restaking?.extension === 'active' &&
        activeChain === 'lava'
      ) {
        _tabs.push({ label: TabElements.YOUR_PROVIDERS });
      }
      if (Object.values(unboundingDelegationsInfo ?? {}).length > 0 || pendingUnDelegations.length > 0) {
        _tabs.push({ label: TabElements.PENDING_UNSTAKE });
      }
      if (_tabs.length > 0) {
        setSelectedTab(_tabs[0]);
      }
      return _tabs;
    }, [
      activeChain,
      activeStakingDenom,
      delegations,
      featureFlags?.restaking?.extension,
      providerDelegations,
      unboundingDelegationsInfo,
    ]);

    if (isLoading) {
      return <></>;
    }

    return (
      <View style={styles.container}>
        <View style={styles.tabSelectorContainer}>
          <TabSelectors
            buttons={tabs.map(label => ({ label }))}
            setSelectedTab={tab => setSelectedTab(tab.label as TabElements)}
            selectedIndex={tabs.findIndex(label => label === selectedTab)}
          />
        </View>

        <ScrollView style={{ flex: 1 }}>
          <AnimatePresence>
            {selectedTab?.label === TabElements.YOUR_DELEGATIONS && (
              <MotiView
                key={TabElements.YOUR_DELEGATIONS}
                transition={transition150}
                animate='animate'
                style={{position: 'relative'}}
              >
                <ValidatorList
                  rootDenomsStore={rootDenomsStore}
                  rootBalanceStore={rootBalanceStore}
                  delegationsStore={delegationsStore}
                  validatorsStore={validatorsStore}
                  unDelegationsStore={unDelegationsStore}
                  claimRewardsStore={claimRewardsStore}
                  forceChain={activeChain}
                  forceNetwork={activeNetwork}
                  setClaimTxMode={setClaimTxMode}
                />
              </MotiView>
            )}

            {selectedTab?.label === TabElements.PENDING_UNSTAKE && (
              <MotiView
                key={TabElements.PENDING_UNSTAKE}
                transition={transition150}
                animate='animate'
                style={{position: 'relative'}}
              >
                <PendingUnstakeList
                  rootDenomsStore={rootDenomsStore}
                  delegationsStore={delegationsStore}
                  validatorsStore={validatorsStore}
                  unDelegationsStore={unDelegationsStore}
                  claimRewardsStore={claimRewardsStore}
                  forceChain={activeChain}
                  forceNetwork={activeNetwork}
                  rootBalanceStore={rootBalanceStore}
                  setClaimTxMode={setClaimTxMode}
                />
              </MotiView>
            )}
            {selectedTab?.label === TabElements.YOUR_PROVIDERS && (
              <ProviderList forceChain={activeChain} forceNetwork={activeNetwork} />
            )}
          </AnimatePresence>
        </ScrollView>
      </View>
    );
  },
);

export default TabList;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 0, paddingTop: 0, backgroundColor: '#fff' },
  tabSelectorContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 16 },
});