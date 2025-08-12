import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';

import {
  sliceWord,
  useActiveChain,
  useActiveStakingDenom,
  useDualStaking,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import { useTheme } from '@leapwallet/leap-ui';

import BottomModal from '../../../components/new-bottom-modal';
import { ValidatorItemSkeleton } from '../../../components/Skeletons/StakeSkeleton';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { Images } from '../../../../assets/images';
import { Provider, ProviderDelegation, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { Button } from '../../../components/ui/button';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import { ValidatorCardView } from '../components/ValidatorCardView';

// ---------- StakedProviderDetails (Modal) ---------------
interface StakedProviderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchValidator: () => void;
  provider?: Provider;
  delegation: ProviderDelegation;
  rootDenomsStore: RootDenomsStore;
  forceChain?: SupportedChain;
  forceNetwork?: 'mainnet' | 'testnet';
}

const StakedProviderDetails = observer(({
  isOpen,
  onClose,
  onSwitchValidator,
  provider,
  delegation,
  rootDenomsStore,
  forceChain,
  forceNetwork,
}: StakedProviderDetailsProps) => {
  const denoms = rootDenomsStore.allDenoms;
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);
  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);
  const [formatCurrency] = useFormatCurrency();
  const { theme } = useTheme();

  const amountTitleText = useMemo(() => {
    if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(delegation.amount.currencyAmount ?? '')));
    } else {
      return hideAssetsStore.formatHideBalance(delegation.amount.formatted_amount ?? delegation.amount.amount);
    }
  }, [
    delegation.amount.amount,
    delegation.amount.currencyAmount,
    delegation.amount.formatted_amount,
    formatCurrency,
  ]);

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(delegation.amount.formatted_amount ?? delegation.amount.amount);
    }
    return '';
  }, [delegation.amount.amount, delegation.amount.currencyAmount, delegation.amount.formatted_amount]);

  // Responsive moniker slicing (adjust as needed for your UI)
  const screenWidth = Dimensions.get('window').width;
  const monikerMaxLen = 18 + Math.floor(((Math.min(screenWidth, 400) - 320) / 81) * 7);

  return (
    <BottomModal
      fullScreen
      isOpen={isOpen}
      onClose={onClose}
      title="Provider Details"
      contentStyle={{ padding: 0, minHeight: '100%' }}
    >
      <ScrollView contentContainerStyle={styles.modalBody}>
        <View style={styles.providerHeaderRow}>
          <Image
            source={{ uri: provider?.image || Images.Misc.Validator }}
            style={styles.providerAvatar}
          />
          <Text style={styles.providerName}>
            {sliceWord(provider?.moniker ?? '', monikerMaxLen, 3)}
          </Text>
        </View>

        <View style={styles.detailBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Staked</Text>
            <Text style={styles.detailValue}>N/A</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Commission</Text>
            <Text style={styles.detailValue}>N/A</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>APR</Text>
            <Text style={[styles.detailValue, styles.successValue]}>N/A</Text>
          </View>
        </View>

        <Text style={styles.depositedLabel}>Your deposited amount</Text>
        <View style={styles.amountBox}>
          <Text style={styles.amountText}>{amountTitleText} </Text>
          {!!amountSubtitleText && (
            <Text style={styles.amountSubText}>({amountSubtitleText})</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomActionRow}>
        <Button onPress={onSwitchValidator}>Switch provider</Button>
      </View>
    </BottomModal>
  );
});

// ---------- ProviderCard ---------------
interface ProviderCardProps {
  provider: Provider;
  delegation: ProviderDelegation;
  onClick?: () => void;
}

const ProviderCard = observer(({ provider, delegation, onClick }: ProviderCardProps) => {
  const [formatCurrency] = useFormatCurrency();

  const amountTitleText = useMemo(() => {
    if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(delegation.amount.currencyAmount ?? '')));
    } else {
      return hideAssetsStore.formatHideBalance(delegation.amount.formatted_amount ?? delegation.amount.amount);
    }
  }, [delegation.amount.amount, delegation.amount.currencyAmount, delegation.amount.formatted_amount, formatCurrency]);

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(delegation.amount.formatted_amount ?? delegation.amount.amount);
    }
    return '';
  }, [delegation.amount.amount, delegation.amount.currencyAmount, delegation.amount.formatted_amount]);

  return (
    <ValidatorCardView
      onClick={onClick}
      imgSrc={Images.Misc.Validator}
      moniker={provider.moniker ?? ''}
      titleAmount={amountTitleText}
      subAmount={amountSubtitleText}
      jailed={false}
    />
  );
});

// ---------- ProviderList (Main Export) ---------------
const ProviderList = observer(({ forceChain, forceNetwork }: { forceChain?: SupportedChain; forceNetwork?: 'mainnet' | 'testnet' }) => {
  // Navigation logic will depend on your stack; replace below with useNavigation from react-navigation if needed
  // const navigation = useNavigation();
  const [showStakedProviderDetails, setShowStakedProviderDetails] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState<ProviderDelegation | undefined>();
  const { delegations: providerDelegations, loadingDelegations, providers } = useDualStaking();

  const emptyProviderDelegation = useMemo(() => {
    return Object.values(providerDelegations ?? {}).find((d) => d.provider === 'empty_provider');
  }, [providerDelegations]);

  const sortedDelegations = useMemo(() => {
    return Object.values(providerDelegations ?? {}).sort(
      (a, b) => parseFloat(b.amount.amount) - parseFloat(a.amount.amount),
    );
  }, [providerDelegations]);

  const emptyProvider = useMemo(() => ({
    provider: emptyProviderDelegation?.provider ?? '',
    moniker: 'Empty Provider',
    address: emptyProviderDelegation?.provider ?? '',
    specs: [],
  }), [emptyProviderDelegation?.provider]);

  return (
    <View>
      {loadingDelegations && <ValidatorItemSkeleton />}
      <View style={{ flexDirection: 'column', width: '100%', gap: 8 }}>
        {!loadingDelegations && providers && sortedDelegations.length > 0 && (
          <>
            {emptyProviderDelegation && (
              <>
                <View style={styles.labelRow}>
                  <Text style={styles.labelText}>Empty Provider</Text>
                  <Text style={styles.labelText}>Amount Staked</Text>
                </View>
                <ProviderCard
                  delegation={emptyProviderDelegation}
                  provider={emptyProvider}
                  onClick={() => {
                    setSelectedDelegation(emptyProviderDelegation);
                    setShowStakedProviderDetails(true);
                  }}
                />
              </>
            )}
            {sortedDelegations.length > 1 && (
              <View style={styles.labelRow}>
                <Text style={styles.labelText}>Provider</Text>
                <Text style={styles.labelText}>Amount Staked</Text>
              </View>
            )}
            {sortedDelegations.map((d) => {
              const provider = providers?.find((el) => el.address === d.provider);
              return (
                provider && (
                  <ProviderCard
                    key={provider?.address}
                    delegation={d}
                    provider={provider}
                    onClick={() => {
                      setSelectedDelegation(d);
                      setShowStakedProviderDetails(true);
                    }}
                  />
                )
              );
            })}
          </>
        )}
      </View>
      {selectedDelegation && (
        <StakedProviderDetails
          rootDenomsStore={rootDenomsStore}
          isOpen={showStakedProviderDetails}
          onClose={() => setShowStakedProviderDetails(false)}
          provider={
            selectedDelegation.provider === emptyProviderDelegation?.provider
              ? emptyProvider
              : providers.find((p) => p.address === selectedDelegation.provider)
          }
          delegation={selectedDelegation}
          onSwitchValidator={() => {
            // Navigation logic: you will need to adapt for react-navigation or similar
            // Prepare next state and trigger navigation
            // const state: StakeInputPageState = {
            //   mode: 'REDELEGATE',
            //   fromProvider: selectedDelegation.provider === emptyProviderDelegation?.provider
            //     ? emptyProvider
            //     : providers.find((p) => p.address === selectedDelegation.provider),
            //   providerDelegation: selectedDelegation,
            //   forceChain: 'lava',
            // };
            // navigation.navigate('StakeInput', { state });
            setShowStakedProviderDetails(false);
          }}
          forceChain={forceChain}
          forceNetwork={forceNetwork}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  modalBody: {
    padding: 24,
    paddingTop: 36,
    flexDirection: 'column',
    gap: 18,
    minHeight: '70%',
    backgroundColor: '#fff',
  },
  providerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  providerName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  detailBox: {
    flexDirection: 'column',
    gap: 12,
    backgroundColor: '#f4f5f8',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  successValue: {
    color: '#14b86a',
  },
  depositedLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 18,
    marginBottom: 4,
  },
  amountBox: {
    backgroundColor: '#f4f5f8',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  amountSubText: {
    fontSize: 14,
    color: '#888',
  },
  bottomActionRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f7f7fa',
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: '#e4e4e7',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  labelText: {
    fontSize: 13,
    color: '#888',
  },
});

export default ProviderList;
