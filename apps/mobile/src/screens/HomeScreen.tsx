import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useWallet } from "../context/WalletContext";

const HomeScreen = ({ navigation }) => {
  const { wallet, logout } = useWallet();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Wallet</Text>
      <Text style={styles.label}>Address:</Text>
      <Text style={styles.address}>{wallet?.address}</Text>
      <Button title="Send" onPress={() => navigation.navigate("Send")} />
      <Button title="Receive" onPress={() => navigation.navigate("Receive")} />
      <Button title="Logout" onPress={logout} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 26, marginBottom: 40 },
  label: { fontSize: 18, marginTop: 10 },
  address: { fontSize: 16, fontWeight: "bold", marginBottom: 20, textAlign: "center" }
});
export default HomeScreen;
