import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SelectedAddress, sliceAddress } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Avatar } from '@leapwallet/leap-ui';
import { UserList } from 'phosphor-react-native';
import { SearchInput } from '../../../../components/ui/input/search-input';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { useContactsSearch } from '../../../../hooks/useContacts';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { AddressBook } from '../../../../utils/addressbook';
import { useSendContext } from '../../context';
import Text from '../../../../components/text';

interface MyContactsProps {
  handleContactSelect: (contact: SelectedAddress) => void;
}

function MyContacts({ handleContactSelect }: MyContactsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedSearchQuery = searchQuery.trim();
  const contacts = useContactsSearch(trimmedSearchQuery);
  const chainInfos = useChainInfos();
  const { setMemo } = useSendContext();
  const defaultTokenLogo = useDefaultTokenLogo();

  const handleAvatarClick = (contact: AddressBook.SavedAddress, chainImage: string | undefined) => {
    handleContactSelect({
      avatarIcon: undefined,
      chainIcon: chainImage ?? '',
      chainName: chainInfos[contact.blockchain as SupportedChain].chainName,
      name: contact.name,
      address: contact.address,
      emoji: contact.emoji,
      selectionType: 'saved',
    });
    setMemo(contact.memo ?? '');
  };

  return (
    <>
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder="Search your contacts..."
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {contacts.length > 0 ? (
          contacts.map((contact, index) => {
            const chainImage =
              chainInfos[contact.blockchain as SupportedChain]?.chainSymbolImageUrl ?? defaultTokenLogo;
            const isLast = index === contacts.length - 1;

            return (
              <React.Fragment key={contact.address}>
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleAvatarClick(contact, chainImage)}
                  activeOpacity={0.7}
                >
                  <Avatar chainIcon={chainImage} emoji={contact.emoji ?? 0} />
                  <View>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactAddress}>
                      {sliceAddress(contact.ethAddress ? contact.ethAddress : contact.address)}
                    </Text>
                  </View>
                </TouchableOpacity>
                {!isLast && <View style={styles.divider} />}
              </React.Fragment>
            );
          })
        ) : (
          <View style={styles.emptyWrap}>
            <UserList size={40} color="#1A202C" style={styles.emptyIcon} />
            <View style={styles.emptyTextWrap}>
              <Text style={styles.emptyTitle}>
                {trimmedSearchQuery.length > 0
                  ? `No contacts found for "${trimmedSearchQuery}"`
                  : `No contacts to show`}
              </Text>
              <Text style={styles.emptySub}>
                {trimmedSearchQuery.length > 0
                  ? `Try searching for a different term `
                  : `Add a contact see them appear here`}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginTop: 16,
    flex: 1,
    maxHeight: 320, // as per h-[calc(100%-300px)]
  },
  scrollContent: {
    paddingBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    width: '100%',
  },
  contactName: {
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-700
    textAlign: 'left',
    textTransform: 'capitalize',
    fontSize: 16,
  },
  contactAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280', // text-gray-600
    textAlign: 'left',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    width: '100%',
  },
  emptyWrap: {
    paddingVertical: 40,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyIcon: {
    marginBottom: 10,
  },
  emptyTextWrap: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 21.5,
    color: '#1A202C',
    marginBottom: 2,
  },
  emptySub: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22.4,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default MyContacts;
