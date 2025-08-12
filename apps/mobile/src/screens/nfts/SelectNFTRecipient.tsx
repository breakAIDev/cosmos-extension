import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Compass, PencilSimpleLine } from 'phosphor-react-native';
import { SelectedAddress, sliceAddress, useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { Images } from '../../../assets/images';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { Wallet } from '../../hooks/wallet/useWallet';
import { AddressBook } from '../../utils/addressbook';
import { useContactsSearch } from '../../hooks/useContacts';
import { useChainInfos } from '../../hooks/useChainInfos';
import { useDefaultTokenLogo } from '../../hooks';

export function MyWallets({ setSelectedAddress }: { setSelectedAddress: (address: SelectedAddress) => void }) {
  const activeChain: SupportedChain = 'mainCoreum';
  const { activeWallet } = useActiveWallet();
  const wallets = Wallet.useWallets();

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .filter((wallet) => wallet.id !== activeWallet?.id)
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [activeWallet?.id, wallets]);

  if (!walletsList.length) {
    return (
      <View style={styles.emptyState}>
        <Compass size={56} color="#aaa" style={styles.emptyIcon} />
        <Text style={styles.emptyText}>No wallets found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ marginTop: 8, maxHeight: 260 }}>
      {walletsList.map((wallet, index) => {
        const addressText = wallet?.addresses?.[activeChain];
        return (
          <TouchableOpacity
            key={wallet.id}
            disabled={!addressText}
            style={[styles.listItem, !addressText && styles.disabled]}
            onPress={() => {
              setSelectedAddress({
                address: addressText,
                avatarIcon: Images.Misc.getWalletIconAtIndex(wallet.colorIndex),
                chainIcon: '',
                chainName: activeChain,
                emoji: undefined,
                name: `${wallet.name.length > 12 ? `${wallet.name.slice(0, 12)}...` : wallet.name}`,
                selectionType: 'currentWallet',
              });
            }}
          >
            <Image
              style={styles.walletAvatar}
              source={{uri: Images.Misc.getWalletIconAtIndex(0)}}
            />
            <View>
              <Text style={styles.walletName}>{wallet.name}</Text>
              <Text style={styles.walletAddr}>{sliceAddress(addressText)}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function MyContacts({
  handleContactSelect,
  editContact,
}: {
  handleContactSelect: (contact: SelectedAddress) => void;
  editContact: (s?: AddressBook.SavedAddress) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedSearchQuery = searchQuery.trim();
  const _contacts = useContactsSearch(trimmedSearchQuery);
  const contacts = _contacts.filter((contact) => contact.blockchain === 'mainCoreum');
  const chainInfos = useChainInfos();
  const { chainName } = useChainInfo('mainCoreum');
  const defaultTokenLogo = useDefaultTokenLogo();
  
  if (!contacts.length) {
    return (
      <View style={styles.emptyState}>
        <Compass size={56} color="#aaa" style={styles.emptyIcon} />
        <Text style={styles.emptyText}>No contacts found</Text>
        <TouchableOpacity style={styles.addContactBtn} onPress={() => editContact()}>
          <Text style={styles.addContactText}>+ Add new contact</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ marginTop: 8, maxHeight: 260 }}>
      {contacts.map((contact, idx) => {
        const chainImage = chainInfos[contact.blockchain]?.chainSymbolImageUrl ?? defaultTokenLogo;
        return (
          <View key={contact.address} style={styles.listItemRow}>
            <TouchableOpacity
              style={[styles.listItem, { flex: 1 }]}
              onPress={() =>
                handleContactSelect({
                  avatarIcon: '',
                  chainIcon: chainImage ?? '',
                  chainName: chainName,
                  name: contact.name,
                  address: contact.address,
                  emoji: contact.emoji,
                  selectionType: 'saved',
                })
              }
            >
              <Image style={styles.walletAvatar} source={{uri: Images.Misc.getWalletIconAtIndex(0)}} />
              <View>
                <Text style={styles.walletName}>{contact.name}</Text>
                <Text style={styles.walletAddr}>
                  {sliceAddress(contact.ethAddress ? contact.ethAddress : contact.address)}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pencilBtn} onPress={() => editContact(contact)}>
              <PencilSimpleLine size={28} color="#aaa" />
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletAvatar: {
    width: 44,
    height: 44,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#e9eef3',
  },
  walletName: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  walletAddr: {
    color: '#888',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 18,
    textAlign: 'center',
  },
  addContactBtn: {
    marginTop: 8,
  },
  addContactText: {
    color: '#13a380',
    fontWeight: '500',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
  pencilBtn: {
    padding: 6,
  },
});
