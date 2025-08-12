import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ArrowDown, ArrowUp } from 'phosphor-react-native';

type SortingButtonProps = {
  sortBy: string;
  sortDir: string;
  defaultSortBy?: string;
  defaultSortDir?: string;
  setSortDir: Dispatch<SetStateAction<string>>;
  setSortBy: Dispatch<SetStateAction<string>>;
  label: string;
  sortName: string;
  showEmptySymbolArea?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SortingButton({
  sortBy,
  sortDir,
  defaultSortBy = '',
  defaultSortDir = '',
  setSortDir,
  setSortBy,
  label,
  sortName,
  showEmptySymbolArea = false,
  style,
}: SortingButtonProps) {
  const symbol = useMemo(() => {
    if (sortBy === sortName) {
      if (sortDir === 'asc') {
        return <ArrowUp size={14} color="#6B7280" />; // gray-500
      } else {
        return <ArrowDown size={14} color="#6B7280" />;
      }
    }
    // If not active sort, show nothing or empty area if requested
    return showEmptySymbolArea ? <View style={{ width: 14, height: 14 }} /> : null;
  }, [sortBy, sortDir, sortName, showEmptySymbolArea]);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => {
        if (sortBy === sortName) {
          if (sortDir === 'asc') {
            setSortDir('dsc');
          } else {
            setSortDir(defaultSortDir);
            setSortBy(defaultSortBy);
          }
        } else {
          setSortBy(sortName);
          setSortDir('asc');
        }
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.iconArea, style]}>{symbol}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // requires RN >= 0.71, otherwise use marginRight/marginLeft
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#111827', // text-black-100
  },
  iconArea: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
