import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CONNECTIONS } from '../../services/config/storage-keys';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Add origin to the allowed sites for each walletId/chainId
 */
export const addToConnections = async (chainIds: string[], walletIds: string[], origin: string) => {
  let stored = await AsyncStorage.getItem(CONNECTIONS);
  let connections = stored ? JSON.parse(stored) : {};

  chainIds.forEach((chainId: string) => {
    walletIds.forEach((walletId: string) => {
      const sites = connections?.[walletId]?.[chainId] || [];
      if (!sites.includes(origin)) {
        sites.push(origin);
      }
      connections[walletId] = {
        ...connections?.[walletId],
        [chainId]: [...sites],
      };
    });
  });

  await AsyncStorage.setItem(CONNECTIONS, JSON.stringify(connections));
};

/**
 * Get the base chain name from the chainId
 */
export const getChainName = (chainId: string) => {
  return chainId?.split('-')?.slice(0, -1)?.join('-');
};
