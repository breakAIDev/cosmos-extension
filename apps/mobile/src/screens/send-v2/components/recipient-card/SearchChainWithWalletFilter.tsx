import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Key } from '@leapwallet/cosmos-wallet-hooks';
import { CaretDown } from 'phosphor-react-native';
import Text from '../../../../components/text';
import { Images } from '../../../../../assets/images';
import { formatWalletName } from '../../../../utils/formatWalletName';
import { trim } from '../../../../utils/strings';

import { SelectWalletSheet } from './SelectWalletSheet';

type SearchChainWithWalletFilterProps = {
  value: string;
  onChange: (text: string) => void;
  setSelectedWallet: (val: Key) => void;
  selectedWallet: Key;
};

export default function SearchChainWithWalletFilter({
  value,
  onChange,
  setSelectedWallet,
  selectedWallet,
}: SearchChainWithWalletFilterProps) {
  const inputRef = useRef<TextInput | null>(null);
  const [isWalletSheetVisible, setIsWalletSheetVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, []);

  const walletName = formatWalletName(selectedWallet?.name || '');
  const walletAvatar = useMemo(() => {
    if (selectedWallet?.avatar) {
      return { uri: selectedWallet.avatar };
    } else {
      return Images.Misc.getWalletIconAtIndex(selectedWallet.colorIndex, selectedWallet.watchWallet);
    }
  }, [selectedWallet.avatar, selectedWallet.colorIndex, selectedWallet.watchWallet]);

  return (
    <View
      style={[
        styles.container,
        isFocused && { borderColor: '#16a34a' }, // green-600 border on focus
      ]}
    >
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Search chain"
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <TouchableOpacity
        style={styles.walletSelector}
        onPress={() => setIsWalletSheetVisible(true)}
        activeOpacity={0.7}
      >
        <Image
          style={styles.walletAvatar}
          source={{uri: walletAvatar as string ?? Images.Logos.LeapLogo28}}
        />
        <Text size="sm" style={styles.walletName}>
          {trim(walletName, 8)}
        </Text>
        <CaretDown size={16} style={{ marginLeft: 2}} color={'#111'}  />
      </TouchableOpacity>

      <SelectWalletSheet
        isOpen={isWalletSheetVisible}
        onClose={() => setIsWalletSheetVisible(false)}
        setSelectedWallet={setSelectedWallet}
        selectedWallet={selectedWallet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a1a1a10', // gray-50
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    minWidth: 160,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    backgroundColor: 'transparent',
    padding: 0,
  },
  walletSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a10', // gray-50
    borderLeftWidth: 2,
    borderLeftColor: '#e5e5e5',
    paddingLeft: 16,
    paddingRight: 4,
  },
  walletAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  walletName: {
    fontWeight: 'bold',
  },
});

