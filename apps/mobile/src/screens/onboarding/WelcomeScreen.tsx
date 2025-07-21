import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const WelcomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Welcome to Leap Wallet</Text>
    <Button title="Create New Wallet" onPress={() => navigation.navigate("CreateWallet")} />
    <Button title="Import Existing Wallet" onPress={() => navigation.navigate("ImportWallet")} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 40 }
});
export default WelcomeScreen;
