import { useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { AggregatedChainsStore } from '@leapwallet/cosmos-wallet-store';
import { MagnifyingGlassMinus } from 'phosphor-react-native';
import { AggregatedNullComponents } from '../../../components/aggregated';
import { CopyAddressCard } from '../../../components/card';
import BottomModal from '../../../components/new-bottom-modal';
import { SearchInput } from '../../../components/ui/input/search-input';
import { PriorityChains } from '../../../services/config/constants';
import { useWalletInfo } from '../../../hooks';
import { useGetWalletAddresses } from '../../../hooks/useGetWalletAddresses';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';

import { CopyAddressSheet } from './index';
import { TextInput } from 'react-native-gesture-handler';

type AggregatedWalletAddresses = {
  [chain: string]: string[];
};

type FetchChainWalletAddressesProps = {
  chain: SupportedChain;
  setWalletAddresses: React.Dispatch<React.SetStateAction<AggregatedWalletAddresses>>;
};

const FetchChainWalletAddresses = React.memo(({ chain, setWalletAddresses }: FetchChainWalletAddressesProps) => {
  const walletAddresses = useGetWalletAddresses(chain);

  useEffect(() => {
    setWalletAddresses((prev) => ({ ...prev, [chain]: walletAddresses }));
  }, [chain, setWalletAddresses, walletAddresses]);

  return null;
});

FetchChainWalletAddresses.displayName = 'FetchChainWalletAddresses';

const RemoveChainWalletAddresses = React.memo(({ chain, setWalletAddresses }: FetchChainWalletAddressesProps) => {
  useEffect(() => {
    setWalletAddresses((prev) => {
      const updatedAddresses = { ...prev };
      delete updatedAddresses[chain];
      return updatedAddresses;
    });
  }, [chain, setWalletAddresses]);

  return null;
});

RemoveChainWalletAddresses.displayName = 'RemoveChainWalletAddresses';

type AggregatedCopyAddressSheetProps = {
  isVisible: boolean;
  onClose: (refetch?: boolean) => void;
  aggregatedChainsStore: AggregatedChainsStore;
};

const AggregatedCopyAddressSheet = React.memo(
  ({ isVisible, onClose, aggregatedChainsStore }: AggregatedCopyAddressSheetProps) => {
    const searchInputRef = useRef<TextInput>(null); // React Native input ref
    const [walletAddresses, setWalletAddresses] = useState<AggregatedWalletAddresses>({});
    const { walletAvatar, walletName } = useWalletInfo();
    const chains = useGetChains();
    const [showCopyAddressSheet, setShowCopyAddressSheet] = useState(false);
    const [selectedChain, setSelectedChain] = useState<SupportedChain>('cosmos');
    const [searchQuery, setSearchQuery] = useState('');

    const Title = useMemo(() => (
      <View style={styles.titleContainer}>
        <Image source={{ uri: walletAvatar }} style={styles.avatar} />
        <Text
          style={styles.titleText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {walletName}
        </Text>
      </View>
    ), [walletAvatar, walletName]);

    const handleCopyAddressSheetClose = useCallback(() => {
      setShowCopyAddressSheet(false);
      setSelectedChain('cosmos');
    }, []);

    const sortedWalletAddresses = useMemo(() => {
      const _chains = Object.keys(walletAddresses).map((chain) => ({
        chain: chain as SupportedChain,
        addresses: walletAddresses[chain],
      }));

      const priorityChains = _chains
        .filter((chain) => PriorityChains.includes(chain.chain))
        .sort((chainA, chainB) => PriorityChains.indexOf(chainA.chain) - PriorityChains.indexOf(chainB.chain));

      const otherChains = _chains
        .filter((chain) => !PriorityChains.includes(chain.chain))
        .sort((chainA, chainB) => chainA.chain.localeCompare(chainB.chain));

      return [...priorityChains, ...otherChains];
    }, [walletAddresses]);

    const filteredWalletAddresses: { chain: SupportedChain; addresses: string[] }[] = useMemo(() => {
      if (searchQuery?.length > 0) {
        return sortedWalletAddresses.filter((chain) => {
          const chainName = chains[chain.chain]?.chainName;
          return (chainName ?? chain.chain).toLowerCase().includes(searchQuery.toLowerCase());
        });
      } else {
        return sortedWalletAddresses;
      }
    }, [chains, searchQuery, sortedWalletAddresses]);

    useEffect(() => {
      if (isVisible) {
        setTimeout(() => {
          searchInputRef.current?.focus?.();
        }, 200);
      } else {
        setSearchQuery('');
      }
    }, [isVisible]);

    return (
      <>
        <AggregatedNullComponents
          setAggregatedStore={setWalletAddresses}
          aggregatedChainsStore={aggregatedChainsStore}
          render={({ key, chain, setAggregatedStore }) => (
            <FetchChainWalletAddresses key={key} chain={chain} setWalletAddresses={setAggregatedStore} />
          )}
          reset={({ key, chain, setAggregatedStore }) => (
            <RemoveChainWalletAddresses key={key} chain={chain} setWalletAddresses={setAggregatedStore} />
          )}
        />

        <BottomModal
          isOpen={isVisible}
          onClose={onClose}
          title={Title}
          fullScreen
          headerStyle={styles.header}
          containerStyle={styles.lastChild}
          style={styles.modalContent}
        >
          <SearchInput
            ref={searchInputRef}
            placeholder='Search by chain name'
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
          />
          <ScrollView
            contentContainerStyle={styles.scrollView}
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {filteredWalletAddresses?.length > 0 ? (
              filteredWalletAddresses.map(({ chain, addresses }, index) => {
                const chainInfo = chains[chain];
                if (addresses.length > 1) {
                  const sortedAddresses = addresses.sort((a, b) => {
                    const isEVM = a?.startsWith('0x');
                    const isEVM2 = b?.startsWith('0x');
                    if (isEVM && !isEVM2) return 1;
                    if (!isEVM && isEVM2) return -1;
                    return 0;
                  });
                  return (
                    <React.Fragment key={`${addresses[0]}-${index}`}>
                      {sortedAddresses.map((address, idx) => {
                        const isEVM = address?.startsWith('0x');
                        return (
                          <CopyAddressCard
                            address={address}
                            key={`${address}-${idx}`}
                            forceChain={chain}
                            forceName={`${chainInfo.chainName}${isEVM ? ` (EVM)` : ''}`}
                          />
                        );
                      })}
                    </React.Fragment>
                  );
                }
                return (
                  <CopyAddressCard
                    address={addresses[0]}
                    key={`${addresses[0]}-${index}`}
                    forceChain={chain}
                    forceName={chainInfo.chainName}
                  />
                );
              })
            ) : (
              <View style={styles.noResultBox}>
                <View style={styles.noResultIcon}>
                  <MagnifyingGlassMinus size={24} color="#888" />
                </View>
                <Text style={styles.noResultText}>No results found</Text>
              </View>
            )}
          </ScrollView>
        </BottomModal>

        <CopyAddressSheet
          isVisible={showCopyAddressSheet}
          onClose={handleCopyAddressSheetClose}
          walletAddresses={walletAddresses[selectedChain] ?? []}
          forceChain={selectedChain}
        />
      </>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    height: 72,
    flexShrink: 0,
  },
  lastChild: {
    marginTop: -2,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    maxWidth: 196,
  },
  searchInput: {
    marginBottom: 16,
  },
  scrollView: {
    alignItems: 'center',
    paddingBottom: 24,
    flexGrow: 1,
  },
  noResultBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 32,
    marginTop: 24,
  },
  noResultIcon: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noResultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
});

AggregatedCopyAddressSheet.displayName = 'AggregatedCopyAddressSheet';
export { AggregatedCopyAddressSheet };
