import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/node/constants';
import { useChainInfos } from '../useChainInfos';
import { useMemo } from 'react';
import {LEAP_WALLET_BACKEND_API_URL} from '@env';

import { useActiveChain } from './useActiveChain';
import { useSelectedNetwork } from './useNetwork';

export function useRpcUrl(forceChain?: SupportedChain) {
  const chainInfos = useChainInfos();
  const selectedNetwork = useSelectedNetwork();
  const activeChain = useActiveChain();
  const chain = forceChain ?? activeChain;

  return useMemo(() => {
    if (!chain) return { rpcUrl: '', lcdUrl: '' };
    if (selectedNetwork === 'mainnet' && chain === 'cosmos') {
      return {
        rpcUrl: `${LEAP_WALLET_BACKEND_API_URL}/figment/cosmos-hub/rpc`,
        lcdUrl: `${LEAP_WALLET_BACKEND_API_URL}/figment/cosmos-hub/lcd`,
      };
    }

    return {
      rpcUrl:
        selectedNetwork === 'testnet' && chainInfos[chain].apis.rpcTest
          ? chainInfos[chain].apis.rpcTest
          : chainInfos[chain].apis.rpc,
      lcdUrl:
        selectedNetwork === 'testnet' && chainInfos[chain].apis.restTest
          ? chainInfos[chain].apis.restTest
          : chainInfos[chain].apis.rest,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, selectedNetwork]);
}
