import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { WalletButtonV2 } from '../../components/button';
import { PageHeader } from '../../components/header/PageHeaderV2';
import { useWalletInfo } from '../../hooks/useWalletInfo';
import SelectWallet from '../home/SelectWallet/v2';

type StakeHeaderProps = {
  disableWalletButton?: boolean;
  setShowSearchInput?: React.Dispatch<React.SetStateAction<boolean>>;
  onBackClick?: () => void;
};

export const StakeHeader = ({
  disableWalletButton,
  setShowSearchInput,
  onBackClick,
}: StakeHeaderProps) => {
  const navigation = useNavigation<any>();
  const walletInfo = useWalletInfo();
  const [showSelectWallet, setShowSelectWallet] = useState(false);

  return (
    <>
      <PageHeader>
        <View style={styles.headerRow}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              if (onBackClick) {
                onBackClick();
              } else {
                navigation.goBack();
              }
            }}
            style={styles.iconBtn}
            hitSlop={12}
          >
            <ArrowLeft size={32} color="#94a3b8" />
          </TouchableOpacity>

          <WalletButtonV2
            showDropdown
            showWalletAvatar
            walletName={walletInfo.walletName}
            walletAvatar={walletInfo.walletAvatar}
            handleDropdownClick={() =>
              !disableWalletButton && setShowSelectWallet(true)
            }
            style={styles.centerWalletBtn}
          />

          {/* Search Button */}
          {setShowSearchInput ? (
            <TouchableOpacity
              onPress={() => setShowSearchInput((val: boolean) => !val)}
              style={styles.iconBtn}
              hitSlop={12}
            >
              <MagnifyingGlass size={32} color="#94a3b8" />
            </TouchableOpacity>
          ) : (
            // Fill the right space if no search button
            <View style={styles.iconBtnPlaceholder} />
          )}
        </View>
      </PageHeader>

      {/* Wallet select modal */}
      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => setShowSelectWallet(false)}
        title="Your Wallets"
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 8,
    position: 'relative',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 24,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnPlaceholder: {
    width: 44,
    height: 44,
  },
  centerWalletBtn: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },
});
