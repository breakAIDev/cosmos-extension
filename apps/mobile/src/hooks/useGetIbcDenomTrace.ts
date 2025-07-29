import { useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { IQueryDenomTraceResponse, TransferQueryClient } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useActiveChain } from './settings/useActiveChain';
import { useRpcUrl } from './settings/useRpcUrl';

export function useGetIbcDenomTrace() {
  const rpcUrl = useRpcUrl().rpcUrl;
  const activeChain = useActiveChain();
  const chainInfos = useGetChains();

  return useCallback(
    async (hash: string): Promise<IQueryDenomTraceResponse['denomTrace'] | null> => {
      const storageKey = `${hash}-${activeChain}`;

      try {
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached !== null) {
          return JSON.parse(cached) as IQueryDenomTraceResponse['denomTrace'];
        }

        const denomTrace = await TransferQueryClient.getDenomTrace(hash, `${rpcUrl}/`, chainInfos);
        const traceData = denomTrace.denomTrace;

        if (traceData) {
          await AsyncStorage.setItem(storageKey, JSON.stringify(traceData));
        }

        return traceData;
      } catch (err) {
        console.error('Error in useGetIbcDenomTrace:', err);
        return null;
      }
    },
    [activeChain, rpcUrl, chainInfos],
  );
}
