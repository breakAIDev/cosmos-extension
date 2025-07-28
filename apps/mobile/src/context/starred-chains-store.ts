import AsyncStorage from '@react-native-async-storage/async-storage';
import { STARRED_CHAINS } from '../services/config/storage-keys';
import { makeAutoObservable } from 'mobx';

export class StarredChainsStore {
  chains: string[] = [];

  constructor() {
    makeAutoObservable(this);

    this.initStarredChains();
  }

  async initStarredChains() {
    try {
      const prevStarredChains = await AsyncStorage.getItem(STARRED_CHAINS);
      if (prevStarredChains) {
        this.chains = JSON.parse(prevStarredChains) ?? [];
        return;
      }
      this.chains = [];
    } catch (err) {
      this.chains = [];
    }
  }

  async addStarredChain(chain: string) {
    this.chains.push(chain);
    await AsyncStorage.setItem(STARRED_CHAINS, JSON.stringify(this.chains));
  }

  async removeStarredChain(chain: string) {
    this.chains = this.chains.filter((f) => f !== chain);
    await AsyncStorage.setItem(STARRED_CHAINS, JSON.stringify(this.chains));
  }
}

export const starredChainsStore = new StarredChainsStore();
