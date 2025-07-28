import AsyncStorage from '@react-native-async-storage/async-storage';
import { EARN_USDN_FEATURE_SHOW } from '../services/config/storage-keys';
import { makeAutoObservable } from 'mobx';

export class EarnFeatureShowStore {
  show = 'false';

  constructor() {
    makeAutoObservable(this);
    this.initEarnFeatureShow();
  }

  private async initEarnFeatureShow() {
    const val = await AsyncStorage.getItem(EARN_USDN_FEATURE_SHOW);

    if (val !== 'false') {
      this.setShow('true');
    }
  }

  setShow(val: string) {
    this.show = val;
    AsyncStorage.setItem(EARN_USDN_FEATURE_SHOW, val);
  }
}

export const earnFeatureShowStore = new EarnFeatureShowStore();
