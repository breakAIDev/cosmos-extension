import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SelectedAddress, useAddressPrefixes, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { getBlockChainFromAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Avatar, Buttons } from '@leapwallet/leap-ui';
import { CaretLeft, CaretRight } from 'phosphor-react-native';
import BottomModal from '../../../../components/bottom-modal';
import { CustomCheckbox } from '../../../../components/custom-checkbox';
import { LoaderAnimation } from '../../../../components/loader/Loader';
import Text from '../../../../components/text';
import { useActiveChain } from '../../../../hooks/settings/useActiveChain';
import { useContacts } from '../../../../hooks/useContacts';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Colors } from '../../../../theme/colors';
import { AddressBook } from '../../../../utils/addressbook';
import { sliceAddress } from '../../../../utils/strings';

import { SendContextType, useSendContext } from '../../context';

type SaveAddressSheetProps = {
  title?: string;
  isOpen: boolean;
  address: string;
  ethAddress?: string;
  sendActiveChain?: SupportedChain;
  onClose: () => void;
  onSave?: (s: SelectedAddress) => void;
};

const subtract = (a: number) => ((a - 1) % 20) + (a >= 1 ? 0 : 20);
const add = (a: number) => (a + 1) % 20;

export default function SaveAddressSheet({
  title = 'Save Contact',
  isOpen,
  onClose,
  address,
  ethAddress,
  onSave,
  sendActiveChain,
}: SaveAddressSheetProps) {
  const [memo, setMemo] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [emoji, setEmoji] = useState<number>(1);
  const [saveAsCEX, setSaveAsCEX] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { setMemo: setNewMemo } = useSendContext() as SendContextType;

  const existingContact = AddressBook.useGetContact(address);
  const { contacts: savedContacts, loading: savedContactsLoading } = useContacts();
  const addressPrefixes = useAddressPrefixes();
  const defaultTokenLogo = useDefaultTokenLogo();
  const enterNameRef = useRef<TextInput | null>(null);

  const chains = useGetChains();
  const _activeChain = useActiveChain();

  const activeChain = useMemo(() => sendActiveChain ?? _activeChain, [sendActiveChain, _activeChain]);

  const chain = useMemo(() => {
    try {
      if (chains[activeChain]?.evmOnlyChain && address.toLowerCase().startsWith('0x')) {
        return activeChain;
      }
      const prefix = getBlockChainFromAddress(address);
      const _chain = addressPrefixes[prefix ?? ''];
      if (_chain === 'cosmoshub') {
        return 'cosmos';
      }
      return _chain as SupportedChain;
    } catch (e) {
      return 'cosmos';
    }
  }, [activeChain, address, addressPrefixes, chains]);

  useEffect(() => {
    if (existingContact) {
      setName(existingContact.name);
      setEmoji(existingContact.emoji);
      setMemo(existingContact.memo ?? '');
      setSaveAsCEX(existingContact?.saveAsCEX ?? false);
    }
  }, [existingContact]);

  useEffect(() => {
    if (isOpen && enterNameRef.current) {
      setTimeout(() => {
        enterNameRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleNameChange = (value: string) => {
    error && setError('');
    if (value.length < 24) {
      if (
        value.length &&
        !savedContactsLoading &&
        Object.values(savedContacts).some(
          ({ name: contactName, address: sCAddress }) =>
            sCAddress !== address && contactName.trim().toLowerCase() === value.trim().toLowerCase(),
        )
      ) {
        setError('Contact with same name already exists');
      }
      setName(value);
    }
  };

  const handleSubmit = async () => {
    if (name && !isSaving) {
      setIsSaving(true);
      await AddressBook.save({
        address: address,
        blockchain: chain,
        emoji: emoji,
        name: name,
        memo: memo,
        ethAddress,
        saveAsCEX: saveAsCEX,
      });

      setNewMemo(memo);
      onSave?.({
        ethAddress,
        address: address,
        chainIcon: chains[chain]?.chainSymbolImageUrl ?? defaultTokenLogo ?? '',
        emoji: emoji,
        name: name,
        avatarIcon: '',
        chainName: chains[chain]?.chainName,
        selectionType: 'saved',
      });
      onClose();
      setIsSaving(false);
    }
  };

  return (
    <BottomModal
      title={title}
      onClose={onClose}
      isOpen={isOpen}
      containerStyle={styles.modalContainer}
    >
      <View style={styles.form}>
        {/* Emoji selector */}
        <View style={styles.emojiRow}>
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setEmoji(subtract(emoji))}
            activeOpacity={0.8}
          >
            <CaretLeft size={32} color="#111" />
          </TouchableOpacity>
          <Avatar size="lg" chainIcon={chains[chain]?.chainSymbolImageUrl ?? defaultTokenLogo} emoji={emoji ?? 0} />
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setEmoji(add(emoji))}
            activeOpacity={0.8}
          >
            <CaretRight size={32} color="#111" />
          </TouchableOpacity>
        </View>

        <Text style={styles.addressText}>{sliceAddress(address)}</Text>

        {/* Name input */}
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Enter name"
            value={name}
            onChangeText={handleNameChange}
            ref={enterNameRef}
            style={styles.input}
            maxLength={24}
            returnKeyType="done"
            blurOnSubmit={true}
            autoCapitalize="words"
          />
          <Text style={styles.charCount}>{`${name.length}/24`}</Text>
          {error ? (
            <Text size="xs" style={styles.errorText}>
              {error}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Memo and CEX checkbox */}
      {!chains[chain]?.evmOnlyChain && (
        <>
          <View style={styles.memoWrap}>
            <Text style={styles.memoLabel}>Add Memo</Text>
            <TextInput
              style={styles.memoInput}
              value={memo}
              placeholder="Required for CEX transfers..."
              placeholderTextColor="#888"
              onChangeText={setMemo}
              maxLength={60}
            />
          </View>
          <View style={styles.cexRow}>
            <CustomCheckbox checked={saveAsCEX} onClick={() => setSaveAsCEX((prev) => !prev)} />
            <Text style={styles.cexLabel}>Save as Centralized Exchange Address</Text>
          </View>
        </>
      )}

      {/* Save Button */}
      <View style={{ width: '100%', alignItems: 'center', marginTop: 16 }}>
        {isSaving ? (
          <LoaderAnimation color={Colors.white100} />
        ) : (
          <Buttons.Generic
            color={Colors.green600}
            size="normal"
            style={{ width: '100%' }}
            disabled={!name || !!error}
            title="Save contact"
            onClick={handleSubmit}
          >
            Save contact
          </Buttons.Generic>
        )}
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  form: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    justifyContent: 'center',
    marginBottom: 16,
  },
  emojiButton: {
    padding: 4,
    backgroundColor: '#eee',
    borderRadius: 24,
  },
  addressText: {
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputWrap: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f6f6f9',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111',
    width: '100%',
  },
  charCount: {
    position: 'absolute',
    right: 16,
    top: 14,
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    color: '#fc5a5a',
    marginTop: 4,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  memoWrap: {
    width: '100%',
    backgroundColor: '#f6f6f9',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  memoLabel: {
    fontWeight: '500',
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  memoInput: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#e9e9ef',
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  cexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f9',
    borderRadius: 20,
    width: '100%',
    padding: 16,
    gap: 12,
    marginBottom: 0,
  },
  cexLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginLeft: 6,
  },
});
