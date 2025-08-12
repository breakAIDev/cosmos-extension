import BottomModal from '../../components/new-bottom-modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getWalletIconAtIndex } from '../../../assets/images/misc';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import SelectWalletColors from '../../components/create-wallet-form/SelectWalletColors';
import { ErrorCard } from '../../components/ErrorCard';
import { Wallet } from '../../hooks/wallet/useWallet';
import { getWalletName } from './utils/wallet-names';
import Text from '../../components/text';

type NewWalletFormProps = {
  isVisible: boolean;
  onClose: (closeParent: boolean) => void;
};

export function NewWalletForm({ isVisible, onClose }: NewWalletFormProps) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const createNewWallet = Wallet.useCreateNewWallet();
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState<number>(0);
  const [error, setError] = useState('');
  const wallets = Wallet.useWallets();
  const shouldAutoFillName = useRef(true);

  const handleClose = useCallback((value: boolean) => {
    setName('');
    setError('');
    onClose(value);
    shouldAutoFillName.current = true;
  }, [onClose]);

  const createWallet = async () => {
    setError('');
    setLoading(true);
    if (name) {
      const err = await createNewWallet({ name: name.trim(), colorIndex });
      if (err) setError(err);
      else {
        handleClose(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isVisible && shouldAutoFillName.current) {
      setName(getWalletName(Object.values(wallets || {}).filter((wallet) => !wallet.watchWallet)));
      shouldAutoFillName.current = false;
    }
  }, [wallets, isVisible]);

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={() => handleClose(false)}
      title={'Create new wallet'}
      style={{width: '100%'}}
      footerComponent={
        <View style={styles.footerRow}>
          <Button size="md" variant="secondary" style={styles.footerBtn} onPress={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            size="md"
            disabled={!name || isLoading}
            data-testing-id="btn-create-wallet"
            style={styles.footerBtn}
            onPress={createWallet}
          >
            Create Wallet
          </Button>
        </View>
      }
    >
      <View style={styles.contentBox}>
        <Image source={{uri: getWalletIconAtIndex(colorIndex)}} style={styles.walletIcon} />

        <Input
          autoFocus
          placeholder="Enter wallet name"
          maxLength={24}
          value={name}
          onChangeText={text => {
            if (text.length <= 24) setName(text);
          }}
          style={styles.input}
        />
        <View style={styles.charCounter}>
          <View>
            {/* You can position this wherever you want */}
            <Input>
              <View>
                <Text style={styles.counterText}>{`${name.length}/24`}</Text>
              </View>
            </Input>
          </View>
        </View>

        <SelectWalletColors selectColorIndex={setColorIndex} colorIndex={colorIndex} />
      </View>

      {!!error && <ErrorCard data-testing-id="create-new-wallet-error" text={error} />}
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  contentBox: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6', // bg-secondary-50
    alignItems: 'center',
    gap: 16,
  },
  walletIcon: {
    width: 80,
    height: 80,
    marginBottom: 12,
    borderRadius: 40,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    marginTop: 8,
  },
  charCounter: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
    marginTop: -8,
  },
  counterText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  footerBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
});
