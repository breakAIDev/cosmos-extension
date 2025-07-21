import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { fetchTransactions } from "../services/cosmos";

const TransactionList = ({ address }: { address: string }) => {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const txs = await fetchTransactions(address);
      setTxs(txs);
      setLoading(false);
    })();
  }, [address]);

  if (loading) return <ActivityIndicator />;
  if (!txs || txs.length === 0) return <Text>No transactions yet.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transactions</Text>
      <FlatList
        data={txs}
        keyExtractor={(item, idx) => item.hash ?? idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.hash}>Tx: {item.hash}</Text>
            <Text>Type: {item.type}</Text>
            <Text>Amount: {item.amount ?? "-"} </Text>
            <Text>Date: {item.date ?? "-"}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10, width: "100%" },
  title: { fontWeight: "bold", marginBottom: 10, fontSize: 16 },
  item: { marginBottom: 10, padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8 },
  hash: { fontWeight: "bold" }
});
export default TransactionList;
