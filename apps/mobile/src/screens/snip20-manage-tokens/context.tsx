import React, { createContext, useContext, useMemo } from 'react';
import { useSecretSnip20, useSecretSnip20Returns } from '@leapwallet/cosmos-wallet-hooks';
import { useSecretWallet } from '../../hooks/wallet/useScrtWallet';

const Snip20ManageTokensContext = createContext<useSecretSnip20Returns | undefined>(undefined);

export function Snip20ManageTokensProvider({ children }: { children: React.ReactNode }) {
  const getWallet = useSecretWallet();
  const snip20 = useSecretSnip20({ getWallet });

  const value = useMemo(() => ({ ...snip20 }), [snip20]);

  return (
    <Snip20ManageTokensContext.Provider value={value}>
      {children}
    </Snip20ManageTokensContext.Provider>
  );
}

export function useSnip20ManageTokens() {
  const context = useContext(Snip20ManageTokensContext);
  if (context === undefined) {
    throw new Error('useSnip20ManageTokens must be used within Snip20ManageTokensProvider');
  }
  return context;
}
