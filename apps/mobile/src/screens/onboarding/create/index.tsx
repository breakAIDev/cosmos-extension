import React from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet } from 'react-native'
import { AnimatePresence, MotiView } from 'moti'

import ChoosePasswordView from '../../../components/choose-password-view'
import { passwordStore } from '../../../context/password-store'

import { CreateWalletProvider, useCreateWalletContext } from './create-wallet-context'
import { CreatingWalletLoader } from './creating-wallet-loader'
import { CreateWalletLayout } from './layout'
import { ConfirmSecretPhrase } from './steps/confirm-secret-phrase'
import { SeedPhrase } from './steps/seed-phrase'

const OnboardingCreateWalletView = observer(function OnboardingCreateWallet() {
  const { onOnboardingCompleted, currentStep, loading, prevStep } = useCreateWalletContext()

  return (
    <AnimatePresence>
      {loading && (
        <MotiView
          key="creating-wallet-loader"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={styles.absoluteFill}
        >
          <CreatingWalletLoader />
        </MotiView>
      )}

      {currentStep === 1 && !loading && (
        <MotiView
          key="seed-phrase-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
          style={styles.absoluteFill}
        >
          <SeedPhrase />
        </MotiView>
      )}

      {currentStep === 2 && !loading && (
        <MotiView
          key="confirm-secret-phrase-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
          style={styles.absoluteFill}
        >
          <ConfirmSecretPhrase />
        </MotiView>
      )}

      {currentStep === 3 && !loading && !passwordStore.password && (
        <MotiView
          key="choose-password-view"
          from={{ opacity: 0, translateX: 32 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -32 }}
          style={styles.absoluteFill}
        >
          <ChoosePasswordView
            entry={prevStep <= currentStep ? 'right' : 'left'}
            onProceed={onOnboardingCompleted}
          />
        </MotiView>
      )}
    </AnimatePresence>
  )
})

const OnboardingCreateWallet = observer(() => (
  <CreateWalletProvider>
    <CreateWalletLayout>
      <OnboardingCreateWalletView />
    </CreateWalletLayout>
  </CreateWalletProvider>
))

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default OnboardingCreateWallet
