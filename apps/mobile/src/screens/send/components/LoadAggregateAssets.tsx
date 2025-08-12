import { useAggregatedSpendableTokens } from '@leapwallet/cosmos-wallet-hooks';
import React, { useEffect } from 'react';

import { LoadChainAssetsProps } from './LoadChainAssets';

// Using React.memo as in web React—this is fully compatible with React Native!
export const LoadAggregateAssets = React.memo(function ({
  setAllAssets,
  setIsAllAssetsLoading,
}: LoadChainAssetsProps) {
  const { spendableAllAssets, spendableIsLoading } = useAggregatedSpendableTokens();

  useEffect(() => {
    setAllAssets(spendableAllAssets);
    setIsAllAssetsLoading(spendableIsLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spendableAllAssets, spendableIsLoading]);

  return null;
});

LoadAggregateAssets.displayName = 'LoadAggregateAssets';
