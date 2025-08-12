import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowSquareOut } from 'phosphor-react-native';

type TokenTitleProps = {
  title: string;
  showRedirection?: boolean;
  handleRedirectionClick?: () => void;
};

export function TokenTitle({
  title,
  showRedirection,
  handleRedirectionClick,
}: TokenTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{title}</Text>
      {showRedirection && (
        <TouchableOpacity onPress={handleRedirectionClick} style={styles.redirectBtn} hitSlop={8}>
          <ArrowSquareOut size={16} color="#94a3b8" weight="regular" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  titleText: {
    fontWeight: 'bold',
    color: '#111',
    fontSize: 14,
  },
  redirectBtn: {
    marginLeft: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
