import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TransactionDetailScreen = ({ route }) => {
  const { tx } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Details</Text>
      {tx ? (
        <>
          <Text>Hash: {tx.hash}</Text>
          <Text>Type: {tx.type}</Text>
          <Text>Amount: {tx.amount}</Text>
          <Text>Date: {tx.date}</Text>
        </>
      ) : (
        <Text>No transaction data.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30 }
});

export default TransactionDetailScreen;
