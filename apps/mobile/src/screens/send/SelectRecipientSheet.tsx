import { Key, SelectedAddress, sliceAddress, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo, pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CaretRight, MagnifyingGlassMinus, PencilSimpleLine } from 'phosphor-react-native';
import BottomModal from '../../components/new-bottom-modal';
import Text from '../../components/text';
import { SearchInput } from '../../components/ui/input/search-input';
import { useDefaultTokenLogo } from '../../hooks';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { useSelectedNetwork } from '../../hooks/settings/useNetwork';
import { useChainInfos } from '../../hooks/useChainInfos';
import { useContacts, useContactsSearch } from '../../hooks/useContacts';
import { Wallet } from '../../hooks/wallet/useWallet';
import { Images } from '../../../assets/images';
import { useSendContext } from '../send/context';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { chainFeatureFlagsStore } from '../../context/balance-store';
import { chainInfoStore } from '../../context/chain-infos-store';
import { AddressBook } from '../../utils/addressbook';
import { View, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

export const SelectChain = observer(
  ({
    isOpen,
    onClose,
    chainList,
    wallet,
    address,
    forceName,
    setSelectedAddress,
  }: {
    isOpen: boolean;
    wallet?: Key;
    address?: string;
    onClose: () => void;
    chainList?: SupportedChain[];
    forceName?: string;
    setSelectedAddress: (address: SelectedAddress) => void;
  }) => {
    const [searchedText, setSearchedText] = useState('');
    const selectedNetwork = useSelectedNetwork();
    const chainInfos = chainInfoStore.chainInfos;
    const chains = useMemo(() => {
      let _chains = chainList
        ? chainList
        : Object.keys(wallet?.addresses ?? {}) as SupportedChain[];
      const isTestnet = selectedNetwork === 'testnet';
      _chains = _chains.filter((item) => {
        const chainInfo = chainInfos[item];
        if (!chainInfo || !chainInfo.enabled) return false;
        if (isTestnet) {
          return !!chainInfo.testnetChainId;
        } else {
          return !chainInfo.testnetChainId || chainInfo.chainId !== chainInfo.testnetChainId;
        }
      });
      return _chains.filter((chain) =>
        chainInfos[chain].chainName.toLowerCase().includes(searchedText.toLowerCase()),
      );
    }, [chainList, selectedNetwork, wallet?.addresses, chainInfos, searchedText]);

    return (
      <BottomModal
        isOpen={isOpen}
        onClose={onClose}
        fullScreen
        title="Select chain"
        hideActionButton
      >
        <View style={styles.container}>
          <SearchInput
            value={searchedText}
            onChangeText={setSearchedText}
            placeholder="Search by chain name"
            style={styles.searchInput}
            onClear={() => setSearchedText('')}
          />
          <ScrollView style={styles.list}>
            {chains.length > 0 ? (
              chains.map((chain) => {
                const chainInfo = chainInfos[chain];
                const walletAddress = address
                  ? address
                  : chainInfo?.evmOnlyChain
                    ? pubKeyToEvmAddressToShow(wallet?.pubKeys?.[chainInfo?.key], true)
                    : wallet?.addresses[chainInfo?.key];

                return (
                  <TouchableOpacity
                    key={chain}
                    style={styles.item}
                    onPress={() => {
                      setSelectedAddress({
                        address: walletAddress,
                        ethAddress: walletAddress,
                        avatarIcon: wallet?.avatar || Images.Misc.getWalletIconAtIndex(wallet?.colorIndex ?? 0),
                        chainIcon: '',
                        chainName: chain,
                        emoji: undefined,
                        name:
                          wallet
                            ? wallet.name.length > 12
                              ? `${wallet.name.slice(0, 12)}...`
                              : wallet.name
                            : forceName || sliceAddress(address),
                        selectionType: 'currentWallet',
                      });
                    }}
                  >
                    <Image source={{ uri: chainInfo.chainSymbolImageUrl }} style={styles.chainIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.chainName}>{chainInfo.chainName}</Text>
                      <Text style={styles.chainAddress}>{sliceAddress(walletAddress)}</Text>
                    </View>
                    <CaretRight size={16} color="#888" />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.noResult}>
                <MagnifyingGlassMinus size={64} color="#888" />
                <Text style={styles.noResultText}>No chains found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </BottomModal>
    );
  }
);

function MyWallets({ setSelectedAddress }: { setSelectedAddress: (address: SelectedAddress) => void }) {
  const wallets = Wallet.useWallets();
  const [selectedWallet, setSelectedWallet] = useState<Key | null>(null);
  const { activeWallet } = useActiveWallet();
  const [showSelectChain, setShowSelectChain] = useState<boolean>(false);

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets).sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [wallets]);

  const handleChainSelect = useCallback(
    (s: SelectedAddress) => {
      setSelectedAddress(s);
      setShowSelectChain(false);
    },
    [setSelectedAddress, setShowSelectChain]
  );

  const handleOnSelectChainClose = useCallback(() => {
    setSelectedWallet(null);
    setShowSelectChain(false);
  }, []);

  return (
    <View style={styles.root}>
      {walletsList.length > 0 ? (
        <ScrollView style={{ flex: 1 }}>
          {walletsList.map((wallet, index) => {
            let walletLabel = '';
            if (wallet.walletType === WALLETTYPE.LEDGER) {
              walletLabel = `Imported · ${wallet.path?.replace("m/44'/118'/", '')}`;
            }

            return (
              <View key={wallet.id}>
                <TouchableOpacity
                  style={styles.walletButton}
                  onPress={() => {
                    setSelectedWallet(wallet);
                    setShowSelectChain(true);
                  }}
                >
                  <View style={styles.avatarRow}>
                    <Image
                      style={styles.avatar}
                      source={{ uri: wallet.avatar ?? Images.Misc.getWalletIconAtIndex(wallet.colorIndex ?? 0)}}
                    />
                    <View style={styles.walletInfo}>
                      <View style={styles.walletNameRow}>
                        <Text style={styles.walletName}>{wallet.name}</Text>
                        {activeWallet && activeWallet.id === wallet.id && (
                          <Text style={styles.activeTag}>Active</Text>
                        )}
                      </View>
                      {walletLabel ? (
                        <Text style={styles.walletLabel}>{walletLabel}</Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
                {index === walletsList.length - 1 && <View style={{ height: 8 }} />}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyRoot}>
          <MagnifyingGlassMinus size={64} color="#888" style={styles.emptyIcon} />
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTitle}>No wallets found</Text>
            <Text style={styles.emptySubtitle}>
              Use Leap’s in-wallet options to get started.
            </Text>
          </View>
        </View>
      )}

      <SelectChain
        isOpen={showSelectChain}
        onClose={handleOnSelectChainClose}
        setSelectedAddress={handleChainSelect}
        wallet={selectedWallet ?? undefined}
      />
    </View>
  );
}

function MyContacts({
  handleContactSelect,
  editContact,
  minitiaChains,
}: {
  handleContactSelect: (contact: SelectedAddress) => void;
  editContact: (s?: AddressBook.SavedAddress) => void;
  minitiaChains: SupportedChain[];
}) {
  const [showSelectChain, setShowSelectChain] = useState<boolean>(false);
  const contacts = useContactsSearch();
  const chainInfos = useChainInfos();
  const defaultTokenLogo = useDefaultTokenLogo();
  const [selectedContact, setSelectedContact] = useState<AddressBook.SavedAddress | null>(null);

  const handleAvatarClick = (contact: AddressBook.SavedAddress, chainImage: string | undefined) => {
    if (contact.address.startsWith('init')) {
      setSelectedContact(contact);
      setShowSelectChain(true);
    } else {
      handleContactSelect({
        avatarIcon: '',
        chainIcon: chainImage ?? '',
        chainName: '',
        name: contact.name,
        address: contact.address,
        ethAddress: contact.ethAddress,
        emoji: contact.emoji,
        selectionType: 'saved',
      });
    }
  };

  const handleOnSelectChainClose = useCallback(() => {
    setSelectedContact(null);
    setShowSelectChain(false);
  }, []);

  const handleSelectChain = useCallback(
    (address: SelectedAddress) => {
      handleContactSelect({ ...address, selectionType: 'saved' });
      setShowSelectChain(false);
    },
    [handleContactSelect]
  );

  return (
    <View style={styles.root}>
      {contacts.length > 0 ? (
        <>
          <ScrollView style={styles.list}>
            {contacts.map((contact, index) => {
              const chainImage = chainInfos[contact.blockchain]?.chainSymbolImageUrl ?? defaultTokenLogo;
              return (
                <View key={contact.address}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleAvatarClick(contact, chainImage)}
                  >
                    <View style={styles.contactRow}>
                      <View style={styles.avatarRow}>
                        <Image
                          style={styles.avatar}
                          source={{uri: Images.Misc.getWalletIconAtIndex(0)}}
                        />
                        <View>
                          <Text style={styles.contactName}>{contact.name}</Text>
                          <Text style={styles.contactAddress}>
                            {sliceAddress(contact.ethAddress ? contact.ethAddress : contact.address)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.editIconWrap}
                        onPress={() => editContact(contact)}
                      >
                        <PencilSimpleLine size={24} weight='fill' color="#888" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  {index === contacts.length - 1 && <View style={{ height: 8 }} />}
                </View>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={styles.addContactButton} onPress={() => editContact()}>
            <Text style={styles.addContactButtonText}>Add new contact</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyRoot}>
          <MagnifyingGlassMinus size={64} color="#888" style={styles.emptyIcon} />
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTitle}>No contacts found</Text>
            <TouchableOpacity onPress={() => editContact()}>
              <Text style={styles.emptyAddContact}>+ Add new contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <SelectChain
        isOpen={showSelectChain}
        onClose={handleOnSelectChainClose}
        chainList={minitiaChains}
        address={selectedContact?.address}
        setSelectedAddress={handleSelectChain}
      />
    </View>
  );
}

export const SelectRecipientSheet = observer(({
  isOpen,
  onClose,
  editContact,
  postSelectRecipient,
}: {
    isOpen: boolean;
    onClose: () => void;
    editContact: (s?: AddressBook.SavedAddress) => void;
    postSelectRecipient: () => void;
  }) => {
  const [selectedTab, setSelectedTab] = useState('contacts');
  const { contacts, loading: loadingContacts } = useContacts();
  const selectedNetwork = useSelectedNetwork();
  const {
    setEthAddress,
    selectedAddress,
    setSelectedAddress,
    setAddressError,
    setMemo,
    setCustomIbcChannelId,
  } = useSendContext();
  const wallets = Wallet.useWallets();

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets).sort((a, b) =>
          a.createdAt && b.createdAt
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : a.name.localeCompare(b.name)
        )
      : [];
  }, [wallets]);

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
          selectedNetwork === 'testnet' ? chainInfo?.testnetChainId === c : chainInfo?.chainId === c,
        );
        if (_chain) {
          _minitiaChains.push(_chain);
        }
      });
    return _minitiaChains;
  }, [chainFeatureFlags, chains, selectedNetwork]);

  const handleContactSelect = useCallback(
    (s: SelectedAddress) => {
      setAddressError(undefined);
      setSelectedAddress(s);
      setEthAddress(s.ethAddress ?? '');
      postSelectRecipient();
      onClose();
    },
    [setAddressError, setEthAddress, setSelectedAddress, onClose, postSelectRecipient]
  );

  const handleWalletSelect = useCallback(
    (s: SelectedAddress) => {
      setAddressError(undefined);
      setSelectedAddress(s);
      setEthAddress(s.ethAddress ?? '');
      setMemo('');
      postSelectRecipient();
      onClose();
    },
    [setAddressError, setEthAddress, setMemo, setSelectedAddress, onClose, postSelectRecipient]
  );

  useEffect(() => {
    if (selectedAddress?.chainName) {
      setCustomIbcChannelId(undefined);
    }
  }, [selectedAddress?.chainName, setCustomIbcChannelId]);

  useEffect(() => {
    if (!loadingContacts && Object.keys(contacts).length === 0) {
      setSelectedTab('wallets');
    }
  }, [contacts, loadingContacts]);

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} fullScreen title="Address Book">
      <View style={styles.container}>
        {/* Tab Selector */}
        {Object.values(contacts).length === 0 && walletsList.length === 0 ? null : walletsList.length === 0 ? (
          <Text style={[styles.tabLabel, { marginTop: 10, color: '#888' }]}>Contacts</Text>
        ) : (
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'contacts' && styles.tabButtonSelected,
              ]}
              onPress={() => setSelectedTab('contacts')}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === 'contacts' && styles.tabButtonTextSelected,
                ]}
              >
                Your contacts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'wallets' && styles.tabButtonSelected,
              ]}
              onPress={() => setSelectedTab('wallets')}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === 'wallets' && styles.tabButtonTextSelected,
                ]}
              >
                Your wallets
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab Content */}
        <View style={{ flex: 1, width: '100%' }}>
          {selectedTab === 'wallets' ? (
            <MyWallets setSelectedAddress={handleWalletSelect} />
          ) : (
            <MyContacts
              handleContactSelect={handleContactSelect}
              editContact={editContact}
              minitiaChains={minitiaChains.map((chain) => chain.key)}
            />
          )}
        </View>
      </View>
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
    paddingHorizontal: 0,
    width: '100%',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 10,
    gap: 10,
    justifyContent: 'flex-start',
  },
  tabButton: {
    borderWidth: 1,
    borderColor: '#dde3ec',
    borderRadius: 32,
    backgroundColor: '#f5f7fa',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  tabButtonSelected: {
    borderColor: '#212121',
    backgroundColor: '#fff',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
  },
  tabButtonTextSelected: {
    color: '#212121',
    fontWeight: 'bold',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: '#e8ecf2',
    borderRadius: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    textTransform: 'capitalize',
  },
  contactAddress: {
    fontSize: 14,
    color: '#888',
  },
  editIconWrap: {
    backgroundColor: '#e8ecf2',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#dde3ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addContactButton: {
    borderColor: '#dde3ec',
    borderWidth: 1,
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 0,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 40,
    backgroundColor: '#f5f7fa',
  },
  addContactButtonText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#888',
  },
  emptyAddContact: {
    fontSize: 16,
    color: '#2d72d9',
    marginTop: 10,
    fontWeight: '500',
  },
  root: {
    flex: 1,
    width: '100%',
    // equivalent to h-[calc(100%-235px)] in web, adjust as needed for your layout
    minHeight: 200,
    maxHeight: '100%',
  },
  walletButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8ecf2', // bg-secondary-100
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  walletInfo: {
    flexDirection: 'column',
  },
  walletNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletName: {
    fontWeight: 'bold',
    color: '#212121',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  activeTag: {
    marginLeft: 6,
    color: '#23b26d', // accent-green
    backgroundColor: '#23b26d22',
    borderColor: '#23b26d77',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 11,
    fontWeight: 'bold',
  },
  walletLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  emptyRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    backgroundColor: '#e8ecf2',
    borderRadius: 40,
    padding: 14,
  },
  emptyContent: {
    marginTop: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  searchInput: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8ecf2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  chainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chainName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#212121',
    textTransform: 'capitalize',
  },
  chainAddress: {
    color: '#888',
    fontSize: 14,
  },
  noResult: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    marginTop: 12,
  },
});
