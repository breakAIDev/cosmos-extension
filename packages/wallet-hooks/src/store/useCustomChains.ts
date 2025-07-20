import create from 'zustand';

import { CustomChainsType, formatNewChainInfo, FormattedChainInfo } from '../utils/formatNewChainInfo';

type CustomChainsState = {
  customChains: FormattedChainInfo[];
  setCustomChains: (customChains: CustomChainsType[]) => void;
};

export const useCustomChainsStore = create<CustomChainsState>((set) => ({
  customChains: [],
  setCustomChains: (data) =>
    set(() => {
      // Temporary fix for xrpl chain. TODO: Remove this once we have a proper logic for chain deduplication.
      return { customChains: data.map((d) => formatNewChainInfo(d)).filter((d) => d.key !== 'xrpl') };
    }),
}));

export const useCustomChains = () => {
  const { customChains } = useCustomChainsStore();
  return customChains ?? [];
};
