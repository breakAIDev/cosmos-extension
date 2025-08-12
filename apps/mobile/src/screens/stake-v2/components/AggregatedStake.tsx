import { PerChainDelegations, sliceSearchWord, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import {
  AggregateStakeStore,
  ChainTagsStore,
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store';
import { CaretDown, CaretUp, X } from 'phosphor-react-native';
import BigNumber from 'bignumber.js';
import { AggregatedLoadingList } from '../../../components/aggregated';
import { EmptyCard } from '../../../components/empty-card';
import { SearchInput } from '../../../components/ui/input/search-input';
import currency from 'currency.js';
import { decodeChainIdToChain } from '../../../context/utils';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { useSelectedNetwork } from '../../../hooks/settings/useNetwork';
import useQuery from '../../../hooks/useQuery';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { StakeHeader } from '../stake-header';
import StakePage from '../StakePage';
import { AggregatedValues } from './AggregatedValues';
import { StakeTokenCard } from './StakeTokenCard';

const NETWORK = 'mainnet';
type DelegationsToConsider = PerChainDelegations & { chain: SupportedChain };

type AggregatedStakeProps = {
  aggregateStakeStore: AggregateStakeStore;
  rootDenomsStore: RootDenomsStore;
  delegationsStore: DelegationsStore;
  validatorsStore: ValidatorsStore;
  unDelegationsStore: UndelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
  rootBalanceStore: RootBalanceStore;
  chainTagsStore: ChainTagsStore;
};

export const AggregatedStake = observer(
  ({
    chainTagsStore,
    aggregateStakeStore,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    rootBalanceStore,
  }: AggregatedStakeProps) => {
    const {
      perChainDelegations,
      totalCurrencyAmountDelegation,
      averageApr,
      totalClaimRewardsAmount,
      isEveryChainLoading,
      isSomeChainLoading,
    } = aggregateStakeStore.aggregatedStake;

    const [searchedText, setSearchedText] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [formatCurrency] = useFormatCurrency();
    const chains = useGetChains();
    const [showAprInDescending, setShowAprInDescending] = useState(true);
    const [showAmountInDescending, setShowAmountInDescending] = useState(true);
    const [sortBy, setSortBy] = useState<'apr' | 'amount'>('amount');
    const selectedNetwork = useSelectedNetwork();

    const [selectedChain, setSelectedChain] = useState<SupportedChain | null>(null);

    const query = useQuery();
    const paramChainId = query.get('chainId') ?? undefined;

    const averageAprValue = useMemo(() => {
      if (averageApr) {
        return `${currency((averageApr * 100).toString(), { precision: 2, symbol: '' }).format()}%`;
      }

      return '-';
    }, [averageApr]);

    const stakingDenomsPriority = ['ATOM', 'TIA', 'CORE', 'OSMO', 'INJ', 'BABY', 'NIBI', 'OM'];

    const delegationsToConsider = useMemo(() => {
      const formattedSearchText = searchedText.trim().toLowerCase();

      const formattedDelegations = Object.keys(perChainDelegations)
        .reduce((acc: DelegationsToConsider[], chain) => {
          if (
            chain.toLowerCase().includes(formattedSearchText) ||
            perChainDelegations[chain].stakingDenom.toLowerCase().includes(formattedSearchText)
          ) {
            return [
              ...acc,
              {
                ...perChainDelegations[chain],
                chain: chain as SupportedChain,
              },
            ];
          }

          return acc;
        }, [])
        .sort((a, b) => {
          const aIndex = stakingDenomsPriority.indexOf(a.stakingDenom);
          const bIndex = stakingDenomsPriority.indexOf(b.stakingDenom);
          return aIndex === -1 ? 1 : bIndex === -1 ? -1 : aIndex - bIndex;
        });

      switch (sortBy) {
        case 'apr': {
          return formattedDelegations.sort((itemA, itemB) => {
            if (showAprInDescending) {
              return itemB.apr - itemA.apr;
            }

            return itemA.apr - itemB.apr;
          });
        }

        case 'amount': {
          return formattedDelegations.sort((itemA, itemB) => {
            const isAValid = itemA.currencyAmountDelegation && !isNaN(Number(itemA.currencyAmountDelegation));
            const isBValid = itemB.currencyAmountDelegation && !isNaN(Number(itemB.currencyAmountDelegation));

            if (!isBValid) {
              if (isAValid) {
                return showAmountInDescending ? -1 : 1;
              }

              const aDelegation: undefined | BigNumber = itemA.totalDelegation;
              const bDelegation: undefined | BigNumber = itemB.totalDelegation;

              if (!bDelegation || bDelegation.isNaN() || bDelegation.isZero()) {
                if (!(!aDelegation || aDelegation.isNaN() || aDelegation.isZero())) {
                  return showAmountInDescending ? -1 : 1;
                }

                return showAmountInDescending ? 1 : -1;
              }

              if (!aDelegation || aDelegation.isNaN() || aDelegation.isZero()) {
                return showAmountInDescending ? 1 : -1;
              }

              if (showAmountInDescending) {
                return bDelegation.minus(aDelegation).toNumber();
              }

              return itemA.totalDelegation.minus(itemB.totalDelegation).toNumber();
            }

            if (!isAValid) {
              return showAmountInDescending ? 1 : -1;
            }

            if (showAmountInDescending) {
              return Number(itemB.currencyAmountDelegation) - Number(itemA.currencyAmountDelegation);
            }

            return Number(itemA.currencyAmountDelegation) - Number(itemB.currencyAmountDelegation);
          });
        }
      }
    }, [perChainDelegations, searchedText, showAmountInDescending, showAprInDescending, sortBy]);

    const handleTokenCardClick = useCallback(
      (chain: SupportedChain) => {
        setSelectedChain(chain);
        if ((validatorsStore.validatorsForChain(chain).validatorData?.validators ?? []).length === 0) {
          validatorsStore.loadValidators(chain, selectedNetwork);
        }
      },
      [selectedNetwork, validatorsStore],
    );

    const handleBackClick = useCallback(() => setSelectedChain(null), []);

    useEffect(() => {
      async function updateChain() {
        if (paramChainId) {
          const chainIdToChain = await decodeChainIdToChain();
          const chain = chainIdToChain[paramChainId] as SupportedChain;
          setSelectedChain(chain);
          query.delete('chainId');
        }
      }
      updateChain();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramChainId]);

    if (selectedChain) {
      return (
        // Navigate to StakePage for selectedChain (not shown here)
        <StakePage
          forceChain={selectedChain}
          forceNetwork={NETWORK}
          showBackAction={true}
          onBackClick={handleBackClick}
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

  return (
    <View>
      <StakeHeader setShowSearchInput={setShowSearchInput} />      
      <View style={styles.container}>
        {/* Header and search */}
        {showSearchInput ? (
          <View style={styles.searchContainer}>
            <SearchInput
              value={searchedText}
              placeholder="Search staked tokens"
              onChangeText={setSearchedText}
              onClear={() => setSearchedText('')}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowSearchInput(false);
                setSearchedText('');
              }}
            >
              <X size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.aggregatedBar}>
            <AggregatedValues label="Staked" value={formatCurrency(totalCurrencyAmountDelegation)} />
            <AggregatedValues label="Claimable" value={formatCurrency(totalClaimRewardsAmount)} />
            <AggregatedValues label="Avg APR" value={averageApr ? `${(averageApr * 100).toFixed(2)}%` : '-'} />
          </View>
        )}

        {/* List Header (Tokens, APR, Amount columns) */}
        {delegationsToConsider.length > 0 && (
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>Tokens</Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => {
                setShowAprInDescending(!showAprInDescending);
                setSortBy('apr');
              }}
            >
              <Text style={styles.listHeaderText}>APR</Text>
              {sortBy === 'apr' &&
                (showAprInDescending ? (
                  <CaretDown size={16} color="#0f172a" />
                ) : (
                  <CaretUp size={16} color="#0f172a" />
                ))}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => {
                setShowAmountInDescending(!showAmountInDescending);
                setSortBy('amount');
              }}
            >
              <Text style={styles.listHeaderText}>Amount</Text>
              {sortBy === 'amount' &&
                (showAmountInDescending ? (
                  <CaretDown size={16} color="#0f172a" />
                ) : (
                  <CaretUp size={16} color="#0f172a" />
                ))}
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        {isEveryChainLoading && <AggregatedLoadingList />}
        {!isEveryChainLoading && (
          <FlatList
            data={delegationsToConsider}
            keyExtractor={(item) => item.chain}
            contentContainerStyle={{ paddingBottom: 60 }}
            renderItem={({ item }) => (
              <StakeTokenCard
                tokenName={item.stakingDenom}
                chainName={chains[item.chain]?.chainName}
                chainLogo={chains[item.chain]?.chainSymbolImageUrl ?? ''}
                apr={item.apr ? `${(item.apr * 100).toFixed(2)}%` : '-'}
                dollarAmount={formatCurrency(item.currencyAmountDelegation)}
                amount={item.totalDelegationAmount}
                onPress={() => handleTokenCardClick(item.chain)}
              />
            )}
            ListEmptyComponent={
              <EmptyCard
                isRounded
                subHeading="Please try again with something else"
                heading={`No results for “${searchedText}”`}
                // Add other props as needed
              />
            }
          />
        )}
        {isSomeChainLoading && !showSearchInput && <AggregatedLoadingList />}
      </View>
    </View>
  );
  },
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', paddingTop: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  closeButton: { marginLeft: 8, backgroundColor: '#f3f4f6', borderRadius: 999, padding: 8 },
  aggregatedBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    margin: 12,
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  listHeaderText: { color: '#334155', fontWeight: '600', fontSize: 13 },
  sortButton: { flexDirection: 'row', alignItems: 'center' },
});