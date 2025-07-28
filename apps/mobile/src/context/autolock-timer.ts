import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_WALLET, AUTO_LOCK_TIME } from '../services/config/storage-keys';
import { PasswordManager } from './password-manager';

let lastPopupPing = Date.now();
const DEFAULT_AUTOLOCK_TIME = 1440;

// To be called when the user opens the app or triggers a "ping"
export function updateLastPopupPing() {
  lastPopupPing = Date.now();
}

async function checkAutoLock(passwordManager: PasswordManager, onAutoLock?: () => void) {
  const storageRaw = await AsyncStorage.multiGet([ACTIVE_WALLET, AUTO_LOCK_TIME]);
  const storage: Record<string, any> = {};
  storageRaw.forEach(([key, value]) => {
    storage[key] = value ? JSON.parse(value) : undefined;
  });

  if (!storage[ACTIVE_WALLET]) return;

  const autoLockTime = Number(storage[AUTO_LOCK_TIME] || DEFAULT_AUTOLOCK_TIME);
  if (autoLockTime < 1) {
    await AsyncStorage.setItem(AUTO_LOCK_TIME, JSON.stringify(DEFAULT_AUTOLOCK_TIME));
    return;
  }

  const startOfMinute = dayjs().startOf('minute');
  const lat = dayjs(lastPopupPing).add(autoLockTime, 'minutes');

  if (startOfMinute.isAfter(lat) && passwordManager.getPassword()) {
    await passwordManager.lockWallet();
    // In React Native, you might use a callback, context, or event to propagate the lock event
    if (typeof onAutoLock === 'function') {
      onAutoLock();
    }
  }
}

// This would be called once, e.g., in a root component or auth context
export function startAutoLockTimer(passwordManager: PasswordManager, onAutoLock?: () => void) {
  setInterval(() => {
    checkAutoLock(passwordManager, onAutoLock);
  }, 1000);
}
