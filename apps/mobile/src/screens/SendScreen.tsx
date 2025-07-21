// src/screens/SendScreen.tsx
import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import { useWallet } from "../context/WalletContext";
import { sendTokens } from "../services/cosmos";
import { isValidCosmosAddress, isValidAmount } from "../utils/validation";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import strings from "../localization/en.json";
import { logEvent } from "../services/analytics";

const SendScreen = ({ navigation }) => {
  const { wallet } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!wallet) return;
    if (!isValidCosmosAddress(to)) {
      Alert.alert(strings.error, "Invalid recipient address.");
      return;
    }
    if (!isValidAmount(amount)) {
      Alert.alert(strings.error, "Invalid amount.");
      return;
    }
    setLoading(true);
    try {
      const hash = await sendTokens(wallet.mnemonic, to.trim(), amount.trim());
      setLoading(false);
      logEvent("send_tokens", { to, amount, hash });
      Alert.alert(strings.success, `${strings.transaction_sent}\nTxHash: ${hash}`);
      navigation.goBack();
    } catch (e) {
      setLoading(false);
      logEvent("send_tokens_error", { to, amount, error: e.message || e });
      Alert.alert(strings.error, "Failed to send tokens. " + (e.message || e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{strings.send}</Text>
      <TextInput
        placeholder={strings.address}
        value={to}
        onChangeText={setTo}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder={strings.balance}
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        keyboardType="numeric"
      />
      <Button title={strings.send} onPress={handleSend} disabled={loading || !to || !amount} color={colors.primary} />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} color={colors.primary} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: colors.background },
  title: { ...typography.heading, marginBottom: 30, color: colors.text },
  input: { width: "100%", borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 20, padding: 10, color: colors.text }
});
export default SendScreen;
