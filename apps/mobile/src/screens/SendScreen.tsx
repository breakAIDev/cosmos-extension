import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import { useWallet } from "../context/WalletContext";
import { sendTokens } from "../utils/cosmos";

const SendScreen = ({ navigation }) => {
  const { wallet } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const hash = await sendTokens(wallet.mnemonic, to.trim(), amount.trim());
      setLoading(false);
      Alert.alert("Success", `Transaction sent!\nTxHash: ${hash}`);
      navigation.goBack();
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Error", "Failed to send tokens. " + (e.message || e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Tokens</Text>
      <TextInput
        placeholder="Recipient Address"
        value={to}
        onChangeText={setTo}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Amount (ATOM)"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        keyboardType="numeric"
      />
      <Button title="Send" onPress={handleSend} disabled={loading || !to || !amount} />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, marginBottom: 30, fontWeight: "bold" },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 20, padding: 10 }
});

export default SendScreen;
