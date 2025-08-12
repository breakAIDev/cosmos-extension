import { Token, useGetTokenSpendableBalances } from '@leapwallet/cosmos-wallet-hooks';
import React, { useEffect } from 'react';

// The prop types remain the same
export type LoadChainAssetsProps = {
  setAllAssets: React.Dispatch<React.SetStateAction<Token[]>>;
  setIsAllAssetsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

// Functional component using hooks, works identically in React Native
export function LoadChainAssets({ setAllAssets, setIsAllAssetsLoading }: LoadChainAssetsProps) {
  const { allAssets, nativeTokensStatus, s3IbcTokensStatus } = useGetTokenSpendableBalances();

  useEffect(() => {
    setAllAssets(allAssets);
    setIsAllAssetsLoading(
      [nativeTokensStatus, s3IbcTokensStatus].some((status) => status === 'loading')
    );
    // No need for eslint-disable in RN, but you can keep it if you want
  }, [allAssets, nativeTokensStatus, s3IbcTokensStatus, setAllAssets, setIsAllAssetsLoading]);

  // Return null as it is a logic-only component
  return null;
}
