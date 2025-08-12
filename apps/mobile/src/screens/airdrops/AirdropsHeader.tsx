import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Info } from 'phosphor-react-native';
import { WalletButtonV2 } from '../../components/button';
import { PageHeader } from '../../components/header/PageHeaderV2';
import { useWalletInfo } from '../../hooks/useWalletInfo';
import SelectWallet from '../../screens/home/SelectWallet/v2';
import { AboutAirdropsSheet } from './components/about-airdrops-sheet';

export const AirdropsHeader = ({
  disableWalletButton,
  onBackClick,
}: {
  disableWalletButton?: boolean;
  onBackClick?: () => void;
}) => {
  const navigation = useNavigation();
  const walletInfo = useWalletInfo();
  const [showSelectWallet, setShowSelectWallet] = useState(false);
  const [showAboutAirdrops, setShowAboutAirdrops] = useState(false);

  const handleShowAboutAirdropsSheet = useCallback(() => setShowAboutAirdrops(true), []);

  return (
    <>
      <PageHeader style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (onBackClick) {
              onBackClick();
            } else {
              navigation.goBack();
            }
          }}>
          <ArrowLeft
            size={36}
            color="#A1A1AA"
            style={styles.iconLeft}
          />
        </TouchableOpacity>

        <View style={styles.centeredWalletButton}>
          <WalletButtonV2
            showDropdown
            showWalletAvatar
            walletName={walletInfo.walletName}
            walletAvatar={walletInfo.walletAvatar}
            handleDropdownClick={() => setShowSelectWallet(!disableWalletButton)}
          />
        </View>

        <TouchableOpacity onPress={handleShowAboutAirdropsSheet}>
          <Info
            size={20}
            color="#A1A1AA"
            style={styles.iconRight}
            
          />
        </TouchableOpacity>
      </PageHeader>

      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => setShowSelectWallet(false)}
        title="Your Wallets"
      />
      <AboutAirdropsSheet
        isOpen={showAboutAirdrops}
        onClose={() => setShowAboutAirdrops(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(249,250,251,0.75)', // secondary-50/75
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    position: 'relative',
    zIndex: 2,
    // paddingHorizontal: 16,
  },
  iconLeft: {
    padding: 4,
    marginLeft: 6,
  },
  iconRight: {
    position: 'absolute',
    right: 18,
    top: 22,
    padding: 2,
  },
  centeredWalletButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -60 }, // tweak as needed depending on button width
      { translateY: -24 },
    ],
    zIndex: 1,
  },
});
