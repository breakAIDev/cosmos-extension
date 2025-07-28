import { SMALL_BALANCES_HIDDEN } from '../services/config/storage-keys';
import { makeAutoObservable } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class HideSmallBalancesStore {
  isHidden = false;

  constructor() {
    makeAutoObservable(this);
    this.initHideSmallBalances();
  }

  initHideSmallBalances = async () => {
    try {
      const storageValue = await AsyncStorage.getItem(SMALL_BALANCES_HIDDEN);
      // Convert the string to boolean
      this.setHidden(storageValue === 'true');
    } catch (e) {
      // Fallback or handle error
      this.setHidden(false);
    }
  };

  setHidden = async (val: boolean) => {
    this.isHidden = val;
    try {
      await AsyncStorage.setItem(SMALL_BALANCES_HIDDEN, val ? 'true' : 'false');
    } catch (e) {
      // Optionally handle error
    }
  };
}

export const hideSmallBalancesStore = new HideSmallBalancesStore();
