import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERCENT_CHANGE_24HR_HIDDEN } from '../services/config/storage-keys';
import { makeAutoObservable } from 'mobx';

export class HidePercentChangeStore {
  isHidden = false;

  constructor() {
    makeAutoObservable(this);

    this.initHidePercentChange();
  }

  private async initHidePercentChange() {
    try{
      const val = await AsyncStorage.getItem(PERCENT_CHANGE_24HR_HIDDEN);
      this.setHidden(val === 'true');
    } catch (e) {
      
    }
  }

  setHidden = async (val: boolean) => {
    this.isHidden = val;
    try {
      await AsyncStorage.setItem(PERCENT_CHANGE_24HR_HIDDEN, val ? 'true' : 'false');
    } catch (e) {
      
    }
  }
}

export const hidePercentChangeStore = new HidePercentChangeStore();
