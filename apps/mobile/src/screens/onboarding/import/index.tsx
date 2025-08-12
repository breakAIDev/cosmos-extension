import React from 'react'
import { observer } from 'mobx-react-lite'
import { AnimatePresence, MotiView } from 'moti'

import ChoosePasswordView from '../../../components/choose-password-view'
import { CreatingWalletLoader } from '../create/creating-wallet-loader'
import { ImportWalletProvider, useImportWalletContext } from './import-wallet-context'
import { ImportWalletLayout } from './layout'
import { ImportLedger } from './steps/import-ledger'
import { ImportingLedgerAccounts } from './steps/importing-ledger-accounts'
import { PrivateKey } from './steps/private-key'
import { SeedPhrase } from './steps/seed-phrase'
import { SelectImportType } from './steps/select-import-type'
import { SelectLedgerNetwork } from './steps/select-ledger-network'
import { SelectLedgerWallet } from './steps/select-ledger-wallet'
import { SelectWallet } from './steps/select-wallet'
import { ImportWatchWallet } from './steps/watch-wallet'

const OnboardingImportWalletView = () => {
  const { currentStepName, onOnboardingCompleted, prevStep, currentStep } = useImportWalletContext();

  return (
    <AnimatePresence>
      {currentStepName === 'loading' && (
        <MotiView
          key="creating-wallet-loader"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <CreatingWalletLoader />
        </MotiView>
      )}

      {currentStepName === 'select-import-type' && (
        <MotiView
          key="select-import-type"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
        >
          <SelectImportType />
        </MotiView>
      )}

      {currentStepName === 'seed-phrase' && (
        <MotiView
          key="seed-phrase-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
        >
          <SeedPhrase />
        </MotiView>
      )}

      {currentStepName === 'private-key' && (
        <MotiView
          key="private-key-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
        >
          <PrivateKey />
        </MotiView>
      )}

      {currentStepName === 'import-ledger' && (
        <MotiView
          key="import-ledger-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
        >
          <ImportLedger />
        </MotiView>
      )}

      {currentStepName === 'select-ledger-network' && (
        <MotiView
          key="select-ledger-network-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
        >
          <SelectLedgerNetwork />
        </MotiView>
      )}

      {currentStepName === 'import-watch-wallet' && (
        <MotiView
          key="import-watch-wallet-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
        >
          <ImportWatchWallet />
        </MotiView>
      )}

      {currentStepName === 'select-wallet' && (
        <MotiView
          key="select-wallet-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
        >
          <SelectWallet />
        </MotiView>
      )}

      {currentStepName === 'importing-ledger-accounts' && (
        <MotiView
          key="importing-ledger-accounts-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
        >
          <ImportingLedgerAccounts />
        </MotiView>
      )}

      {currentStepName === 'select-ledger-wallet' && (
        <MotiView
          key="select-ledger-wallet-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
        >
          <SelectLedgerWallet />
        </MotiView>
      )}

      {currentStepName === 'choose-password' && (
        <MotiView
          key="choose-password-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
        >
          <ChoosePasswordView
            onProceed={onOnboardingCompleted}
            entry={prevStep <= currentStep ? 'right' : 'left'}
          />
        </MotiView>
      )}
    </AnimatePresence>
  );
};

const OnboardingImportWallet = () => (
  <ImportWalletProvider>
    <ImportWalletLayout>
      <OnboardingImportWalletView />
    </ImportWalletLayout>
  </ImportWalletProvider>
);

export default observer(OnboardingImportWallet);
