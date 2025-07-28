import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storageMigrationV77(storage: Record<string, any>) {
  if (storage['encrypted'] && storage['timestamp']) {
    await AsyncStorage.removeItem('encrypted');
    await AsyncStorage.removeItem('timestamp');
  }
}
