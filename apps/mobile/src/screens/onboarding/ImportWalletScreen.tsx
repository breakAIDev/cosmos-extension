import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert } from "react-native";
import { useWallet } from "../../context/WalletContext";

const ImportWalletScreen = ({ navigation }) => {
  const [mnemonic, setMnemonic] = useState("");
  const { importWallet } = useWallet();

  const handleImport = async () => {
    try {
      await importWallet(mnemonic.trim());
      navigation.replace("Home");
    } catch (e) {
      Alert.alert("Invalid Mnemonic", "Please check your mnemonic phrase.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Wallet</Text>
      <TextInput
        placeholder="Enter mnemonic phrase"
        value={mnemonic}
        onChangeText={setMnemonic}
        style={styles.input}
        multiline
      />
      <Button title="Import" onPress={handleImport} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, marginBottom: 30 },
  input: { width: "100%", height: 100, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 20, padding: 10 }
});
export default ImportWalletScreen;
