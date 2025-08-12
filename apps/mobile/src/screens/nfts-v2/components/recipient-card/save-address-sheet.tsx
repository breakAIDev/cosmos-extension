import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Text as RNText } from 'react-native';
import { SelectedAddress, useAddressPrefixes } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Avatar, Buttons, Memo } from '@leapwallet/leap-ui';
import { decode } from 'bech32';
import BottomModal from '../../../../components/bottom-modal';
import IconButton from '../../../../components/icon-button';
import { LoaderAnimation } from '../../../../components/loader/Loader';
import Text from '../../../../components/text';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { useContacts } from '../../../../hooks/useContacts';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../../assets/images';
import { Colors } from '../../../../theme/colors';
import { AddressBook } from '../../../../utils/addressbook';

const getPrevEmojiIndex = (a: number) => ((a - 1) % 20) + (a >= 1 ? 0 : 20);
const getNextEmojiIndex = (a: number) => (a + 1) % 20;

type SaveAddressSheetProps = {
  title?: string;
  isOpen: boolean;
  address: string;
  onClose: () => void;
  
  onSave?: (s: SelectedAddress) => void;
};

export default function SaveAddressSheet({
  title = 'Save Contact',
  isOpen,
  onClose,
  address,
  onSave,
}: SaveAddressSheetProps) {
  const [memo, setMemo] = useState('');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(1);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const existingContact = AddressBook.useGetContact(address);
  const { contacts: savedContacts, loading: savedContactsLoading } = useContacts();
  const chainInfos = useChainInfos();
  const addressPrefixes = useAddressPrefixes();
  const defaultTokenLogo = useDefaultTokenLogo();

  const chain = useMemo(() => {
    try {
      const { prefix } = decode(address);
      const _chain = addressPrefixes[prefix];
      if (_chain === 'cosmoshub') {
        return 'cosmos';
      }
      return _chain;
    } catch (e) {
      return 'cosmos';
    }
  }, [address, addressPrefixes]);

  const chainIcon = chainInfos[chain]?.chainSymbolImageUrl ?? defaultTokenLogo;

  useEffect(() => {
    if (existingContact) {
      setName(existingContact.name);
      setEmoji(existingContact.emoji);
      setMemo(existingContact.memo ?? '');
    }
  }, [existingContact]);

  const handleNameChange = (value: string) => {
    if (error) setError('');
    if (value.length < 24) {
      if (
        value.length &&
        !savedContactsLoading &&
        Object.values(savedContacts).some(
          ({ name: n, address: sCAddress }) =>
            sCAddress !== address && n.trim().toLowerCase() === value.trim().toLowerCase(),
        )
      ) {
        setError('Contact with same name already exists');
      }
      setName(value);
    }
  };

  const onClickSave = async () => {
    if (name && !isSaving) {
      setIsSaving(true);
      await AddressBook.save({
        address: address,
        blockchain: chain as SupportedChain,
        emoji: emoji,
        name: name,
        memo: memo,
      });

      onSave?.({
        address: address,
        chainIcon: chainIcon ?? '',
        emoji: emoji,
        name: name,
        avatarIcon: '',
        chainName: chainInfos[chain]?.chainName,
        selectionType: 'saved',
      });
      onClose();
      setIsSaving(false);
    }
  };

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={title} closeOnBackdropClick={true}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.emojiRow}>
            <IconButton
              style={[styles.iconBtn, { transform: [{ rotate: '180deg' }] }]}
              onPress={() => setEmoji(getPrevEmojiIndex(emoji))}
              image={{ src: {uri: Images.Misc.RightArrow}, alt: 'left' }}
            />
            <Avatar size="lg" chainIcon={chainIcon} emoji={emoji ?? 0} />
            <IconButton
              style={styles.iconBtn}
              onPress={() => setEmoji(getNextEmojiIndex(emoji))}
              image={{ src: {uri: Images.Misc.RightArrow}, alt: 'right' }}
            />
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="enter name"
              value={name}
              onChangeText={(e: string) => handleNameChange(e)}
              maxLength={24}
            />
            <RNText style={styles.counter}>{`${name.length}/24`}</RNText>
          </View>
          {error ? (
            <Text size="xs" style={styles.errorText}>
              {error}
            </Text>
          ) : null}
        </View>

        <Memo
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          style={{ width: '100%', marginTop: 8 }}
        />

        {isSaving ? (
          <LoaderAnimation color={Colors.white100} />
        ) : (
          <Buttons.Generic
            color={Colors.juno}
            size="normal"
            style={styles.saveBtn}
            disabled={!name || !!error}
            title="Save contact"
            onClick={onClickSave}
          >
            Save contact
          </Buttons.Generic>
        )}
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    gap: 16,
    flexDirection: 'column',
  },
  card: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    marginHorizontal: 8,
    padding: 8,
  },
  inputRow: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    width: 312,
    alignSelf: 'center',
    fontSize: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
  },
  counter: {
    position: 'absolute',
    right: 16,
    top: 16,
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    color: '#fca5a5',
    fontWeight: 'bold',
    marginTop: 6,
    marginLeft: 4,
  },
  saveBtn: {
    width: '100%',
    marginTop: 14,
  },
});
