import React, { forwardRef, useMemo } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Fuse from 'fuse.js';
import { observer } from 'mobx-react-lite';
import { SourceChain, SourceToken } from '../../../types/swap';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { CompassIcon } from '../../../../assets/icons/compass-icon';
import { SwapsCheckIcon } from '../../../../assets/icons/swaps-check-icon';
import { GenericLight } from '../../../../assets/images/logos';

export type TokenAssociatedChain = {
  chain: SourceChain;
  asset?: SourceToken;
};

export type ListChainsProps = {
  onChainSelect: (props: TokenAssociatedChain) => void;
  selectedChain?: SourceChain;
  selectedToken: SourceToken | null;
  chainsToShow?: TokenAssociatedChain[];
  setSearchedChain: (chain: string) => void;
  searchedChain: string;
  loadingChains: boolean;
};

function ChainsListSkeleton({ index, isLast }: { index: number; isLast: boolean }) {
  // Use ActivityIndicator or custom skeleton UI
  return (
    <View key={`chain-list-skeleton-${index}`} style={[styles.skeletonContainer, !isLast && styles.skeletonDivider]}>
      <View style={styles.skeletonCircle}>
        <ActivityIndicator size="small" color="#ccc" />
      </View>
      <View style={styles.skeletonText} />
    </View>
  );
}

function ChainCard({
  itemsLength,
  tokenAssociatedChain,
  index,
  setSearchedChain,
  onChainSelect,
  selectedChain,
  selectedToken,
}: {
  tokenAssociatedChain: TokenAssociatedChain;
  index: number;
  itemsLength: number;
  setSearchedChain: (chain: string) => void;
  onChainSelect: (props: TokenAssociatedChain) => void;
  selectedChain?: SourceChain;
  selectedToken: SourceToken | null;
}) {
  const img = tokenAssociatedChain.chain.icon || tokenAssociatedChain.chain.logoUri || GenericLight;
  const chainName = tokenAssociatedChain.chain.chainName;
  const isLast = index === itemsLength - 1;
  const defaultTokenLogo = useDefaultTokenLogo();

  const isSelected =
    !!selectedChain &&
    selectedChain.key === tokenAssociatedChain.chain.key &&
    (!selectedToken || selectedToken.skipAsset?.denom === tokenAssociatedChain.asset?.skipAsset?.denom);

  return (
    <TouchableOpacity
      onPress={() => {
        setSearchedChain('');
        onChainSelect(tokenAssociatedChain);
      }}
      style={[styles.cardWrapper, !isLast && { marginBottom: 12 }]}
      key={`${tokenAssociatedChain.chain.chainName}-${tokenAssociatedChain.asset?.skipAsset?.denom}-${index}`}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        <View style={styles.cardImgBox}>
          <Image
            source={{ uri: img ?? defaultTokenLogo}}
            style={styles.cardImg}
            onError={() => {
            }}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.cardChainName}>{chainName}</Text>
        {isSelected && <SwapsCheckIcon size={20} style={styles.checkIcon} />}
      </View>
    </TouchableOpacity>
  );
}

// FORWARD REF version for focusing TextInput from parent
const ChainsListView = forwardRef<TextInput, ListChainsProps>(
  (
    {
      onChainSelect,
      selectedChain,
      selectedToken,
      chainsToShow,
      searchedChain,
      setSearchedChain,
      loadingChains,
    }: ListChainsProps,
    ref,
  ) => {
    const chainsFuse = useMemo(() => {
      return new Fuse(chainsToShow ?? [], {
        threshold: 0.3,
        keys: ['chain.chainName'],
        shouldSort: false,
      });
    }, [chainsToShow]);

    const filteredChains = useMemo(() => {
      if (!searchedChain) {
        return chainsToShow ?? [];
      }
      return chainsFuse?.search(searchedChain).map((chain) => chain.item) ?? [];
    }, [chainsFuse, searchedChain, chainsToShow]);

    return (
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            value={searchedChain}
            onChangeText={setSearchedChain}
            placeholder="Search by chain name"
            style={styles.searchInput}
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.listContainer}>
          {loadingChains ? (
            Array.from({ length: 5 }).map((_, index) => (
              <ChainsListSkeleton key={index} index={index} isLast={index === 4} />
            ))
          ) : filteredChains.length === 0 ? (
            <View style={styles.noChainsContainer}>
              <View style={styles.noChainsIcon}>
                <CompassIcon size={40} color="#bbb" />
              </View>
              <Text style={styles.noChainsTitle}>No chains found</Text>
              <Text style={styles.noChainsSubtitle}>
                We couldn’t find a match. Try searching again or use a different keyword.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredChains}
              keyExtractor={(item, idx) =>
                `${item.chain.chainName}-${item.asset?.skipAsset?.denom ?? ''}-${idx}`
              }
              renderItem={({ item, index }) => (
                <ChainCard
                  tokenAssociatedChain={item}
                  index={index}
                  itemsLength={filteredChains.length}
                  selectedChain={selectedChain}
                  selectedToken={selectedToken}
                  onChainSelect={onChainSelect}
                  setSearchedChain={setSearchedChain}
                />
              )}
              contentContainerStyle={{ paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </View>
    );
  },
);

ChainsListView.displayName = 'ChainsListView';

export const ChainsList = observer(ChainsListView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#fff',
  },
  inputWrapper: {
    marginBottom: 18,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafbfc',
  },
  listContainer: {
    flex: 1,
    minHeight: 240,
  },
  skeletonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    marginBottom: 6,
  },
  skeletonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e1e1e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  skeletonText: {
    height: 18,
    width: 80,
    borderRadius: 5,
    backgroundColor: '#e1e1e1',
  },
  skeletonDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f7',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  cardImgBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  cardChainName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#18181a',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  noChainsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 18,
    padding: 24,
    marginVertical: 18,
    backgroundColor: '#fcfcfc',
  },
  noChainsIcon: {
    backgroundColor: '#f1f2f4',
    borderRadius: 24,
    padding: 6,
    marginBottom: 8,
  },
  noChainsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#232324',
    marginTop: 4,
    textAlign: 'center',
  },
  noChainsSubtitle: {
    fontSize: 12,
    color: '#636363',
    textAlign: 'center',
    marginTop: 6,
  },
});
