import { ChainInfos, initiateNodeUrls, NODE_URLS, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { BETA_CHAINS, CUSTOM_ENDPOINTS } from '../services/config/storage-keys';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSelectedNetwork } from './settings/useNetwork';

export function useInitNodeUrls() {
  const [nodeUrlsInitialised, setNodeUrlInitialised] = useState(false);
  const selectedNetwork = useSelectedNetwork();

  useEffect(() => {
    async function updateNodeUrls() {
      const rawBetaChains = await AsyncStorage.getItem(BETA_CHAINS);
      const rawCustomEndpoints = await AsyncStorage.getItem(CUSTOM_ENDPOINTS);

      const betaChains = JSON.parse(rawBetaChains ?? '{}');
      const customEndpoints = JSON.parse(rawCustomEndpoints ?? '{}');

      // Remove betaChains that already exist in ChainInfos
      for (const chainName in betaChains) {
        const chainMatch = Object.values(ChainInfos).some((chainInfo) =>
          [chainInfo.chainId, chainInfo.testnetChainId].includes(betaChains[chainName].chainId),
        );
        if (chainMatch) delete betaChains[chainName];
      }

      const chains = {
        ...betaChains,
        ...ChainInfos,
      };

      if (NODE_URLS) {
        for (const chain in customEndpoints) {
          const { rpc, lcd, rpcTest, lcdTest } = customEndpoints[chain];
          const chainId =
            selectedNetwork === 'testnet'
              ? chains[chain as SupportedChain]?.testnetChainId
              : chains[chain as SupportedChain]?.chainId;

          if (chainId) {
            if (lcd && NODE_URLS.rest) {
              NODE_URLS.rest[chainId] = [
                { nodeUrl: selectedNetwork === 'testnet' ? lcdTest : lcd, nodeProvider: null },
              ];
            }

            if (rpc && NODE_URLS.rpc) {
              NODE_URLS.rpc[chainId] = [
                { nodeUrl: selectedNetwork === 'testnet' ? rpcTest : rpc, nodeProvider: null },
              ];
            }
          }
        }
      }
    }

    (async () => {
      try {
        await initiateNodeUrls();
        await updateNodeUrls();
      } finally {
        setNodeUrlInitialised(true);
      }
    })();

    // You can simulate reactive behavior using an event emitter or polling
  }, [selectedNetwork]);

  return nodeUrlsInitialised;
}
