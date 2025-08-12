import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Modal, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import { BigNumber } from 'bignumber.js';
import {
  hasToAddEvmDetails,
  Token,
  useGasAdjustmentForChain,
  useSeiLinkedAddressState,
  useSnipGetSnip20TokenBalances,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  isValidAddressWithPrefix,
  SolanaTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { useSendContext } from '../../../send-v2/context';
import { AGGREGATED_CHAIN_KEY } from '../../../../services/config/constants';
import { useQuery as useRouterQuery } from '@tanstack/react-query';
import { SelectTokenSheet } from './select-token-sheet';
import { TokenInputCard } from './TokenInputCard';
import { useRoute } from '@react-navigation/native';
import { useActiveChain } from '../../../../hooks/settings/useActiveChain';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import useQuery from '../../../../hooks/useQuery';
import { selectedNetworkStore } from '../../../../context/selected-network-store';
import { AggregatedSupportedChain } from '../../../../types/utility';
import { calculateFeeAmount } from '../../../../components/gas-price-options';

type AmountCardProps = {
  isAllAssetsLoading: boolean;
  rootBalanceStore: any;
  rootCW20DenomsStore: any;
  rootDenomsStore: any;
  rootERC20DenomsStore: any;
  evmBalanceStore: any;
  aptosCoinDataStore: any;
};

export const AmountCard = observer(({
  isAllAssetsLoading,
  rootBalanceStore,
  rootDenomsStore,
  rootCW20DenomsStore,
  evmBalanceStore,
}: AmountCardProps) => {
  const inputRef = useRef<TextInput | null>(null);
  const route = useRoute();
  const locationState = route?.params?.state;
  const activeChain = useActiveChain();
  const chainInfos = useChainInfos();

  const [showTokenSelectSheet, setShowTokenSelectSheet] = useState<boolean>(false);
  const [amount, setAmount] = useState('');
  const [isInputInUSDC, setIsInputInUSDC] = useState<boolean>(false);

  const { addressLinkState } = useSeiLinkedAddressState();
  const { snip20Tokens } = useSnipGetSnip20TokenBalances();
  const allCW20Denoms = rootCW20DenomsStore.allCW20Denoms;

  const isCW20Token = useCallback(
    (token: Token) => {
      if (!token) {
        return false;
      }
      return Object.keys(allCW20Denoms).includes(token.coinMinimalDenom);
    },
    [allCW20Denoms],
  );

  const assetCoinDenom = useQuery().get('assetCoinDenom') ?? undefined;
  const chainId = useQuery().get('chainId') ?? undefined;

  const {
    inputAmount,
    setInputAmount,
    selectedToken,
    setSelectedToken,
    sendActiveChain,
    selectedChain,
    setSelectedChain,
    setAmountError,
    amountError,
    userPreferredGasPrice,
    userPreferredGasLimit,
    gasEstimate,
    selectedAddress,
    fee,
    feeDenom,
    sameChain,
    setFeeDenom,
    addressWarning,
    setGasError,
  } = useSendContext();

  const gasAdjustment = useGasAdjustmentForChain();
  const evmBalance = evmBalanceStore.evmBalance;

  function getFlooredFixed(v: number, d: number) {
    return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }
  
  const { data: minimumRentAmount } = useRouterQuery(
    ['minimum-rent-amount', selectedAddress?.address, sendActiveChain, selectedToken?.chain],
    async () => {
      if (selectedToken?.chain === 'solana' && sendActiveChain === 'solana') {
        const solanaTx = await SolanaTx.getSolanaClient(
          chainInfos?.[sendActiveChain]?.apis?.rpc ?? '',
          undefined,
          selectedNetworkStore.selectedNetwork,
          sendActiveChain,
        );
        return await solanaTx.getMinimumRentAmount(selectedAddress?.address ?? '');
      }
      return 0;
    },
  );

  useEffect(() => {
    const amountDecimals = amount.split('.')?.[1]?.length;
    const coinDecimals = selectedToken?.coinDecimals ?? 6;
    if (amountDecimals > coinDecimals) {
      setInputAmount(getFlooredFixed(Number(amount), coinDecimals) as string);
    } else {
      setInputAmount(amount);
    }
  }, [amount, selectedToken?.coinDecimals, setInputAmount]);

  const isSecretChainTargetAddress = useMemo(
    () => selectedAddress && isValidAddressWithPrefix(selectedAddress.address ?? '', 'secret'),
    [selectedAddress],
  );

  const allAssets = rootBalanceStore.allSpendableTokens;
  const assets = useMemo(() => {
    let _assets = allAssets;
    if (snip20Tokens && isSecretChainTargetAddress) {
      _assets = [..._assets, ...snip20Tokens];
    }
    const addEvmDetails =
      (activeChain as string) === AGGREGATED_CHAIN_KEY
        ? false
        : hasToAddEvmDetails(false, addressLinkState, false); // update with evmOnlyChain if needed
    if (addEvmDetails) {
      _assets = [..._assets, ...(evmBalance.evmBalance ?? [])].filter((token) => new BigNumber(token.amount).gt(0));
    }
    return (activeChain as string) === AGGREGATED_CHAIN_KEY
      ? _assets.sort((a: { usdValue: any; }, b: { usdValue: any; }) => Number(b.usdValue) - Number(a.usdValue))
      : _assets;
  }, [
    activeChain,
    addressLinkState,
    allAssets,
    evmBalance.evmBalance,
    isSecretChainTargetAddress,
    snip20Tokens,
  ]);

  // --- Token loading status
  const isTokenStatusSuccess = useMemo(() => {
    let status = isAllAssetsLoading === false;
    const addEvmDetails = hasToAddEvmDetails(
      false,
      addressLinkState,
      false, // update with evmOnlyChain if needed
    );
    if (addEvmDetails) {
      status = status && evmBalance.status === 'success';
    }
    return status;
  }, [addressLinkState, evmBalance.status, isAllAssetsLoading]);

  // --- Token selection handlers
  const updateSelectedToken = useCallback(
    (token: Token | null) => {
      setSelectedToken(token);
      if ((activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY) {
        setSelectedChain(token?.tokenBalanceOnChain || null);
      } else {
        setSelectedChain(null);
      }

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
    [activeChain, chainInfos, setFeeDenom, setSelectedChain, setSelectedToken]
  );

  // Asset auto-select logic (should be adapted if you use navigation/params)
  useEffect(() => {
    if (!selectedToken && isTokenStatusSuccess) {
      if (locationState && (locationState as Token).coinMinimalDenom) {
        const token = locationState as Token;
        updateSelectedToken(token);
      } else if (assets.length > 0) {
        const tokensWithBalance = assets.filter((token: { amount: BigNumber.Value; }) => new BigNumber(token.amount).gt(0));
        const token = tokensWithBalance[0] as Token;
        updateSelectedToken(token);
      }
    }
  }, [assets, isTokenStatusSuccess, locationState, selectedToken, updateSelectedToken]);

  useEffect(() => {
    if (addressLinkState === 'done' && selectedToken && selectedToken?.isEvm) {
      const tokensWithBalance = assets.filter((token: { amount: BigNumber.Value; }) => new BigNumber(token.amount).gt(0));
      const token = tokensWithBalance[0] as Token;
      updateSelectedToken(token);
    }
  }, [addressLinkState, assets, selectedToken, updateSelectedToken]);

  useEffect(() => {
    if (assetCoinDenom) {
      const tokenFromParams: Token | null =
        assets.find((asset: { ibcDenom: any; coinMinimalDenom: any; }) => asset.ibcDenom === assetCoinDenom || asset.coinMinimalDenom === assetCoinDenom) ||
        null;

      updateSelectedToken(tokenFromParams);
    } else if (chainId) {
      const tokenFromParams: Token | null = assets.find((asset: { amount: BigNumber.Value; }) => new BigNumber(asset.amount).gt(0)) || null;
      updateSelectedToken(tokenFromParams);
    }
  }, [chainId, assetCoinDenom, activeChain, assets, updateSelectedToken]);
  
  useEffect(() => {
    if (addressWarning.type === 'link') {
      setInputAmount('0.0001');
      return;
    }
  }, [addressWarning, setInputAmount]);

  // --- Validation logic (simplified for RN)
  useEffect(() => {
    const check = () => {
      if (selectedAddress?.address && !sameChain && selectedToken && isCW20Token(selectedToken)) {
        return 'IBC transfers are not supported for cw20 tokens.';
      }
      if (inputAmount === '') {
        return '';
      }
      if (isNaN(Number(inputAmount))) {
        return 'Please enter a valid amount';
      }
      if (new BigNumber(inputAmount).lt(0)) {
        return 'Please enter a positive amount';
      }
      if (new BigNumber(inputAmount).gt(new BigNumber(selectedToken?.amount ?? ''))) {
        return 'Insufficient balance';
      }

      if (
        selectedToken?.chain === 'solana' &&
        selectedToken?.coinMinimalDenom === 'lamports' &&
        sendActiveChain === 'solana'
      ) {
        if (minimumRentAmount > Number(inputAmount)) {
          return `A minimum of ${minimumRentAmount} SOL is required`;
        }
      }

      const feeDenomValue = assets.find((asset: { isEvm: any; coinMinimalDenom: string; ibcDenom: string; }) => {
        if (selectedToken?.isEvm && asset?.isEvm) {
          return asset.coinMinimalDenom === feeDenom?.coinMinimalDenom;
        }

        return asset.ibcDenom === feeDenom.coinMinimalDenom || asset.coinMinimalDenom === feeDenom.coinMinimalDenom;
      });

      if (!fee || !userPreferredGasPrice || !feeDenomValue) {
        return '';
      }

      const { amount } = calculateFeeAmount({
        gasPrice: userPreferredGasPrice.amount.toFloatApproximation(),
        gasLimit: userPreferredGasLimit ?? gasEstimate,
        feeDenom: feeDenom,
        gasAdjustment,
        isSeiEvmTransaction: chainInfos?.[sendActiveChain]?.evmOnlyChain,
      });

      if (amount.gt(feeDenomValue.amount)) {
        return 'Insufficient funds for fees.';
      }
      
      return '';
    };
    setAmountError(check());
  }, [assets, inputAmount, selectedToken, selectedAddress, isCW20Token, setAmountError, sameChain, sendActiveChain, fee, userPreferredGasPrice, userPreferredGasLimit, gasEstimate, feeDenom, gasAdjustment, chainInfos, minimumRentAmount]);

  // --- UI ---
  return (
    <View
      style={[
        addressWarning.type === 'link' && styles.disabledContainer,
        { overflow: 'hidden', width: '100%' },
      ]}
    >
      <TokenInputCard
        isInputInUSDC={isInputInUSDC}
        setIsInputInUSDC={setIsInputInUSDC}
        value={amount}
        token={selectedToken}
        loadingAssets={!isTokenStatusSuccess}
        balanceStatus={isAllAssetsLoading}
        onChange={(value) => setAmount(value)}
        onTokenSelectSheet={() => setShowTokenSelectSheet(true)}
        amountError={amountError}
        sendActiveChain={sendActiveChain}
        selectedChain={selectedChain}
      />

      <Modal
        visible={showTokenSelectSheet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTokenSelectSheet(false)}
      >
        <SelectTokenSheet
          denoms={rootDenomsStore.allDenoms}
          isOpen={showTokenSelectSheet}
          assets={assets}
          selectedToken={selectedToken as Token}
          onClose={() => setShowTokenSelectSheet(false)}
          onTokenSelect={(token: Token) => {
            updateSelectedToken(token);
            setGasError('');
            setAmount('');
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
        />
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  disabledContainer: {
    opacity: 0.5,
  },
});
