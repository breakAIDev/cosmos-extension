import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import BottomModal from '../../components/bottom-modal';
import { useSiteLogo } from '../../hooks/utility/useSiteLogo';
import { Images } from '../../../assets/images';
import { addToConnections } from '../ApproveConnection/utils';
import { Wallet } from '../../hooks/wallet/useWallet';
import CreateImportActions from './CreateImportActions';
import { NewWalletForm } from './CreateNewWallet';
import { EditWalletForm } from './EditWallet';
import { ImportPrivateKey } from './ImportPrivateKey';
import { ImportSeedPhrase } from './ImportSeedPhrase';
import ImportWatchWallet from './ImportWatchWallet';
import WalletCardWrapper from './WalletCardWrapper';
import { activeChainStore } from '../../context/active-chain-store';
import { chainInfoStore } from '../../context/chain-infos-store';

type SelectWalletProps = {
  readonly isVisible: boolean;
  readonly onClose: VoidFunction;
  readonly title: string;
  readonly hideCreateNewWallet?: boolean;
  readonly currentWalletInfo?: {
    wallets: [any]; // change [Key] if needed
    chainIds: [string];
    origin: string;
  } | null;
};

export default function SelectWallet({
  isVisible,
  onClose,
  title,
  currentWalletInfo,
  hideCreateNewWallet,
}: SelectWalletProps) {
  const [isNewWalletFormVisible, setIsNewWalletFormVisible] = useState(false);
  const [isEditWalletVisible, setIsEditWalletVisible] = useState(false);
  const wallets = Wallet.useWallets();
  const [editWallet, setEditWallet] = useState<any>(); // or Key

  const [showImportPrivateKey, setShowImportPrivateKey] = useState(false);
  const [showImportSeedPhrase, setShowImportSeedPhrase] = useState(false);
  const [showImportWatchWallet, setShowImportWatchWallet] = useState(false);

  useEffect(() => {
    if (!isVisible) setEditWallet(undefined);
  }, [isVisible]);

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .sort((a, b) => (a.watchWallet === b.watchWallet ? a.name.localeCompare(b.name) : a.watchWallet ? 1 : -1))
      : [];
  }, [wallets]);

  const handleConnectWalletClick = async () => {
    const walletIds = currentWalletInfo?.wallets.map((wallet) => wallet.id);
    await addToConnections(
      currentWalletInfo?.chainIds as [string],
      walletIds ?? [],
      currentWalletInfo?.origin as string,
    );
    onClose();
  };

  const walletName = currentWalletInfo?.wallets?.[0]?.name;
  const walletColorIndex = currentWalletInfo?.wallets?.[0]?.colorIndex;
  const siteName =
    currentWalletInfo?.origin?.split('//')?.at(-1)?.split('.')?.at(-2) ||
    currentWalletInfo?.origin?.split('//')?.at(-1);
  const siteLogo = useSiteLogo(currentWalletInfo?.origin);

  return (
    <>
      <BottomModal isOpen={isVisible} onClose={onClose} title={title} closeOnBackdropClick>
        <ScrollView
          style={styles.innerContainer}
          contentContainerStyle={{ paddingBottom: 30 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {currentWalletInfo && (
            <View style={styles.siteWalletContainer}>
              <View style={styles.iconRow}>
                <Image
                  source={{uri: Images.Misc.getWalletIconAtIndex(
                    walletColorIndex as number,
                    currentWalletInfo?.wallets?.[0]?.watchWallet,
                  )}}
                  style={styles.walletIcon}
                  resizeMode="cover"
                />
                <Image
                  source={{ uri: siteLogo || Images.Misc.DefaultWebsiteIcon }}
                  style={styles.siteLogo}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.siteName}>{siteName}</Text>
              <Text style={styles.walletTitle}>{walletName} not Connected</Text>
              <Text style={styles.siteDesc}>
                You can connect this wallet, or can switch to an already connected wallet.
              </Text>
              <TouchableOpacity
                style={styles.connectBtn}
                onPress={handleConnectWalletClick}
                activeOpacity={0.8}
              >
                <Text style={styles.connectBtnText}>Connect {walletName}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Wallets List */}
          <View style={styles.walletsListContainer}>
            {walletsList.map((wallet, index, array) => {
              if (wallet.id === currentWalletInfo?.wallets?.[0]?.id) return null;
              return (
                <WalletCardWrapper
                  key={wallet.id}
                  isLast={index === array.length - 1}
                  wallet={wallet}
                  onClose={onClose}
                  setEditWallet={setEditWallet}
                  setIsEditWalletVisible={setIsEditWalletVisible}
                />
              );
            })}
          </View>

          {/* Create/Import actions */}
          {!hideCreateNewWallet && (
            <CreateImportActions
              setShowImportSeedPhrase={setShowImportSeedPhrase}
              setShowImportPrivateKey={setShowImportPrivateKey}
              setShowImportWatchWallet={setShowImportWatchWallet}
              setIsNewWalletFormVisible={setIsNewWalletFormVisible}
            />
          )}
        </ScrollView>
      </BottomModal>

      {/* Edit, New, Import Forms (modals) */}
      <EditWalletForm
        wallet={editWallet}
        isVisible={isEditWalletVisible}
        onClose={() => setIsEditWalletVisible(false)}
        activeChainStore={activeChainStore}
        chainInfosStore={chainInfoStore}
      />

      <NewWalletForm
        isVisible={isNewWalletFormVisible}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) onClose();
          setIsNewWalletFormVisible(false);
        }}
      />

      <ImportSeedPhrase
        isVisible={showImportSeedPhrase}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) onClose();
          setShowImportSeedPhrase(false);
        }}
      />

      <ImportPrivateKey
        isVisible={showImportPrivateKey}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) onClose();
          setShowImportPrivateKey(false);
        }}
      />

      <ImportWatchWallet
        isVisible={showImportWatchWallet}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) onClose();
          setShowImportWatchWallet(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    padding: 0,
    backgroundColor: 'transparent',
    flex: 1,
  },
  siteWalletContainer: {
    flexDirection: 'column',
    borderRadius: 18,
    backgroundColor: '#fff',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    marginBottom: 16,
    marginTop: 4,
    shadowColor: '#0002',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 8,
    gap: 10,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2d3142',
    marginRight: -12,
    zIndex: 2,
  },
  siteLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: -8,
    zIndex: 1,
    backgroundColor: '#eee',
  },
  siteName: {
    fontSize: 16,
    color: '#1ba672',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  siteDesc: {
    fontSize: 13,
    color: '#8f98a8',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  connectBtn: {
    backgroundColor: 'rgba(225, 136, 129, 0.1)',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'center',
  },
  connectBtnText: {
    color: '#E18881',
    fontWeight: 'bold',
    fontSize: 15,
  },
  walletsListContainer: {
    borderRadius: 18,
    backgroundColor: '#fff',
    maxHeight: 200,
    marginBottom: 18,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});
