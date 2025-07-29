import { BETA_CW20_TOKENS, useActiveChain, useBetaCW20TokensStore } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { useMemo } from 'react';
import { AggregatedSupportedChain } from '../../types/utility';

import { useFillBetaValuesFromStorage } from './useFillBetaValuesFromStorage';

export function useFillBetaCW20Tokens(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(
    () => (forceChain || _activeChain) as AggregatedSupportedChain,
    [forceChain, _activeChain],
  );

  const { setBetaCW20Tokens } = useBetaCW20TokensStore();

  useFillBetaValuesFromStorage(
    activeChain !== AGGREGATED_CHAIN_KEY ? activeChain : '',
    BETA_CW20_TOKENS,
    (value) => {
      if (activeChain && activeChain !== AGGREGATED_CHAIN_KEY) {
        setBetaCW20Tokens(value, activeChain);
      }
    },
    {},
  );
  
}
