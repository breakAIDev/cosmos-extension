import {
  AddressWarning,
  INITIAL_ADDRESS_WARNING,
  Token,
  useActiveWallet,
  useAddress,
  useChainsStore,
  useSeiLinkedAddressState,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  AccountDetails,
  BTC_CHAINS,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  isValidAddress,
  isValidBtcAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import * as sol from 'micro-sol-signer';
import { ReactElement, useCallback, useEffect } from 'react';

// Utility: Hex checking for Sui
function isHex(value: string): boolean {
  return /^(0x|0X)?[a-fA-F0-9]+$/.test(value) && value.length % 2 === 0;
}
function getHexByteLength(value: string): number {
  return /^(0x|0X)/.test(value) ? (value.length - 2) / 2 : value.length / 2;
}
export function isValidSuiAddress(value: string): value is string {
  return isHex(value) && getHexByteLength(value) === 32;
}

// Main hook
export type UseCheckAddressErrorParams = {
  setAssociatedSeiAddress: React.Dispatch<React.SetStateAction<string>>;
  setAssociated0xAddress: React.Dispatch<React.SetStateAction<string>>;
  setAddressError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setAddressWarning: React.Dispatch<React.SetStateAction<AddressWarning>>;
  setFetchAccountDetailsData: React.Dispatch<React.SetStateAction<AccountDetails | undefined>>;
  fetchAccountDetails: (address: string) => Promise<void>;
  selectedToken: Token | null;
  recipientInputValue: string;
  allCW20Denoms: Record<string, any>;
  allERC20Denoms: Record<string, any>;
  addressWarningElementError: ReactElement;
  showNameServiceResults: boolean;
  sendActiveChain: SupportedChain;
  sendSelectedNetwork: 'mainnet' | 'testnet';
  setHasToUsePointerLogic: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useCheckAddressError({
  setAssociated0xAddress,
  setAssociatedSeiAddress,
  setAddressError,
  setAddressWarning,
  selectedToken,
  recipientInputValue,
  showNameServiceResults,
  sendActiveChain,
  sendSelectedNetwork,
}: UseCheckAddressErrorParams) {
  const { chains } = useChainsStore();
  const currentWalletAddress = useAddress();
  const activeWallet = useActiveWallet();
  const isBtcTx = BTC_CHAINS.includes(sendActiveChain);
  const isAptosTx = isAptosChain(sendActiveChain);
  const isSolanaTx = isSolanaChain(sendActiveChain);
  const isSuiTx = isSuiChain(sendActiveChain);
  const { addressLinkState } = useSeiLinkedAddressState();

  // Bitcoin address error check
  const checkBitcoinAddressError = useCallback(() => {
    const network = sendActiveChain === 'bitcoin' ? 'mainnet' : 'testnet';
    const isValid = isValidBtcAddress(recipientInputValue, network);
    if (!isValid) {
      setAddressError('The entered address is invalid');
    } else {
      setAddressError(undefined);
    }
  }, [recipientInputValue, sendActiveChain, setAddressError]);

  useEffect(() => {
    (async function () {
      setAssociatedSeiAddress('');
      setAssociated0xAddress('');
      if (isAptosTx) return;

      // Sui
      if (isSuiTx) {
        if (!isValidSuiAddress(recipientInputValue)) {
          setAddressError('The entered address is invalid');
        } else {
          setAddressError(undefined);
        }
        return;
      }
      // Solana
      if (isSolanaTx) {
        if (!recipientInputValue) {
          setAddressError(undefined);
          return;
        }
        const regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
        if (!regex.test(recipientInputValue)) {
          setAddressError('The entered address is invalid');
          return;
        }
        try {
          if (!sol.isOnCurve(recipientInputValue)) {
            setAddressError('The entered address is invalid');
          } else {
            setAddressError(undefined);
          }
        } catch (e) {
          setAddressError('The entered address is invalid');
        }
        return;
      }
      // Bitcoin
      if (isBtcTx && recipientInputValue.length) {
        checkBitcoinAddressError();
        return;
      }
      if (currentWalletAddress === recipientInputValue) {
        return;
      } else if (
        chains[sendActiveChain]?.evmOnlyChain &&
        recipientInputValue.length
      ) {
        if (!recipientInputValue.toLowerCase().startsWith('0x')) {
          setAddressError('The entered address is invalid');
        }
      } else if (
        recipientInputValue &&
        !isValidAddress(recipientInputValue) &&
        !showNameServiceResults
      ) {
        setAddressError('The entered address is invalid');
      } else {
        setAddressWarning(INITIAL_ADDRESS_WARNING);
        setAddressError(undefined);
      }
    })();
  }, [addressLinkState, currentWalletAddress, recipientInputValue, selectedToken, selectedToken?.coinMinimalDenom, selectedToken?.isEvm, showNameServiceResults, activeWallet?.walletType, sendActiveChain, sendSelectedNetwork, isAptosTx, isBtcTx, isSolanaTx, isSuiTx, chains, setAssociatedSeiAddress, setAssociated0xAddress, setAddressError, checkBitcoinAddressError, setAddressWarning]);
}
