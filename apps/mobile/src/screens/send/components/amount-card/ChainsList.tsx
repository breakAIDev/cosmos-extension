import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk';
import { MagnifyingGlassMinus } from 'phosphor-react-native';
import Text from '../../../../components/text';
import { CheckIcon } from '../../../../../assets/icons/check-icon';
import { GenericLight } from '../../../../../assets/images/logos';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { FlatList, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Fuse from 'fuse.js';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { SearchInput } from '../../../../components/ui/input/search-input';

export type ListChainsProps = {
  onChainSelect: (props: ChainInfo) => void;
  selectedChain?: ChainInfo;
  chainsToShow?: ChainInfo[];
  setSearchedChain: (chain: string) => void;
  searchedChain: string;
  loadingChains: boolean;
};

export function ChainsListSkeleton({ index, isLast }: { index: number; isLast: boolean }) {
  return (
    <React.Fragment key={`chain-list-skeleton-${index}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, marginHorizontal: 24, height: 72 }}>
        <SkeletonPlaceholder>
          <SkeletonPlaceholder.Item width={36} height={36} borderRadius={18} />
        </SkeletonPlaceholder>
        <View style={{ marginLeft: 16 }}>
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item width={80} height={17} borderRadius={4} />
          </SkeletonPlaceholder>
        </View>
      </View>
      {!isLast && (
        <View style={{ height: 1, backgroundColor: '#ECECEC', marginHorizontal: 24 }} />
      )}
    </React.Fragment>
  );
}

export function ChainCard({
  itemsLength,
  tokenAssociatedChain,
  index,
  setSearchedChain,
  onChainSelect,
  selectedChain,
}: {
  tokenAssociatedChain: ChainInfo;
  index: number;
  itemsLength: number;
  setSearchedChain: (chain: string) => void;
  onChainSelect: (props: ChainInfo) => void;
  selectedChain?: ChainInfo;
}) {
  const img = tokenAssociatedChain.chainSymbolImageUrl ?? GenericLight;
  const chainName = tokenAssociatedChain.chainName;
  const isLast = index === itemsLength - 1;
  const defaultTokenLogo = useDefaultTokenLogo();

  const isSelected = !!selectedChain && selectedChain.key === tokenAssociatedChain.key;

  return (
    <TouchableOpacity
      key={`${tokenAssociatedChain.chainName}-${index}`}
      onPress={() => {
        setSearchedChain('');
        onChainSelect(tokenAssociatedChain);
      }}
      style={styles.cardRow}
      activeOpacity={0.8}
    >
      <View style={styles.cardBox}>
        <Image
          source={{ uri: img ?? defaultTokenLogo}}
          style={styles.cardAvatar}
        />
        <Text style={styles.cardName}>{chainName}</Text>
        {isSelected && <CheckIcon size={20} style={styles.checkIcon} />}
      </View>
      {!isLast && <View style={styles.cardDivider} />}
    </TouchableOpacity>
  );
}

const ChainsListView = ({
  onChainSelect,
  selectedChain,
  chainsToShow,
  searchedChain,
  setSearchedChain,
  loadingChains,
}: ListChainsProps) => {
  const chainsFuse = useMemo(() => {
    return new Fuse(chainsToShow ?? [], {
      threshold: 0.3,
      keys: ['chainName'],
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.searchBox}>
        <SearchInput
          value={searchedChain}
          onChangeText={(value) => setSearchedChain(value)}
          data-testing-id='switch-chain-input-search'
          placeholder='Search by chain name'
          onClear={() => setSearchedChain('')}
        />
      </View>
      {/* List */}
      <View style={{ flex: 1, marginBottom: 12 }}>
        {loadingChains ? (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <ChainsListSkeleton key={index} index={index} isLast={index === 4} />
            ))}
          </>
        ) : filteredChains.length === 0 ? (
          <View style={styles.notFoundOuter}>
            <View style={styles.notFoundInner}>
              <View style={styles.notFoundIconBox}>
                <MagnifyingGlassMinus size={64} color="#222" />
              </View>
              <Text style={styles.notFoundTitle}>No chains found</Text>
              <Text style={styles.notFoundDesc}>
                We couldn&apos;t find a match. Try searching again or use a different keyword.
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredChains}
            keyExtractor={(item, idx) => item.key + '-' + idx}
            renderItem={({ item, index }) => (
              <ChainCard
                key={item?.chainName}
                tokenAssociatedChain={item}
                index={index}
                itemsLength={filteredChains.length}
                selectedChain={selectedChain}
                onChainSelect={onChainSelect}
                setSearchedChain={setSearchedChain}
              />
            )}
          />
        )}
      </View>
    </View>
  );
};

export const ChainsList = observer(ChainsListView);

const styles = StyleSheet.create({
  // Skeleton
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    marginHorizontal: 24,
    height: 72,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECECEC',
    marginRight: 16,
  },
  skeletonName: {
    width: 80,
    height: 17,
    borderRadius: 4,
    backgroundColor: '#ECECEC',
  },
  skeletonDivider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginHorizontal: 24,
    marginTop: 0,
  },
  // Card
  cardRow: {
    flex: 1,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  cardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5FA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 14,
  },
  cardName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#18191A',
  },
  checkIcon: {
    marginLeft: 'auto',
    color: '#11A676',
    width: 24,
    height: 24,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginTop: 10,
  },
  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F3F5FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    height: 40,
    color: '#18191A',
  },
  // Not found
  notFoundOuter: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundInner: {
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
  },
  notFoundIconBox: {
    padding: 12,
    backgroundColor: '#F3F5FA',
    borderRadius: 24,
    marginBottom: 10,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18191A',
    textAlign: 'center',
    marginVertical: 4,
  },
  notFoundDesc: {
    fontSize: 12,
    color: '#6D7280',
    textAlign: 'center',
    marginTop: 2,
  },
});