import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Key } from '@leapwallet/leap-keychain';
import { decode, encode } from 'bech32';

function convertBech32Address(address: string, prefix: string) {
  const { words } = decode(address);
  return encode(prefix, words);
}

// migrate composable finance address prefix from centauri to pica
export function migratePicassoAddress(
  keystore: Record<string, Key<SupportedChain>>,
  activeWallet: Key<SupportedChain>,
) {
  const keystoreEntries = Object.entries(keystore);
  const newKeyStore = keystoreEntries.reduce((kstore: Record<string, Key<SupportedChain>>, [walletId, key]) => {
    if (!key?.addresses?.cosmos) {
      return kstore;
    }
    const newKey = {
      ...key,
      addresses: {
        ...key.addresses,
        [ChainInfos.composable.key]: convertBech32Address(key.addresses.cosmos, ChainInfos.composable.addressPrefix),
      },
    };
    kstore[walletId] = newKey;
    return kstore;
  }, {});

  const newActiveWallet = activeWallet?.addresses?.cosmos
    ? {
        ...activeWallet,
        addresses: {
          ...activeWallet.addresses,
          [ChainInfos.composable.key]: convertBech32Address(
            activeWallet.addresses.cosmos,
            ChainInfos.composable.addressPrefix,
          ),
        },
      }
    : activeWallet;

  return { newKeyStore, newActiveWallet };
}
