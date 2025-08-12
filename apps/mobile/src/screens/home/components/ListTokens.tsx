import { Token } from '@leapwallet/cosmos-wallet-hooks';
import { CaretRight, CaretUp, MagnifyingGlassMinus } from 'phosphor-react-native';
import { SideNavMenuOpen } from '../../../components/header/sidenav-menu';
import { observer } from 'mobx-react-lite';
import React, { useMemo, useState } from 'react';
import { percentageChangeDataStore } from '../../../context/balance-store';
import { chainInfoStore } from '../../../context/chain-infos-store';
import { hideSmallBalancesStore } from '../../../context/hide-small-balances-store';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { AssetCard } from './index';

const maxAssets = 10;
const sideNavDefaults = { openTokenDisplayPage: true };

export const ListTokens = observer(
  ({ allTokens, searchQuery }: { allTokens: Token[]; searchQuery: string }) => {
    const [showMaxAssets, setShowMaxAssets] = useState(false);

    const assetsToShow = useMemo(() => {
      let truncatedAssets =
        searchQuery || showMaxAssets || allTokens.length < maxAssets
          ? allTokens
          : allTokens?.slice(0, maxAssets);

      if (searchQuery) {
        truncatedAssets = truncatedAssets.filter(
          (asset) =>
            asset.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      if (hideSmallBalancesStore.isHidden) {
        return truncatedAssets.filter((asset) => Number(asset.usdValue) > 0.1);
      }

      return truncatedAssets;
    }, [allTokens, showMaxAssets, searchQuery]);

    const atLeastOneTokenHasSmallBalance = useMemo(() => {
      return allTokens.some((asset) => Number(asset.usdValue) < 0.1);
    }, [allTokens]);

    return (
      <View style={styles.container}>
        {assetsToShow.map((asset: any) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            percentageChangeDataStore={percentageChangeDataStore}
            chainInfosStore={chainInfoStore}
          />
        ))}

        {searchQuery && assetsToShow.length === 0 && (
          <View style={styles.notFoundContainer}>
            <View style={styles.notFoundContent}>
              <View style={styles.iconCircle}>
                <MagnifyingGlassMinus size={24} color="#111" />
              </View>
              <Text style={styles.notFoundText}>No tokens found</Text>
            </View>
          </View>
        )}

        {allTokens.length > maxAssets && (
          <TextElementToShow
            allTokens={allTokens}
            showMaxAssets={showMaxAssets}
            searchQuery={searchQuery}
            setShowMaxAssets={setShowMaxAssets}
          />
        )}

        {hideSmallBalancesStore.isHidden && atLeastOneTokenHasSmallBalance && (
          <Text style={styles.smallBalanceText}>
            Tokens with small balances hidden (&lt;$0.1).{'\n'}
            Customize settings{' '}
            <SideNavMenuOpen sideNavDefaults={sideNavDefaults}>
              <Text style={styles.underline}>here</Text>
            </SideNavMenuOpen>
            .
          </Text>
        )}
      </View>
    );
  }
);

const TextElementToShow = ({
  allTokens,
  showMaxAssets,
  searchQuery,
  setShowMaxAssets,
}: {
  allTokens: Token[];
  showMaxAssets: boolean;
  searchQuery: string;
  setShowMaxAssets: (value: boolean) => void;
}) => {
  const assetsLength = hideSmallBalancesStore.isHidden
    ? allTokens.filter((asset) => Number(asset.usdValue) > 0.1).length
    : allTokens.length;

  if (searchQuery || assetsLength <= maxAssets) {
    return null;
  }

  if (showMaxAssets) {
    return (
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowMaxAssets(!showMaxAssets)}
        activeOpacity={0.7}
      >
        <CaretUp size={16} weight="bold" style={styles.caretIcon} />
        <Text style={styles.toggleButtonText}>Collapse</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.toggleButton}
      onPress={() => setShowMaxAssets(!showMaxAssets)}
      activeOpacity={0.7}
    >
      <CaretRight size={16} weight="bold" style={styles.caretIcon} />
      <Text style={styles.toggleButtonText}>
        View {assetsLength - maxAssets} more tokens
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12, // Not natively supported, use marginBottom on cards if needed
  },
  notFoundContainer: {
    width: '100%',
    minHeight: 276,
    backgroundColor: '#F3F4F6', // bg-secondary-100
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB', // bg-secondary-200
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  notFoundContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 16,
  },
  iconCircle: {
    padding: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  notFoundText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    justifyContent: 'flex-start',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  caretIcon: {
    marginRight: 8,
  },
  smallBalanceText: {
    fontSize: 12,
    paddingHorizontal: 16,
    fontWeight: 'bold',
    color: '#A1A1AA', // text-muted-foreground
    textAlign: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
    color: '#888',
  },
});

