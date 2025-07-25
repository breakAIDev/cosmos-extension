import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useWallet } from "../context/WalletContext";
import AuthNavigator from "./AuthNavigator";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import CreateWalletScreen from "../screens/onboarding/CreateWalletScreen";
import ImportWalletScreen from "../screens/onboarding/ImportWalletScreen";
import SecureWalletScreen from "../screens/onboarding/SecureWalletScreen";
import HomeScreen from "../screens/HomeScreen";
import WalletScreen from "../screens/WalletScreen";
import SendScreen from "../screens/SendScreen";
import ReceiveScreen from "../screens/ReceiveScreen";
import SettingsScreen from "../screens/SettingScreen";
import TransactionDetailScreen from "../screens/TransactionDetailScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { wallet } = useWallet();
  if (!wallet) {
    // Show onboarding flow if wallet not set
    return <AuthNavigator />;
  }

  // Authenticated wallet flow
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
      <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
      <Stack.Screen name="SecureWallet" component={SecureWalletScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Send" component={SendScreen} />
      <Stack.Screen name="Receive" component={ReceiveScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
    </Stack.Navigator>
  );
}
