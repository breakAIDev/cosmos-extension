import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, RequireAuth, RequireAuthOnboarding } from "./context/auth-context";

// --- Auth/Onboarding Screens ---
import LoginScreen from "./screens/auth/login";
import OnboardingScreen from "./screens/onboarding";
import OnboardingCreateWalletScreen from "./screens/onboarding/create";
import OnboardingImportWalletScreen from "./screens/onboarding/import";
import OnboardingSuccessScreen from "./screens/onboarding/success";
import ImportLedgerScreen from "./screens/importLedger";
import ForgotPasswordScreen from "./screens/forgot-password";

// --- Main Screens ---
import HomeScreen from "./screens/home/Home";
import NFTScreen from "./screens/nfts/NFTPage";
import ActivityScreen from "./screens/activity/Activity";
import SendScreen from "./screens/send";
import BuyScreen from "./screens/buy";
import EarnScreen from "./screens/earn";
// import SwapScreen from "./screens/swaps-v2";
import AirdropsScreen from "./screens/airdrops";
import AirdropsDetailsScreen from "./screens/airdrops/AirdropsDetails";
import StakeScreen from "./screens/stake-v2";
import StakeInputScreen from "./screens/stake-v2/StakeInputPage";
import StakePendingTxnScreen from "./screens/stake-v2/StakeTxnPage";
import ManageChainScreen from "./screens/manageChain";
import ManageTokensScreen from "./screens/manage-tokens";
import AddTokenScreen from "./screens/add-token/AddToken";
import PendingTxScreen from "./screens/activity/PendingTx";
import ProposalsScreen from "./screens/governance/Proposals";
import AlphaScreen from "./screens/alpha";
import EarnUSDNScreen from "./screens/earnUSDN";
import InitiaVipScreen from "./screens/initia-vip";
import SecretManageTokensScreen from "./screens/snip20-manage-tokens";

// --- Chain/Switch/Sign screens ---
// import SwitchChainScreen from "./screens/switch-chain";
// import SwitchEthereumChainScreen from "./screens/switch-ethereum-chain";
// import SwitchSolanaChainScreen from "./screens/switch-solana-chain";
// import SuggestEthereumChainScreen from "./screens/suggestChain/SuggestEthereumChain";
// import SuggestChainScreen from "./screens/suggestChain/suggestChain";
// import AddSecretTokenScreen from "./screens/suggest/SuggestSecret";
// import SuggestErc20Screen from "./screens/suggest/SuggestErc20";
import SignScreen from "./screens/sign/sign-transaction";
import SignAptosScreen from "./screens/sign-aptos/sign-transaction";
import SignBitcoinScreen from "./screens/sign-bitcoin/SignBitcoinTransaction";
import SignSeiEvmScreen from "./screens/sign-sei-evm/SignSeiEvmTransaction";
import SignSolanaScreen from "./screens/sign-solana/sign-transaction";
import SignSuiScreen from "./screens/sign-sui/sign-transaction";

import { AlphaContextProvider } from "./screens/alpha/context"; // If using context providers for some screens
import { chainTagsStore } from "./context/chain-infos-store";
import { rootBalanceStore, rootStakeStore, rootStore } from "./context/root-store";
import { claimRewardsStore, delegationsStore, unDelegationsStore, validatorsStore } from "./context/stake-store";
import { rootDenomsStore } from "./context/denoms-store-instance";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- Main Tab Navigator (Home/NFT/Activity) ---
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="NFTs" component={NFTScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
    </Tab.Navigator>
  );
}

// --- Auth Stack ---
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding">
        {() => (
          <RequireAuthOnboarding>
            <OnboardingScreen />
          </RequireAuthOnboarding>
        )}
      </Stack.Screen>
      <Stack.Screen name="OnboardingCreateWallet">
        {() => (
          <RequireAuthOnboarding>
            <OnboardingCreateWalletScreen />
          </RequireAuthOnboarding>
        )}
      </Stack.Screen>
      <Stack.Screen name="OnboardingImportWallet">
        {() => (
          <RequireAuthOnboarding>
            <OnboardingImportWalletScreen />
          </RequireAuthOnboarding>
        )}
      </Stack.Screen>
      <Stack.Screen name="OnboardingSuccess" component={OnboardingSuccessScreen} />
      <Stack.Screen name="ImportLedger">
        {() => (
          <RequireAuthOnboarding>
            <ImportLedgerScreen />
          </RequireAuthOnboarding>
        )}
      </Stack.Screen>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// --- Main App Stack (Protected by RequireAuth) ---
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main Tabbed Navigation */}
      <Stack.Screen name="MainTabs" component={MainTabs} />
      {/* App Routes (mirroring your web extension routes) */}
      <Stack.Screen name="Send">
        {() => (
          <RequireAuth>
            <SendScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="Buy">
        {() => (
          <RequireAuth>
            <BuyScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="Earn">
        {() => (
          <RequireAuth>
            <EarnScreen chainTagsStore={chainTagsStore} />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="EarnUSDN">
        {() => (
          <RequireAuth>
            <EarnUSDNScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
{/*}      <Stack.Screen name="Swap">
        {() => (
          <RequireAuth>
            <SwapScreen rootBalanceStore={rootBalanceStore} />
          </RequireAuth>
        )}
      </Stack.Screen>*/}
      <Stack.Screen name="Airdrops">
        {() => (
          <RequireAuth>
            <AirdropsScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="AirdropsDetails">
        {() => (
          <RequireAuth>
            <AirdropsDetailsScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="Stake">
        {() => (
          <RequireAuth>
            <StakeScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="StakeInput">
        {() => (
          <RequireAuth>
            <StakeInputScreen
              rootDenomsStore={rootDenomsStore}
              delegationsStore={delegationsStore}
              validatorsStore={validatorsStore}
              unDelegationsStore={unDelegationsStore}
              claimRewardsStore={claimRewardsStore}
              rootBalanceStore={rootBalanceStore}
              nmsStore={rootStore.nmsStore}
            />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="StakePendingTxn">
        {() => (
          <RequireAuth>
            <StakePendingTxnScreen  rootBalanceStore={rootBalanceStore} rootStakeStore={rootStakeStore} />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="ManageChain">
        {() => (
          <RequireAuth>
            <ManageChainScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="ManageTokens">
        {() => (
          <RequireAuth>
            <ManageTokensScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="AddToken">
        {() => (
          <RequireAuth>
            <AddTokenScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="PendingTx">
        {() => (
          <RequireAuth>
            <PendingTxScreen rootBalanceStore={rootBalanceStore} rootStakeStore={rootStakeStore} />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="Proposals">
        {() => (
          <RequireAuth>
            <ProposalsScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="Alpha">
        {() => (
          <RequireAuth>
            <AlphaContextProvider>
              <AlphaScreen />
            </AlphaContextProvider>
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="InitiaVip">
        {() => (
          <RequireAuth>
            <InitiaVipScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="SecretManageTokens">
        {() => (
          <RequireAuth>
            <SecretManageTokensScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      {/* Chain/Switch/Sign screens */}
{/*}      <Stack.Screen name="SwitchChain">
        {() => (
          <RequireAuth>
            <SwitchChainScreen />
          </RequireAuth>
        )}
      </Stack.Screen>*/}
      {/*<Stack.Screen name="SwitchEthereumChain">
        {() => (
          <RequireAuth>
            <SwitchEthereumChainScreen />
          </RequireAuth>
        )}
      </Stack.Screen>*/}
      {/*<Stack.Screen name="SwitchSolanaChain">
        {() => (
          <RequireAuth>
            <SwitchSolanaChainScreen />
          </RequireAuth>
        )}
      </Stack.Screen>*/}
      {/*<Stack.Screen name="SuggestEthereumChain">
        {() => (
          <RequireAuth>
            <SuggestEthereumChainScreen />
          </RequireAuth>
        )}
      </Stack.Screen>*/}
      {/*<Stack.Screen name="SuggestChain">
        {() => (
          <RequireAuth>
            <SuggestChainScreen />
          </RequireAuth>
        )}
      </Stack.Screen>*/}
      {/*<Stack.Screen name="AddSecretToken">
        {() => (
          <RequireAuth>
            <AddSecretTokenScreen />
          </RequireAuth>
        )}
      </Stack.Screen>*/}
      {/*<Stack.Screen name="SuggestErc20">
        {() => (
          <RequireAuth>
            <SuggestErc20Screen />
          </RequireAuth>
        )}
      </Stack.Screen>*/}
      <Stack.Screen name="Sign">
        {() => (
          <RequireAuth>
            <SignScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="SignAptos">
        {() => (
          <RequireAuth>
            <SignAptosScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="SignBitcoin">
        {() => (
          <RequireAuth>
            <SignBitcoinScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="SignSeiEvm">
        {() => (
          <RequireAuth>
            <SignSeiEvmScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="SignSolana">
        {() => (
          <RequireAuth>
            <SignSolanaScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
      <Stack.Screen name="SignSui">
        {() => (
          <RequireAuth>
            <SignSuiScreen />
          </RequireAuth>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// --- Main AppNavigator with AuthProvider ---
function NavigatorWithAuth() {
  // You can use your auth context here for more control
  // For example, show AuthStack if locked/no account, otherwise MainStack

  // Optionally, import/use your useAuth() here for logic
  // const auth = useAuth();

  // If you want onboarding to show only if not authenticated, you can split logic here
  // For now, let's keep both stacks and use navigation guards inside
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Auth stack comes first, main stack is guarded */}
      <Stack.Screen name="AuthStack" component={AuthStack} />
      {/*<Stack.Screen name="MainStack" component={MainStack} />*/}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <NavigatorWithAuth />
      </NavigationContainer>
    </AuthProvider>
  );
}
