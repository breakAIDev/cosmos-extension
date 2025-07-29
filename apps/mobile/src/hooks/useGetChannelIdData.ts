import { getChannelIdData } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useActiveChain } from './settings/useActiveChain';
import { useRpcUrl } from './settings/useRpcUrl';

export function useGetChannelIdData() {
  const lcdUrl = useRpcUrl().lcdUrl;
  const activeChain = useActiveChain();

  return useCallback(
    async (channelId: string): Promise<string | null> => {
      const cacheKey = `${channelId}-${activeChain}`;
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached !== null) {
          return cached;
        }

        const chainId = await getChannelIdData(lcdUrl as string, channelId);
        if (chainId) {
          await AsyncStorage.setItem(cacheKey, chainId);
        }

        return chainId;
      } catch (error) {
        console.error('Failed to get or store channelId data:', error);
        return null;
      }
    },
    [lcdUrl, activeChain],
  );
}
