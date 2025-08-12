import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Avatar } from '@leapwallet/leap-ui';
import Text from '../../../../components/text';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../../assets/images';
import { SelectedAddress } from '@leapwallet/cosmos-wallet-hooks';

type SelectedAddressPreviewProps = {
  selectedAddress: SelectedAddress;
  showEditMenu: boolean;
  onDelete: () => void;
};

export const SelectedAddressPreview = ({
  selectedAddress,
  showEditMenu,
  onDelete, // you can use this for swipe-to-delete or show delete icon, as needed
}: SelectedAddressPreviewProps) => {
  const defaultTokenLogo = useDefaultTokenLogo();
  const [, setShowContactDetailsSheet] = useState(false);

  // This will open details sheet when you implement that modal/screen
  const handleClick = () => {
    setShowContactDetailsSheet(true);
  };

  return (
    <View style={styles.row}>
      <Text>{`${selectedAddress.chainName}: ${selectedAddress.address}`}</Text>
      <Avatar
        size="sm"
        avatarImage={selectedAddress.avatarIcon ?? defaultTokenLogo}
        // avatarOnError is web-only; you can handle error fallback in Avatar for RN if needed
        emoji={selectedAddress.emoji}
        chainIcon={
          selectedAddress.avatarIcon === selectedAddress.chainIcon
            ? undefined
            : selectedAddress.chainIcon
        }
        style={styles.avatar}
      />
      <Text size="md" style={styles.nameText}>
        {selectedAddress.name}
      </Text>
      {showEditMenu ? (
        <TouchableOpacity onPress={handleClick} style={styles.menuBtn}>
          <Image
            source={{uri: Images.Misc.Menu}}
            style={styles.menuIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // You can add padding or margin as needed
  },
  avatar: {
    backgroundColor: '#e5e7eb',
    height: 32,
    width: 32,
    borderRadius: 999,
  },
  nameText: {
    color: '#1f2937',
    marginLeft: 8,
    fontSize: 16,
  },
  menuBtn: {
    marginLeft: 'auto',
    padding: 6,
  },
  menuIcon: {
    width: 18,
    height: 18,
  },
});
