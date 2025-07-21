import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { WalletProvider } from "./src/context/WalletContext";
import WelcomeScreen from "./src/screens/Onboarding/WelcomeScreen";
import CreateWalletScreen from "./src/screens/Onboarding/CreateWalletScreen";
import ImportWalletScreen from "./src/screens/Onboarding/ImportWalletScreen";
import HomeScreen from "./src/screens/HomeScreen";
import WalletScreen from "./src/screens/WalletScreen";
import SendScreen from "./src/screens/SendScreen";
import ReceiveScreen from "./src/screens/ReceiveScreen";

const Stack = createStackNavigator();

const App = () => (
  <WalletProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
        <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Send" component={SendScreen} />
        <Stack.Screen name="Receive" component={ReceiveScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </WalletProvider>
);

export default App;
