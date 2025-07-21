import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Clipboard } from "react-native";
import { useWallet } from "../../context/WalletContext";

const CreateWalletScreen = ({ navigation }) => {
  const { createWallet, wallet } = useWallet();
  const [created, setCreated] = useState(false);

  const handleCreate = async () => {
    await createWallet();
    setCreated(true);
  };

  return (
    <View style={styles.container}>
      {!created ? (
        <>
          <Text style={styles.title}>Create a New Wallet</Text>
          <Button title="Generate Wallet" onPress={handleCreate} />
        </>
      ) : (
        <>
          <Text style={styles.mnemonic}>{wallet?.mnemonic}</Text>
          <Button title="Copy Mnemonic" onPress={() => Clipboard.setString(wallet?.mnemonic ?? "")} />
          <Button title="Continue" onPress={() => navigation.replace("Home")} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, marginBottom: 30 },
  mnemonic: { fontSize: 18, fontWeight: "bold", marginVertical: 30, textAlign: "center" }
});
export default CreateWalletScreen;
