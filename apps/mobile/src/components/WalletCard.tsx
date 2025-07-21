import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  address: string;
  balance: string | null;
  onPress?: () => void;
};

const WalletCard: React.FC<Props> = ({ address, balance, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <Text style={styles.label}>Wallet Address</Text>
    <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">{address}</Text>
    <Text style={styles.label}>Balance</Text>
    <Text style={styles.balance}>{balance ?? 'Loading...'} ATOM</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 20,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center"
  },
  label: {
    fontSize: 13,
    color: "#888",
    marginTop: 4
  },
  address: {
    fontSize: 15,
    fontWeight: "bold",
    marginVertical: 4,
    textAlign: "center"
  },
  balance: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5
  }
});

export default WalletCard;
