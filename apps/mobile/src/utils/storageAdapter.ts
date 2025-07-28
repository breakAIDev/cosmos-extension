import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStorageAdapter = () => {
  return {
    get: async (key: string) => {
      const value = await AsyncStorage.getItem(key);
      if (value != null) return JSON.parse(value);
      return null;
    },
    set: async <T = string>(key: string, value: T) => {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    },
    remove: async (key: string) => {
      await AsyncStorage.removeItem(key);
    },
  };
};
