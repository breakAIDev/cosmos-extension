// src/screens/ReceiveScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useWallet } from "../context/WalletContext";
import QRCodeModal from "../components/QRCodeModal";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import strings from "../localization/en.json";
import { logEvent } from "../services/analytics";

const ReceiveScreen = () => {
  const { wallet } = useWallet();
  const [qrVisible, setQrVisible] = useState(false);

  if (!wallet) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{strings.receive}</Text>
      <Text style={styles.label}>{strings.address}:</Text>
      <Text selectable style={styles.address}>{wallet.address}</Text>
      <Button title="Show QR" color={colors.primary} onPress={() => { logEvent("receive_show_qr"); setQrVisible(true); }} />
      <QRCodeModal
        visible={qrVisible}
        value={wallet.address}
        onClose={() => setQrVisible(false)}
        title={strings.address}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: colors.background },
  title: { ...typography.heading, marginBottom: 20, color: colors.text },
  label: { fontSize: 16, marginBottom: 10, color: colors.text },
  address: { fontSize: 15, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: colors.text }
});
export default ReceiveScreen;
