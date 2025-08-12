import {
  getKeyToUseForDenoms,
  useActiveChain,
  useActiveWallet,
  useAddressPrefixes,
  useChainsStore,
  useFeatureFlags,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  getBlockChainFromAddress,
  isAptosAddress,
  isEthAddress,
  isSolanaAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { Token } from '@leapwallet/cosmos-wallet-store';
import {
  Asset,
  SkipDestinationChain,
  useSkipDestinationChains,
  useSkipSupportedChains,
} from '@leapwallet/elements-hooks';
import { ArrowLeft } from 'phosphor-react-native';
import { decode } from 'bech32';
import { BigNumber } from 'bignumber.js';
import { WalletButtonV2 } from '../../components/button';
import { PageHeader } from '../../components/header/PageHeaderV2';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { useWalletInfo } from '../../hooks';
import { usePerformanceMonitor } from '../../hooks/perf-monitoring/usePerformanceMonitor';
import { useSelectedNetwork } from '../../hooks/settings/useNetwork';
import useQuery from '../../hooks/useQuery';
import { observer } from 'mobx-react-lite';
import SelectWallet from '../home/SelectWallet/v2';
import TxPage, { TxType } from '../nfts/send-nft/TxPage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chainFeatureFlagsStore, evmBalanceStore } from '../../context/balance-store';
import { chainInfoStore } from '../../context/chain-infos-store';
import { rootCW20DenomsStore, rootDenomsStore, rootERC20DenomsStore } from '../../context/denoms-store-instance';
import { manageChainsStore } from '../../context/manage-chains-store';
import { rootBalanceStore } from '../../context/root-store';
import { AggregatedSupportedChain } from '../../types/utility';
import { AddressBook } from '../../utils/addressbook';
import { isLedgerEnabled } from '../../utils/isLedgerEnabled';

import { AmountCard } from './components/amount-card';
import { SelectTokenSheet } from './components/amount-card/select-token-sheet';
import { ErrorChannel } from './components/error-warning';
import { Memo } from './components/memo';
import RecipientCard from './components/recipient-card';
import SaveAddressSheet from './components/recipient-card/save-address-sheet';
import { ReviewTransfer } from './components/review-transfer';
import { SendContextProvider, useSendContext } from './context';
import { useCheckIbcTransfer } from './hooks/useCheckIbcTransfer';
import { SelectRecipientSheet } from './SelectRecipientSheet';
import { View, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Send = observer(() => {
  const navigation = useNavigation();
  const isAllAssetsLoading = rootBalanceStore.loading;
  const [showSelectWallet, setShowSelectWallet] = useState(false);
  const [showSelectRecipient, setShowSelectRecipient] = useState(false);
  const { walletAvatar, walletName } = useWalletInfo();
  const activeChain = useActiveChain();
  const [amount, setAmount] = useState('');
  const {
    selectedAddress,
    setSelectedAddress,
    setAddressError,
    isIBCTransfer,
    setCustomIbcChannelId,
    selectedToken,
    isIbcUnwindingDisabled,
    sendActiveChain,
    setSelectedChain,
    sendSelectedNetwork,
    setGasError,
    setInputAmount,
    setFeeDenom,
    setSelectedToken,
  } = useSendContext();

  const assetCoinDenom = useQuery().get('assetCoinDenom') ?? undefined;
  const chainId = useQuery().get('chainId') ?? undefined;
  const [showTxPage, setShowTxPage] = useState(false);
  const [isAddContactSheetVisible, setIsAddContactSheetVisible] = useState(false);
  const [showTokenSelectSheet, setShowTokenSelectSheet] = useState<boolean>(!assetCoinDenom);
  const [selectedContact, setSelectedContact] = useState<AddressBook.SavedAddress | undefined>();
  const [inputInProgress, setInputInProgress] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState(false);

  const chainInfos = chainInfoStore.chainInfos;
  const goBack = () => navigation.goBack();
  const inputRef = useRef<TextInput>(null);

  usePerformanceMonitor({
    page: 'send',
    queryStatus: isAllAssetsLoading ? 'loading' : 'success',
    op: 'sendPageLoad',
    description: 'loading state on send page',
  });

  const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), []);

  const handleCloseRecipientSheet = useCallback(() => {
    setShowSelectRecipient(false);
  }, []);

  const handleCloseTokenSelectSheet = (isTokenSelected?: boolean) => {
      if (!selectedToken && !isTokenSelected) {
        goBack();
      } else {
        setShowTokenSelectSheet(false);
      }
    };

  const editContact = (savedAddress?: AddressBook.SavedAddress) => {
    if (savedAddress) {
      setSelectedContact(savedAddress);
    }
    setIsAddContactSheetVisible(true);
  };

  const { chains } = useChainsStore();
  const addressPrefixes = useAddressPrefixes();
  const activeWallet = useActiveWallet();

  const { data: elementsChains } = useSkipSupportedChains({ chainTypes: ['cosmos'] });
  const evmBalance = evmBalanceStore.evmBalance;
  const { data: featureFlags } = useFeatureFlags();
  const selectedNetwork = useSelectedNetwork();

  const activeChainInfo = chains[sendActiveChain];

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

    // we are sure that the key is there in the chains object due to previous checks
    return chains[destinationChainKey];
  }, [addressPrefixes, chains, selectedAddress?.address]);

  const allAssets = rootBalanceStore.getAggregatedSpendableBalances(selectedNetwork);
  const assets = useMemo(() => {
    const _assets = allAssets;

    return _assets.sort((a, b) => Number(b.usdValue) - Number(a.usdValue));
  }, [allAssets]);

  useCheckIbcTransfer({
    sendActiveChain,
    selectedAddress,
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
    const address = selectedAddress?.address || selectedAddress?.ethAddress;
    if (address && Object.keys(addressPrefixes).length > 0) {
      let chain: SupportedChain = 'cosmos';
      try {
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
          if (prefix === 'init') {
            chain = selectedAddress?.chainName as SupportedChain;
          }
        }
      } catch (error) {
        if (isSolanaAddress(address)) {
          chain = 'solana';
        }
      }
      if (!selectedToken) {
        setSelectedChain(chain);
      }
    }
  }, [
    addressPrefixes,
    selectedAddress?.address,
    selectedAddress?.chainName,
    selectedAddress?.ethAddress,
    selectedToken,
    setSelectedChain,
  ]);

  useEffect(() => {
    if (selectedToken && selectedToken.tokenBalanceOnChain && sendActiveChain !== selectedToken.tokenBalanceOnChain) {
      setSelectedChain(selectedToken.tokenBalanceOnChain);
    }
  }, [selectedToken, sendActiveChain, setSelectedChain]);

  const updateSelectedToken = useCallback(
    (token: Token | null) => {
      setSelectedToken(token);
      setSelectedChain(token?.tokenBalanceOnChain || null);

      if (token && token?.isEvm) {
        setFeeDenom({
          coinMinimalDenom: token.coinMinimalDenom,
          coinDecimals: token.coinDecimals ?? 6,
          coinDenom: token.symbol,
          icon: token.img,
          coinGeckoId: token.coinGeckoId ?? '',
          chain: token.chain ?? '',
        });
      }

      if (token && (activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY) {
        const _token =
          Object.values(chainInfos[token.tokenBalanceOnChain as SupportedChain]?.nativeDenoms)?.[0] || token;

        setFeeDenom({
          coinMinimalDenom: _token.coinMinimalDenom,
          coinDecimals: _token.coinDecimals ?? 6,
          coinDenom: _token.coinDenom || token.symbol,
          icon: _token.icon || token.img,
          coinGeckoId: _token.coinGeckoId ?? '',
          chain: _token.chain ?? '',
        });
      }
    },
    [setSelectedToken, activeChain, setSelectedChain, setFeeDenom, chainInfos],
  );

  const isTokenStatusSuccess = useMemo(() => {
    let status = isAllAssetsLoading === false;
    const addEvmDetails = chainInfos?.[sendActiveChain]?.evmOnlyChain ?? false;

    if (addEvmDetails) {
      status = status && evmBalance.status === 'success';
    }
    return status;
  }, [chainInfos, evmBalance.status, isAllAssetsLoading, sendActiveChain]);

  useEffect(() => {
    if (assetCoinDenom) {
      const tokenFromParams: Token | null =
        assets.find((asset) => {
          if (assetCoinDenom?.startsWith('ibc/')) {
            return asset.ibcDenom === assetCoinDenom;
          }
          if (
            getKeyToUseForDenoms(asset.ibcDenom || asset.coinMinimalDenom, asset.chain || '') ===
            getKeyToUseForDenoms(assetCoinDenom, chainId || '')
          ) {
            return true;
          }
          return false;
        }) || null;
      updateSelectedToken(tokenFromParams);
    } else if (chainId) {
      const tokenFromParams: Token | null = assets.find((asset) => new BigNumber(asset.amount).gt(0)) || null;
      updateSelectedToken(tokenFromParams);
    }
  }, [chainId, assetCoinDenom, activeChain, assets, updateSelectedToken]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {selectedToken ? (
        <>
          <PageHeader>
            <TouchableOpacity onPress={goBack}>
              <ArrowLeft size={36} color="#212121" style={{ padding: 8 }} />
            </TouchableOpacity>
            <WalletButtonV2
              walletName={walletName}
              showWalletAvatar={true}
              walletAvatar={walletAvatar}
              showDropdown={true}
              handleDropdownClick={handleOpenWalletSheet}
            />
          </PageHeader>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <AmountCard
              rootBalanceStore={rootBalanceStore}
              isAllAssetsLoading={isAllAssetsLoading}
              rootDenomsStore={rootDenomsStore}
              rootCW20DenomsStore={rootCW20DenomsStore}
              rootERC20DenomsStore={rootERC20DenomsStore}
              evmBalanceStore={evmBalanceStore}
              resetForm={resetForm}
              setShowTokenSelectSheet={setShowTokenSelectSheet}
              isTokenStatusSuccess={isTokenStatusSuccess}
              setAmount={setAmount}
              amount={amount}
            />
            <RecipientCard
              ref={inputRef}
              isIBCTransfer={isIBCTransfer}
              sendSelectedNetwork={sendSelectedNetwork}
              destChainInfo={destChainInfo}
              selectedAddress={selectedAddress}
              activeChain={activeChain}
              setSelectedContact={setSelectedContact}
              setShowSelectRecipient={setShowSelectRecipient}
              setIsAddContactSheetVisible={setIsAddContactSheetVisible}
              setInputInProgress={setInputInProgress}
              inputInProgress={inputInProgress}
              chainInfoStore={chainInfoStore}
              chainFeatureFlagsStore={chainFeatureFlagsStore}
            />
            <Memo />
            <View style={{ marginHorizontal: 24 }}>
              <ErrorChannel />
            </View>
            <ReviewTransfer setShowTxPage={setShowTxPage} />
          </ScrollView>
        </>
      ) : null}

      <SelectRecipientSheet
        isOpen={showSelectRecipient && !isAddContactSheetVisible}
        onClose={handleCloseRecipientSheet}
        postSelectRecipient={() => setInputInProgress(false)}
        editContact={editContact}
      />

      {showTxPage && (
        <TxPage
          isOpen={showTxPage}
          onClose={(clear) => {
            setShowTxPage(false);
            if (clear) {
              setInputAmount('');
              setResetForm(true);
              setTimeout(() => setResetForm(false), 2000);
            }
          }}
          txType={TxType.SEND}
        />
      )}

      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => {
          setShowSelectWallet(false);
          navigation.navigate('Home');
        }}
        title="Your Wallets"
      />

      <SaveAddressSheet
        isOpen={isAddContactSheetVisible}
        onSave={setSelectedAddress}
        onClose={() => {
          setIsAddContactSheetVisible(false);
          setSelectedContact(undefined);
        }}
        address={selectedContact?.address ?? ''}
        ethAddress={selectedContact?.ethAddress ?? ''}
        sendActiveChain={activeChain}
        title={selectedContact ? 'Edit Contact' : 'Add Contact'}
        showDeleteBtn={!!selectedContact}
      />

      <SelectTokenSheet
        denoms={rootDenomsStore.allDenoms}
        isOpen={showTokenSelectSheet}
        assets={assets}
        selectedToken={selectedToken}
        onClose={handleCloseTokenSelectSheet}
        onTokenSelect={(token) => {
          updateSelectedToken(token);
          setGasError('');
          setAmount('');
          inputRef.current?.focus();
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingHorizontal: 0,
    gap: 12,
  },
  // ...add other styles as needed
});

// Context Provider wrapper
const SendPage = observer(() => {
  const activeChain = useActiveChain();
  return (
    <SendContextProvider
      activeChain={activeChain}
      rootDenomsStore={rootDenomsStore}
      rootCW20DenomsStore={rootCW20DenomsStore}
      rootERC20DenomsStore={rootERC20DenomsStore}
    >
      <Send/>
    </SendContextProvider>
  );
});

export default SendPage;