import React, { useMemo } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Key, useChainInfo, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { CheckCircle } from 'phosphor-react-native';
import BottomModal from '../../../../components/bottom-modal';
import Text from '../../../../components/text';
import { WALLET_NAME_SLICE_LENGTH } from '../../../../services/config/constants';
import { useChainPageInfo } from '../../../../hooks';
import { Wallet } from '../../../../hooks/wallet/useWallet';
import { Images } from '../../../../../assets/images';
import { useSendContext } from '../../../send-v2/context';
import { formatWalletName } from '../../../../utils/formatWalletName';
import { isLedgerEnabled } from '../../../../utils/isLedgerEnabled';
import { sliceAddress } from '../../../../utils/strings';
import useWallets = Wallet.useWallets;
import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk';
import { getDerivationPathToShow } from '../../../../utils';
import { getLedgerEnabledEvmChainsKey } from '../../../../utils/getLedgerEnabledEvmChains';

type SelectWalletSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  setSelectedWallet: (val: Key) => void;
  selectedWallet: Key;
};

export const SelectWalletSheet: React.FC<SelectWalletSheetProps> = ({
  isOpen,
  onClose,
  setSelectedWallet,
  selectedWallet,
}) => {
  const wallets = useWallets();
  const { topChainColor } = useChainPageInfo();
  const { sendActiveChain } = useSendContext();

  const activeChainInfo = useChainInfo(sendActiveChain);
  const chains = useGetChains();

  const ledgerEnabledEvmChainsKeys = useMemo(() => {
    return getLedgerEnabledEvmChainsKey(Object.values(chains));
  }, [chains]);

  const ledgerApp = useMemo(() => {
    return ledgerEnabledEvmChainsKeys.includes(activeChainInfo?.key) ? 'EVM' : 'Cosmos';
  }, [activeChainInfo?.key, ledgerEnabledEvmChainsKeys]);

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [wallets]);

  return (
    <BottomModal
      title="Wallets"
      onClose={onClose}
      isOpen={isOpen}
      containerStyle={styles.modalContainer}
    >
      <View>
        {walletsList.map((wallet, index, array) => {
          const isLast = index === array.length - 1;
          let walletLabel = '';

          if (wallet.walletType === WALLETTYPE.LEDGER) {
            const path = wallet.path ? getDerivationPathToShow(wallet.path) : `0'/0/${wallet.addressIndex}`;
            walletLabel = ` · /${path}`;
          }

          if (
            (wallet.walletType === WALLETTYPE.PRIVATE_KEY || wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED) &&
            !wallet.watchWallet
          ) {
            walletLabel = ` · Imported`;
          }

          const walletName = formatWalletName(wallet.name);
          const shortenedWalletName =
            walletName.length > WALLET_NAME_SLICE_LENGTH
              ? walletName.slice(0, WALLET_NAME_SLICE_LENGTH) + '...'
              : walletName;

          const addressValue = activeChainInfo?.evmOnlyChain
            ? pubKeyToEvmAddressToShow(wallet?.pubKeys?.[activeChainInfo?.key])
            : wallet?.addresses?.[activeChainInfo?.key] ?? '';
          let addressText = `${
            addressValue ? sliceAddress(addressValue) + walletLabel : walletLabel.replace(' · ', '')
          }`;

          if (
            wallet.walletType === WALLETTYPE.LEDGER &&
            !isLedgerEnabled(activeChainInfo.key, activeChainInfo.bip44.coinType, Object.values(chains))
          ) {
            addressText = `Ledger not supported on ${activeChainInfo.chainName}`;
          }

          if (
            wallet.walletType === WALLETTYPE.LEDGER &&
            isLedgerEnabled(activeChainInfo.key, activeChainInfo.bip44.coinType, Object.values(chains)) &&
            !wallet.addresses[activeChainInfo.key]
          ) {
            addressText = `Please import ${ledgerApp} wallet`;
          }

          return (
            <View key={wallet.id} style={styles.walletRow}>
              <TouchableOpacity
                style={styles.walletButton}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedWallet(wallet);
                  onClose();
                }}
              >
                <Image
                  source={{ uri: wallet.avatar ?? Images.Misc.getWalletIconAtIndex(wallet.colorIndex, wallet.watchWallet)}}
                  style={styles.walletIcon}
                  resizeMode="cover"
                />

                <View style={styles.walletInfo}>
                  <View style={styles.walletNameRow}>
                    <Text style={styles.walletName}>{shortenedWalletName}</Text>
                    {wallet.walletType === WALLETTYPE.LEDGER && (
                      <Text style={styles.ledgerTag} color="text-gray-400" size="xs">
                        Ledger
                      </Text>
                    )}
                  </View>

                  <Text style={styles.walletAddress}>{addressText}</Text>
                </View>

                {selectedWallet?.id === wallet.id ? (
                  <CheckCircle weight="fill" size={24} style={{ marginLeft: 8 }} color={ topChainColor } />
                ) : null}
              </TouchableOpacity>

              {!isLast && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  walletRow: {
    minHeight: 56,
    justifyContent: 'center',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  walletIcon: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.13)',
    height: 40,
    width: 40,
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  walletNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletName: {
    fontWeight: 'bold',
    color: '#252525',
    fontSize: 15,
    marginRight: 2,
    textTransform: 'capitalize',
  },
  ledgerTag: {
    backgroundColor: '#191a24',
    borderRadius: 12,
    paddingHorizontal: 8,
    marginLeft: 4,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'normal',
    color: '#888',
    fontSize: 11,
    overflow: 'hidden',
  },
  walletAddress: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ededed',
    width: '100%',
  },
});

export default SelectWalletSheet;
