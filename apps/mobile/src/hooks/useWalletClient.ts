import { fromBase64 } from '@cosmjs/encoding';
import { useActiveChain, useChainsStore, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { SignAminoMethod, SignDirectMethod, Signer } from '@leapwallet/elements-core';
import { WalletClient } from '@leapwallet/elements-hooks';
import { decodeChainIdToChain } from '../context/utils';
import useActiveWallet from './settings/useActiveWallet';
import { Wallet } from './wallet/useWallet';
import { useCallback, useMemo } from 'react';

export const useWalletClient = (forceChain?: SupportedChain) => {
  const { activeWallet } = useActiveWallet();
  const getWallet = Wallet.useGetWallet();
  const { chains } = useChainsStore();

  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
  const isLedgerTypeWallet = activeWallet?.walletType === WALLETTYPE.LEDGER;

  const signDirect: SignDirectMethod = useCallback(
    async (signerAddress: string, signDoc: any) => {
      const wallet = await getWallet((chains[activeChain]?.key ?? '') as SupportedChain);
      if ('signDirect' in wallet) {
        const result = await wallet.signDirect(signerAddress, signDoc);
        return {
          signature: Uint8Array.from(Buffer.from(result.signature.signature, 'base64')), // Can use fromBase64 too
          signed: result.signed,
        };
      }
      throw new Error('signDirect not supported');
    },
    [activeChain, chains, getWallet],
  );

  const signAmino: SignAminoMethod = useCallback(
    async (address: string, signDoc: any) => {
      const wallet = await getWallet((chains[activeChain]?.key ?? '') as SupportedChain);
      if ('signAmino' in wallet) {
        const result = await wallet.signAmino(address, signDoc);
        return {
          signature: Uint8Array.from(Buffer.from(result.signature.signature, 'base64')), // Consistency
          signed: result.signed,
        };
      }
      throw new Error('signAmino not supported');
    },
    [activeChain, chains, getWallet],
  );

  const signer: Signer = useMemo(() => ({ signDirect, signAmino }), [signDirect, signAmino]);

  const walletClient: WalletClient = useMemo(() => ({
    enable: async () => {
      // Optional: Add permission or unlock logic here if needed for RN
    },
    getAccount: async (chainId: string) => {
      if (!activeWallet) throw new Error('No active wallet');
      const chainIdToChain = await decodeChainIdToChain();
      const chainKey = chainIdToChain[chainId] ?? activeChain;

      const address = activeWallet.addresses[chainKey as SupportedChain];
      const pubKey = activeWallet.pubKeys?.[chainKey as SupportedChain];
      if (!address || !pubKey) throw new Error('No address or pubKey');

      return {
        bech32Address: address,
        pubKey: fromBase64(pubKey),
        isNanoLedger: isLedgerTypeWallet,
      };
    },
    getSigner: async () => signer,
  }), [activeChain, activeWallet, isLedgerTypeWallet, signer]);

  return { walletClient };
};
