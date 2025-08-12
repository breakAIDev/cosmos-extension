import { Key } from '@leapwallet/cosmos-wallet-hooks';
import { pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { MagnifyingGlassMinus, Plus } from 'phosphor-react-native';
import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import { SearchInput } from '../../../components/ui/input/search-input';
import { useChainInfos } from '../../../hooks/useChainInfos';
import React, { useEffect, useMemo, useState } from 'react';
import { activeChainStore } from '../../../context/active-chain-store';
import { chainInfoStore } from '../../../context/chain-infos-store';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { Wallet } from '../../../hooks/wallet/useWallet';
import { EditWalletForm } from '../EditWallet/index';
import WalletCardWrapper from '../WalletCardWrapper';
import CreateImportActions from './CreateImportActions';
import { WalletNotConnectedMsg } from './not-connected-msg';

type SelectWalletProps = {
  readonly isVisible: boolean;
  readonly onClose: VoidFunction;
  readonly title?: string;
  readonly currentWalletInfo?: {
    wallets: [Key];
    chainIds: [string];
    origin: string;
  } | null;
};

const SelectWallet = ({
  isVisible,
  onClose,
  title = 'Your Wallets',
  currentWalletInfo,
}: SelectWalletProps) => {
  const [isEditWalletVisible, setIsEditWalletVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const wallets = Wallet.useWallets();
  const chainInfos = useChainInfos();

  const [editWallet, setEditWallet] = useState<Key>();
  const [showCreateImportActions, setShowCreateImportActions] = useState(false);

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .sort((a, b) =>
            a.createdAt && b.createdAt
              ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              : a.name.localeCompare(b.name),
          )
          .filter(
            (wallet) =>
              wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              Object.entries(wallet.addresses).some(([chain, address]) => {
                if (chainInfos[chain as SupportedChain]?.evmOnlyChain) {
                  const pubKey = wallet.pubKeys?.[chain as SupportedChain];
                  if (!pubKey) return false;
                  const evmAddress = pubKeyToEvmAddressToShow(pubKey, true);
                  return evmAddress?.toLowerCase().includes(searchQuery.toLowerCase());
                }
                return address.toLowerCase().includes(searchQuery.toLowerCase());
              }),
          )
      : [];
  }, [wallets, searchQuery, chainInfos]);

  useEffect(() => {
    if (!isVisible) {
      setSearchQuery('');
    }
  }, [isVisible]);

  return (
    <>
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        title={title}
        fullScreen
        footerComponent={
          <Button style={styles.createButton} size={'md'} onPress={() => setShowCreateImportActions(true)}>
            <Plus size={16} /> Create / Import Wallet
          </Button>
        }
      >
        <View style={styles.content}>
          <SearchInput
            value={searchQuery}
            autoFocus={false}
            onChangeText={setSearchQuery}
            placeholder="Search by wallet name or address"
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
          />

          {currentWalletInfo && !searchQuery && (
            <WalletNotConnectedMsg currentWalletInfo={currentWalletInfo} onClose={onClose} />
          )}

          {walletsList?.length > 0 ? (
            <ScrollView style={styles.walletList} contentContainerStyle={styles.walletListContent}>
              {walletsList?.map((wallet, index, array) => {
                if (wallet.id === currentWalletInfo?.wallets?.[0]?.id) return null;
                return (
                  <WalletCardWrapper
                    key={wallet.id}
                    isLast={index === array.length - 1}
                    wallet={wallet}
                    onClose={onClose}
                    setEditWallet={setEditWallet}
                    setIsEditWalletVisible={setIsEditWalletVisible}
                  />
                );
              })}
            </ScrollView>
          ) : searchQuery ? (
            <View style={styles.noResultBox}>
              <View style={styles.noResultInner}>
                <View style={styles.noResultIconWrap}>
                  <MagnifyingGlassMinus size={24} color="#222" />
                </View>
                <Text style={styles.noResultText}>No results found</Text>
              </View>
            </View>
          ) : null}
        </View>
      </BottomModal>

      <CreateImportActions
        title="Create / Import Wallet"
        isVisible={showCreateImportActions}
        onClose={(closeParent) => {
          setShowCreateImportActions(false);
          if (closeParent) onClose();
        }}
      />

      <EditWalletForm
        wallet={editWallet as Key}
        isVisible={isEditWalletVisible}
        onClose={() => {
          setIsEditWalletVisible(false);
        }}
        activeChainStore={activeChainStore}
        chainInfoStore={chainInfoStore}
      />
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    height: '100%',
  },
  searchInput: {
    marginBottom: 24,
  },
  walletList: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 16,
  },
  walletListContent: {
    flexDirection: 'column',
    gap: 16,
    paddingBottom: 20,
  },
  createButton: {
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    marginTop: 12,
  },
  noResultBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 260,
    backgroundColor: '#F3F4F6',
  },
  noResultInner: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 16,
  },
  noResultIconWrap: {
    padding: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noResultText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
});

export default SelectWallet;
