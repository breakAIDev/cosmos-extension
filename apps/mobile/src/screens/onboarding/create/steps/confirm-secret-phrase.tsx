import React, { useMemo, useState } from 'react'
import { View, Text, TextInput, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { AnimatePresence, MotiText } from 'moti'
import { Button } from '../../../../components/ui/button'
import { getWordFromMnemonic } from '../../../../utils/getWordFromMnemonic'
import { OnboardingWrapper } from '../../wrapper'
import { useCreateWalletContext } from '../create-wallet-context'
import { KeySlimIcon } from '../../../../../assets/icons/key-slim-icon'

type StatusType = 'error' | 'success' | '';

type Status = {
  four: StatusType;
  eight: StatusType;
  tweleve: StatusType;
};

type WordInputProps = React.Ref<TextInput> & {
  readonly value?: string;
  readonly onChangeText?: (value: string) => void;
  readonly onBlur?: () => void;
  readonly name?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly prefixNumber?: number;
  readonly status?: StatusType;
};

const outlineColor = {
  error: '#EF4444',   // destructive
  success: '#13c47b', // accent-success
  default: '#475569', // foreground
}

export function WordInput({
  value,
  onChangeText,
  onBlur,
  name,
  prefixNumber,
  style,
  status = '',
  ...rest
}: WordInputProps) {
  return (
    <View
      style={[
        styles.inputBox,
        { borderColor: outlineColor[status] || outlineColor.default },
        style,
      ]}
    >
      <Text style={styles.prefix}>{prefixNumber}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        autoComplete={"off"}
        autoCorrect={false}
        autoCapitalize="none"
        placeholder=""
        {...rest}
      />
    </View>
  )
}

type MissingWords = {
  four: string;
  eight: string;
  tweleve: string;
};

const positions = [
  { name: 'four', prefix: 4, top: 56, left: 28 },
  { name: 'eight', prefix: 8, top: 91, left: 144 },
  { name: 'tweleve', prefix: 12, top: 127, left: 259 },
]

export function ConfirmSecretPhraseView({ mnemonic, onProceed }: { mnemonic: string; onProceed: () => void }) {
  const [status, setStatus] = useState<Status>({ four: '', eight: '', tweleve: '' })
  const [missingWords, setMissingWords] = useState<MissingWords>({ four: '', eight: '', tweleve: '' })

  const hasError = status.four === 'error' || status.eight === 'error' || status.tweleve === 'error'

  // Mask words
  const words = useMemo(() => {
    const _words = mnemonic.trim().split(' ')
    _words[3] = ''
    _words[7] = ''
    _words[11] = ''
    return _words
  }, [mnemonic])

  function handleInputChange(name: string, value: string) {
    setStatus(s => ({ ...s, [name]: '' }))
    setMissingWords(s => ({ ...s, [name]: value }))
  }

  const validateInput = (index: number, numberWord: keyof typeof missingWords) => {
    const word = getWordFromMnemonic(mnemonic, index)
    const missingWord = missingWords[numberWord].trim()
    setStatus(s => ({
      ...s,
      [numberWord]: missingWord && word !== missingWord ? 'error' : missingWord ? 'success' : '',
    }))
  }

  function handleConfirmClick() {
    if (getWordFromMnemonic(mnemonic, 4) !== missingWords.four.trim()) {
      setStatus(s => ({ ...s, four: 'error' }))
      return
    }
    if (getWordFromMnemonic(mnemonic, 8) !== missingWords.eight.trim()) {
      setStatus(s => ({ ...s, eight: 'error' }))
      return
    }
    if (getWordFromMnemonic(mnemonic, 12) !== missingWords.tweleve.trim()) {
      setStatus(s => ({ ...s, tweleve: 'error' }))
      return
    }
    onProceed()
  }

  return (
    <View style={{ flex: 1, gap: 16 }}>
      <View style={viewStyles.phraseBox}>
        {/* You could use CanvasBox RN alternative here, or display as Text */}
        <Text style={viewStyles.phraseText}>
          {words.map((w, i) => (w ? w : '______')).join(' ')}
        </Text>
        {/* Inputs overlay */}
        {positions.map(pos => (
          <WordInput
            key={pos.name}
            name={pos.name}
            prefixNumber={pos.prefix}
            value={missingWords[pos.name as keyof typeof missingWords]}
            onChangeText={(val) => handleInputChange(pos.name, val)}
            onBlur={() => validateInput(pos.prefix, pos.name as keyof typeof missingWords)}
            status={status[pos.name as keyof typeof missingWords]}
            style={[viewStyles.input, { top: pos.top, left: pos.left }]}
          />
        ))}
      </View>
      <AnimatePresence>
        {hasError && (
          <MotiText
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 12 }}
            style={viewStyles.error}
          >
            Seed phrase does not match. Please try again.
          </MotiText>
        )}
      </AnimatePresence>
      <Button
        style={viewStyles.button}
        onPress={handleConfirmClick}
        disabled={hasError || Object.values(missingWords).some(v => !v)}
      >
        Confirm and continue
      </Button>
    </View>
  )
}

export const ConfirmSecretPhrase = () => {
  const { prevStep, currentStep, mnemonic, moveToNextStep } = useCreateWalletContext()
  return (
    <View style={{ flex: 1 }}>
      <OnboardingWrapper
        headerIcon={<KeySlimIcon size={24} />}
        entry={prevStep <= currentStep ? 'right' : 'left'}
        heading="Verify your recovery phrase"
        subHeading={
          <>
            Select the 4th, 6th and 8th words of your recovery {'\n'}
            phrase in that same order.
          </>
        }
      >
        <ConfirmSecretPhraseView mnemonic={mnemonic} onProceed={moveToNextStep} />
      </OnboardingWrapper>
    </View>
  )
}

const viewStyles = StyleSheet.create({
  phraseBox: {
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    minHeight: 184,
    width: 376,
    padding: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  phraseText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    letterSpacing: 0.4,
    marginBottom: 24,
  },
  input: {
    position: 'absolute',
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    width: '100%',
    alignSelf: 'center',
  },
})

const styles = StyleSheet.create({
  inputBox: {
    width: 100,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 8,
    gap: 8,
    marginVertical: 2,
  },
  prefix: {
    color: '#94A3B8',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    height: '100%',
    color: '#475569',
    fontSize: 16,
    padding: 0,
  },
})
