// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Button, ScrollView, StyleSheet } from "react-native";
import { useWallet } from "../context/WalletContext";
import { getBalance } from "../services/cosmos";
import WalletCard from "../components/WalletCard";
import TokenList from "../components/TokenList";
import TransactionList from "../components/TransactionList";
import { colors } from "../theme/colors";
import { logEvent } from "../services/analytics";
import strings from "../localization/en.json";

const HomeScreen = ({ navigation }) => {
  const { wallet, logout, refreshWallet } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [tokens, setTokens] = useState([{ denom: "uatom", amount: "0" }]); // Example, replace with real tokens

  useEffect(() => {
    (async () => {
      if (wallet?.address) {
        setBalance(null);
        const b = await getBalance(wallet.address);
        setBalance(b);
        setTokens([{ denom: "uatom", amount: (parseFloat(b) * 1e6).toFixed(0) }]);
      }
    })();
    refreshWallet();
  }, [wallet]);

  if (!wallet) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <WalletCard address={wallet.address} balance={balance} />
      <TokenList tokens={tokens} />
      <View style={styles.buttonRow}>
        <Button title={strings.send} onPress={() => { logEvent("nav_send"); navigation.navigate("Send"); }} color={colors.primary} />
        <Button title={strings.receive} onPress={() => { logEvent("nav_receive"); navigation.navigate("Receive"); }} color={colors.primary} />
        <Button title={strings.settings} onPress={() => navigation.navigate("Settings")} color={colors.primary} />
      </View>
      <TransactionList address={wallet.address} />
      <Button title={strings.logout} onPress={() => { logEvent("logout"); logout(); }} color={colors.error} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20, paddingTop: 60, backgroundColor: colors.background },
  buttonRow: { flexDirection: "row", marginVertical: 10, justifyContent: "space-between", width: "100%" }
});
export default HomeScreen;
