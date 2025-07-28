import { PasswordStore } from '@leapwallet/cosmos-wallet-store';
import { makeAutoObservable } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const passwordStore = new PasswordStore();

const DEFAULT_AUTO_LOCK_TIME = 1440;

export const TimerLockPeriod = {
  '15 min': 15,
  '60 min': 60,
  '24 hrs': 1440,
  'Never auto-lock': 14400,
} as const;

export type TimerLockPeriodKey = keyof typeof TimerLockPeriod;

export const TimerLockPeriodRev = {
  15: '15 min',
  60: '60 min',
  1440: '24 hrs',
  14400: 'Never auto-lock',
} as const;

export type TimerLockPeriodRevKey = keyof typeof TimerLockPeriodRev;

export class AutoLockTimeStore {
  time: number = DEFAULT_AUTO_LOCK_TIME;

  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  async init() {
    const value = await AsyncStorage.getItem('AUTO_LOCK_TIME');
    if (value != null) {
      this.time = JSON.parse(value);
    }
  }

  setLockTime(time: TimerLockPeriodKey) {
    const newTime = TimerLockPeriod[time];
    this.time = newTime;
    AsyncStorage.setItem('AUTO_LOCK_TIME', JSON.stringify(newTime));
  }

  setLastActiveTime = () => {
    const timestamp = Date.now();
    return AsyncStorage.setItem('lastActiveTime', JSON.stringify(timestamp));
  };
}

export const autoLockTimeStore = new AutoLockTimeStore();
