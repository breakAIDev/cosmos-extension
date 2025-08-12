import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { observer } from 'mobx-react-lite';
import { CaretUp, CaretDown } from 'phosphor-react-native';
import currency from 'currency.js';

import BottomModal from '../../../components/new-bottom-modal';
import { ProviderCard } from './SelectLSProvider';

// Assume you have RN versions of these UI components
import { GenericCard } from '@leapwallet/leap-ui';
import { useActiveChain, useStaking } from '@leapwallet/cosmos-wallet-hooks';

const CARD_BG = '#fff'; // Change as needed
const CARD_BG_DARK = '#18181b'; // Change as needed

type StakeSelectSheetProps = {
  isVisible: boolean;
  title: string;
  onClose: () => void;
  tokenLSProviders: any[]; // LSProvider[]
  handleStakeClick: () => void;
  rootDenomsStore: any;
  delegationsStore: any;
  validatorsStore: any;
  unDelegationsStore: any;
  claimRewardsStore: any;
  forceChain?: any;
  forceNetwork?: any;
};

const StakeSelectSheet = observer(({
  isVisible,
  title,
  onClose,
  tokenLSProviders,
  handleStakeClick,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
}: StakeSelectSheetProps) => {
    const _activeChain = useActiveChain();
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

    const denoms = rootDenomsStore.allDenoms;
    const chainDelegations = delegationsStore.delegationsForChain(activeChain);
    const chainValidators = validatorsStore.validatorsForChain(activeChain);
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

    const [showLSProviders, setShowLSProviders] = useState(false);
    const { minMaxApr } = useStaking(denoms, chainDelegations, chainValidators, chainUnDelegations, chainClaimRewards);


  const avgAprValue = useMemo(() => {
    if (minMaxApr) {
      const avgApr = (minMaxApr[0] + minMaxApr[1]) / 2;
      return currency((avgApr * 100).toString(), { precision: 2, symbol: '' }).format();
    }
    return null;
  }, [minMaxApr]);

  const maxLSAPY = useMemo(() => {
    if (tokenLSProviders?.length > 0) {
      const _maxAPY = Math.max(...tokenLSProviders.map((provider) => provider.apy));
      return `APY ${currency((_maxAPY * 100).toString(), { precision: 2, symbol: '' }).format()}%`;
    } else {
      return 'N/A';
    }
  }, [tokenLSProviders]);

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => {
        setShowLSProviders(false);
        onClose();
      }}
      title={title}
    >
      <View style={styles.container}>
        <GenericCard
          style={styles.genericCard}
          title={<Text style={styles.cardTitle}>Stake</Text>}
          subtitle={<Text style={styles.cardSubtitle}>APR {avgAprValue}%</Text>}
          isRounded
          size="md"
          title2={
            <TouchableOpacity style={styles.stakeBtn} onPress={handleStakeClick}>
              <Text style={styles.stakeBtnText}>Stake</Text>
            </TouchableOpacity>
          }
        />
        {tokenLSProviders?.length > 0 && (
          <View style={styles.lsProviderCard}>
            <View style={styles.lsProviderHeader}>
              <View>
                <Text style={styles.lsProviderTitle}>Liquid Stake</Text>
                <Text style={styles.lsProviderSubtitle}>{maxLSAPY}</Text>
              </View>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setShowLSProviders(!showLSProviders)}
              >
                {showLSProviders ? (
                  <CaretUp size={16} color="#111" />
                ) : (
                  <CaretDown size={16} color="#111" />
                )}
              </TouchableOpacity>
            </View>
            {showLSProviders && (
              <ScrollView style={styles.providersList}>
                {tokenLSProviders.map((provider) => (
                  <View key={provider.name} style={styles.providerCardWrapper}>
                    {provider.priority && (
                      <View style={styles.promotedBadge}>
                        <Text style={styles.promotedBadgeText}>Promoted</Text>
                      </View>
                    )}
                    <ProviderCard
                      provider={provider}
                      backgroundColor={provider.priority ? '#29A87426' : '#F9FAFB'}
                      rootDenomsStore={rootDenomsStore}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  genericCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  stakeBtn: {
    borderRadius: 16,
    backgroundColor: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  stakeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  lsProviderCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  lsProviderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lsProviderTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  lsProviderSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  dropdownBtn: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  providersList: {
    maxHeight: 300,
    marginTop: 12,
  },
  providerCardWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  promotedBadge: {
    position: 'absolute',
    top: 0,
    right: 16,
    backgroundColor: '#16a34a',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  promotedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default StakeSelectSheet;
