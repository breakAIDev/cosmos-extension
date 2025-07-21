import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const SecureWalletScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Secure Your Wallet</Text>
    <Text style={styles.text}>
      Please write down your mnemonic phrase and store it in a safe place. Never share it with anyone!
    </Text>
    <Button title="Done" onPress={() => navigation.replace("Home")} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30 },
  text: { fontSize: 16, textAlign: "center", marginBottom: 40 }
});

export default SecureWalletScreen;
