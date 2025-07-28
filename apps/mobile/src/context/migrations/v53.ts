import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTO_LOCK_TIME } from '../../services/config/storage-keys';

export async function storageMigrationV53(storage: Record<string, any>) {
  if (storage[AUTO_LOCK_TIME] && storage[AUTO_LOCK_TIME] === -1) {
    await AsyncStorage.setItem(AUTO_LOCK_TIME, '1440');
  }
}
