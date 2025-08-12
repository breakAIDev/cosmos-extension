import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SelectedAddress, sliceAddress } from '@leapwallet/cosmos-wallet-hooks';
import { Avatar } from '@leapwallet/leap-ui';
import Text from '../../../../components/text';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../../assets/images';
import WalletDetailsSheet from '../wallet-details-sheet';

type SelectedAddressPreviewProps = {
  selectedAddress: SelectedAddress;
  showEditMenu: boolean;
  onDelete: () => void;
};

export const SelectedAddressPreview: React.FC<SelectedAddressPreviewProps> = ({
  selectedAddress,
  showEditMenu,
  onDelete,
}) => {
  const defaultTokenLogo = useDefaultTokenLogo();
  const [showContactDetailsSheet, setShowContactDetailsSheet] = useState(false);

  // No stopPropagation in RN, just control navigation logic
  const handleMenuPress = () => setShowContactDetailsSheet(true);

  return (
    <>
      <View style={styles.row} /* add accessibilityLabel or testID if needed */>
        <Avatar
          size="sm"
          avatarImage={selectedAddress.avatarIcon ?? defaultTokenLogo}
          avatarOnError={() => {}}
          emoji={selectedAddress.emoji}
          chainIcon={
            selectedAddress.avatarIcon === selectedAddress.chainIcon
              ? undefined
              : selectedAddress.chainIcon
          }
          style={styles.avatar}
        />
        <Text size="md" style={styles.nameText}>
          {selectedAddress.ethAddress && selectedAddress.chainName !== 'injective'
            ? sliceAddress(selectedAddress.ethAddress)
            : selectedAddress.name}
        </Text>
        {showEditMenu ? (
          <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
            <Image source={{uri: Images.Misc.Menu}} style={styles.menuIcon} />
          </TouchableOpacity>
        ) : null}
      </View>
      <WalletDetailsSheet
        isOpen={showEditMenu && showContactDetailsSheet}
        selectedAddress={selectedAddress}
        onDelete={onDelete}
        onCloseHandler={() => setShowContactDetailsSheet(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  avatar: {
    backgroundColor: '#E5E7EB', // bg-gray-200
    height: 32, // 8 * 4
    width: 32,
    borderRadius: 16,
  },
  nameText: {
    color: '#1A202C', // text-black-100
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
    flexShrink: 1,
  },
  menuButton: {
    marginLeft: 'auto',
    padding: 6,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});
