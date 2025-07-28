import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/auth-context';
import { useNavigation, StackActions } from '@react-navigation/native';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const navigation = useNavigation();

  // Loading: show splash or loader
  if (!auth || auth.locked === 'pending' || auth.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Locked: send to Auth/Login screen
  if (auth.locked === 'locked') {
    // Use navigation stack replace to send to Login
    navigation.dispatch(StackActions.replace('Login'));
    return null;
  }

  // Unlocked: render content
  return <>{children}</>;
};
