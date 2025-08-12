import { SelectedAddress, sliceAddress, useAddressPrefixes, useDebounce } from '@leapwallet/cosmos-wallet-hooks';
import {
  ChainInfo,
  isAptosAddress,
  isEthAddress,
  isSolanaAddress,
  isValidAddress,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { ChainFeatureFlagsStore, ChainInfosStore } from '@leapwallet/cosmos-wallet-store';
import { CaretRight } from 'phosphor-react-native';
import { decode } from 'bech32';
import useQuery from '../../../../hooks/useQuery';
import { Wallet } from '../../../../hooks/wallet/useWallet';
import { ContactCalenderIcon } from '../../../../../assets/icons/contact-calender-icon';
import { Images } from '../../../../../assets/images';
import { observer } from 'mobx-react-lite';
import { useSendContext } from '../../../send/context';
import { useCheckAddressError } from '../../../send/hooks/useCheckAddressError';
import { SelectChain } from '../../../send/SelectRecipientSheet';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AddressBook } from '../../../../utils/addressbook';
import { UserClipboard } from '../../../../utils/clipboard';
import NameServiceMatchList from './match-lists';

import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';

interface InputCardProps {
  setShowSelectRecipient: (show: boolean) => void;
  setRecipientInputValue: (value: string) => void;
  recipientInputValue: string;
  setInputInProgress: (inProgress: boolean) => void;
  chainInfoStore: ChainInfosStore;
  chainFeatureFlagsStore: ChainFeatureFlagsStore;
  selectedNetwork: string;
}

const nameServiceMatcher = /^[a-zA-Z0-9_-]+\.[a-z]+$/;

const InputCard = forwardRef<any, InputCardProps>(
  (
    {
      setShowSelectRecipient,
      setRecipientInputValue,
      recipientInputValue,
      setInputInProgress,
      chainInfoStore,
      chainFeatureFlagsStore,
      selectedNetwork,
    },
    ref
  ) => {
    const recipient = useQuery().get('recipient') ?? undefined;
    const {
      setEthAddress,
      setSelectedAddress,
      addressError,
      setMemo,
      sendActiveChain,
      setAddressError,
      setAddressWarning,
    } = useSendContext();
    const addressPrefixes = useAddressPrefixes();
    const [showSelectChain, setShowSelectChain] = useState<boolean>(false);
    const debouncedRecipientInputValue = useDebounce(recipientInputValue, 100);
    const existingContactMatch = AddressBook.useGetContact(recipientInputValue);
    const wallets = Wallet.useWallets();
    const walletsList = useMemo(() => {
      return wallets
        ? Object.values(wallets)
            .map((wallet) => wallet)
            .sort((a, b) =>
              a.createdAt && b.createdAt
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : a.name.localeCompare(b.name)
            )
        : [];
    }, [wallets]);

    const existingWalletMatch = useMemo(() => {
      const res = walletsList.find((wallet) => {
        const addresses = Object.values(wallet.addresses) || [];
        const evmPubKey = wallet?.pubKeys?.ethereum;
        const ethAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) : undefined;
        if (ethAddress) {
          addresses.push(ethAddress);
        }
        return addresses.some(
          (address) =>
            recipientInputValue.toLowerCase() === address.toLowerCase()
        );
      });
      if (res) return res;
    }, [recipientInputValue, walletsList]);

    const existingResult = existingContactMatch ?? existingWalletMatch;

    const showNameServiceResults = useMemo(() => {
      const allowedTopLevelDomains = [
        ...Object.keys(addressPrefixes),
        'arch', 'sol', ...['sei', 'pp'], 'core', 'i',
      ];
      const [, domain] = recipientInputValue.split('.');
      const isValidDomain = allowedTopLevelDomains.indexOf(domain) !== -1;
      return nameServiceMatcher.test(recipientInputValue) && isValidDomain;
    }, [recipientInputValue, addressPrefixes]);

    const chains = chainInfoStore.chainInfos;
    const chainFeatureFlags = chainFeatureFlagsStore?.chainFeatureFlagsData;

    const minitiaChains = useMemo(() => {
      const _minitiaChains: ChainInfo[] = [];
      Object.keys(chainFeatureFlags)
        .filter((chain) => chainFeatureFlags?.[chain]?.chainType === 'minitia')
        .forEach((c) => {
          if (chains[c as SupportedChain]) {
            _minitiaChains.push(chains[c as SupportedChain]);
          }
          const _chain = Object.values(chainInfoStore.chainInfos).find((chainInfo) =>
            selectedNetwork === 'testnet'
              ? chainInfo?.testnetChainId === c
              : chainInfo?.chainId === c
          );
          if (_chain) {
            _minitiaChains.push(_chain);
          }
        });
      return _minitiaChains;
    }, [chainFeatureFlags, chains, selectedNetwork, chainInfoStore?.chainInfos]);

    useCheckAddressError({
      setAddressError,
      setAddressWarning,
      recipientInputValue,
      showNameServiceResults,
      sendActiveChain,
    });

    useEffect(() => {
      if (recipient) {
        setRecipientInputValue(recipient);
        if (
          !isValidAddress(recipientInputValue) &&
          !isEthAddress(recipientInputValue) &&
          !isAptosAddress(recipientInputValue) &&
          !isSolanaAddress(recipientInputValue)
        ) {
          return;
        }
        setSelectedAddress({
          address: recipient,
          ethAddress: recipient,
          name: sliceAddress(recipient),
          avatarIcon: existingWalletMatch?.avatar || '',
          selectionType: 'notSaved',
          chainIcon: '',
          chainName: '',
          emoji: undefined,
        });
      }
    }, [existingWalletMatch?.avatar, recipient, recipientInputValue, setRecipientInputValue, setSelectedAddress]);

    const handledSelectedAddress = useCallback(
      (address: string) => {
        if (!address) return;
        setMemo('');
        try {
          if (address.length === 0) {
            setAddressError(undefined);
            return;
          }

          let chain: SupportedChain = 'cosmos';
          try {
            if (isAptosAddress(address)) {
              chain = 'movement';
            } else if (isEthAddress(address)) {
              chain = 'ethereum' as SupportedChain;
            } else if (address.startsWith('tb1q')) {
              chain = 'bitcoinSignet';
            } else if (address.startsWith('bc1q')) {
              chain = 'bitcoin';
            } else {
              const { prefix } = decode(address);
              chain = addressPrefixes[prefix] as SupportedChain;
              if (prefix === 'init') {
                setShowSelectChain(true);
                return;
              }
            }
          } catch {
            if (isSolanaAddress(address)) {
              chain = 'solana';
            } else {
              throw new Error('Invalid Address');
            }
          }

          setSelectedAddress({
            address,
            ethAddress: address,
            name: existingResult ? existingResult.name : '',
            avatarIcon: existingWalletMatch?.avatar || '',
            selectionType: existingResult ? 'saved' : 'notSaved',
            chainIcon: '',
            chainName: chain,
            emoji: undefined,
          });
          setInputInProgress(false);
        } catch (err) {
          if (!(err as Error)?.message?.includes('too short')) {
            setAddressError('Invalid Address');
          }
        }
      },
      [
        addressPrefixes,
        existingResult,
        existingWalletMatch?.avatar,
        setAddressError,
        setMemo,
        setSelectedAddress,
        setInputInProgress,
      ]
    );

    const handleSelectRecipient = useCallback(() => {
      const cleanInputValue = recipientInputValue?.trim();
      handledSelectedAddress(cleanInputValue);
    }, [recipientInputValue, handledSelectedAddress]);

    const actionPaste = useCallback(() => {
      UserClipboard.pasteText()
        .then((text) => {
          if (!text) return;
          setRecipientInputValue(text.trim());
          handledSelectedAddress(text.trim());
        })
        .catch(() => {});
      if (ref && 'current' in ref) {
        ref.current?.focus();
      }
    }, [ref, setRecipientInputValue, handledSelectedAddress]);

    const handleContactSelect = useCallback(
      (s: SelectedAddress) => {
        setAddressError(undefined);
        setSelectedAddress(s);
        setEthAddress(s.ethAddress ?? '');
        setRecipientInputValue(s.address ?? '');
        setInputInProgress(false);
      },
      [
        setAddressError,
        setEthAddress,
        setSelectedAddress,
        setRecipientInputValue,
        setInputInProgress,
      ]
    );

    const showError = !showNameServiceResults && addressError;
    const showRecipientPlaceholder =
      recipientInputValue?.length > 0 &&
      debouncedRecipientInputValue?.length > 0 &&
      !addressError &&
      !showNameServiceResults;

    return (
      <View style={styles.container}>
        <View style={styles.inputRow}>
          <TextInput
            ref={ref}
            style={styles.input}
            placeholder="Enter address"
            value={recipientInputValue}
            onChangeText={(text) => {
              setInputInProgress(true);
              setRecipientInputValue(text);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            placeholderTextColor="#A0A2B1"
          />
          <View style={styles.actionButtons}>
            {!recipientInputValue && (
              <TouchableOpacity style={styles.pasteBtn} onPress={actionPaste}>
                <Text style={styles.pasteBtnText}>Paste</Text>
              </TouchableOpacity>
            )}
            {!recipientInputValue && (
              <TouchableOpacity style={styles.contactBtn} onPress={() => setShowSelectRecipient(true)}>
                <ContactCalenderIcon size={20} color="#222" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {(showError || showRecipientPlaceholder || showNameServiceResults) && (
          <View style={styles.separator} />
        )}

        {showError && (
          <Text style={styles.errorText}>{addressError}</Text>
        )}

        {showRecipientPlaceholder && (
          <TouchableOpacity
            style={styles.recipientCard}
            onPress={handleSelectRecipient}
          >
            <View style={styles.recipientCardContent}>
              <View style={styles.recipientInfo}>
                <Image
                  style={styles.avatar}
                  source={{ uri: existingWalletMatch?.avatar ?? Images.Misc.getWalletIconAtIndex(0)}}
                />
                <View>
                  {existingResult && (
                    <Text style={styles.recipientName}>
                      {existingResult.name}
                    </Text>
                  )}
                  <Text style={styles.recipientAddress}>
                    {sliceAddress(recipientInputValue)}
                  </Text>
                </View>
              </View>
              <CaretRight size={16} color="#A0A2B1" />
            </View>
          </TouchableOpacity>
        )}

        {showNameServiceResults && (
          <NameServiceMatchList
            address={recipientInputValue}
            handleContactSelect={handleContactSelect}
          />
        )}

        <SelectChain
          isOpen={showSelectChain}
          onClose={() => setShowSelectChain(false)}
          setSelectedAddress={(s) => {
            setSelectedAddress(s);
            setShowSelectChain(false);
            setInputInProgress(false);
          }}
          address={recipientInputValue}
          forceName={existingResult ? existingResult.name : undefined}
          wallet={existingWalletMatch}
          chainList={minitiaChains.map((chain) => chain.key)}
        />
      </View>
    );
  }
);

InputCard.displayName = 'InputCard';

export default observer(InputCard);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 18,
    backgroundColor: 'transparent',
    color: '#18191A',
    fontWeight: 'bold',
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pasteBtn: {
    borderRadius: 8,
    backgroundColor: '#F3F5FA',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 7 : 5,
    marginLeft: 4,
  },
  pasteBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1877F2',
  },
  contactBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F5FA',
    marginLeft: 4,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#DDE4EF',
    marginTop: 16,
    marginBottom: 4,
  },
  errorText: {
    color: '#FF5555',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  recipientCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F3F5FA',
    borderRadius: 12,
  },
  recipientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    height: 44,
    width: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: '#F3F5FA',
  },
  recipientName: {
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#18191A',
    fontSize: 15,
    marginBottom: 2,
  },
  recipientAddress: {
    fontSize: 13,
    color: '#A0A2B1',
    textAlign: 'left',
  },
});
