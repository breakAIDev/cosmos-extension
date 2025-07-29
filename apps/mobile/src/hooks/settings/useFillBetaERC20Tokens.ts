import { BETA_ERC20_TOKENS, useActiveChain, useBetaERC20TokensStore } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { useMemo } from 'react';
import { AggregatedSupportedChain } from '../../types/utility';

import { useFillBetaValuesFromStorage } from './useFillBetaValuesFromStorage';

export function useFillBetaERC20Tokens(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(
    () => (forceChain || _activeChain) as AggregatedSupportedChain,
    [forceChain, _activeChain],
  );

  const { setBetaERC20Tokens } = useBetaERC20TokensStore();

  useFillBetaValuesFromStorage(
    activeChain !== AGGREGATED_CHAIN_KEY ? activeChain : '',
    BETA_ERC20_TOKENS,
    (value) => {
      if (activeChain && activeChain !== AGGREGATED_CHAIN_KEY) {
        setBetaERC20Tokens(value, activeChain);
      }
    },
    {},
  );
}
