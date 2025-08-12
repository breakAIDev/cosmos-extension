import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type AggregatedValuesProps = {
  label: string;
  value: string | React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
};

export function AggregatedValues({
  label,
  value,
  style,
  labelStyle,
  valueStyle,
}: AggregatedValuesProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      {React.isValidElement(value) ? value : typeof value === 'string' ?
        <Text style={[styles.value, valueStyle]}>{value}</Text> : null
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: 4, // Use marginBottom on label if gap unsupported
    alignItems: 'center',
  },
  label: {
    color: '#4B5563', // gray-600
    fontSize: 12,
    // add dark theme support with dynamic styles if needed
  },
  value: {
    color: '#111',
    fontWeight: '700',
    // add dark theme support as above if needed
  },
});
