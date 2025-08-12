import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, AuthContextType } from '../../context/auth-context';
import { MotiView, AnimatePresence } from 'moti';
import { Button, Variant } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { HappyFrog } from '../../../assets/icons/frog'; // Use Image or SVG
import { autoLockTimeStore } from '../../context/password-store';

import { ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET } from '../../services/config/storage-keys';
import { useNavigation } from '@react-navigation/native';

type ExitAnimationState = 'scale' | 'scale-fade' | null;

function LoginView(props: {
  exitAnimationState: ExitAnimationState;
  errorHighlighted: boolean;
  passwordInput: string;
  onChange: (text: string) => void;
  onSignIn: () => void;
  onForgotPassword: () => void;
  loading: boolean;
  unlockLoader: boolean;
}) {
  if (props.loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leap Wallet</Text>
      <View style={styles.centerContainer}>
        <HappyFrog style={styles.frogIcon} />
        <Text style={styles.title}>Enter your password</Text>
        <View style={styles.inputContainer}>
          <Input
            autoFocus
            style={[styles.input, props.errorHighlighted && styles.inputError]}
            secureTextEntry
            placeholder="Password"
            value={props.passwordInput}
            onChangeText={props.onChange}
            onSubmitEditing={props.onSignIn}
            returnKeyType="go"
          />
          <AnimatePresence>
            {props.errorHighlighted && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 36 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'timing', duration: 200 }}
                style={styles.errorWrapper}
              >
                <Text style={styles.errorText}>Incorrect password. Please try again</Text>
              </MotiView>
            )}
          </AnimatePresence>
        </View>
        <Button
          variant={"text" as Variant}
          style={styles.forgotButton}
          onPress={props.onForgotPassword}
        >
          Forgot Password?
        </Button>
      </View>
      <View style={styles.footer}>
        <Button
          size="md"
          style={styles.button}
          onPress={props.onSignIn}
          disabled={props.unlockLoader}
        >
          {props.unlockLoader ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Unlock wallet</Text>
          )}
        </Button>
      </View>
    </View>
  );
}

function Login() {
  const [passwordInput, setPasswordInput] = useState('');
  const [exitAnimationState, setExitAnimationState] = useState<ExitAnimationState>(null);
  const hasAccounts = useRef(false);
  const isNavigating = useRef(false);
  const navigation = useNavigation();

  const auth = useAuth();
  const [isError, setError] = useState<boolean>(false);
  const [showUnlockLoader, setShowUnlockLoader] = useState(false);

  // Navigation function
  const successNavigate = useCallback((to: string, animate = false) => {
    if (!to || isNavigating.current) return;

    isNavigating.current = true;

    if (!animate) {
      // "Replace" the stack so user can't go back to login (optional)
      navigation.reset({
        index: 0,
        routes: [{ name: to, params: { from: 'Login' } }], // You can add params here if you want
      });
      isNavigating.current = false;
      return;
    }

    setExitAnimationState('scale');
    setTimeout(() => {
      setExitAnimationState('scale-fade');
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: to, params: { from: 'Login' } }],
        });
        isNavigating.current = false;
      }, 100);
    }, 850);
  }, [navigation]);

  // On mount, check accounts using AsyncStorage
  useEffect(() => {
    (async () => {
      const active = await AsyncStorage.getItem(ACTIVE_WALLET);
      const encrypted = await AsyncStorage.getItem(ENCRYPTED_ACTIVE_WALLET);
      if (active || encrypted) {
        hasAccounts.current = true;
        return;
      }
      // No account: Navigate to onboarding
      successNavigate('Onboarding');
    })();
  }, [successNavigate]);

  // Sign in logic
  const signIn = useCallback(async () => {
    if (!passwordInput) return;
    setShowUnlockLoader(true);
    try {
      const textEncoder = new TextEncoder();
      await (auth as AuthContextType).signin(textEncoder.encode(passwordInput), () => {
        autoLockTimeStore.setLastActiveTime();
        successNavigate('Home', true);
        setShowUnlockLoader(false);
      });
    } catch (e) {
      setError(true);
      setShowUnlockLoader(false);
    }
  }, [auth, passwordInput, successNavigate]);

  const forgetPasswordHandler = useCallback(() => {
    successNavigate('ForgotPassword');
  }, [successNavigate]);

  // Auto-login if already unlocked
  useEffect(() => {
    if (auth?.locked === 'unlocked' && !passwordInput) {
      successNavigate('Home');
    }
  }, [auth, passwordInput, successNavigate]);

  return (
    <LoginView
      unlockLoader={showUnlockLoader}
      loading={auth.loading}
      errorHighlighted={isError}
      exitAnimationState={exitAnimationState}
      passwordInput={passwordInput}
      onChange={(value) => {
        setError(false);
        setPasswordInput(value);
      }}
      onSignIn={signIn}
      onForgotPassword={forgetPasswordHandler}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'flex-start' },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    paddingVertical: 18,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 16 },
  inputContainer: { width: '100%' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d6d6d6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError: { borderColor: '#ff5252' },
  errorWrapper: { width: '100%', overflow: 'hidden' },
  errorText: { color: '#ff5252', textAlign: 'center', fontSize: 14, height: 36, paddingTop: 4 },
  forgotButton: { marginTop: 8, alignSelf: 'center' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    padding: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#319D66',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  frogIcon: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginBottom: 8,
  },
});

export default Login;
