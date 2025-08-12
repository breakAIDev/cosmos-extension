import { AvatarCard, Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui';
import BottomModal from '../../../../components/bottom-modal';
import { SelectedAddress } from '../../../send/types';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
}: WalletDetailsSheetProps) {
  const [showSaveAddressSheet, setShowSaveAddressSheet] = useState<boolean>(false);
  const contact = AddressBook.useGetContact(selectedAddress.address ?? '');
  const { theme } = useTheme();

  // For RN Modal, backdrop click is handled by modal component

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <BottomModal
        title="Contact details"
        onClose={onCloseHandler}
        isOpen={isOpen}
        contentStyle={[
          styles.modalContent,
          theme === ThemeName.DARK ? styles.darkModal : styles.lightModal,
        ]}
        style={styles.modal}
      >
        <View style={styles.centeredCol}>
          <View
            style={[
              styles.assetCard,
              theme === ThemeName.DARK ? styles.darkCard : styles.lightCard,
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

          <View style={styles.row}>
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
              Delete contact
            </Buttons.Generic>

            <Buttons.Generic
              title="Edit contact"
              color={theme === ThemeName.DARK ? Colors.gray900 : '#F4F4F4'}
              onClick={() => setShowSaveAddressSheet(true)}
              style={styles.flex1}
            >
              {/* Use Text instead of <p> */}
              <Text
                style={theme === ThemeName.DARK ? styles.editTextDark : styles.editTextLight}
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
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#fff',
  },
  darkModal: {
    backgroundColor: '#0B0B0E',
  },
  lightModal: {
    backgroundColor: '#FFF',
  },
  modal: {
    padding: 24,
  },
  centeredCol: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  assetCard: {
    width: '100%',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
  },
  darkCard: {
    backgroundColor: '#232334',
  },
  lightCard: {
    backgroundColor: '#F7F8FA',
  },
  avatar: {
    marginTop: 12,
  },
  copyButton: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  flex1: {
    flex: 1,
  },
  editTextLight: {
    color: '#19191A',
    textAlign: 'center',
  },
  editTextDark: {
    color: '#FFF',
    textAlign: 'center',
  },
});
