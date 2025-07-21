// src/screens/SettingsScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import strings from "../localization/en.json";

const SettingsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>{strings.settings}</Text>
    <Text>Settings coming soon.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  title: { ...typography.heading, marginBottom: 30, color: colors.text }
});
export default SettingsScreen;
