import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Info } from 'phosphor-react-native';

export default function WarningCard({ text, subText }: { text: string; subText?: string }) {
  return (
    <View style={styles.card}>
      <Info size={20} color="#FB923C" style={styles.icon} weight="duotone" />
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>{text}</Text>
        {subText ? (
          <Text style={styles.subText}>{subText}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 344,
    height: 86,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 21,
    // If you have dark mode, you can add dynamic colors here
    // backgroundColor: isDark ? '#111827' : '#fff',
  },
  icon: {
    marginRight: 12,
    alignSelf: 'center',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
  },
  mainText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#232323',
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: '#97A3B9',
    marginLeft: 5,
  },
});
