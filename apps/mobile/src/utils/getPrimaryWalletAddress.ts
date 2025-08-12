
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_WALLET_ADDRESS } from '../services/config/storage-keys';

export async function getPrimaryWalletAddress(): Promise<string | undefined> {
  const storage = await AsyncStorage.getItem(PRIMARY_WALLET_ADDRESS);
  return storage as string;
}
