import ChoosePasswordView from 'components/choose-password-view';
import { AnimatePresence } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { PrivateKeyView, SeedPhraseView } from '../components';
import { CreatingWalletLoader } from '../create/creating-wallet-loader';
import { ImportWalletProvider, useImportWalletContext } from './import-wallet-context';
import ImportLedgerView from './ImportLedgerView';
import { ImportWalletLayout } from './layout';
import { LedgerFlow } from './ledger-flow/LedgerFlow';
import SelectImportType from './select-import-type';
import SelectLedgerWalletView from './SelectLedgerWalletView';
import { SelectWalletView } from './SelectWalletView';

const OnboardingImportWalletView = observer(() => {
  const {
    currentStep,
    setSelectedIds,
    onOnboardingCompleted,
    moveToNextStep,
    secret,
    setSecret,
    importWalletFromSeedPhrase,
    privateKeyError,
    setPrivateKeyError,
    selectedIds,
    getLedgerAccountDetailsForIdxs,
    walletAccounts,
    prevStep,
    currentStepName,
    customWalletAccounts,
    getCustomLedgerAccountDetails,
  } = useImportWalletContext();

  return (
    <AnimatePresence mode='wait' presenceAffectsLayout>
      {currentStepName === 'loading' && <CreatingWalletLoader key='creating-wallet-loader' />}

      {currentStepName === 'select-import-type' && <SelectImportType key={'select-import-type'} />}

      {currentStepName === 'seed-phrase' && (
        <SeedPhraseView
          key={'seed-phrase-view'}
          secret={secret}
          setSecret={setSecret}
          onProceed={importWalletFromSeedPhrase}
          privateKeyError={privateKeyError}
          setPrivateKeyError={setPrivateKeyError}
        />
      )}

      {currentStepName === 'private-key' && (
        <PrivateKeyView
          key={'private-key-view'}
          secret={secret}
          setSecret={setSecret}
          onProceed={importWalletFromSeedPhrase}
          privateKeyError={privateKeyError}
          setPrivateKeyError={setPrivateKeyError}
        />
      )}

      {currentStepName === 'select-wallet' && (
        <SelectWalletView
          key={'select-wallet-view'}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          accountsData={walletAccounts ?? []}
          onProceed={moveToNextStep}
        />
      )}
      {/*currentStepName === 'select-ledger-app' && (
        <SelectLedgerAppView
          setSelectedApp={setSelectedApp}
          onNext={() => moveToNextStep()}
        />
      )*/}

      {/*currentStepName === 'import-ledger' && (
        <ImportLedgerView
          key={'import-ledger-view'}
          retry={() => importLedger(getLedgerAccountDetailsForIdxs)}
          onNext={() => importLedger(getLedgerAccountDetailsForIdxs)}
          onSkip={moveToNextStep}
          status={ledgerConnectionStatus}
        />
      )*/}
      {['select-ledger-app'].includes(currentStepName) && <LedgerFlow />}

      {currentStepName === 'select-ledger-wallet' && (
        <SelectLedgerWalletView
          key={'select-ledger-wallet-view'}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          accountsData={walletAccounts ?? []}
          customAccountsData={customWalletAccounts}
          onProceed={moveToNextStep}
          getCustomLedgerAccountDetails={getCustomLedgerAccountDetails}
          getLedgerAccountDetailsForIdxs={getLedgerAccountDetailsForIdxs}
        />
      )}

      {currentStepName === 'choose-password' && (
        <ChoosePasswordView
          key={'choose-password-view'}
          onProceed={onOnboardingCompleted}
          entry={prevStep <= currentStep ? 'right' : 'left'}
        />
      )}
    </AnimatePresence>
  );
});

const OnboardingImportWallet = () => (
  <ImportWalletProvider>
    <ImportWalletLayout>
      <OnboardingImportWalletView />
    </ImportWalletLayout>
  </ImportWalletProvider>
);

export default OnboardingImportWallet;
