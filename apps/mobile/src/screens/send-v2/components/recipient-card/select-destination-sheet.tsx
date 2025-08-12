import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SelectedAddress, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { isAptosChain } from '@leapwallet/cosmos-wallet-sdk';
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store/dist/utils';
import BottomModal from '../../../../components/bottom-modal';
import { useSendContext } from '../../../send-v2/context';

import MyContacts from './MyContacts';
import { MyEvmWalletAddresses } from './MyEvmWalletAddresses';
import MyWallets from './MyWallets';
import Text from '../../../../components/text'; // Ensure your Text is a RN-compatible component

export type DestinationType = 'My Wallets' | 'My Contacts';

type SelectDestinationSheetProps = {
  isOpenType: DestinationType | null;
  onClose: () => void;
  setSelectedAddress: (address: SelectedAddress) => void;
  handleContactSelect: (contact: SelectedAddress) => void;
  skipSupportedDestinationChainsIDs: string[];
  showOnlyMyWallets?: boolean;
};

export const SelectDestinationSheet: React.FC<SelectDestinationSheetProps> = ({
  isOpenType,
  onClose,
  setSelectedAddress,
  handleContactSelect,
  skipSupportedDestinationChainsIDs,
  showOnlyMyWallets,
}) => {
  const [destinationType, setDestinationType] = useState<DestinationType>(isOpenType as DestinationType);

  const { chains } = useChainsStore();
  const { sendActiveChain } = useSendContext();

  const chainData = chains[sendActiveChain];

  useEffect(() => {
    setDestinationType(isOpenType as DestinationType);
  }, [isOpenType]);

  return (
    <BottomModal
      title="Select Destination"
      onClose={onClose}
      isOpen={!!isOpenType}
      containerStyle={styles.modalContainer}
    >
      <View style={styles.tabsRow}>
        {(['My Contacts', 'My Wallets'] as DestinationType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.tab,
              destinationType === type ? styles.tabActive : styles.tabInactive,
            ]}
            onPress={() => setDestinationType(type)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                destinationType === type ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ width: '100%' }}>
        {destinationType === 'My Contacts' ? (
          <MyContacts handleContactSelect={handleContactSelect} />
        ) : chainData.evmOnlyChain ||
          isAptosChain(chainData.key) ||
          isBitcoinChain(chainData.key) ||
          showOnlyMyWallets ? (
          <MyEvmWalletAddresses chainInfo={chainData} setSelectedAddress={setSelectedAddress} />
        ) : (
          <MyWallets
            skipSupportedDestinationChainsIDs={skipSupportedDestinationChainsIDs}
            setSelectedAddress={setSelectedAddress}
          />
        )}
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f7',
    borderWidth: 3,
    borderColor: '#f5f5f7',
    borderRadius: 25,
    marginBottom: 24,
    width: '100%',
  },
  tab: {
    flex: 1,
    borderRadius: 40,
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#111',
  },
  tabTextInactive: {
    color: '#888',
  },
});

export default SelectDestinationSheet;
