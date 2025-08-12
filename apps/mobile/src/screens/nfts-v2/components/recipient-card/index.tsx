import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { SelectedAddressPreview } from './selected-address-preview';
import Clipboard from '@react-native-clipboard/clipboard'; // npm install @react-native-clipboard/clipboard
import { SelectedAddress, useActiveWallet, useAddress, useAddressPrefixes, useChainsStore, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { getBlockChainFromAddress, isValidAddress, pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { decode } from 'bech32';
import { AddressBook } from '../../../../utils/addressbook';
import { useContactsSearch } from '../../../../hooks/useContacts';
import { useSendNftCardContext } from '../send-nft';
import { Images } from '../../../../../assets/images';
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from '../../../../services/config/constants';
import { sliceAddress } from '../../../../utils/strings';
import { ActionInputWithPreview } from '../../../../components/action-input-with-preview';
import { SecondaryActionButton } from '../secondary-action-button';
import { ContactsMatchList, NameServiceMatchList } from './match-lists';
import { ContactsSheet } from './contacts-sheet';
import { MyWalletSheet } from './my-wallet-sheet';
import SaveAddressSheet from './save-address-sheet';
import { IBCSettings } from '../ibc-banner';

type RecipientCardProps = {
  themeColor: string;
  selectedAddress: SelectedAddress | null;
  setSelectedAddress: (s: SelectedAddress | null) => void;
  addressError?: string;
  setAddressError: (s: string) => void;
  collectionAddress: string;
  associatedSeiAddress: string;
  setAssociatedSeiAddress: React.Dispatch<React.SetStateAction<string>>;
};

const nameServiceMatcher = /^[a-zA-Z0-9_-]+\.[a-z]+$/;

export const RecipientCard = ({
  themeColor,
  selectedAddress,
  setSelectedAddress,
  addressError,
  setAddressError,
  collectionAddress,
  associatedSeiAddress,
  setAssociatedSeiAddress,
}: RecipientCardProps) => {
  const inputRef = useRef(null);
  const {
    fetchAccountDetails,
    fetchAccountDetailsData,
    fetchAccountDetailsStatus,
    setAddressWarning,
    addressWarning,
    nftSendChain: activeChain,
    nftSendNetwork: activeNetwork,
  } = useSendNftCardContext();

  const [isContactsSheetVisible, setIsContactsSheetVisible] = useState(false);
  const [isMyWalletSheetVisible, setIsMyWalletSheetVisible] = useState(false);
  const [isAddContactSheetVisible, setIsAddContactSheetVisible] = useState(false);
  const [recipientInputValue, setRecipientInputValue] = useState('');

  const [customIbcChannelId, setCustomIbcChannelId] = useState<string | undefined>();

  const { ibcSupportData, isIBCTransfer } = {
    ibcSupportData: {},
    isIBCTransfer: false,
  };

  const { chains } = useChainsStore();
  const currentWalletAddress = useAddress(activeChain);
  const addressPrefixes = useAddressPrefixes();

  const activeWallet = useActiveWallet();
  const activeChainInfo = chains[activeChain];
  const contactsToShow = useContactsSearch(recipientInputValue);
  const existingContactMatch = AddressBook.useGetContact(recipientInputValue);
  const ownWalletMatch = selectedAddress?.selectionType === 'currentWallet';

  const handleCustomIbcChannelId = useCallback(
    (value: string | undefined) => {
      if (selectedAddress?.chainName) {
        setCustomIbcChannelId(undefined);
      } else {
        setCustomIbcChannelId(value);
      }
    },
    [selectedAddress?.chainName]
  );

  const handleOnChange = useCallback(
    (value: string) => {
      setRecipientInputValue(value);
    },
    [setRecipientInputValue]
  );

  const handleContactSelect = useCallback(
    (s: SelectedAddress) => {
      setSelectedAddress(s);
      setRecipientInputValue(s.address ?? '');
      if (isContactsSheetVisible) {
        setIsContactsSheetVisible(false);
      }
    },
    [isContactsSheetVisible, setRecipientInputValue, setSelectedAddress]
  );

  const handleWalletSelect = useCallback(
    (s: SelectedAddress) => {
      setRecipientInputValue(s.address ?? '');
      setSelectedAddress(s);
    },
    [setRecipientInputValue, setSelectedAddress]
  );

  const handleAddContact = useCallback(() => {
    try {
      const { prefix } = decode(recipientInputValue);
      const chainName = addressPrefixes[prefix];
      if (!chainName) {
        setAddressError('Unsupported Chain');
        return;
      }
      setIsAddContactSheetVisible(true);
    } catch (err) {
      setAddressError('Invalid Address');
    }
  }, [addressPrefixes, recipientInputValue, setAddressError]);

  const action = useMemo(() => {
    if (recipientInputValue.length > 0) {
      return 'clear';
    }
    return 'paste';
  }, [recipientInputValue]);

  const inputButtonIcon = useMemo(() => {
    if (recipientInputValue.length > 0) {
      return Images.Misc.CrossFilled;
    }
    return undefined;
  }, [recipientInputValue]);

  const showNameServiceResults = useMemo(() => {
    const allowedTopLevelDomains = [
      ...Object.keys(addressPrefixes),
      'arch',
      'sol',
      ...['sei', 'pp'],
      'core',
      'i',
    ];
    const [, domain] = recipientInputValue.split('.');
    const isValidDomain = allowedTopLevelDomains.indexOf(domain) !== -1;
    return nameServiceMatcher.test(recipientInputValue) && isValidDomain;
  }, [recipientInputValue, addressPrefixes]);

  const showContactsList =
    recipientInputValue.trim().length > 0 && contactsToShow.length > 0;
  const isSavedContactSelected =
    selectedAddress?.address === recipientInputValue &&
    selectedAddress?.selectionType === 'saved';
  const showAddToContacts =
    !showContactsList &&
    recipientInputValue.length > 0 &&
    !isSavedContactSelected &&
    !existingContactMatch &&
    recipientInputValue !== currentWalletAddress &&
    !ownWalletMatch &&
    !showNameServiceResults;
  const showContactsButton =
    !isSavedContactSelected &&
    !showAddToContacts &&
    !existingContactMatch &&
    !selectedAddress &&
    !showNameServiceResults;
  const showMyWalletButton =
    !isSavedContactSelected &&
    !showAddToContacts &&
    !existingContactMatch &&
    !selectedAddress &&
    !showNameServiceResults &&
    activeNetwork === 'mainnet' &&
    false;

  const showSecondaryActions =
    showContactsButton || showMyWalletButton || showAddToContacts;

  useEffect(() => {
    switch (fetchAccountDetailsStatus) {
      case 'loading': {
        setAddressWarning(
          `Recipient will receive this on address: (loading...)`
        );
        break;
      }
      case 'success': {
        if (fetchAccountDetailsData?.pubKey.key) {
          const recipient0xAddress = pubKeyToEvmAddressToShow(
            fetchAccountDetailsData.pubKey.key
          );
          if (recipient0xAddress.toLowerCase().startsWith('0x')) {
            setAddressWarning(
              `Recipient will receive the NFT on associated EVM address: ${recipient0xAddress}`
            );
          } else {
            setAddressError('You can only send this NFT to an EVM address.');
          }
        }
        break;
      }
      case 'error': {
        setAddressError('You can only send this NFT to an EVM address.');
        break;
      }
      default: {
        setAddressWarning('');
        setAddressError('');
      }
    }
  }, [fetchAccountDetailsData?.pubKey.key, fetchAccountDetailsStatus, setAddressError, setAddressWarning]);

  useEffect(() => {
    (async function () {
      setAssociatedSeiAddress('');

      if (currentWalletAddress === recipientInputValue) {
        setAddressError('Cannot send to self');
      } else if (
        collectionAddress.toLowerCase().startsWith('0x') &&
        recipientInputValue
      ) {
        if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
          setAddressError(SEI_EVM_LEDGER_ERROR_MESSAGE);
          return;
        }

        if (
          !recipientInputValue.toLowerCase().startsWith('0x') &&
          recipientInputValue.length >= 42
        ) {
          await fetchAccountDetails(recipientInputValue);
        }
      } else if (
        recipientInputValue &&
        !isValidAddress(recipientInputValue) &&
        !showNameServiceResults
      ) {
        setAddressError('Invalid address');
      } else {
        setAddressError('');
        setAddressWarning('');
      }
    })();
  }, [collectionAddress, currentWalletAddress, recipientInputValue, setAddressError, showNameServiceResults, activeWallet?.walletType, activeChain, activeNetwork, setAssociatedSeiAddress, fetchAccountDetails, setAddressWarning]);

  useEffect(() => {
    if (recipientInputValue === selectedAddress?.address) {
      return;
    }
    const cleanInputValue = recipientInputValue.trim();
    if (selectedAddress && cleanInputValue !== selectedAddress.address) {
      setSelectedAddress(null);
      return;
    }
    try {
      if (
        cleanInputValue.toLowerCase().startsWith('0x') &&
        (collectionAddress.toLowerCase().startsWith('0x') ||
          (!collectionAddress.toLowerCase().startsWith('0x') &&
            associatedSeiAddress))
      ) {
        setSelectedAddress({
          address: cleanInputValue,
          name: sliceAddress(cleanInputValue),
          avatarIcon: activeChainInfo.chainSymbolImageUrl ?? '',
          emoji: undefined,
          chainIcon: activeChainInfo.chainSymbolImageUrl ?? '',
          chainName: activeChainInfo.key,
          selectionType: 'notSaved',
        });
        return;
      }

      const { prefix } = decode(cleanInputValue);
      const _chain = addressPrefixes[prefix] as SupportedChain;
      const img = chains[_chain].chainSymbolImageUrl;

      setSelectedAddress({
        address: cleanInputValue,
        name: sliceAddress(cleanInputValue),
        avatarIcon: img ?? '',
        emoji: undefined,
        chainIcon: img ?? '',
        chainName: _chain,
        selectionType: 'notSaved',
      });
    } catch (err) {
      // swallow error
    }
  }, [
    activeChainInfo.chainSymbolImageUrl,
    activeChainInfo.key,
    addressPrefixes,
    associatedSeiAddress,
    chains,
    collectionAddress,
    currentWalletAddress,
    recipientInputValue,
    selectedAddress,
    setSelectedAddress,
  ]);

  useEffect(() => {
    if (existingContactMatch) {
      const shouldUpdate =
        existingContactMatch.address !== selectedAddress?.address ||
        existingContactMatch.name !== selectedAddress?.name ||
        existingContactMatch.emoji !== selectedAddress?.emoji ||
        existingContactMatch.blockchain !== selectedAddress?.chainName;

      if (shouldUpdate) {
        const img = chains[existingContactMatch.blockchain].chainSymbolImageUrl;
        setSelectedAddress({
          address: existingContactMatch.address,
          name: existingContactMatch.name,
          avatarIcon: undefined,
          emoji: existingContactMatch.emoji,
          chainIcon: img ?? '',
          chainName: existingContactMatch.blockchain,
          selectionType: 'saved',
        });
      }
    }
  }, [chains, existingContactMatch, recipientInputValue, selectedAddress, setSelectedAddress]);

  const destChainInfo = useMemo(() => {
    if (!selectedAddress?.address) {
      return null;
    }
    const destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address);
    if (!destChainAddrPrefix) {
      return null;
    }
    const destinationChainKey = addressPrefixes[destChainAddrPrefix] as SupportedChain | undefined;
    if (!destinationChainKey) {
      return null;
    }
    return chains[destinationChainKey];
  }, [addressPrefixes, chains, selectedAddress?.address]);

  useEffect(() => {
    let destinationChain;
    if (
      (selectedAddress?.address ?? '').toLowerCase().startsWith('0x') &&
      (collectionAddress.toLowerCase().startsWith('0x') ||
        (!collectionAddress.toLowerCase().startsWith('0x') && associatedSeiAddress))
    ) {
      return;
    }

    if (selectedAddress?.address) {
      const destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address);

      if (!destChainAddrPrefix) {
        setAddressError('Invalid Address');
        return;
      } else {
        destinationChain = addressPrefixes[destChainAddrPrefix];
      }
    } else {
      return;
    }

    const isIBC = destinationChain !== activeChain;
    if (!isIBC) {
      return;
    }

    if (isIBC && activeNetwork === 'testnet') {
      setAddressError(`IBC not supported on testnet`);
      return;
    }

    if (destinationChain && ibcSupportData !== undefined) {
      if (customIbcChannelId) {
        setAddressError('');
      } else {
        setAddressError(
          `IBC not supported between ${chains[destinationChain as SupportedChain].chainName} and ${
            chains[activeChain].chainName
          }`
        );
      }
    }
  }, [
    activeChain,
    activeNetwork,
    activeChainInfo,
    ibcSupportData,
    selectedAddress,
    setAddressError,
    currentWalletAddress,
    customIbcChannelId,
    chains,
    addressPrefixes,
    collectionAddress,
    associatedSeiAddress,
  ]);


  const preview = useMemo(() => {
    if (selectedAddress) {
      return (
        <SelectedAddressPreview
          selectedAddress={selectedAddress}
          showEditMenu={false}
          onDelete={() => {
            setSelectedAddress(null);
            setRecipientInputValue('');
          }}
        />
      );
    }
    if (recipientInputValue.length > 0) {
      try {
        decode(recipientInputValue);
        return (
          <Text style={styles.previewText}>
            {sliceAddress(recipientInputValue)}
          </Text>
        );
      } catch (err) {
        return null;
      }
    }
    return null;
  }, [selectedAddress, recipientInputValue, setSelectedAddress]);

  const actionHandler = useCallback(
    async (_action: string) => {
      switch (_action) {
        case 'paste':
          const text = await Clipboard.getString();
          if (!text) return;
          setRecipientInputValue(text.trim());
          break;
        case 'clear':
          setRecipientInputValue('');
          setSelectedAddress(null);
          break;
        default:
          break;
      }
    },
    [setRecipientInputValue, setSelectedAddress]
  );

  return (
    <View>
      <MotiView
      style={[styles.cardContainer, isIBCTransfer && styles.roundedBottomNone]}>
        <Text style={styles.label}>Recipient</Text>

        {/* Adapt ActionInputWithPreview for RN, see note below */}
        <ActionInputWithPreview
          invalid={!!addressError}
          warning={!!addressWarning}
          action={action}
          buttonText={action}
          buttonTextColor={themeColor}
          icon={inputButtonIcon}
          value={recipientInputValue}
          onAction={actionHandler}
          onChangeText={handleOnChange}
          placeholder="Enter name or address"
          autoComplete="off"
          spellCheck={false}
          style={styles.input}
          preview={preview}
          ref={inputRef}
        />

        {addressError ? (
          <Text style={styles.errorText}>{addressError}</Text>
        ) : null}
        {addressWarning ? (
          <Text style={styles.warningText}>{addressWarning}</Text>
        ) : null}

        {/* Secondary actions as buttons */}
        {showSecondaryActions ? (
          <View style={styles.secondaryActions}>
            {showContactsButton ? (
              <SecondaryActionButton
                leftIcon={Images.Misc.Contacts}
                onPress={() => setIsContactsSheetVisible(true)}
                actionLabel="Open Contacts Sheet"
              >
                <Text style={styles.secondaryButtonText}>Contacts</Text>
              </SecondaryActionButton>
            ) : null}
            {showMyWalletButton ? (
              <SecondaryActionButton
                leftIcon={Images.Misc.WalletIcon2}
                onPress={() => setIsMyWalletSheetVisible(true)}
                actionLabel="Show My Wallets on Other Chains"
              >
                <Text style={styles.secondaryButtonText}>My Wallet</Text>
              </SecondaryActionButton>
            ) : null}
            {showAddToContacts ? (
              <SecondaryActionButton
                leftIcon={Images.Misc.AddContact}
                onPress={handleAddContact}
                actionLabel="Add Contact to Address Book"
              >
                <Text style={styles.secondaryButtonText}>Add Contact</Text>
              </SecondaryActionButton>
            ) : null}
          </View>
        ) : null}

        {/* Contacts/Name Service lists, modals, etc., should also be RN components */}
        {showContactsList ? (
          <ContactsMatchList contacts={contactsToShow} handleContactSelect={handleContactSelect} />
        ) : null}
        {showNameServiceResults ? (
          <NameServiceMatchList address={recipientInputValue} handleContactSelect={handleContactSelect} />
        ) : null}

        <ContactsSheet
          isOpen={isContactsSheetVisible}
          onContactSelect={handleContactSelect}
          onClose={() => setIsContactsSheetVisible(false)}
        />

        <MyWalletSheet
          isOpen={isMyWalletSheetVisible}
          setSelectedAddress={handleWalletSelect}
          onClose={() => setIsMyWalletSheetVisible(false)}
        />

        <SaveAddressSheet
          isOpen={isAddContactSheetVisible}
          onSave={handleContactSelect}
          onClose={() => setIsAddContactSheetVisible(false)}
          address={recipientInputValue}
        />
      </MotiView>
      {isIBCTransfer && activeNetwork === 'mainnet' && destChainInfo ? (
        <IBCSettings
          style={styles.roundedBottom2xl}
          targetChain={destChainInfo.key}
          onSelectChannel={handleCustomIbcChannelId}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginVertical: 12,
    // add more style as needed
  },
  roundedBottomNone: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  roundedBottom2xl: {
    borderBottomLeftRadius: 24,  // 2xl in Tailwind is 1.5rem = 24px
    borderBottomRightRadius: 24,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 4,
  },
  previewText: {
    color: '#222',
    fontSize: 16,
    marginTop: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  warningText: {
    color: '#f59e42',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    marginLeft: 4,
  },
});