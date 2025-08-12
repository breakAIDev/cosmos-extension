import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CopyAddressCard } from '../../../components/card'; // Make sure this is a React Native component
import BottomModal from '../../../components/new-bottom-modal'; // Make sure this is a React Native modal
import { useWalletInfo } from '../../../hooks';

type CopyAddressSheetProps = {
  isVisible: boolean;
  onClose: (refetch?: boolean) => void;
  walletAddresses: string[];
  forceChain?: SupportedChain;
};

export function CopyAddressSheet({ isVisible, onClose, walletAddresses, forceChain }: CopyAddressSheetProps) {
  const { walletAvatar, walletName } = useWalletInfo();

  const sortedWalletAddresses = useMemo(() => {
    return walletAddresses.sort((a, b) => {
      const isEVM = a?.startsWith('0x');
      const isEVM2 = b?.startsWith('0x');
      if (isEVM && !isEVM2) return 1;
      if (!isEVM && isEVM2) return -1;
      return 0;
    });
  }, [walletAddresses]);

  const Title = useMemo(() => (
    <View style={styles.titleContainer}>
      <Image
        style={styles.avatar}
        source={{uri: walletAvatar}}
        alt='wallet avatar'
      />
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.walletName}
      >
        {walletName}
      </Text>
    </View>
  ), [walletAvatar, walletName]);

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      title={Title}
      containerStyle={styles.modalContainer}
      style={{padding: 24}}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedWalletAddresses.map((address, index) => (
          <CopyAddressCard
            address={address}
            key={`${address}-${index}`}
            forceChain={forceChain}
          />
        ))}
      </ScrollView>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // If your RN version supports it, otherwise use marginRight on Image
    height: 40,
    backgroundColor: '#E5E7EB', // replace with your secondary-200 color
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  walletName: {
    color: '#171717', // replace with your 'text-foreground'
    fontWeight: 'bold',
    fontSize: 16,
    maxWidth: 196,
    lineHeight: 22,
    flexShrink: 1,
  },
  modalContainer: {
    padding: 24,
    // height: 'auto', // let modal handle its height
  },
  scrollView: {
    maxHeight: 400,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
  },
});
