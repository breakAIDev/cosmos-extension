import { BETA_NATIVE_TOKENS, useActiveChain, useBetaNativeTokensStore } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { useMemo } from 'react';
import { AggregatedSupportedChain } from '../../types/utility';

import { useFillBetaValuesFromStorage } from './useFillBetaValuesFromStorage';

export function useFillBetaNativeTokens(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(
    () => (forceChain || _activeChain) as AggregatedSupportedChain,
    [forceChain, _activeChain],
  );

  const { setBetaNativeTokens } = useBetaNativeTokensStore();

  useFillBetaValuesFromStorage(
    activeChain !== AGGREGATED_CHAIN_KEY ? activeChain : '',
    BETA_NATIVE_TOKENS,
    (value) => {
      if (activeChain && activeChain !== AGGREGATED_CHAIN_KEY) {
        setBetaNativeTokens(value);
      }
    },
    {},
  );
}
