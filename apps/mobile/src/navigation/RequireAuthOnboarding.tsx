import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/auth-context';
import { useNavigation, StackActions } from '@react-navigation/native';
import { Wallet } from '../hooks/wallet/useWallet'; // Should be your real wallet loader

export const RequireAuthOnboarding: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const navigation = useNavigation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkWallets = async () => {
      // Replace with your real wallet count check
      const allWallets = await Wallet.getAllWallets?.(); // Implement for mobile
      const hasWallets = allWallets && Object.keys(allWallets).length > 0;
      if (!auth.loading && auth.locked === 'locked' && hasWallets) {
        navigation.dispatch(StackActions.replace('Home'));
      } else if (!hasWallets) {
        navigation.dispatch(StackActions.replace('Onboarding'));
      }
      setChecked(true);
    };
    checkWallets();
  }, [auth, navigation]);

  // Prevent flashing content while checking
  if (!checked) return null;
  return <>{children}</>;
};
