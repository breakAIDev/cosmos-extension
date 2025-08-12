import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import { Token } from '@leapwallet/cosmos-wallet-store';
import BottomModal from '../../../../components/bottom-modal';
import NoSearchResults from '../../../../components/no-search-results';
import { SearchInput } from '../../../../components/ui/input/search-input';
import { useSendContext } from '../../../send-v2/context';
import { TokenCard } from '../../../swaps-v2/components/TokenCard';
import React, { useMemo, useState } from 'react';
import { SourceToken } from '../../../../types/swap';
import { View, ScrollView, StyleSheet } from 'react-native';

type SelectTokenSheetProps = {
  assets: Token[];
  isOpen: boolean;
  onClose: () => void;
  selectedToken: Token;
  onTokenSelect: (token: Token) => void;
  denoms: DenomsRecord;
};

export const SelectTokenSheet = ({
  assets,
  selectedToken,
  isOpen,
  onClose,
  onTokenSelect,
  denoms,
}: SelectTokenSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { sendActiveChain } = useSendContext();
  const activeChainInfo = useChainInfo(sendActiveChain);

  const _assets = useMemo(() => {
    return assets.filter((token) => {
      if (token.isAptos) return true;
      if (token.isSolana) return true;
      if (token.isSui) return true;
      return (
        String(token.amount) !== '0' &&
        (denoms[token.coinMinimalDenom as keyof typeof denoms] ??
          Object.values(activeChainInfo.nativeDenoms).find(
            (_denom) => _denom.coinMinimalDenom === token.coinMinimalDenom,
          ))
      );
    });
  }, [activeChainInfo.nativeDenoms, assets, denoms]);

  const transferableTokens = useMemo(
    () => _assets.filter((asset) => asset.symbol?.toLowerCase().includes(searchQuery.trim().toLowerCase())),
    [_assets, searchQuery],
  );

  const handleSelectToken = (token: Token) => {
    onTokenSelect(token);
    onClose();
  };

  return (
    <BottomModal
      title="Select Token"
      isOpen={isOpen}
      closeOnBackdropClick={true}
      onClose={onClose}
      // Add extra styles if your BottomModal supports it
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.searchWrapper}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search tokens..."
          />
        </View>
        <ScrollView
          style={styles.tokensWrapper}
          contentContainerStyle={transferableTokens.length === 0 && styles.noResultsScroll}
          keyboardShouldPersistTaps="handled"
        >
          {transferableTokens.length > 0 ? (
            transferableTokens.map((asset, index) => {
              const isLast = index === transferableTokens.length - 1;
              let isSelected = selectedToken?.coinMinimalDenom === asset.coinMinimalDenom;
              if (selectedToken?.ibcDenom || asset.ibcDenom) {
                isSelected = selectedToken?.ibcDenom === asset.ibcDenom;
              }
              if (selectedToken?.isEvm || asset?.isEvm) {
                isSelected = isSelected && selectedToken?.isEvm === asset?.isEvm;
              }
              return (
                <React.Fragment key={`${asset.coinMinimalDenom}-${index}`}>
                  <TokenCard
                    onTokenSelect={handleSelectToken}
                    token={asset as SourceToken}
                    isSelected={isSelected}
                    selectedChain={undefined}
                    showRedirection={false}
                  />
                  {!isLast && <View style={styles.divider} />}
                </React.Fragment>
              );
            })
          ) : (
            <NoSearchResults searchQuery={searchQuery} style={styles.noResults} />
          )}
        </ScrollView>
      </View>
    </BottomModal>
  );
};

SelectTokenSheet.displayName = 'SelectTokenSheet';

const styles = StyleSheet.create({
  modal: {
    padding: 0,
  },
  container: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 0,
    alignItems: 'center',
    backgroundColor: '#fff', // or use your theme
  },
  searchWrapper: {
    width: '100%',
    paddingHorizontal: 24,
  },
  tokensWrapper: {
    flex: 1,
    minHeight: 200,
    maxHeight: '70%', // Adjust as needed
    width: '100%',
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#fff', // or theme
  },
  divider: {
    height: 1,
    marginHorizontal: 24,
    backgroundColor: '#F3F4F6', // gray-100 or dark: #1f2937
  },
  noResults: {
    marginHorizontal: 24,
  },
  noResultsScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
