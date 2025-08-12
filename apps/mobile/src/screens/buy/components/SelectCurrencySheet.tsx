import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import { MagnifyingGlassMinus } from 'phosphor-react-native';
import BottomModal from '../../../components/new-bottom-modal';
import TokenListSkeleton from '../../../components/Skeletons/TokenListSkeleton';
import { useSwappedAssets } from '../../../hooks/useGetSwappedDetails';
import CurrencyCard from './CurrencyCard';

type SelectCurrencySheetProps = {
  isVisible: boolean;
  onClose: () => void;
  onCurrencySelect: (code: string) => void;
  selectedCurrency?: string;
};

type CurrencyProps = {
  code: string;
  name: string;
  logo: string;
};

export default function SelectCurrencySheet({
  isVisible,
  onClose,
  onCurrencySelect,
  selectedCurrency,
}: SelectCurrencySheetProps) {
  const [searchedCurrency, setSearchedCurrency] = useState('');
  const { isLoading, data } = useSwappedAssets();
  const { fiatAssets = [] } = data ?? {};

  const currencyList = useMemo<CurrencyProps[]>(
    () =>
      fiatAssets.filter(
        (currency: CurrencyProps) =>
          currency.code.toLowerCase().includes(searchedCurrency.toLowerCase()) ||
          currency.name.toLowerCase().includes(searchedCurrency.toLowerCase())
      ),
    [fiatAssets, searchedCurrency]
  );

  useEffect(() => {
    if (isVisible) {
      setSearchedCurrency('');
    }
  }, [isVisible]);

  return (
    <BottomModal isOpen={isVisible} onClose={onClose} title="Select currency" fullScreen>
      <View style={styles.container}>
        <TextInput
          value={searchedCurrency}
          onChangeText={setSearchedCurrency}
          placeholder="Search currency"
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      {isLoading && <TokenListSkeleton />}
      {isLoading &&  (
        <View style={{ flex: 1 }}>
          {currencyList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MagnifyingGlassMinus size={64} color="#222" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No tokens found</Text>
              <Text style={styles.emptySubtitle}>
                We couldn’t find a match. Try searching again or use a different keyword.
              </Text>
            </View>
          ) : (
            <FlatList
              data={currencyList}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <CurrencyCard
                  code={item.code}
                  name={item.name}
                  logo={item.logo}
                  onClick={() => onCurrencySelect(item.code)}
                  isSelected={item.code === selectedCurrency}
                />
              )}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}
        </View>
      )}
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: 80,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    padding: 12,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

