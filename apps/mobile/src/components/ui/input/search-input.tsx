import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SearchIcon } from '../../../../assets/icons/search-icon'; // Should be an SVG or Icon RN component
import { Input, InputProps } from '.'; // Your RN Input component

interface SearchInputProps extends Omit<InputProps, 'trailingElement'> {
  onClear: () => void;
}

export const SearchInput = forwardRef<any, SearchInputProps>(
  ({ onClear, style, value, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        {...props}
        value={value}
        style={[styles.input, style]}
        trailingElement={
          (value as string)?.length > 0 ? (
            <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
              <Text style={styles.clearText}>clear</Text>
            </TouchableOpacity>
          ) : (
            <SearchIcon width={18} height={18} color="#97A3B9" />
          )
        }
        placeholderTextColor="#97A3B9"
      />
    );
  }
);

const styles = StyleSheet.create({
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F7F9FA',
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  clearText: {
    color: '#97A3B9',
    fontSize: 14,
  },
});

SearchInput.displayName = 'SearchInput';
