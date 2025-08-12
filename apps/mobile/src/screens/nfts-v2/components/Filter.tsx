import { X } from 'phosphor-react-native';
import Sort from '../../../../assets/icons/sort';
import { Images } from '../../../../assets/images';
import React from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

type FilterProps = {
  readonly searchedText: string;
  readonly setSearchedText: React.Dispatch<React.SetStateAction<string>>;
  readonly onClickSortBy: VoidFunction;
};

export function Filter({ searchedText, setSearchedText, onClickSortBy }: FilterProps) {
  return (
    <View style={styles.root}>
      <View style={[styles.inputWrap]}>
        <TextInput
          value={searchedText}
          placeholder="search by nft collection/name..."
          placeholderTextColor="#9ca3af"
          style={styles.input}
          onChangeText={setSearchedText}
        />

        {searchedText.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchedText('')} style={styles.iconBtn}>
            <X size={16} color="#9ca3af" />
          </TouchableOpacity>
        ) : (
          <Image source={{uri: Images.Misc.Search}} style={styles.iconImg} />
        )}
      </View>

      <TouchableOpacity
        onPress={onClickSortBy}
        style={styles.sortBtn}
        activeOpacity={0.75}
      >
        <Sort size={24} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#fff', // bg-white-100
    borderRadius: 30,
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#4b5563', // text-gray-600
    backgroundColor: 'transparent',
    fontWeight: '500',
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    // outline-none: not needed for RN
  },
  iconBtn: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImg: {
    width: 18,
    height: 18,
    tintColor: '#9ca3af',
  },
  sortBtn: {
    marginLeft: 12,
    borderRadius: 24,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // bg-white-100
    // For dark mode, you can use dynamic color here
  },
});
