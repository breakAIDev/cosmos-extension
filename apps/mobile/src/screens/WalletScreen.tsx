import React from "react";
import { View, Text, StyleSheet } from "react-native";

const WalletScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Wallet Details</Text>
    <Text>More wallet info coming soon.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 }
});

export default WalletScreen;
