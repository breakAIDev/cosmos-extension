import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";

type Props = {
  visible: boolean;
  value: string;
  onClose: () => void;
  title?: string;
};

const QRCodeModal: React.FC<Props> = ({ visible, value, onClose, title }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>{title ?? "Scan QR Code"}</Text>
        <QRCode value={value} size={200} />
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 24,
    alignItems: "center"
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 18 },
  button: {
    marginTop: 24, backgroundColor: "#2266ee",
    paddingHorizontal: 30, paddingVertical: 12,
    borderRadius: 7
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});
export default QRCodeModal;
