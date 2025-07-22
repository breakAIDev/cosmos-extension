import React, { useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Images } from '../../../assets/images';

type AggregatedSearchComponentsProps = {
  handleClose: () => void;
  value: string;
  handleChange: (value: string) => void;
  placeholder?: string;
  style?: any;
};

export function AggregatedSearchComponent({
  handleClose,
  value,
  handleChange,
  placeholder,
  style,
}: AggregatedSearchComponentsProps) {
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isDark = colorScheme === 'dark';

  const SearchIcon = Images.Misc.search_white_icon;
  const CrossIcon = Images.Misc.cross;

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.inputWrapper,
        { backgroundColor: isDark ? '#18181b' : '#fff' },
      ]}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: isDark ? '#fff' : '#18181b' },
          ]}
          placeholder={placeholder ?? 'Search'}
          value={value}
          onChangeText={handleChange}
          autoFocus
          placeholderTextColor={isDark ? '#aaa' : '#444'}
        />
        {SearchIcon ? (
          <SearchIcon width={22} height={22} color={isDark ? '#fff' : '#000'} />
        ) : null}
      </View>
      <TouchableOpacity
        style={[
          styles.closeButton,
          { backgroundColor: isDark ? '#18181b' : '#fff' },
        ]}
        onPress={handleClose}
        activeOpacity={0.8}
      >
        {CrossIcon ? (
          <CrossIcon width={12} height={12} color={isDark ? '#fff' : '#000'} />
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8, // If your RN version doesn't support gap, use marginRight/Left on children
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    height: 40,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

