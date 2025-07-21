// src/screens/Onboarding/WelcomeScreen.tsx
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import strings from "../../localization/en.json";
import { logEvent } from "../../services/analytics";

const WelcomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{strings.welcome}</Text>
    <Button
      title={strings.create_wallet}
      color={colors.primary}
      onPress={() => {
        logEvent("onboarding_create_wallet");
        navigation.navigate("CreateWallet");
      }}
    />
    <View style={{ height: 16 }} />
    <Button
      title={strings.import_wallet}
      color={colors.primary}
      onPress={() => {
        logEvent("onboarding_import_wallet");
        navigation.navigate("ImportWallet");
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  title: { ...typography.heading, marginBottom: 40, color: colors.text }
});
export default WelcomeScreen;
