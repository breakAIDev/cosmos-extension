import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, Image, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { BigNumber } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/utils/classes';
import { formatTokenAmount, sliceWord, sortTokens, Token, useUserPreferredCurrency, currencyDetail } from '@leapwallet/cosmos-wallet-hooks';
import { useFormatCurrency } from '../../hooks/settings/useCurrency';
import { hideAssetsStore } from '../../context/hide-assets-store';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  assets: Token[];
  selectedToken?: Token;
  onTokenSelect: (baseDenom: string, ibcDenom?: string) => void;
};

const TokenCard = ({
  asset,
  onSelect,
  isSelected,
  hasToShowIbcTag = true,
  hasToShowEvmTag = true,
}: {
  asset: Token;
  onSelect: (token: Token) => void;
  isSelected: boolean;
  hasToShowIbcTag?: boolean;
  hasToShowEvmTag?: boolean;
}) => {
  const [formatCurrency] = useFormatCurrency();
  const [preferredCurrency] = useUserPreferredCurrency();

  const formattedFiatValue = asset.usdValue ? formatCurrency(new BigNumber(asset.usdValue)) : '-';

  const ibcInfo = asset.ibcChainInfo
    ? `${asset.ibcChainInfo.pretty_name} / ${sliceWord(asset.ibcChainInfo.channelId || '', 7, 5)}`
    : '';

  const handlePress = () => {
    if (!isSelected) onSelect(asset);
  };

  return (
    <TouchableOpacity
      style={[
        styles.tokenCard,
        isSelected ? styles.tokenCardSelected : styles.tokenCardDefault,
      ]}
      onPress={handlePress}
      disabled={isSelected}
    >
      <Image source={{ uri: asset.img }} style={styles.tokenImage} />
      <View style={styles.tokenInfo}>
        <Text style={styles.symbolText}>
          {asset.symbol}
          {asset.ibcChainInfo && hasToShowIbcTag ? '  [IBC]' : ''}
          {asset.isEvm && hasToShowEvmTag ? '  [EVM]' : ''}
        </Text>
        <Text style={styles.amountText}>
          {hideAssetsStore.formatHideBalance(
            formatTokenAmount(asset.amount, sliceWord(asset.symbol, 4, 4), 3, currencyDetail[preferredCurrency].locale)
          )}
        </Text>
      </View>
      <Text style={styles.fiatValue}>
        {hideAssetsStore.formatHideBalance(formattedFiatValue)}
      </Text>
    </TouchableOpacity>
  );
};

export const SelectTokenModal: React.FC<Props> = ({ isOpen, onClose, assets, selectedToken, onTokenSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = useMemo(() => {
    const input = searchQuery.trim().toLowerCase();
    return assets
      .filter((asset) => asset.symbol.toLowerCase().includes(input))
      .sort(sortTokens);
  }, [assets, searchQuery]);

  const handleSelect = useCallback(
    (token: Token) => {
      onTokenSelect(token.coinMinimalDenom, token.ibcDenom);
      onClose();
    },
    [onTokenSelect, onClose],
  );

  useEffect(() => {
    if (isOpen) setSearchQuery('');
  }, [isOpen]);

  return (
    <Modal isVisible={isOpen} onBackdropPress={onClose}>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Select Fees Token</Text>
        <TextInput
          placeholder="Search by token name"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <FlatList
          data={filteredTokens}
          keyExtractor={(item, index) => `${item.symbol}-${item.coinMinimalDenom}-${index}`}
          renderItem={({ item }) => {
            const isSelected = selectedToken?.ibcDenom
              ? item.ibcDenom === selectedToken.ibcDenom
              : item.coinMinimalDenom === selectedToken?.coinMinimalDenom;

            return (
              <TokenCard
                asset={item}
                onSelect={handleSelect}
                isSelected={isSelected}
              />
            );
          }}
          ListEmptyComponent={<Text style={styles.noResults}>No results found.</Text>}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  tokenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
  },
  tokenCardSelected: {
    backgroundColor: '#e6e6e6',
  },
  tokenCardDefault: {
    backgroundColor: '#f9f9f9',
  },
  tokenImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  tokenInfo: {
    flex: 1,
  },
  symbolText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  amountText: {
    fontSize: 12,
    color: '#666',
  },
  fiatValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
  },
});

