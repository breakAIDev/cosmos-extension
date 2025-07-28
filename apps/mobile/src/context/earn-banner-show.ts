import AsyncStorage from '@react-native-async-storage/async-storage';
import { EARN_USDN_BANNER_SHOW } from '../services/config/storage-keys';
import { makeAutoObservable } from 'mobx';

export class EarnBannerShowStore {
  show = 'false';

  constructor() {
    makeAutoObservable(this);
    this.initEarnBannerShow();
  }

  private async initEarnBannerShow() {
    const val = await AsyncStorage.getItem(EARN_USDN_BANNER_SHOW);

    if (val !== 'false') {
      this.setShow('true');
    }
  }

  setShow(val: string) {
    this.show = val;
    AsyncStorage.setItem(EARN_USDN_BANNER_SHOW, val );
  }
}

export const earnBannerShowStore = new EarnBannerShowStore();
