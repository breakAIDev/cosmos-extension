import React, { useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Images } from '../../../assets/images';

type AggregatedSearchComponentsProps = {
  handleClose: () => void;
  value: string;
  handleChange: (value: string) => void;
  placeholder?: string;
  style?: object;
};

export function AggregatedSearchComponent({
  handleClose,
  value,
  handleChange,
  placeholder,
  style,
}: AggregatedSearchComponentsProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder ?? 'Search'}
          value={value}
          onChangeText={handleChange}
          ref={inputRef}
          placeholderTextColor="#9CA3AF"
        />
        <Image source={Images.Misc.search_white_icon} style={styles.searchIcon} />
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Image source={Images.Misc.cross} style={styles.closeIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  inputContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
    color: '#18181b',
    outlineStyle: 'none',
  },
  searchIcon: {
    width: 22,
    height: 22,
    tintColor: '#18181b',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeIcon: {
    width: 12,
    height: 12,
    tintColor: '#18181b',
  },
});
