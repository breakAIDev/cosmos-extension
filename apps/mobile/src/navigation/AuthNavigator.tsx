import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import CreateWalletScreen from "../screens/onboarding/CreateWalletScreen";
import ImportWalletScreen from "../screens/onboarding/ImportWalletScreen";
import SecureWalletScreen from "../screens/onboarding/SecureWalletScreen";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
      <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
      <Stack.Screen name="SecureWallet" component={SecureWalletScreen} />
    </Stack.Navigator>
  );
}
