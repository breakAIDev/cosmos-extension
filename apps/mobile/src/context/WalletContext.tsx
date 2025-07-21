import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { WalletInfo } from "../types/wallet";
import { COSMOS_PREFIX } from "../utils/constants";

type WalletContextType = {
  wallet: WalletInfo | null;
  createWallet: () => Promise<void>;
  importWallet: (mnemonic: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);

  useEffect(() => { refreshWallet(); }, []);

  const refreshWallet = async () => {
    const mnemonic = await AsyncStorage.getItem("WALLET_MNEMONIC");
    if (mnemonic) {
      const walletObj = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: COSMOS_PREFIX });
      const [account] = await walletObj.getAccounts();
      setWallet({ address: account.address, mnemonic });
    }
  };

  const createWallet = async () => {
    const walletObj = await DirectSecp256k1HdWallet.generate(24, { prefix: COSMOS_PREFIX });
    const [account] = await walletObj.getAccounts();
    const mnemonic = walletObj.mnemonic;
    setWallet({ address: account.address, mnemonic });
    await AsyncStorage.setItem("WALLET_MNEMONIC", mnemonic);
  };

  const importWallet = async (mnemonic: string) => {
    const walletObj = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: COSMOS_PREFIX });
    const [account] = await walletObj.getAccounts();
    setWallet({ address: account.address, mnemonic });
    await AsyncStorage.setItem("WALLET_MNEMONIC", mnemonic);
  };

  const logout = async () => {
    setWallet(null);
    await AsyncStorage.removeItem("WALLET_MNEMONIC");
  };

  return (
    <WalletContext.Provider value={{ wallet, createWallet, importWallet, logout, refreshWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
