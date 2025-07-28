import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'; // Your RN theme hook
import BottomModal from '../bottom-modal';      // Your RN bottom sheet/modal
import Text from '../text';                    // Your styled RN Text
import { Images } from '../../../assets/images'; // Should be require/import
import SelectWallet from '../../screens/home/SelectWallet/v2';
import { importWatchWalletSeedPopupStore } from '../../context/import-watch-wallet-seed-popup-store';
import { Colors } from '../../theme/colors';

const ImportWatchWalletSeedPopup = observer(() => {
  const { theme } = useTheme();
  const [showImportWalletSheet, setShowImportWalletSheet] = useState(false);

  if (showImportWalletSheet) {
    return (
      <SelectWallet
        isVisible={showImportWalletSheet}
        onClose={() => setShowImportWalletSheet(false)}
        title="Your Wallets"
      />
    );
  }

  return (
    <BottomModal
      isOpen={importWatchWalletSeedPopupStore.showPopup}
      onClose={() => {
        importWatchWalletSeedPopupStore.setShowPopup(false);
      }}
      closeOnBackdropClick={true}
      title="Import wallet?"
      containerStyle={styles.modalContainer}
    >
      <View style={styles.content}>
        <View style={styles.centerContent}>
          <View style={styles.iconStack}>
            <Image
              source={Images.Misc.GreenEye}
              style={styles.greenEye}
              width={40}
              height={40}
              resizeMode="contain"
            />
            <Image
              source={Images.Activity.TxSwapFailure}
              style={styles.txSwapFailure}
              width={18}
              height={18}
              resizeMode="contain"
            />
          </View>
          <View style={styles.texts}>
            <Text
              style={[styles.titleText, { color: theme === 'dark' ? '#D6D6D6' : '#4B5563' }]}
            >
              You are watching this wallet.
            </Text>
            <Text
              style={[styles.subtitleText, { color: theme === 'dark' ? '#D6D6D6' : '#4B5563' }]}
            >
              Import the wallet using your recovery phrase to manage assets and sign transactions.
            </Text>
          </View>
        </View>
        <Buttons.Generic
          onClick={() => {
            setShowImportWalletSheet(true);
            importWatchWalletSeedPopupStore.setShowPopup(false);
          }}
          color={theme === ThemeName.DARK ? Colors.white100 : Colors.black100}
          className='w-full'
          size='normal'
        >
          <Text style={{
            color: theme === 'dark' ? Colors.black100 : Colors.white100,
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 15
          }}>Import now</Text>
        </Buttons.Generic>
      </View>
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  modalContainer: {
    padding: 24,
    borderRadius: 18,
    minWidth: 320,
    alignItems: 'center',
  },
  content: {
    width: 344,
    alignItems: 'center',
    gap: 30,
    paddingBottom: 8,
  },
  centerContent: {
    alignItems: 'center',
    gap: 12,
  },
  iconStack: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  greenEye: {
    width: 40,
    height: 40,
    zIndex: 2,
  },
  txSwapFailure: {
    position: 'absolute',
    left: 31,
    top: 0,
    width: 18,
    height: 18,
    zIndex: 3,
  },
  texts: {
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitleText: {
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 20,
  },
});

export default ImportWatchWalletSeedPopup;
