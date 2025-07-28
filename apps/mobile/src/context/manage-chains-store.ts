import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { PopularChainsStore } from '@leapwallet/cosmos-wallet-store';
import { DeprioritizedChains } from '../services/config/constants';
import { MANAGE_CHAIN_SETTINGS } from '../services/config/storage-keys';
import { makeAutoObservable } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { popularChainsStore } from './popular-chains-store';

export type ManageChainSettings = {
  chainName: SupportedChain;
  active: boolean;
  preferenceOrder: number;
  denom: string;
  id: number;
  beta: boolean | undefined;
  chainId: string;
  testnetChainId?: string;
  evmChainId?: string;
  evmChainIdTestnet?: string;
  formattedName?: string;
  evmOnlyChain?: boolean;
};

export class ManageChainsStore {
  chains: ManageChainSettings[] = [];

  constructor(private popularChainsStore: PopularChainsStore) {
    makeAutoObservable(this);
  }

  private async setChainData(chains: ManageChainSettings[]) {
    this.chains = chains;
    await AsyncStorage.setItem(MANAGE_CHAIN_SETTINGS, JSON.stringify(chains));
  }

  async initManageChains(chainInfos: typeof ChainInfos) {
    const dataRaw = await AsyncStorage.getItem(MANAGE_CHAIN_SETTINGS);
    await this.popularChainsStore.readyPromise;
    const priorityChains = this.popularChainsStore.popularChains;

    const addedChains: ManageChainSettings[] = dataRaw ? JSON.parse(dataRaw) : [];
    let missingChains: string[] = [];
    if (addedChains && addedChains.length > 0) {
      const enabledChains = Object.keys(chainInfos).filter((chain) => chainInfos[chain as SupportedChain].enabled);
      missingChains = enabledChains.filter(
        (chain) => !addedChains.find((addedChain: ManageChainSettings) => addedChain.chainName === chain),
      );
    }

    if (!addedChains || missingChains.length > 0) {
      const _chains = (Object.keys(chainInfos) as Array<SupportedChain>).filter(
        (chain) => !priorityChains.includes(chain) && !DeprioritizedChains.includes(chain),
      );
      const chains = [...priorityChains, ..._chains, ...DeprioritizedChains];

      const manageChainObject = chains
        .filter((chain) => chainInfos[chain]?.enabled)
        .map((chain, index) => ({
          chainName: chain,
          active: true,
          preferenceOrder: index,
          denom: chainInfos[chain].denom,
          id: index,
          beta: chainInfos[chain]?.beta ?? false,
          chainId: chainInfos[chain].chainId,
          testnetChainId: chainInfos[chain].testnetChainId,
          evmChainId: chainInfos[chain].evmChainId,
          evmChainIdTestnet: chainInfos[chain].evmChainIdTestnet,
          formattedName: chainInfos[chain].chainName,
        }));

      await this.setChainData(manageChainObject);
    } else {
      const enabledChains = addedChains
        .filter((chainObject: ManageChainSettings) => chainInfos[chainObject.chainName]?.enabled)
        .map((item: ManageChainSettings) => ({
          ...item,
          beta: chainInfos[item.chainName].beta ?? false,
        }));

      await this.setChainData(enabledChains);
    }
  }

  async toggleChain(chainName: SupportedChain) {
    const newChainData = this.chains.map((chainObject) => {
      if (chainObject.chainName === chainName) {
        return {
          ...chainObject,
          active: !chainObject.active,
        };
      }
      return chainObject;
    });

    const sortedChainData = newChainData.sort((a, b) => a.preferenceOrder - b.preferenceOrder);
    await this.setChainData(sortedChainData);
  }

  async updatePreferenceOrder(chainData: ManageChainSettings[]) {
    const newChainData = chainData.map((chainObject, index) => ({
      ...chainObject,
      preferenceOrder: index,
    }));
    await this.setChainData(newChainData);
  }
}

export const manageChainsStore = new ManageChainsStore(popularChainsStore);
