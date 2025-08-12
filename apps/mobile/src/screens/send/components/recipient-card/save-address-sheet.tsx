import { SelectedAddress, useAddressPrefixes, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import {
  isAptosAddress,
  isEthAddress,
  isSolanaAddress,
  isValidAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { Plus, TrashSimple } from 'phosphor-react-native';
import { decode } from 'bech32';
import { CustomCheckbox } from '../../../../components/custom-checkbox';
import { LoaderAnimation } from '../../../../components/loader/Loader';
import BottomModal from '../../../../components/new-bottom-modal/index';
import Text from '../../../../components/text';
import { Button } from '../../../../components/ui/button';
import { useContacts } from '../../../../hooks/useContacts';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../../assets/images';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Colors } from '../../../../theme/colors';
import { AddressBook } from '../../../../utils/addressbook';

import { SendContextType, useSendContext } from '../../context';

import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

type SaveAddressSheetProps = {
  title?: string;
  isOpen: boolean;
  address: string;
  ethAddress?: string;
  sendActiveChain?: SupportedChain;
  onClose: () => void;
  onSave?: (s: SelectedAddress) => void;
  showDeleteBtn?: boolean;
};

export default function SaveAddressSheet({
  isOpen,
  onClose,
  address,
  ethAddress,
  onSave,
  showDeleteBtn,
}: SaveAddressSheetProps) {
  const [memo, setMemo] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [emoji, setEmoji] = useState<number>(1);
  const [saveAsCEX, setSaveAsCEX] = useState<boolean>(false);
  const [addressError, setAddressError] = useState('');
  const [nameError, setNameError] = useState('');
  const [addressValue, setAddressValue] = useState('');

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { setMemo: setNewMemo, setSelectedAddress } = useSendContext() as SendContextType;

  const existingContact = AddressBook.useGetContact(address);
  const { contacts: savedContacts, loading: savedContactsLoading } = useContacts();
  const addressPrefixes = useAddressPrefixes();
  const defaultTokenLogo = useDefaultTokenLogo();
  const enterNameRef = useRef<TextInput | null>(null);

  const chains = useGetChains();

  const chain = useMemo(() => {
    try {
      let chain: SupportedChain = 'cosmos';
      if (isAptosAddress(address)) {
        chain = 'movement';
      } else if (isEthAddress(address)) {
        chain = 'ethereum';
      } else if (address.startsWith('tb1q')) {
        chain = 'bitcoinSignet';
      } else if (address.startsWith('bc1q')) {
        chain = 'bitcoin';
      } else {
        const { prefix } = decode(address);
        chain = addressPrefixes[prefix] as SupportedChain;
      }
      return chain;
    } catch (e) {
      if (isSolanaAddress(address)) {
        return 'solana';
      }
      return 'cosmos';
    }
  }, [address, addressPrefixes]);

  useEffect(() => {
    if (existingContact) {
      setName(existingContact.name);
      setEmoji(existingContact.emoji);
      setMemo(existingContact.memo ?? '');
      setSaveAsCEX(existingContact?.saveAsCEX ?? false);
      setAddressValue(existingContact.ethAddress || existingContact.address);
    }
  }, [existingContact]);

  useEffect(() => {
    if (
      isValidAddress(address) ||
      isEthAddress(address) ||
      isAptosAddress(address) ||
      isSolanaAddress(address)
    ) {
      setAddressValue(address);
    }
  }, [address]);

  useEffect(() => {
    if (isOpen && enterNameRef.current) {
      enterNameRef.current.focus();
    }
  }, [isOpen]);

  const handleNameChange = (value: string) => {
    nameError && setNameError('');
    if (value.length < 24) {
      if (
        value.length &&
        !savedContactsLoading &&
        Object.values(savedContacts).some(
          ({ name, address: sCAddress }) =>
            sCAddress !== address && name.trim().toLowerCase() === value.trim().toLowerCase(),
        )
      ) {
        setNameError('Contact with same name already exists');
      } else {
        if (nameError === 'Contact with same name already exists') {
          setNameError('');
        }
      }
      setName(value);
    }
  };

  const handleAddressChange = (value: string) => {
    addressError && setAddressError('');
    setAddressValue(value);
    if (
      value.length > 0 &&
      !isValidAddress(value) &&
      !isEthAddress(value) &&
      !isAptosAddress(value) &&
      !isSolanaAddress(value)
    ) {
      setAddressError('Invalid address');
      return;
    }
    if (Object.values(savedContacts).some(({ address: sCAddress }) => sCAddress === value)) {
      if (value !== (existingContact?.ethAddress || existingContact?.address)) {
        setAddressError('Contact with same address already exists');
        return;
      }
    }
  };

  const handleSubmit = async () => {
    if (addressError || nameError) {
      return;
    }
    if (name && addressValue && !isSaving) {
      setIsSaving(true);
      await AddressBook.save({
        address: addressValue,
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
        address: addressValue,
        chainIcon: chains[chain]?.chainSymbolImageUrl ?? defaultTokenLogo ?? '',
        emoji: emoji,
        name: name,
        avatarIcon: '',
        chainName: chains[chain]?.chainName,
        selectionType: 'saved',
      });
      onClose();
      setIsSaving(false);
      setAddressError('');
      setNameError('');
      setAddressValue('');
      setName('');
      setMemo('');
      setSaveAsCEX(false);
    }
  };

  const handleDelete = async () => {
    if (existingContact?.ethAddress || existingContact?.address) {
      setIsSaving(true);
      await AddressBook.removeEntry(existingContact?.ethAddress || existingContact?.address);
      setSelectedAddress(null);
      setName('');
      setMemo('');
      setSaveAsCEX(false);
      setAddressValue('');
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={existingContact ? 'Edit Contact' : 'Add Contact'}
      fullScreen
      secondaryActionButton={
        showDeleteBtn ? (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <TrashSimple size={32} color={Colors.gray900} weight="fill" />
          </TouchableOpacity>
        ) : null
      }
      contentStyle={styles.modalContent}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          <View style={styles.iconContainer}>
            <Image
              source={{uri: Images.Misc.getWalletIconAtIndex(0)}}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <TextInput
            style={styles.textarea}
            placeholder="Enter address"
            value={addressValue}
            onChangeText={handleAddressChange}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={Colors.gray400}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter recipient’s name"
            value={name}
            onChangeText={handleNameChange}
            ref={enterNameRef}
            placeholderTextColor={Colors.gray400}
            autoCapitalize="none"
          />
          {saveAsCEX && (
            <View style={styles.memoContainer}>
              <TextInput
                style={styles.memoInput}
                value={memo}
                placeholder="Add memo"
                onChangeText={setMemo}
                placeholderTextColor={Colors.gray400}
              />
              {memo.length === 0 ? (
                <Plus size={20} color={Colors.gray400} />
              ) : (
                <TouchableOpacity onPress={() => setMemo('')}>
                  <Text size="xs" color="text-muted-foreground" style={styles.clearMemo}>
                    Clear
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {(addressError || nameError) && (
            <Text size="xs" color="text-red-300" style={styles.errorText}>
              {addressError || nameError}
            </Text>
          )}
          {isSaving ? (
            <LoaderAnimation color={Colors.white100} />
          ) : (
            <Button
              style={styles.saveBtn}
              disabled={
                !name ||
                !addressValue ||
                !!addressError ||
                !!nameError ||
                (saveAsCEX && memo.length === 0)
              }
              onPress={handleSubmit}
            >
              Save contact
            </Button>
          )}
          <View style={styles.checkboxRow}>
            <CustomCheckbox checked={saveAsCEX} onClick={() => setSaveAsCEX((prev) => !prev)} />
            <Text style={styles.cexText}>Save as centralized exchange</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: Colors.aggregatePrimary,
    flex: 1,
    padding: 24,
  },
  formContent: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 24,
  },
  iconContainer: {
    marginBottom: 12,
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  textarea: {
    height: 90,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.aggregatePrimary,
    backgroundColor: Colors.aggregatePrimary,
    width: '100%',
    fontSize: 16,
    color: Colors.aggregatePrimary,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.aggregatePrimary,
    backgroundColor: Colors.junoPrimary,
    width: '100%',
    fontSize: 16,
    color: Colors.junoPrimary,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  memoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray50,
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  memoInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray50,
    backgroundColor: 'transparent',
    fontWeight: '500',
    marginRight: 10,
  },
  clearMemo: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    color: Colors.red300,
    fontWeight: 'bold',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  saveBtn: {
    width: '100%',
    marginTop: 12,
    borderRadius: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    justifyContent: 'center',
    width: '100%',
  },
  cexText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray50,
    marginLeft: 8,
  },
  deleteBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
    padding: 6,
  },
});
