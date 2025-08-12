import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  SelectedAddress,
  useActiveWallet,
  useAddress,
  useAddressPrefixes,
  useChainsStore,
  useFeatureFlags,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  BTC_CHAINS,
  getBech32Address,
  getBlockChainFromAddress,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  isValidBtcAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import {
  ChainFeatureFlagsStore,
  ChainTagsStore,
  RootCW20DenomsStore,
  RootERC20DenomsStore,
} from '@leapwallet/cosmos-wallet-store';
import {
  Asset,
  SkipDestinationChain,
  useSkipDestinationChains,
  useSkipSupportedChains,
} from '@leapwallet/elements-hooks';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import { AddressBook as AddressBookIcon, CaretDown, UserPlus, Wallet as WalletIcon } from 'phosphor-react-native';
import { decode } from 'bech32';
import { ActionInputWithPreview } from '../../../../components/action-input-with-preview';
import { LoaderAnimation } from '../../../../components/loader/Loader';
import Text from '../../../../components/text';
import { useContactsSearch } from '../../../../hooks/useContacts';
import useQuery from '../../../../hooks/useQuery';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../../assets/images';
import * as sol from 'micro-sol-signer';
import { observer } from 'mobx-react-lite';
import { useSendContext } from '../../../send-v2/context';
import { chainInfoStore } from '../../../../context/chain-infos-store';
import { manageChainsStore } from '../../../../context/manage-chains-store';
import { Colors } from '../../../../theme/colors';
import { AddressBook } from '../../../../utils/addressbook';
import { UserClipboard } from '../../../../utils/clipboard';
import { isLedgerEnabled } from '../../../../utils/isLedgerEnabled';
import { sliceAddress } from '../../../../utils/strings';

import { useCheckAddressError } from '../../hooks/useCheckAddressError';
import { useCheckIbcTransfer } from '../../hooks/useCheckIbcTransfer';
import { useFillAddressWarning } from '../../hooks/useFillAddressWarning';
import { NameServiceMatchList } from './match-lists';
import SaveAddressSheet from './save-address-sheet';
import { SecondaryActionButton } from './secondary-action-button';
import { DestinationType, SelectDestinationSheet } from './select-destination-sheet';
import { SelectedAddressPreview } from './selected-address-preview';
import { SelectInitiaChainSheet } from './SelectInitiaChainSheet';
import { MotiView } from 'moti';

type RecipientCardProps = {
  themeColor: string;
  rootERC20DenomsStore: RootERC20DenomsStore;
  rootCW20DenomsStore: RootCW20DenomsStore;
  chainTagsStore: ChainTagsStore;
  chainFeatureFlagsStore: ChainFeatureFlagsStore;
};

const nameServiceMatcher = /^[a-zA-Z0-9_-]+\.[a-z]+$/;

export const RecipientCard = observer(
  ({ rootERC20DenomsStore, rootCW20DenomsStore, chainFeatureFlagsStore }: RecipientCardProps) => {
    const recipient = useQuery().get('recipient') ?? undefined;
    const [isAddContactSheetVisible, setIsAddContactSheetVisible] = useState<boolean>(false);
    const [recipientInputValue, setRecipientInputValue] = useState<string>(recipient ?? '');

    const [isSelectInitiaChainSheetVisible, setIsSelectInitiaChainSheetVisible] = useState(false);
    const [selectedInitiaChain, setSelectedInitiaChain] = useState<SupportedChain | null>(null);

    const [isDestinationSheetVisible, setIsDestinationSheetVisible] = useState<DestinationType | null>(null);

    /**
     * Global Hooks
     */

    const {
      ethAddress,
      selectedAddress,
      setSelectedAddress,
      addressError,
      setAddressError,
      isIBCTransfer,
      setMemo,
      setCustomIbcChannelId,
      setEthAddress,
      selectedToken,
      addressWarning,
      setAddressWarning,
      isIbcUnwindingDisabled,
      fetchAccountDetails,
      fetchAccountDetailsData,
      fetchAccountDetailsStatus,
      setFetchAccountDetailsData,
      setAssociatedSeiAddress,
      sendActiveChain,
      sendSelectedNetwork,
      associatedSeiAddress,
      setAssociated0xAddress,
      setHasToUsePointerLogic,
    } = useSendContext();

    const { chains } = useChainsStore();
    const { theme } = useTheme();
    const currentWalletAddress = useAddress();
    const addressPrefixes = useAddressPrefixes();

    const defaultTokenLogo = useDefaultTokenLogo();
    const activeWallet = useActiveWallet();

    const { data: elementsChains } = useSkipSupportedChains({ chainTypes: ['cosmos'] });
    const { data: featureFlags } = useFeatureFlags();

    /**
     * Local Variables
     */

    const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms;
    const allCW20Denoms = rootCW20DenomsStore.allCW20Denoms;

    const activeChainInfo = chains[sendActiveChain];
    const isDark = theme === ThemeName.DARK;
    const ownWalletMatch = selectedAddress?.selectionType === 'currentWallet';
    const isBtcTx = BTC_CHAINS.includes(sendActiveChain);
    const isAptosTx = isAptosChain(sendActiveChain);
    const isSolanaTx = isSolanaChain(sendActiveChain);
    const isSuiTx = isSuiChain(sendActiveChain);
    const asset: Asset = {
      denom: selectedToken?.ibcDenom || selectedToken?.coinMinimalDenom || '',
      symbol: selectedToken?.symbol || '',
      logoUri: selectedToken?.img || '',
      decimals: selectedToken?.coinDecimals || 0,
      originDenom: selectedToken?.coinMinimalDenom || '',
      denomTracePath: selectedToken?.ibcChainInfo ? `transfer/${selectedToken.ibcChainInfo?.channelId}` : '',
    };

    const sourceChain = elementsChains?.find((chain) => chain.chainId === activeChainInfo.chainId);
    const { data: skipSupportedDestinationChains } =
      featureFlags?.ibc?.extension !== 'disabled'
        ? useSkipDestinationChains(asset, sourceChain, sendSelectedNetwork === 'mainnet')
        : { data: null };

    const isSavedContactSelected =
      selectedAddress?.address === recipientInputValue && selectedAddress?.selectionType === 'saved';

    const recipientValueToShow = useMemo(() => {
      if (ethAddress) {
        return ethAddress;
      }

      return recipientInputValue;
    }, [ethAddress, recipientInputValue]);

    const contactsToShow = useContactsSearch(recipientValueToShow);
    const existingContactMatch = AddressBook.useGetContact(recipientValueToShow);

    const action = recipientInputValue.length > 0 ? 'clear' : 'paste';

    const inputButtonIcon = useMemo(() => {
      if (recipientInputValue.length > 0) {
        return Images.Misc.CrossFilled;
      }
      return undefined;
    }, [recipientInputValue]);

    const showNameServiceResults = useMemo(() => {
      const allowedTopLevelDomains = [
        ...Object.keys(addressPrefixes), // for ibcdomains, icns, stargazenames
        'arch', // for archId
        'sol', // for injective .sol domains by SNS
        ...['sei', 'pp'], // for degeNS
        'core', // for bdd
        'i', //for celestials.id
      ];
      // ex: leap.arch --> name = leap, domain = arch
      const [, domain] = recipientInputValue.split('.');
      const isValidDomain = allowedTopLevelDomains.indexOf(domain) !== -1;
      return nameServiceMatcher.test(recipientInputValue) && isValidDomain;
    }, [recipientInputValue, addressPrefixes]);

    const preview = useMemo(() => {
      if (selectedAddress) {
        return (
          <SelectedAddressPreview
            selectedAddress={selectedAddress}
            showEditMenu={
              selectedAddress.address === existingContactMatch?.address &&
              selectedAddress.ethAddress === existingContactMatch?.ethAddress
            }
            onDelete={() => {
              setSelectedAddress(null);
              setRecipientInputValue('');
              setEthAddress('');
            }}
          />
        );
      }

      if (recipientValueToShow.length > 0) {
        try {
          decode(recipientValueToShow);
          return (
            <Text size='md' style={{ color: isDark ? '#e5e7eb' : '#1f2937' }}>
              {sliceAddress(recipientValueToShow)}
            </Text>
          );
        } catch (err) {
          return undefined;
        }
      }

      return undefined;
    }, [existingContactMatch?.address, existingContactMatch?.ethAddress, isDark, recipientValueToShow, selectedAddress, setEthAddress, setSelectedAddress]);

    const skipSupportedDestinationChainsIDs: string[] = useMemo(() => {
      return (
        (skipSupportedDestinationChains as Array<Extract<SkipDestinationChain, { chainType: 'cosmos' }>>)
          ?.filter((chain) => {
            if (chain.chainType !== 'cosmos') {
              return false;
            }
            if (
              (activeWallet?.walletType === WALLETTYPE.LEDGER &&
                !isLedgerEnabled(chain.key as SupportedChain, chain.coinType, Object.values(chains))) ||
              !activeWallet?.addresses[chain.key as SupportedChain]
            ) {
              return false;
            } else {
              return true;
            }
          })
          .map((chain) => {
            return chain.chainId;
          }) || []
      );
    }, [skipSupportedDestinationChains, activeWallet?.walletType, activeWallet?.addresses, chains]);

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

      if (destinationChainKey === 'initiaEvm') {
        if (selectedInitiaChain) {
          return chains[selectedInitiaChain];
        }
      }

      // we are sure that the key is there in the chains object due to previous checks
      return chains[destinationChainKey];
    }, [addressPrefixes, chains, selectedAddress?.address, selectedInitiaChain]);

    const chainFeatureFlags = chainFeatureFlagsStore.chainFeatureFlagsData;

    const minitiaChains = useMemo(() => {
      const _minitiaChains: string[] = [];
      Object.keys(chainFeatureFlags)
        .filter((chain) => chainFeatureFlags[chain].chainType === 'minitia')
        .forEach((c) => {
          if (chains[c as SupportedChain]) {
            _minitiaChains.push(c);
          }
          const _chain = Object.values(chains).find((chainInfo) =>
            sendSelectedNetwork === 'testnet' ? chainInfo?.testnetChainId === c : chainInfo?.chainId === c,
          );
          if (_chain) {
            _minitiaChains.push(_chain.key);
          }
        });
      return _minitiaChains;
    }, [chainFeatureFlags, chains, sendSelectedNetwork]);

    const showContactsList = recipientInputValue.trim().length > 0 && contactsToShow.length > 0;

    const showAddToContacts =
      !showContactsList &&
      recipientInputValue.length > 0 &&
      !isSavedContactSelected &&
      !existingContactMatch &&
      recipientInputValue !== currentWalletAddress &&
      !ownWalletMatch &&
      !showNameServiceResults &&
      !addressError?.includes('The entered address is invalid');

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
      sendSelectedNetwork === 'mainnet';

    const showSecondaryActions = showContactsButton || showMyWalletButton || showAddToContacts;

    const fillRecipientInputValue = useCallback(
      (value: string) => {
        if (chains[sendActiveChain]?.evmOnlyChain && value.toLowerCase().startsWith('0x')) {
          setAddressError(undefined);
          setEthAddress(value);
          setRecipientInputValue(value);
        } else if (
          Number(activeChainInfo.bip44.coinType) === 60 &&
          value.toLowerCase().startsWith('0x') &&
          activeChainInfo.key !== 'injective'
        ) {
          try {
            setAddressError(undefined);
            const bech32Address = getBech32Address(activeChainInfo.addressPrefix, value);
            setEthAddress(value);
            setRecipientInputValue(bech32Address);
            return;
          } catch (e) {
            setAddressError('The entered address is invalid');
          }
        }

        setEthAddress('');
        setRecipientInputValue(value);
      },
      [
        activeChainInfo.addressPrefix,
        activeChainInfo.bip44.coinType,
        activeChainInfo.key,
        chains,
        sendActiveChain,
        setAddressError,
        setEthAddress,
      ],
    );

    const handleOnChange = useCallback(
      (value: string) => {
        fillRecipientInputValue(value);
      },
      [fillRecipientInputValue],
    );

    const actionHandler = useCallback(
      (value: string, _action: string) => {
        switch (_action) {
          case 'paste':
            UserClipboard.pasteText().then((text) => {
              if (!text) return;
              setRecipientInputValue(text.trim());
            });
            break;
          case 'clear':
            setEthAddress('');
            setRecipientInputValue('');
            setSelectedAddress(null);
            setMemo('');
            break;
          default:
            break;
        }
      },

      [setEthAddress, setMemo, setSelectedAddress],
    );

    const handleContactSelect = useCallback(
      (s: SelectedAddress) => {
        setSelectedAddress(s);
        setEthAddress(s.ethAddress ?? '');
        setRecipientInputValue(s.address ?? '');
        if (isDestinationSheetVisible) {
          setIsDestinationSheetVisible(null);
        }
      },
      [isDestinationSheetVisible, setEthAddress, setSelectedAddress],
    );

    const handleWalletSelect = useCallback(
      (s: SelectedAddress) => {
        setAddressError(undefined);
        setRecipientInputValue(s.address ?? '');
        setSelectedAddress(s);
        setIsDestinationSheetVisible(null);
      },
      [setAddressError, setSelectedAddress],
    );

    const handleAddContact = useCallback(() => {
      try {
        if (
          isAptosTx ||
          isSolanaTx ||
          isSuiTx ||
          (chains[sendActiveChain]?.evmOnlyChain && recipientInputValue.toLowerCase().startsWith('0x'))
        ) {
          setIsAddContactSheetVisible(true);
          return;
        }

        const prefix = getBlockChainFromAddress(recipientInputValue);
        const chainName = addressPrefixes[prefix ?? ''];
        if (!chainName) {
          setAddressError('Unsupported Chain');
          return;
        }
        setIsAddContactSheetVisible(true);
      } catch (err) {
        setAddressError('The entered address is invalid');
      }
    }, [
      addressPrefixes,
      chains,
      isAptosTx,
      isSolanaTx,
      isSuiTx,
      recipientInputValue,
      sendActiveChain,
      setAddressError,
    ]);

    const handleSelectInitiaClick = useCallback(() => {
      setIsSelectInitiaChainSheetVisible(true);
    }, []);

    /**
     * Effect Hooks
     */

    useFillAddressWarning({
      fetchAccountDetailsData,
      fetchAccountDetailsStatus,

      addressWarningElementError: (
        <>
          Recipient will receive this on address:{' '}
          <LoaderAnimation color={Colors.white100} style={{height: 20, width: 20}} />
        </>
      ),
      setAddressWarning,
    });

    useCheckAddressError({
      setAssociatedSeiAddress,
      setAssociated0xAddress,

      setAddressError,
      setAddressWarning,
      setFetchAccountDetailsData,
      fetchAccountDetails,

      selectedToken,
      recipientInputValue,
      allCW20Denoms,
      allERC20Denoms,
      addressWarningElementError: (
        <>
          Checking the Ox and Sei address link status{' '}
          <LoaderAnimation color={Colors.white100} style={{height: 20, width: 20}} />
        </>
      ),
      showNameServiceResults,

      sendActiveChain,
      sendSelectedNetwork,
      setHasToUsePointerLogic,
    });

    useEffect(() => {
      // Autofill of recipientInputValue if passed in information
      if (showNameServiceResults) {
        setAddressError(undefined);
        return;
      }
      if (selectedAddress?.information?.autofill) {
        setRecipientInputValue(selectedAddress?.address || '');
        return;
      }
      const cleanInputValue = recipientInputValue?.trim();

      if (recipientInputValue === selectedAddress?.address) {
        const isEvmChain = chains[sendActiveChain]?.evmOnlyChain;
        const isEvmAddress = cleanInputValue?.toLowerCase()?.startsWith('0x');
        const isSameChain = sendActiveChain === selectedAddress?.chainName;

        if (isEvmChain && isEvmAddress) {
          if (isSameChain || selectedAddress?.selectionType === 'saved') {
            return;
          }
        } else {
          if (!selectedInitiaChain) return;
          if (selectedInitiaChain === selectedAddress?.chainName) return;
        }
      }

      if (selectedAddress && cleanInputValue !== selectedAddress.address) {
        setSelectedAddress(null);
        return;
      }

      try {
        if (cleanInputValue.length === 0) {
          setAddressError(undefined);
          return;
        }

        if (isSuiTx) {
          const img = activeChainInfo.chainSymbolImageUrl ?? '';

          setSelectedAddress({
            ethAddress: cleanInputValue,
            address: cleanInputValue,
            name: sliceAddress(cleanInputValue),
            avatarIcon: activeChainInfo.chainSymbolImageUrl ?? '',
            emoji: undefined,
            chainIcon: img ?? '',
            chainName: activeChainInfo.key,
            selectionType: 'notSaved',
          });

          return;
        }

        if (isAptosTx || (chains[sendActiveChain]?.evmOnlyChain && cleanInputValue.toLowerCase().startsWith('0x'))) {
          const img = activeChainInfo.chainSymbolImageUrl ?? '';

          setSelectedAddress({
            ethAddress: cleanInputValue,
            address: cleanInputValue,
            name: sliceAddress(cleanInputValue),
            avatarIcon: activeChainInfo.chainSymbolImageUrl ?? '',
            emoji: undefined,
            chainIcon: img ?? '',
            chainName: activeChainInfo.key,
            selectionType: 'notSaved',
          });

          return;
        }

        if (isSolanaTx) {
          if (sol.isOnCurve(recipientInputValue)) {
            const img = chains[sendActiveChain]?.chainSymbolImageUrl ?? defaultTokenLogo;

            setSelectedAddress({
              ethAddress: cleanInputValue,
              address: cleanInputValue,
              name: sliceAddress(cleanInputValue),
              avatarIcon: img ?? '',
              emoji: undefined,
              chainIcon: img ?? '',
              chainName: sendActiveChain,
              selectionType: 'notSaved',
            });
            return;
          } else {
            return;
          }
        }

        if (isSuiTx) {
          return;
        }

        if (isBtcTx && !isValidBtcAddress(cleanInputValue, sendActiveChain === 'bitcoin' ? 'mainnet' : 'testnet')) {
          return;
        }

        const { prefix } = isBtcTx ? { prefix: '' } : decode(cleanInputValue);
        let _chain = addressPrefixes[prefix] as SupportedChain;

        if (_chain !== 'noble' && selectedToken?.coinMinimalDenom === 'uusdn') {
          setAddressError('IBC transfer is not supported for USDN');
          return;
        }

        if (prefix === 'init' && selectedInitiaChain) {
          _chain = selectedInitiaChain;
        }

        if (sendActiveChain === 'bitcoin') {
          _chain = 'bitcoin';
        }

        if (sendActiveChain === 'bitcoinSignet') {
          _chain = 'bitcoinSignet';
        }

        const img = chains[_chain]?.chainSymbolImageUrl ?? defaultTokenLogo;

        setSelectedAddress({
          ethAddress,
          address: cleanInputValue,
          name: sliceAddress(cleanInputValue),
          avatarIcon: img ?? '',
          emoji: undefined,
          chainIcon: img ?? '',
          chainName: _chain,
          selectionType: 'notSaved',
        });
      } catch (err) {
        if (!(err as Error)?.message?.includes('too short')) {
          setAddressError('Invalid Address');
        }
      }
    }, [addressPrefixes, chains, currentWalletAddress, recipientInputValue, selectedAddress, setSelectedAddress, showNameServiceResults, sendActiveChain, selectedInitiaChain, selectedToken, setAddressError, isSuiTx, isAptosTx, isSolanaTx, isBtcTx, defaultTokenLogo, ethAddress, activeChainInfo.chainSymbolImageUrl, activeChainInfo.key]);

    useEffect(() => {
      if (existingContactMatch && selectedAddress && !selectedInitiaChain) {
        const shouldUpdate =
          existingContactMatch.ethAddress !== selectedAddress?.ethAddress ||
          existingContactMatch.address !== selectedAddress?.address ||
          existingContactMatch.name !== selectedAddress?.name ||
          existingContactMatch.emoji !== selectedAddress?.emoji ||
          existingContactMatch.blockchain !== selectedAddress?.chainName;

        if (shouldUpdate) {
          const img = chains[existingContactMatch.blockchain]?.chainSymbolImageUrl ?? defaultTokenLogo;
          setMemo(existingContactMatch.memo ?? '');

          setSelectedAddress({
            ethAddress: existingContactMatch?.ethAddress,
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

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      chains,
      existingContactMatch,
      recipientInputValue,
      selectedAddress,
      setMemo,
      setSelectedAddress,
      selectedInitiaChain,
    ]);

    useCheckIbcTransfer({
      sendActiveChain,
      selectedAddress,

      associatedSeiAddress,
      sendSelectedNetwork,
      isIbcUnwindingDisabled,
      skipSupportedDestinationChainsIDs,
      selectedToken,

      setAddressError,
      manageChainsStore,
    });

    useEffect(() => {
      if (selectedAddress?.chainName) {
        setCustomIbcChannelId(undefined);
      }
    }, [selectedAddress?.chainName, setCustomIbcChannelId]);

    useEffect(() => {
      if (minitiaChains.includes(sendActiveChain)) {
        setSelectedInitiaChain(sendActiveChain);
      }
    }, [minitiaChains, sendActiveChain]);

    const isNotIBCError = addressError ? !addressError.includes('IBC transfers are not supported') : false;

    return (
      <MotiView style={styles.cardOuter}>
        {/* Action Input */}
        <ActionInputWithPreview
          invalid={!!isNotIBCError}
          warning={!!addressWarning.message}
          action={action}
          buttonText={action}
          icon={inputButtonIcon}
          value={recipientValueToShow}
          onAction={actionHandler}
          onChangeText={handleOnChange}
          placeholder="Enter recipient address or contact"
          autoComplete="off"
          spellCheck={false}
          style={[
            styles.input,
            !isNotIBCError && !addressWarning.message && styles.inputActive,
          ]}
          preview={preview}
        />

        {/* Error/Warning Text */}
        {isNotIBCError ? (
          <Text size="xs" style={styles.errorText}>
            {addressError}
          </Text>
        ) : null}
        {addressWarning.message ? (
          <Text size="xs" style={styles.warningText}>
            {addressWarning.message}
          </Text>
        ) : null}

        {/* Secondary Action Buttons */}
        <View style={styles.actionsRow}>
          <View style={styles.actionsWrap}>
            {showSecondaryActions && (
              <>
                {showContactsButton && (
                  <SecondaryActionButton
                    leftIcon={
                      <AddressBookIcon size={12} color="#444" style={{ marginRight: 4 }} />
                    }
                    onPress={() => setIsDestinationSheetVisible('My Contacts')}
                    actionLabel="Open Contacts Sheet"
                  >
                    <Text size="xs" style={styles.actionLabel}>
                      Contacts
                    </Text>
                  </SecondaryActionButton>
                )}
                {showMyWalletButton && (
                  <SecondaryActionButton
                    leftIcon={
                      <WalletIcon size={12} color="#444" style={{ marginRight: 4 }} />
                    }
                    onPress={() => setIsDestinationSheetVisible('My Wallets')}
                    actionLabel="Show My Wallets on Other Chains"
                  >
                    <Text size="xs" style={styles.actionLabel}>
                      My Wallets
                    </Text>
                  </SecondaryActionButton>
                )}
                {showAddToContacts && (
                  <SecondaryActionButton
                    leftIcon={
                      <UserPlus size={12} color="#444" style={{ marginRight: 4 }} />
                    }
                    onPress={handleAddContact}
                    actionLabel="Add Contact to Address Book"
                  >
                    <Text size="xs" style={styles.actionLabel}>
                      Add Contact
                    </Text>
                  </SecondaryActionButton>
                )}
              </>
            )}
            {/* IBC Transfer Badge */}
            {isIBCTransfer && sendSelectedNetwork === 'mainnet' && destChainInfo && (
              <View style={styles.ibcTag}>
                <Images.Misc.IbcProtocol color={isDark ? '#E0B9F4' : '#A22CDD'} />
                <Text
                  size="xs"
                  style={{
                    color: isDark ? '#E0B9F4' : '#A22CDD',
                    fontWeight: '500',
                    marginLeft: 4,
                  }}
                >
                  IBC Transfer
                </Text>
              </View>
            )}
            {/* Initia Chain Selection */}
            {destChainInfo &&
              minitiaChains.includes(destChainInfo.key) &&
              minitiaChains.includes(sendActiveChain) && (
                <TouchableOpacity
                  onPress={handleSelectInitiaClick}
                  style={styles.initiaSelector}
                  activeOpacity={0.7}
                >
                  <Text size="xs" style={styles.initiaText}>
                    {destChainInfo.chainName}
                  </Text>
                  <CaretDown size={10} color="#222" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              )}
          </View>
        </View>

        {/* Name Service Results */}
        {showNameServiceResults ? (
          <NameServiceMatchList address={recipientInputValue} handleContactSelect={handleContactSelect} />
        ) : null}

        {/* Bottom Sheets/Modals */}
        <SelectDestinationSheet
          isOpenType={isDestinationSheetVisible}
          setSelectedAddress={handleWalletSelect}
          handleContactSelect={handleContactSelect}
          onClose={() => setIsDestinationSheetVisible(null)}
          skipSupportedDestinationChainsIDs={skipSupportedDestinationChainsIDs}
          showOnlyMyWallets={selectedToken?.coinMinimalDenom === 'uusdn' && selectedToken?.chain === 'noble'}
        />
        <SelectInitiaChainSheet
          isOpen={isSelectInitiaChainSheetVisible}
          setSelectedInitiaChain={setSelectedInitiaChain}
          onClose={() => setIsSelectInitiaChainSheetVisible(false)}
          chainFeatureFlagsStore={chainFeatureFlagsStore}
          chainInfoStore={chainInfoStore}
          selectedNetwork={sendSelectedNetwork}
        />
        <SaveAddressSheet
          isOpen={isAddContactSheetVisible}
          onSave={handleContactSelect}
          onClose={() => setIsAddContactSheetVisible(false)}
          address={recipientInputValue}
          ethAddress={ethAddress}
          sendActiveChain={sendActiveChain}
        />
      </MotiView>
    );
  },
);

const styles = StyleSheet.create({
  cardOuter: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff', // you may add dynamic dark color
    marginBottom: 12,
  },
  input: {
    borderColor: 'transparent',
    borderRadius: 12,
    height: 48,
    paddingLeft: 16,
    paddingVertical: 4,
    fontSize: 16,
    backgroundColor: '#F6F6F7',
    fontWeight: '500',
    color: '#18181B',
  },
  inputActive: {
    borderColor: '#16a34a',
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
    fontWeight: 'bold',
    marginTop: 8,
    marginLeft: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#facc15',
    fontWeight: 'bold',
    marginTop: 8,
    marginLeft: 4,
  },
  actionsRow: {
    width: '100%',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    alignItems: 'center',
  },
  actionLabel: {
    color: '#444',
    fontWeight: '500',
    marginLeft: 2,
  },
  ibcTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7EDFC',
    borderRadius: 20,
    height: 32,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  initiaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginLeft: 'auto',
  },
  initiaText: {
    color: '#111',
    fontWeight: '500',
  },
});

export default RecipientCard;
