import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { LedgerDriveIcon } from '../../../../../assets/icons/ledger-icon';
import { LEDGER_NETWORK, useImportWalletContext } from '../import-wallet-context';
import { HoldState } from './hold-state';
import { ledgerNetworkOptions } from './select-ledger-network';

export const ImportingLedgerAccounts = () => {
  const [currentAppToImport, setCurrentAppToImport] = useState<LEDGER_NETWORK>();
  const [alreadyImported, setAlreadyImported] = useState<Set<LEDGER_NETWORK>>(new Set());

  const { moveToNextStep, ledgerNetworks, setCurrentStep, currentStep, prevStep } = useImportWalletContext();

  useEffect(() => {
    const firstAppToImport = ledgerNetworkOptions.find((network) => ledgerNetworks.has(network.id));
    if (firstAppToImport) {
      setAlreadyImported((prev) => new Set(prev).add(firstAppToImport.id));
      setCurrentAppToImport(firstAppToImport.id);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveToNextApp = useCallback(
    (appType: LEDGER_NETWORK) => {
      const nextAppToImport = ledgerNetworkOptions.find(
        (network) =>
          network.id !== appType &&
          !alreadyImported.has(network.id) &&
          ledgerNetworks.has(network.id)
      );
      if (nextAppToImport) {
        setAlreadyImported((prev) => new Set(prev).add(nextAppToImport.id));
        setCurrentAppToImport(nextAppToImport.id);
      } else {
        setCurrentAppToImport(undefined);
        moveToNextStep();
      }
    },
    [alreadyImported, ledgerNetworks, moveToNextStep]
  );

  if (ledgerNetworks.size > 0 && currentAppToImport) {
    return (
      <AnimatePresence>
        <MotiView
          from={{ opacity: 0, translateX: prevStep <= currentStep ? 48 : -48 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: prevStep <= currentStep ? -48 : 48 }}
          style={styles.wrapper}
        >
          <HoldState
            key={`hold-state-${currentAppToImport}`}
            title={`Open ${currentAppToImport === LEDGER_NETWORK.ETH ? 'Ethereum' : 'Cosmos'} app on your ledger`}
            Icon={LedgerDriveIcon}
            appType={currentAppToImport}
            moveToNextApp={moveToNextApp}
          />
        </MotiView>
      </AnimatePresence>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    gap: 28, // gap-7
  },
});
