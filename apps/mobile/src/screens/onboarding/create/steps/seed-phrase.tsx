import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { Button } from '../../../../components/ui/button'
import { CopyButton } from '../../../../components/ui/button/copy-button'
import { KeySlimIcon } from '../../../../../assets/icons/key-slim-icon';
import Clipboard from '@react-native-clipboard/clipboard';

import { OnboardingWrapper } from '../../wrapper'
import { useCreateWalletContext } from '../create-wallet-context'

// You can style this more or use a real Canvas/SVG box if you have it for RN
const CanvasTextBox = ({ text }: {text: string}) => (
  <View style={styles.canvasBox}>
    <Text style={styles.mnemonic}>{text}</Text>
  </View>
)

export const SeedPhrase = () => {
  const { prevStep, currentStep, mnemonic, moveToNextStep } = useCreateWalletContext()

  const handleCopy = () => {
    Clipboard.setString(mnemonic)
    Alert.alert('Copied!', 'Seed phrase copied to clipboard')
  }

  return (
    <OnboardingWrapper
      headerIcon={<KeySlimIcon size={24} />}
      entry={prevStep <= currentStep ? 'right' : 'left'}
      heading="Your secret recovery phrase"
      subHeading={
        <Text>
          Write down these words, your secret recovery phrase {'\n'}
          is the <Text style={styles.warning}>only way to recover</Text> your wallet and funds!
        </Text>
      }
    >
      <View style={styles.centered}>
        <CanvasTextBox text={mnemonic} />
        <CopyButton onPress={handleCopy} style={styles.copyButton}>
          Copy to Clipboard
        </CopyButton>
      </View>

      <Button
        disabled={mnemonic.length === 0}
        style={styles.fullWidth}
        onPress={moveToNextStep}
      >
        I have saved my recovery phrase
      </Button>
    </OnboardingWrapper>
  )
}

const styles = StyleSheet.create({
  centered: {
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  canvasBox: {
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    minWidth: 250,
    marginVertical: 8,
  },
  mnemonic: {
    fontSize: 18,
    color: '#334155',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1,
  },
  copyButton: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'center',
    marginTop: 'auto',
  },
  warning: {
    color: '#f59e42', // Use your theme warning color
    fontWeight: 'bold',
  },
})
