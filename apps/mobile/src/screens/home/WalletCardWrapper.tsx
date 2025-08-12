import { Key, useActiveChain, useChainInfo, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { isAptosChain, pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk';
import { Check, DotsThreeVertical } from 'phosphor-react-native';
import { CopyIcon } from '../../../assets/icons/copy-icon';
import { EyeIcon } from '../../../assets/icons/eye-icon';
import { LedgerDriveIcon } from '../../../assets/icons/ledger-icon';
import { getWalletIconAtIndex } from '../../../assets/images/misc';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getWalletColorAtIndex } from '../../theme/colors';
import { AggregatedSupportedChain } from '../../types/utility';
import { UserClipboard } from '../../utils/clipboard';
import { formatWalletName } from '../../utils/formatWalletName';
import { getLedgerEnabledEvmChainsKey } from '../../utils/getLedgerEnabledEvmChains';
import { isLedgerEnabled } from '../../utils/isLedgerEnabled';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { sliceAddress } from '../../utils/strings';
import { View, Text, TouchableOpacity, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';

export const WatchWalletAvatar = (props: { colorIndex?: number, style?: StyleProp<ViewStyle>, iconSize?: number }) => {
  return (
    <View
      style={[
        styles.avatar,
        { backgroundColor: getWalletColorAtIndex(props.colorIndex) },
        props.style,
      ]}
    >
      <EyeIcon size={props.iconSize} />
    </View>
  );
};

const AddressLabel = ({ address }: {address: string}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  if (!address) return null;

  return (
    <TouchableOpacity
      onPress={() => {
        UserClipboard.copyText(address);
        setIsCopied(true);
      }}
      style={styles.addressBtn}
      activeOpacity={0.6}
    >
      <AnimatePresence>
        {isCopied ? (
          <MotiView
            from={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 5 }}
            style={styles.addressAnimRow}
            key="copied"
          >
            <Text style={styles.copiedText}>Copied</Text>
            <Check size={13} />
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 5 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -5 }}
            style={styles.addressAnimRow}
            key="address"
          >
            <Text numberOfLines={1} style={styles.addressText}>
              {sliceAddress(address)}
            </Text>
            <CopyIcon size={13} style={styles.copyIcon} />
          </MotiView>
        )}
      </AnimatePresence>
    </TouchableOpacity>
  );
};

const WalletCardWrapper = observer(
  ({
    isLast,
    wallet,
    onClose,
    setEditWallet,
    setIsEditWalletVisible,
  }: {
    isLast: boolean;
    wallet: Key;
    onClose: () => void;
    setEditWallet: (wallet: Key) => void;
    setIsEditWalletVisible: (visible: boolean) => void;
  }) => {
    const navigation = useNavigation();
    const activeChainInfo = useChainInfo();
    const activeChain = useActiveChain() as AggregatedSupportedChain;
    const { activeWallet, setActiveWallet } = useActiveWallet();
    const chains = useGetChains();

    const ledgerEnabledEvmChainsKeys = useMemo(() => {
      return getLedgerEnabledEvmChainsKey(Object.values(chains));
    }, [chains]);

    const ledgerApp = useMemo(() => {
      return ledgerEnabledEvmChainsKeys.includes(activeChainInfo?.key) ? 'EVM' : 'Cosmos';
    }, [activeChainInfo?.key, ledgerEnabledEvmChainsKeys]);

    const { walletLabel, shortenedWalletName } = useMemo(() => {
      let walletLabel = '';

      if (
        (wallet.walletType === WALLETTYPE.PRIVATE_KEY || wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED) &&
        !wallet.watchWallet
      ) {
        walletLabel = 'Imported';
      }

      if (!wallet.watchWallet && wallet.walletType === WALLETTYPE.LEDGER && wallet.path) {
        walletLabel = `${wallet.path?.replace("m/44'/118'/", '')}`;
      }

      const walletName = formatWalletName(wallet.name);

      const sliceLength = 19;
      const walletNameLength = walletName.length;
      const shortenedWalletName =
        walletNameLength > sliceLength ? walletName.slice(0, sliceLength) + '...' : walletName;

      return { walletLabel, walletName, walletNameLength, shortenedWalletName };
    }, [wallet]);

    const { addressText, disableEdit } = useMemo(() => {
      const addressValue = activeChainInfo?.evmOnlyChain
        ? pubKeyToEvmAddressToShow(wallet?.pubKeys?.[activeChainInfo?.key], true) ??
          wallet?.addresses?.[activeChainInfo?.key]
        : wallet?.addresses?.[activeChainInfo?.key] ?? '';

      let addressText = addressValue;
      let disableEdit = false;

      if (
        wallet.walletType === WALLETTYPE.LEDGER &&
        !isLedgerEnabled(activeChainInfo?.key, activeChainInfo?.bip44?.coinType, Object.values(chains))
      ) {
        addressText = `Ledger not supported on ${activeChainInfo?.chainName}`;
        disableEdit = true;
      }
      if (
        wallet.walletType === WALLETTYPE.LEDGER &&
        isLedgerEnabled(activeChainInfo?.key, activeChainInfo?.bip44?.coinType, Object.values(chains)) &&
        !wallet.addresses[activeChainInfo?.key]
      ) {
        addressText = `Please import ${ledgerApp} wallet`;
        disableEdit = true;
      }

      const isEvmNotImportedOnWW =
        wallet.walletType === WALLETTYPE.WATCH_WALLET &&
        !!activeChainInfo?.evmOnlyChain &&
        !wallet.addresses[activeChainInfo?.key];

      const isAptosNotImportedOnWW =
        wallet.walletType === WALLETTYPE.WATCH_WALLET &&
        isAptosChain(activeChainInfo?.key) &&
        !wallet.addresses[activeChainInfo?.key];

      if (isEvmNotImportedOnWW || isAptosNotImportedOnWW) {
        addressText = `Please import ${isEvmNotImportedOnWW ? 'EVM' : 'Movement'} wallet`;
        disableEdit = true;
      }

      return { addressText, disableEdit };
    }, [wallet, activeChainInfo, chains, ledgerApp]);

    const onClick = useCallback(async () => {
      await setActiveWallet(wallet);
      onClose();
      navigation.navigate('Home');
    }, [setActiveWallet, wallet, onClose, navigation]);

    return (
      <TouchableOpacity
        onPress={onClick}
        style={[
          styles.card,
          activeWallet?.id === wallet.id
            ? styles.activeCard
            : styles.inactiveCard,
        ]}
        activeOpacity={0.9}
      >
        {wallet.watchWallet ? (
          <WatchWalletAvatar colorIndex={wallet.colorIndex} style={styles.avatarLarge} iconSize={28} />
        ) : (
          <Image
            source={{ uri: wallet.avatar ?? getWalletIconAtIndex(wallet.colorIndex)}}
            style={styles.avatarLarge}
            resizeMode="cover"
          />
        )}

        <View style={styles.walletInfo}>
          <View style={styles.walletNameRow}>
            <Text style={styles.walletName} numberOfLines={1}>{shortenedWalletName}</Text>
            {walletLabel ? (
              <Text style={styles.walletLabel}>{walletLabel}</Text>
            ) : null}
            {wallet.walletType === WALLETTYPE.LEDGER && (
              <View style={styles.ledgerIconContainer}>
                <LedgerDriveIcon size={10} />
              </View>
            )}
          </View>
          {activeChain !== 'aggregated' ? (
            disableEdit
              ? <Text style={styles.addressText} numberOfLines={1}>{addressText}</Text>
              : <AddressLabel address={addressText} />
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.dotsButton}
          onPress={(e) => {
            e.stopPropagation?.();
            if (disableEdit) return;
            setEditWallet(wallet);
            setIsEditWalletVisible(true);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <DotsThreeVertical size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 8,
    backgroundColor: '#F3F4F6', // secondary-100
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 72,
    width: '100%',
  },
  activeCard: {
    backgroundColor: '#E3F9EC',
    borderColor: '#26c06f',
  },
  inactiveCard: {
    backgroundColor: '#F3F4F6',
    borderColor: 'transparent',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C1C9CE',
  },
  avatarLarge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 2,
  },
  walletNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  walletName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#212121',
    maxWidth: 120,
  },
  copiedText: {
    color: '#31CD73',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  addressAnimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 170,
  },
  walletLabel: {
    backgroundColor: '#F3F7F6',
    fontSize: 12,
    color: '#7C868C',
    borderRadius: 5,
    paddingHorizontal: 4,
    marginLeft: 6,
  },
  ledgerIconContainer: {
    backgroundColor: '#E7EBF0',
    borderRadius: 5,
    padding: 2,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    color: '#8997a6',
    fontSize: 13,
    marginTop: 0,
    marginBottom: 2,
    width: '100%',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 180,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 180,
    paddingVertical: 2,
    marginVertical: 0,
  },
  copyIcon: {
    marginLeft: 2,
    opacity: 0.6,
  },
  dotsButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderRadius: 16,
  },
});

export default WalletCardWrapper;
