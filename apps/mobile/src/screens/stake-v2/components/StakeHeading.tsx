import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import currency from 'currency.js';
import { MotiView, AnimatePresence } from 'moti';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { useChainInfo, useSelectedNetwork, useStaking, SelectedNetwork } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';

import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { claimRewardsStore, delegationsStore, unDelegationsStore, validatorsStore } from '../../../context/stake-store';

// ---- RN version of StakeHeading ----

type StakeHeadingProps = {
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
};

const StakeHeading = observer(({ forceChain, forceNetwork }: StakeHeadingProps) => {
  const _activeChain = useActiveChain();
  const _activeNetwork = useSelectedNetwork();

  const activeChain = forceChain ?? _activeChain;
  const activeNetwork = forceNetwork ?? _activeNetwork;

  const defaultTokenLogo = useDefaultTokenLogo();
  const activeChainInfo = useChainInfo(activeChain);

  const denoms = rootDenomsStore.allDenoms;
  const chainDelegations = delegationsStore.delegationsForChain(activeChain);
  const chainValidators = validatorsStore.validatorsForChain(activeChain);
  const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
  const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

  const { network, loadingNetwork } = useStaking(
    denoms,
    chainDelegations,
    chainValidators,
    chainUnDelegations,
    chainClaimRewards,
    activeChain,
    activeNetwork,
  );

  const aprValue = useMemo(() => {
    if (network?.chainApr) {
      return currency((network?.chainApr * 100).toString(), {
        precision: 2,
        symbol: '',
      }).format();
    }
  }, [network?.chainApr]);

  return (
    <View style={styles.headingRow}>
      <View style={styles.left}>
        <Image
          source={{ uri: activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo }}
          style={styles.logo}
          // fallback for onError: show defaultTokenLogo
          defaultSource={{ uri: defaultTokenLogo }}
        />
        <Text style={styles.chainName}>{activeChainInfo.chainName}</Text>
      </View>
      <AnimatePresence>
        {network?.chainApr === undefined ? (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 150 }}
            key="skeleton"
          >
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item width={80} height={20} borderRadius={8} />
            </SkeletonPlaceholder>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 150 }}
            key="span"
          >
            <Text style={styles.aprText}>
              {aprValue && `APR ${aprValue}%`}
            </Text>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
});

const styles = StyleSheet.create({
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB', // bg-secondary-300
    marginRight: 6,
  },
  chainName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111',
  },
  aprText: {
    fontSize: 15,
    color: '#6B7280', // text-muted-foreground
    fontWeight: '500',
  },
});

export default StakeHeading;
