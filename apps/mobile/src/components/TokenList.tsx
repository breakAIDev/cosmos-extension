// src/components/TokenList.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { formatAtom } from "../utils/format";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import strings from "../localization/en.json";

type Token = { denom: string; amount: string };

type Props = { tokens: Token[] };

const TokenList: React.FC<Props> = ({ tokens }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{strings.tokens}</Text>
    <FlatList
      data={tokens}
      keyExtractor={item => item.denom}
      renderItem={({ item }) => (
        <View style={styles.tokenRow}>
          <Text style={styles.denom}>{item.denom.toUpperCase()}</Text>
          <Text style={styles.amount}>{formatAtom(item.amount)}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={{ color: colors.border }}>No tokens found.</Text>}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { width: "100%", marginTop: 10 },
  title: { ...typography.subheading, marginBottom: 10, color: colors.text },
  tokenRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  denom: { fontWeight: "bold", fontSize: 15, color: colors.text },
  amount: { fontSize: 15, color: colors.text }
});
export default TokenList;
