import React, { useMemo } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import {
  capitalize,
  Key,
  SelectedAddress,
  sliceAddress,
  useGetChains,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo, pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk';
import useActiveWallet from '../../../../hooks/settings/useActiveWallet';
import { Wallet } from '../../../../hooks/wallet/useWallet';
import { Images } from '../../../../../assets/images';
import { getLedgerEnabledEvmChainsKey } from '../../../../utils/getLedgerEnabledEvmChains';
import { isLedgerEnabled } from '../../../../utils/isLedgerEnabled';
import Text from '../../../../components/text'; // Your custom RN-compatible Text

type WalletCardProps = {
  chainInfo: ChainInfo;
  wallet: Key;
  onClick: (params: { address: string; name: string; chainName: string }) => void;
};

const WalletCard = ({ wallet, onClick, chainInfo }: WalletCardProps) => {
  const chains = useGetChains();

  const walletAddress = chainInfo?.evmOnlyChain
    ? pubKeyToEvmAddressToShow(wallet.pubKeys?.[chainInfo?.key], true)
    : wallet.addresses[chainInfo?.key];

  const ledgerEnabledEvmChainsKeys = useMemo(() => {
    return getLedgerEnabledEvmChainsKey(Object.values(chains));
  }, [chains]);

  const ledgerApp = useMemo(() => {
    return ledgerEnabledEvmChainsKeys.includes(chainInfo?.key) ? 'EVM' : 'Cosmos';
  }, [chainInfo?.key, ledgerEnabledEvmChainsKeys]);

  const addressText = useMemo(() => {
    if (
      wallet.walletType === WALLETTYPE.LEDGER &&
      !isLedgerEnabled(chainInfo.key, chainInfo.bip44.coinType, Object.values(chains))
    ) {
      return `Ledger not supported on ${chainInfo.chainName}`;
    }

    if (
      wallet.walletType === WALLETTYPE.LEDGER &&
      isLedgerEnabled(chainInfo.key, chainInfo.bip44.coinType, Object.values(chains)) &&
      !wallet.addresses[chainInfo.key]
    ) {
      return `Please import ${ledgerApp} wallet`;
    }

    const walletLabel =
      wallet.walletType === WALLETTYPE.LEDGER
        ? ` · /0'/0/${wallet.addressIndex}`
        : wallet.walletType === WALLETTYPE.PRIVATE_KEY || wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
        ? ` · Imported`
        : '';

    return `${sliceAddress(walletAddress)}${walletLabel}`;
  }, [
    wallet.walletType,
    wallet.addresses,
    wallet.addressIndex,
    chainInfo.key,
    chainInfo.bip44.coinType,
    chainInfo.chainName,
    chains,
    walletAddress,
    ledgerApp,
  ]);

  // Button disabled if walletAddress is falsy
  const isDisabled = !walletAddress;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isDisabled && styles.disabledCard,
      ]}
      activeOpacity={isDisabled ? 1 : 0.7}
      disabled={isDisabled}
      onPress={() => {
        const name =
          wallet.name.length > 12
            ? `${wallet.name.slice(0, 12)}...`
            : wallet.name +
              ' - ' +
              capitalize(chainInfo.chainName === 'seiTestnet2' ? 'sei' : chainInfo.chainName);
        onClick({
          address: walletAddress,
          chainName: chainInfo.chainName,
          name,
        });
      }}
    >
      <Image
        source={{ uri: wallet.avatar ?? Images.Misc.getWalletIconAtIndex(wallet.colorIndex)}}
        style={styles.walletAvatar}
        resizeMode="cover"
      />
      <View style={styles.cardInfo}>
        <Text style={styles.walletName}>
          {wallet.name}
        </Text>
        <Text style={styles.walletAddress}>
          {addressText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

type MyEvmWalletAddressesProps = {
  chainInfo: ChainInfo;
  setSelectedAddress: (address: SelectedAddress) => void;
};

export const MyEvmWalletAddresses = ({
  chainInfo,
  setSelectedAddress,
}: MyEvmWalletAddressesProps) => {
  const wallets = Wallet.useWallets();
  const { activeWallet } = useActiveWallet();
  const walletList = Object.values(wallets || {});

  return (
    <View style={styles.list}>
      {walletList.map((wallet) => {
        if (activeWallet?.id === wallet.id) {
          return null;
        }

        return (
          <WalletCard
            key={wallet.id}
            chainInfo={chainInfo}
            wallet={wallet}
            onClick={({ address, name, chainName }) => {
              const img = wallet?.avatar
                ? wallet.avatar
                : Images.Misc.getWalletIconAtIndex(wallet.colorIndex);

              setSelectedAddress({
                address,
                chainName,
                name,
                avatarIcon: img,
                chainIcon: img,
                emoji: undefined,
                selectionType: 'saved',
              });
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    gap: 12,
    marginBottom: 0,
  },
  disabledCard: {
    opacity: 0.5,
  },
  walletAvatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'column',
    maxWidth: 170,
  },
  walletName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
    textAlign: 'left',
  },
  walletAddress: {
    fontSize: 13,
    color: '#888',
    textAlign: 'left',
  },
});

export default MyEvmWalletAddresses;
