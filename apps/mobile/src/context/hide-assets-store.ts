import { HIDE_ASSETS } from '../services/config/storage-keys';
import { makeAutoObservable } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class HideAssetsStore {
  isHidden = false;

  constructor() {
    makeAutoObservable(this);
    this.initHideAssets();
  }

  initHideAssets = async () => {
    try {
      const storageValue = await AsyncStorage.getItem(HIDE_ASSETS);
      this.setHidden(storageValue === 'true');
    } catch (e) {
      // handle error if needed
      this.setHidden(false);
    }
  };

  setHidden = async (val: boolean) => {
    this.isHidden = val;
    try {
      await AsyncStorage.setItem(HIDE_ASSETS, val ? 'true' : 'false');
    } catch (e) {
      // handle error if needed
    }
  };

  formatHideBalance(s: string) {
    return this.isHidden ? '••••••••' : s;
  }
}

export const hideAssetsStore = new HideAssetsStore();
