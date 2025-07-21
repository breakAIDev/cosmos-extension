import React, { createContext, useState, ReactNode, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";

type WalletInfo = {
  address: string;
  mnemonic: string;
};

type WalletContextProps = {
  wallet: WalletInfo | null;
  createWallet: () => Promise<void>;
  importWallet: (mnemonic: string) => Promise<void>;
  logout: () => void;
};

const WalletContext = createContext<WalletContextProps>({} as WalletContextProps);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);

  const createWallet = async () => {
    const wallet = await DirectSecp256k1HdWallet.generate(24, { prefix: "cosmos" });
    const [account] = await wallet.getAccounts();
    const mnemonic = (await wallet.mnemonic);
    setWallet({ address: account.address, mnemonic });
    await AsyncStorage.setItem("WALLET_MNEMONIC", mnemonic);
  };

  const importWallet = async (mnemonic: string) => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "cosmos" });
    const [account] = await wallet.getAccounts();
    setWallet({ address: account.address, mnemonic });
    await AsyncStorage.setItem("WALLET_MNEMONIC", mnemonic);
  };

  const logout = async () => {
    setWallet(null);
    await AsyncStorage.removeItem("WALLET_MNEMONIC");
  };

  return (
    <WalletContext.Provider value={{ wallet, createWallet, importWallet, logout }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
