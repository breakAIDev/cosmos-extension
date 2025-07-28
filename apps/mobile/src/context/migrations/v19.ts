import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storageMigrationV19() {
  await AsyncStorage.setItem('encrypted', 'null');
  await AsyncStorage.setItem('timestamp', 'null');
  await AsyncStorage.setItem('connections', JSON.stringify({}));
}
