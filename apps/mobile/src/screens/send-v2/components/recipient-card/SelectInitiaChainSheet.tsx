import React, { useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ChainFeatureFlagsStore, ChainInfosStore } from '@leapwallet/cosmos-wallet-store';
import BottomModal from '../../../../components/bottom-modal'; // Must be a RN modal
import Text from '../../../../components/text';
import { SearchInput } from '../../../../components/ui/input/search-input';
import { GenericLight } from '../../../../../assets/images/logos';
import { ResizeMode } from 'expo-av';

type SelectInitiaChainSheetProps = {
  isOpen: boolean;
  setSelectedInitiaChain: (chain: SupportedChain) => void;
  onClose: () => void;
  chainFeatureFlagsStore: ChainFeatureFlagsStore;
  chainInfoStore: ChainInfosStore;
  selectedNetwork: 'mainnet' | 'testnet';
};

export const SelectInitiaChainSheet: React.FC<SelectInitiaChainSheetProps> = observer(
  ({ isOpen, setSelectedInitiaChain, onClose, chainFeatureFlagsStore, chainInfoStore, selectedNetwork }) => {
    const [searchedTerm, setSearchedTerm] = useState('');

    const chains = chainInfoStore.chainInfos;
    const chainFeatureFlags = chainFeatureFlagsStore.chainFeatureFlagsData;

    const minitiaChains = useMemo(() => {
      const _minitiaChains: ChainInfo[] = [];
      Object.keys(chainFeatureFlags)
        .filter((chain) => chainFeatureFlags[chain].chainType === 'minitia')
        .forEach((c) => {
          if (chains[c as SupportedChain]) {
            _minitiaChains.push(chains[c as SupportedChain]);
          }
          const _chain = Object.values(chainInfoStore.chainInfos).find((chainInfo) =>
            selectedNetwork === 'testnet'
              ? chainInfo?.testnetChainId === c
              : chainInfo?.chainId === c
          );
          if (_chain) {
            _minitiaChains.push(_chain);
          }
        });
      return _minitiaChains;
    }, [chainFeatureFlags, chainInfoStore.chainInfos, chains, selectedNetwork]);

    const initiaChains = useMemo(() => {
      return minitiaChains.filter((chain) =>
        chain?.chainName.toLowerCase().includes(searchedTerm.toLowerCase())
      );
    }, [minitiaChains, searchedTerm]);

    return (
      <BottomModal
        title="Select Recipient"
        onClose={() => {
          setSearchedTerm('');
          onClose();
        }}
        isOpen={isOpen}
        closeOnBackdropClick={true}
        containerStyle={{ height: '90%' }}
        style={styles.modalPadding}
      >
        <View style={styles.flexCol}>
          <SearchInput
            value={searchedTerm}
            onChangeText={setSearchedTerm}
            placeholder="Search chain"
            onClear={() => setSearchedTerm('')}
          />
          <FlatList
            data={initiaChains}
            keyExtractor={(chain) => chain.key}
            renderItem={({ item: chain }) => (
              <TouchableOpacity
                style={styles.chainRow}
                onPress={() => {
                  setSelectedInitiaChain(chain.key);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: chain.chainSymbolImageUrl ?? GenericLight}}
                  onError={() => {}}
                  style={styles.chainImg}
                  resizeMode={"cover" as ResizeMode}
                />
                <Text size="md" style={styles.chainText}>
                  {chain.chainName}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.chainList}
          />
        </View>
      </BottomModal>
    );
  }
);

const styles = StyleSheet.create({
  modalPadding: {
    padding: 24,
  },
  flexCol: {
    flexDirection: 'column',
    gap: 24,
    flex: 1,
  },
  chainList: {
    flexGrow: 1,
    marginTop: 12,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  chainImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F4F4',
  },
  chainText: {
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
});
