import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Linking, TextInput as RNTextInput } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';

import { Button } from '../ui/button';
import { Checkbox } from '../ui/check-box';
import { Input } from '../ui/input';
import { PasswordInput } from '../ui/input/password-input';
import { PasswordLockIcon } from '../../../assets/icons/password-lock-icon';
import { OnboardingWrapper } from '../../screens/onboarding/wrapper';
import { CreatingWalletLoader } from '../../screens/onboarding/create/creating-wallet-loader';
import { PasswordStrengthIndicator } from './password-strength';
import { getPassScore } from '../../utils/passChecker';

type ViewProps = {
  readonly onProceed: (password: Uint8Array) => void;
  readonly entry?: 'left' | 'right';
};

export default function ChoosePasswordView({ onProceed, entry }: ViewProps) {
  const [isLoading, setLoading] = useState(false);
  const [passScore, setPassScore] = useState<number | null>(null);
  const [termsOfUseAgreedCheck, setTermsOfUseAgreedCheck] = useState(true);
  const [error, setError] = useState('');
  const [passwords, setPasswords] = useState({ pass1: '', pass2: '' });
  const [errors, setErrors] = useState<{ pass1: string; pass2: string }>({ pass1: '', pass2: '' });

  // For field navigation (next on keyboard)
  const pass1Ref = useRef<RNTextInput>(null);
  const pass2Ref = useRef<RNTextInput>(null);

  // Validate length
  const validateLength = useCallback(() => {
    if (passwords.pass1.length < 8) {
      setErrors((e) => ({ ...e, pass1: 'Password must be at least 8 characters' }));
      return false;
    }
    setErrors((e) => ({ ...e, pass1: '' }));
    return true;
  }, [passwords.pass1.length]);

  // Validate password match
  const validatePasswordMatch = useCallback(() => {
    if (passwords.pass1 !== passwords.pass2) {
      setErrors((e) => ({ ...e, pass2: 'Passwords do not match' }));
      return false;
    } else if (!validateLength()) {
      return false;
    }
    setErrors((e) => ({ ...e, pass2: '' }));
    return true;
  }, [passwords.pass1, passwords.pass2, validateLength]);

  // Password strength calculation
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (passwords.pass1) {
        setPassScore(getPassScore(passwords.pass1));
      } else {
        setPassScore(null);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [passwords.pass1]);

  // Handle input change (don't mutate state directly)
  const handleInputChange = (name: 'pass1' | 'pass2', value: string) => {
    setError('');
    setPasswords((p) => ({ ...p, [name]: value }));
    setErrors((e) => ({ ...e, [name]: '' }));
  };

  // Submit logic
  const handleSubmit = () => {
    setError('');
    if (!validatePasswordMatch()) return;
    try {
      setLoading(true);
      const textEncoder = new TextEncoder();
      onProceed(textEncoder.encode(passwords.pass1));
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation (next/done)
  const handlePass1Submit = () => pass2Ref.current?.focus();
  const handlePass2Submit = () => {
    if (validatePasswordMatch()) handleSubmit();
  };

  const isSubmitDisabled =
    !!errors.pass1 ||
    !!errors.pass2 ||
    !passwords.pass1 ||
    !passwords.pass2 ||
    passwords.pass1.length < 8 ||
    !termsOfUseAgreedCheck;

  if (isLoading) {
    return <CreatingWalletLoader />;
  }

  return (
    <View style={{ flex: 1 }}>
      <OnboardingWrapper
        headerIcon={<PasswordLockIcon size={24} />}
        entry={entry}
        heading="Create your password"
        subHeading="Choose a password to secure & lock your wallet"
        style={{ gap: 0 }}
      >
        <View style={styles.inputContainer}>
          <View style={styles.relativeCol}>
            <Input
              ref={pass1Ref}
              autoFocus
              placeholder="Enter password"
              secureTextEntry
              value={passwords.pass1}
              onChangeText={(text) => handleInputChange('pass1', text)}
              onBlur={validateLength}
              status={errors.pass1 ? 'error' : undefined}
              testID="input-password"
              style={styles.input}
              trailingElement={<PasswordStrengthIndicator score={passScore} />}
              returnKeyType="next"
              onSubmitEditing={handlePass1Submit}
            />
            <AnimatePresence>
              {errors.pass1 ? (
                <MotiView
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 22 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.errorWrapper}
                >
                  <Text style={styles.errorText}>{errors.pass1}</Text>
                </MotiView>
              ) : null}
            </AnimatePresence>
          </View>

          <View style={styles.relativeCol}>
            <PasswordInput
              ref={pass2Ref}
              placeholder="Confirm password"
              value={passwords.pass2}
              onChangeText={(text) => handleInputChange('pass2', text)}
              status={errors.pass2 ? 'error' : undefined}
              testID="input-confirm-password"
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handlePass2Submit}
            />
            <AnimatePresence>
              {(errors.pass2 || error) ? (
                <MotiView
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 22 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.errorWrapper}
                >
                  <Text style={styles.errorText} testID="password-error-ele">
                    {errors.pass2 || error}
                  </Text>
                </MotiView>
              ) : null}
            </AnimatePresence>
          </View>
        </View>

        {/* Terms Checkbox */}
        <View style={styles.checkboxRow}>
          <Checkbox
            checked={termsOfUseAgreedCheck}
            onChange={setTermsOfUseAgreedCheck}
            style={styles.checkbox}
          />
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL('https://leapwallet.io/terms')}
              accessibilityRole="link"
            >
              Terms & Conditions
            </Text>
          </Text>
        </View>

        <Button
          style={styles.submitBtn}
          disabled={isSubmitDisabled || isLoading}
          onPress={handleSubmit}
        >
          Set Password
        </Button>
      </OnboardingWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 40,
    marginBottom: 0,
  },
  relativeCol: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: 20, // Replaces gap
  },
  input: {
    height: 58, // h-[3.625rem] = 58px
  },
  errorWrapper: {
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  errorText: {
    color: '#E2655A', // destructive-100
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 10,
  },
  checkbox: {
    marginRight: 8,
    height: 16,
    width: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#97A3B9', // muted-foreground
    textAlign: 'center',
    flexShrink: 1,
  },
  link: {
    color: '#32DA6D', // accent-foreground
    textDecorationLine: 'underline',
  },
  submitBtn: {
    width: '100%',
    marginTop: 20,
  },
});
