import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { capitalize, sliceAddress, SelectedAddress } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { EditIcon } from '../../../../../assets/icons/edit-icon'; // Must be a React Native-compatible SVG or component
import { Images } from '../../../../../assets/images';
import { AddressBook } from '../../../../utils/addressbook';

interface RecipientDisplayCardProps {
  selectedAddress: SelectedAddress;
  setSelectedContact: (contact: AddressBook.SavedAddress) => void;
  setIsAddContactSheetVisible: (visible: boolean) => void;
  activeChain: SupportedChain;
  onEdit: () => void;
}

const RecipientDisplayCard = ({
  selectedAddress,
  setSelectedContact,
  setIsAddContactSheetVisible,
  activeChain,
  onEdit,
}: RecipientDisplayCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Image
          source={{ uri: selectedAddress.avatarIcon ?? Images.Misc.getWalletIconAtIndex(0)}}
          style={styles.avatar}
        />

        <View style={styles.textContainer}>
          <Text style={styles.nameText}>
            {selectedAddress?.name
              ? capitalize(selectedAddress?.name)
              : sliceAddress(selectedAddress?.ethAddress || selectedAddress?.address)}
          </Text>
          {selectedAddress?.name ? (
            <Text style={styles.addressText}>
              {sliceAddress(selectedAddress?.ethAddress || selectedAddress?.address)}
            </Text>
          ) : (
            <TouchableOpacity
              style={styles.addContactBtn}
              onPress={() => {
                setSelectedContact({
                  address: selectedAddress?.ethAddress || selectedAddress?.address || '',
                  name: '',
                  emoji: 0,
                  blockchain: activeChain,
                  ethAddress: selectedAddress?.ethAddress || '',
                });
                setIsAddContactSheetVisible(true);
              }}
            >
              <Text style={styles.addContactText}>+ Add to contacts</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.editIconBtn}
        onPress={onEdit}
        activeOpacity={0.7}
      >
        {/* Your EditIcon component must be React Native compatible (SVG or Image) */}
        <EditIcon size={24}/>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#ddd',
  },
  textContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  nameText: {
    fontWeight: 'bold',
    color: '#222', // You can use your theme colors here
    fontSize: 15,
    marginBottom: 2,
  },
  addressText: {
    color: '#8c8c8c',
    fontSize: 13,
  },
  addContactBtn: {
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  addContactText: {
    fontSize: 12,
    color: '#8c8c8c',
  },
  editIconBtn: {
    backgroundColor: '#e3e6ea',
    borderRadius: 16,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default RecipientDisplayCard;
