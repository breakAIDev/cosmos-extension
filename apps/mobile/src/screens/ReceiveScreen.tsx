import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useWallet } from "../context/WalletContext";

const ReceiveScreen = () => {
  const { wallet } = useWallet();
  if (!wallet) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive Tokens</Text>
      <Text style={styles.label}>Your Address:</Text>
      <Text selectable style={styles.address}>{wallet.address}</Text>
      <View style={{ margin: 30 }}>
        <QRCode value={wallet.address} size={200} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  address: { fontSize: 15, fontWeight: "bold", marginBottom: 10, textAlign: "center" }
});

export default ReceiveScreen;
