import { KeyChain } from '@leapwallet/leap-keychain';
import { ACTIVE_WALLET } from '../services/config/storage-keys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startAutoLockTimer, updateLastPopupPing } from './autolock-timer';
import { Buffer } from 'buffer';

/**
 * Event-driven PasswordManager for React Native.
 * Expects you to manually call unlock/lock from your app logic,
 * since there's no extension message passing.
 */
export class PasswordManager {
  private password: Uint8Array | undefined;

  static create(onAutoLock?: () => void) {
    const passwordManager = new PasswordManager();
    passwordManager.init(onAutoLock);
    return passwordManager;
  }

  private init(onAutoLock?: () => void) {
    // Start auto-lock timer with a callback
    startAutoLockTimer(this, onAutoLock);
    // No browser.runtime.onMessage listener in RN!
  }

  async lockWallet() {
    if (this.hasPassword()) {
      const storageValue = await AsyncStorage.getItem(ACTIVE_WALLET);
      const storage = storageValue ? JSON.parse(storageValue) : undefined;
      if (storage && this.password) {
        await KeyChain.encrypt(this.password);
      }
      this.password = undefined;
    }
  }

  clearPassword() {
    this.password = undefined;
  }

  getPassword() {
    return this.password;
  }

  hasPassword(): boolean {
    return !!this.password;
  }

  /** Manually call this when user unlocks the wallet */
  unlock(base64Password: string) {
    this.password = Buffer.from(base64Password, 'base64');
    updateLastPopupPing();
  }

  /** Manually call this when user enters password */
  setPassword(password: Uint8Array) {
    this.password = password;
    updateLastPopupPing();
  }
}
