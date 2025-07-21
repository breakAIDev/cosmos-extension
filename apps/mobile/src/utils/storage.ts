import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveMnemonic = async (mnemonic: string) => {
  await AsyncStorage.setItem("WALLET_MNEMONIC", mnemonic);
};

export const loadMnemonic = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("WALLET_MNEMONIC");
};

export const clearWallet = async () => {
  await AsyncStorage.removeItem("WALLET_MNEMONIC");
};
