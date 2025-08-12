import Text from '../../text';
import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';

type KeyProps = {
  readonly children: string;
};

export function Key({ children }: KeyProps) {
  return (
    <Text size="sm" style={styles.key}>
      {children}
    </Text>
  );
}

export function Value({ children }: KeyProps) {
  const colorScheme = useColorScheme();
  return (
    <Text
      size="xs"
      style={[
        styles.value,
        { color: colorScheme === 'dark' ? '#D1D5DB' : '#374151' }, // gray-300 (dark) / gray-700 (light)
      ]}
    >
      {children}
    </Text>
  );
}

export function KeyNew({ children }: KeyProps) {
  return (
    <Text
      size="sm"
      style={styles.keyNew}
    >
      {children}
    </Text>
  );
}

export function ValueNew({ children }: KeyProps) {
  return (
    <Text
      size="md"
      style={styles.valueNew}
    >
      {children}
    </Text>
  );
}

export function Divider() {
  const colorScheme = useColorScheme();
  return (
    <View
      style={[
        styles.divider,
        {
          borderBottomColor: colorScheme === 'dark' ? '#1E293B' : '#F3F4F6', // gray-800 or white-100
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  key: {
    fontWeight: 'bold',
  },
  value: {
    marginTop: -4, // -mt-1 ~ -4px
    flexWrap: 'wrap',
  },
  keyNew: {
    fontWeight: '500',
    lineHeight: 22,
    color: '#6B7280', // muted-foreground (adjust as needed)
  },
  valueNew: {
    fontWeight: 'bold',
    fontSize: 16, // 'md'
    lineHeight: 22,
    color: '#111827', // foreground (adjust as needed)
    flexWrap: 'wrap',
  },
  divider: {
    marginVertical: 2, // my-0.5 ~ 2px
    borderBottomWidth: 0.5,
    opacity: 0.5,
  },
});
