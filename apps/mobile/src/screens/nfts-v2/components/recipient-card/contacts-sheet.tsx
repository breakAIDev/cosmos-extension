import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SelectedAddress, sliceAddress } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { AvatarCard } from '@leapwallet/leap-ui'; // Assumed RN compatible
import BottomModal from '../../../../components/bottom-modal';
import { EmptyCard } from '../../../../components/empty-card';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { useContactsSearch } from '../../../../hooks/useContacts';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../../assets/images';
import { AddressBook } from '../../../../utils/addressbook';
import InputWithButton from '../../../../components/input-with-button';

type ContactsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onContactSelect: (s: SelectedAddress) => void;
};

export const ContactsSheet: React.FC<ContactsSheetProps> = ({
  isOpen,
  onClose,
  onContactSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedSearchQuery = searchQuery.trim();
  const contacts = useContactsSearch(trimmedSearchQuery);
  const chainInfos = useChainInfos();
  const defaultTokenLogo = useDefaultTokenLogo();

  const handleAvatarClick = (
    contact: AddressBook.SavedAddress,
    chainImage: string | undefined
  ) => {
    onContactSelect({
      avatarIcon: undefined ?? '',
      chainIcon: chainImage ?? '',
      chainName: chainInfos[contact.blockchain as SupportedChain].chainName,
      name: contact.name,
      address: contact.address,
      emoji: contact.emoji,
      selectionType: 'saved',
    });
  };

  return (
    <BottomModal
      isOpen={isOpen}
      closeOnBackdropClick={true}
      title="Contact Book"
      onClose={onClose}
    >
      <View>
        <InputWithButton
          icon={Images.Misc.Search}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your contacts..."
        />

        <View style={styles.contactsContainer}>
          {contacts.length > 0 ? (
            <ScrollView
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            >
              <View style={styles.gridInner}>
                {contacts.map((contact) => {
                  const chainImage =
                    chainInfos[contact.blockchain].chainSymbolImageUrl ??
                    defaultTokenLogo;

                  return (
                    <AvatarCard
                      key={contact.address}
                      chainIcon={chainImage}
                      emoji={contact.emoji}
                      size="md"
                      subtitle={sliceAddress(contact.address)}
                      title={contact.name}
                      onClick={() => handleAvatarClick(contact, chainImage)}
                    />
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <EmptyCard
              src={
                trimmedSearchQuery.length > 0
                  ? Images.Misc.NoSearchResult
                  : Images.Misc.AddContact
              }
              heading="No Contact Found"
              subHeading={
                trimmedSearchQuery.length > 0
                  ? `No contacts found for "${trimmedSearchQuery}"`
                  : `You don't have any existing contacts, add one now!`
              }
              // style override for RN: adjust style prop if needed
              style={styles.emptyCard}
            />
          )}
        </View>
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  contactsContainer: {
    marginTop: 16,
    backgroundColor: '#f8fafc', // light
    borderRadius: 16,
    maxHeight: 400,
    width: '100%',
    padding: 0,
  },
  grid: {
    // spacing for ScrollView content
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  gridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12, // Only works in RN 0.71+
  },
  emptyCard: {
    padding: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
