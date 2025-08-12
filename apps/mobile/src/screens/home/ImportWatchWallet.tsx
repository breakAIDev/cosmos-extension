import { getBlockChainFromAddress, isValidWalletAddress } from '@leapwallet/cosmos-wallet-sdk';
import { KeyChain } from '@leapwallet/leap-keychain';
import SelectWalletColors from '../../components/create-wallet-form/SelectWalletColors';
import BottomModal from '../../components/new-bottom-modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from '../../services/config/config';
import { useChainInfos } from '../../hooks/useChainInfos';
import React, { useEffect, useRef, useState } from 'react';
import { passwordStore } from '../../context/password-store';

import { Wallet } from '../../hooks/wallet/useWallet';
import { getWalletName } from './utils/wallet-names';
import { WatchWalletAvatar } from './WalletCardWrapper';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';

type ImportWatchAddressProps = {
  isVisible: boolean;
  onClose: (closeParent: boolean) => void;
};

export default function ImportWatchWallet({ isVisible, onClose }: ImportWatchAddressProps) {
  const wallets = Wallet.useWallets();
  const [watchAddress, setWatchAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const password = passwordStore.password;
  const saveWatchWallet = Wallet.useSaveWatchWallet();
  const chainInfos = useChainInfos();
  const shouldAutoFillName = useRef(true);
  const [colorIndex, setColorIndex] = useState(0);

  const onChangeHandler = (value: string) => {
    setError('');
    setWatchAddress(value);
  };

  const handleImportWallet = async () => {
    setIsLoading(true);

    if (watchAddress && password && !error) {
      try {
        await saveWatchWallet(watchAddress, walletName);
        setWatchAddress('');
        setWalletName('');
        shouldAutoFillName.current = true;
        onClose(true);
      } catch (error: any) {
        setError(error.message);
      }
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    onClose(false);
    setError('');
    setWatchAddress('');
    setWalletName('');
    shouldAutoFillName.current = true;
  };

  useEffect(() => {
    async function validate() {
      if (!watchAddress) {
        setError('');
        return;
      }
      if (!isValidWalletAddress(watchAddress)) {
        setError('Invalid public address, please enter a valid address');
        return;
      }

      const prefix = getBlockChainFromAddress(watchAddress);
      const chain = Object.values(chainInfos).find((chain) => chain.addressPrefix === prefix);
      const wallets = await KeyChain.getAllWallets();
      const addresses = Object.values(wallets).reduce((acc, wallet) => {
        if (chain) {
          const existingAddress = wallet.addresses[chain?.key];
          if (existingAddress) {
            acc.push(existingAddress);
          }
        }
        return acc;
      }, [] as string[]);
      if (addresses.includes(watchAddress)) {
        setError('This address already exists in your wallet');
        return;
      }
      setError('');
    }
    validate();
  }, [chainInfos, watchAddress]);

  useEffect(() => {
    if (isVisible && shouldAutoFillName.current) {
      setWalletName(
        getWalletName(
          Object.values(wallets || {}).filter((wallet) => wallet.watchWallet),
          'Watch Wallet',
        ),
      );
      shouldAutoFillName.current = false;
    }
  }, [wallets, isVisible]);

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      title="Watch wallet"
      onClose={handleClose}
      footerComponent={
        <View style={styles.footerRow}>
          <Button variant="secondary" size="md" style={styles.footerBtn} onPress={handleClose}>
            Cancel
          </Button>
          <Button
            size="md"
            style={styles.footerBtn}
            disabled={!watchAddress || !!error || isLoading}
            onPress={handleImportWallet}
          >
            Watch Wallet
          </Button>
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <WatchWalletAvatar
          colorIndex={colorIndex}
          style={styles.avatar}
          iconSize={40}
        />

        {/* Public address input (multiline) */}
        <TextInput
          style={[
            styles.textarea,
            error ? styles.inputError : undefined,
          ]}
          placeholder="Public address"
          autoFocus={isVisible}
          value={watchAddress}
          onChangeText={onChangeHandler}
          multiline
          numberOfLines={3}
          spellCheck={false}
        />

        {/* Wallet name input with trailing length counter */}
        <View style={styles.inputWrapper}>
          <Input
            maxLength={24}
            spellCheck={false}
            placeholder="Enter wallet name"
            value={walletName.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '')}
            onChangeText={setWalletName}
            style={styles.input}
          />
          <Text style={styles.counterText}>{walletName.length > 0 ? `${walletName.length}/24` : ''}</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <SelectWalletColors selectColorIndex={setColorIndex} colorIndex={colorIndex} />
      </ScrollView>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F6F7FB', // bg-secondary-50
    borderRadius: 20,
    gap: 18,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 6,
    marginTop: 2,
    alignSelf: 'center',
  },
  textarea: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    color: '#222',
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  counterText: {
    position: 'absolute',
    right: 16,
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    fontWeight: '500',
    color: '#E2655A',
    fontSize: 15,
    alignSelf: 'center',
    marginVertical: 2,
  },
  inputError: {
    borderColor: '#E2655A',
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#F3F4F6',
  },
  footerBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
});
