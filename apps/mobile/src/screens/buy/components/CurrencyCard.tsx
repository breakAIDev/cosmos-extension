import React, { useCallback } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { sliceWord } from '@leapwallet/cosmos-wallet-hooks';
import Text from '../../../components/text';

export type CurrencyCardProps = {
  code: string;
  name: string;
  logo: string;
  onClick: () => void;
  isSelected: boolean;
};

export default function CurrencyCard({
  code,
  name,
  logo,
  onClick,
  isSelected,
}: CurrencyCardProps) {
  const handleCurrencySelect = useCallback(() => {
    if (isSelected) return;
    onClick();
  }, [isSelected, onClick]);

  return (
    <TouchableOpacity
      activeOpacity={isSelected ? 1 : 0.7}
      style={[
        styles.container,
        isSelected ? styles.selected : styles.unselected,
      ]}
      onPress={handleCurrencySelect}
      disabled={isSelected}
    >
      <Image source={{ uri: logo }} style={styles.logo} />
      <View style={styles.textWrap}>
        <Text size="md" color="text-monochrome" style={{ fontWeight: 'bold' }}>
          {sliceWord(code)}
        </Text>
        <Text size="sm" color="text-muted-foreground">
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: '#E0E7EF', // bg-secondary-200
    borderColor: '#4B6EAF',     // border-secondary-600
  },
  unselected: {
    backgroundColor: '#F6F8FA', // bg-secondary-100
  },
  logo: {
    borderRadius: 18,
    width: 36,
    height: 36,
  },
  textWrap: {
    flexDirection: 'column',
  },
});
