import React, { useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { WalletButtonV2 } from '../../../components/button';
import { PageHeader } from '../../../components/header/PageHeaderV2';
import { SideNavMenuOpen } from '../../../components/header/sidenav-menu';
import { useWalletInfo } from '../../../hooks/useWalletInfo';
import SelectWallet from '../../home/SelectWallet/v2';

export const ActivityHeader = (props: { disableWalletButton?: boolean }) => {
  const walletInfo = useWalletInfo();
  const [showSelectWallet, setShowSelectWallet] = useState(false);

  const handleWalletPress = () => {
    setShowSelectWallet(true && !props.disableWalletButton)
  };

  return (
    <View>
      <PageHeader>
        <SideNavMenuOpen style={styles.menuIcon} />

        <WalletButtonV2
          showDropdown
          showWalletAvatar
          walletName={walletInfo.walletName}
          walletAvatar={walletInfo.walletAvatar}
          handleDropdownClick={handleWalletPress}
          style={styles.walletButton}
        />
      </PageHeader>

      <Modal visible={showSelectWallet} transparent animationType="slide">
        <SelectWallet
          isVisible={showSelectWallet}
          onClose={() => setShowSelectWallet(false)}
          title="Your Wallets"
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  menuIcon: {
    paddingVertical: 8,
    paddingRight: 6,
    paddingLeft: 10,
    color: '#666',
  },
  walletButton: {
    position: 'absolute',
    top: '50%',
    right: '50%',
    transform: [{ translateX: 50 }, { translateY: -20 }],
  },
});
