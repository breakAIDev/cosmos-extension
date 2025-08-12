import React, { ReactElement, useCallback, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import { AvatarCard, Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui';
import BottomModal from '../../../../components/bottom-modal'; // Must be a RN modal
import { SelectedAddress } from '../../..//send-v2/types';
import { Colors } from '../../../../theme/colors';
import { AddressBook } from '../../../../utils/addressbook';
import { sliceAddress } from '../../../../utils/strings';
import SaveAddressSheet from '../recipient-card/save-address-sheet';

export type WalletDetailsSheetProps = {
  isOpen: boolean;
  selectedAddress: SelectedAddress;
  onDelete: () => void;
  onCloseHandler: () => void;
};

export default function WalletDetailsSheet({
  isOpen,
  onCloseHandler,
  onDelete,
  selectedAddress,
}: WalletDetailsSheetProps): ReactElement {
  const [showSaveAddressSheet, setShowSaveAddressSheet] = useState<boolean>(false);
  const contact = AddressBook.useGetContact(selectedAddress.address ?? '');
  const { theme } = useTheme();

  // RN doesn't support stopPropagation exactly, but you can block touches to parent via pointerEvents
  const stopPropagation = useCallback(() => {}, []);

  return (
    <TouchableWithoutFeedback onPress={stopPropagation}>
      <View>
        <BottomModal
          title="Contact details"
          onClose={onCloseHandler}
          isOpen={isOpen}
          closeOnBackdropClick={true}
          contentStyle={[
            styles.modalContent,
            { backgroundColor: theme === ThemeName.DARK ? '#10151C' : '#FFFFFF' },
          ]}
        >
          <View style={styles.centered}>
            <View
              style={[
                styles.card,
                { backgroundColor: theme === ThemeName.DARK ? '#202636' : '#F8FAFC' },
              ]}
            >
              <AvatarCard
                chainIcon={selectedAddress.chainIcon}
                emoji={contact?.emoji ?? selectedAddress.emoji}
                size="lg"
                title={contact?.name ?? selectedAddress.name}
                style={styles.avatar}
              />

              <Buttons.CopyWalletAddress
                style={styles.copyButton}
                color={Colors.juno}
                walletAddress={sliceAddress(selectedAddress.address)}
              />
            </View>

            <View style={styles.buttonRow}>
              <Buttons.Generic
                title="Delete contact"
                color={Colors.red300}
                onClick={async () => {
                  await AddressBook.removeEntry(selectedAddress.address ?? '');
                  onDelete();
                  onCloseHandler();
                }}
                style={styles.flex1}
              >
                <Text style={styles.deleteText}>Delete contact</Text>
              </Buttons.Generic>

              <Buttons.Generic
                title="Edit contact"
                color={theme === ThemeName.DARK ? Colors.gray900 : '#F4F4F4'}
                onClick={() => setShowSaveAddressSheet(true)}
                style={styles.flex1}
              >
                <Text
                  style={[
                    theme === ThemeName.DARK ? styles.editTextDark : styles.editTextLight,
                  ]}
                >
                  Edit contact
                </Text>
              </Buttons.Generic>
            </View>
          </View>
        </BottomModal>

        <SaveAddressSheet
          isOpen={showSaveAddressSheet}
          title="Edit Contact"
          address={selectedAddress.address ?? ''}
          onClose={() => setShowSaveAddressSheet(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    borderRadius: 20,
    padding: 24,
  },
  centered: {
    alignItems: 'center',
    gap: 16,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'column',
  },
  avatar: {
    marginTop: 12,
  },
  copyButton: {
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  flex1: {
    flex: 1,
  },
  deleteText: {
    color: Colors.red300,
    textAlign: 'center',
  },
  editTextDark: {
    color: '#fff',
    textAlign: 'center',
  },
  editTextLight: {
    color: '#000',
    textAlign: 'center',
  },
});
