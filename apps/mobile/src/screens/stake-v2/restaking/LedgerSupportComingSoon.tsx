import { Info } from 'phosphor-react-native';
import Text from '../../../components/text';
import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';

export default function LedgerSupportComingSoon() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1e40af' : '#bfdbfe' } // blue-900 or blue-200
      ]}
    >
      <Info
        size={20}
        color={isDark ? '#60a5fa' : '#2563eb'} // blue-400 or blue-600
        style={styles.icon}
      />
      <Text
        size="xs"
        color={isDark ? 'text-white-100' : 'text-black-100'}
        style={{ flex: 1 }}
      >
        Ledger support for restaking will be introduced in the upcoming software upgrade, which is planned for release soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    marginVertical: 8,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
});
