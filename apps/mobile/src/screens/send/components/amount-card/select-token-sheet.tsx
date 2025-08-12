import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import BigNumber from 'bignumber.js';
import { MagnifyingGlassMinus } from 'phosphor-react-native';
import { Token, useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfos, DenomsRecord, isSuiChain } from '@leapwallet/cosmos-wallet-sdk';
import { TokenCard } from '../../../send/components/TokenCard';
import { useSendContext } from '../../../send/context';
import BottomModal from '../../../../components/new-bottom-modal';
import { SearchInput } from '../../../../components/ui/input/search-input';
import { SourceToken } from '../../../../types/swap';

type SelectTokenSheetProps = {
  assets: Token[];
  isOpen: boolean;
  onClose: (isTokenSelected?: boolean) => void;
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  denoms: DenomsRecord;
};

export const priorityChainsIds = [
  ChainInfos.ethereum.key,
  ChainInfos.cosmos.key,
  ChainInfos.movement.key,
  ChainInfos.base.key,
];

export const SelectTokenSheet: React.FC<SelectTokenSheetProps> = ({
  assets, selectedToken, isOpen, onClose, onTokenSelect, denoms,
}) => {
  const searchInputRef = useRef<View>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { sendActiveChain } = useSendContext();
  const activeChainInfo = useChainInfo(sendActiveChain);

  const assetsToShow = useMemo(() => {
    return assets.filter((token) => {
      return (
        !new BigNumber(token?.amount).isNaN() &&
        new BigNumber(token?.amount).gt(0) &&
        (isSuiChain(token.tokenBalanceOnChain ?? '') ||
          (denoms[token.coinMinimalDenom as keyof typeof denoms] ??
            Object.values(activeChainInfo.nativeDenoms).find(
              (_denom) => _denom.coinMinimalDenom === token.coinMinimalDenom,
            ))) &&
        token?.symbol?.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    });
  }, [activeChainInfo?.nativeDenoms, searchQuery, assets, denoms]);

  const handleSelectToken = (token: Token) => {
    onTokenSelect(token);
    onClose(true);
  };

    useEffect(() => {
      if (isOpen) {
        setSearchQuery('');
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 400);
      }
    }, [isOpen]);

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      style={styles.modal}
      fullScreen
    >
      <View style={styles.container}>
        <Text style={styles.title}>Select Token</Text>
        <SearchInput
          ref={searchInputRef}
          value={searchQuery}
          onChangeText={(value: string) => setSearchQuery(value)}
          onClear={() => setSearchQuery('')}
        />

        {assetsToShow.length > 0 ? (
          <FlatList
            data={assetsToShow}
            keyExtractor={(item, idx) => `${item.coinMinimalDenom}-${idx}`}
            style={{ flex: 1 }}
            renderItem={({ item, index }) => {
              const isLast = index === assetsToShow.length - 1;

              let isSelected = selectedToken?.coinMinimalDenom === item.coinMinimalDenom;
              if (selectedToken?.ibcDenom || item.ibcDenom) {
                isSelected = selectedToken?.ibcDenom === item.ibcDenom;
              }
              if (selectedToken?.isEvm || item?.isEvm) {
                isSelected = isSelected && selectedToken?.isEvm === item?.isEvm;
              }

              return (
                <TokenCard
                  onTokenSelect={handleSelectToken}
                  token={item as SourceToken}
                  hideAmount={item.amount === '0'}
                  isSelected={isSelected}
                  selectedChain={undefined}
                  showRedirection={false}
                  isFirst={index === 0}
                  isLast={isLast}
                />
              );
            }}
          />
        ) : (
          <View style={styles.noTokensContainer}>
            <MagnifyingGlassMinus
              size={64}
              color="#9CA3AF"
              style={styles.icon}
            />
            <Text style={styles.noTokensTitle}>No tokens found</Text>
            <Text style={styles.noTokensDesc}>
              We couldn’t find a match. Try searching again or use a different keyword.
            </Text>
          </View>
        )}
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    padding: 24,
    paddingBottom: 0,
    minHeight: 400,
    maxHeight: '90%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  searchInput: {
    height: 44,
    borderRadius: 10,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  noTokensContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  icon: {
    backgroundColor: '#E5E7EB',
    borderRadius: 32,
    padding: 12,
    marginBottom: 16,
  },
  noTokensTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  noTokensDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
