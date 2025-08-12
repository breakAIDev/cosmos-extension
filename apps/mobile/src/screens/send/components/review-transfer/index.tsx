import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useQuery } from '@tanstack/react-query';

import { useAddress, useChainsStore, useFeatureFlags, useGetAptosGasPrices } from '@leapwallet/cosmos-wallet-hooks';
import { isAptosChain, isSolanaChain, SolanaTx, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { SkipSupportedAsset } from '@leapwallet/elements-core';
import { useAllSkipAssets, useDebouncedValue, useSkipSupportedChains, useTransfer } from '@leapwallet/elements-hooks';
import { useTransferReturnType } from '@leapwallet/elements-hooks/dist/use-transfer';

import { AutoAdjustAmountSheet } from '../../../../components/auto-adjust-amount-sheet';
import { Button } from '../../../../components/ui/button'; // Should be a RN-compatible Button
import { FIXED_FEE_CHAINS } from '../../../../services/config/constants';
import useActiveWallet from '../../../../hooks/settings/useActiveWallet';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { useEffectiveAmountValue } from '../../../../hooks/useEffectiveAmountValue';
import { useWalletClient } from '../../../../hooks/useWalletClient';
import { useSendContext } from '../../../send/context';

import { rootDenomsStore, rootERC20DenomsStore } from '../../../../context/denoms-store-instance';
import { rootBalanceStore } from '../../../../context/root-store';
import { selectedNetworkStore } from '../../../../context/selected-network-store';

import { FeesView } from '../fees-view';
import { FixedFee } from '../fees-view/FixedFee';
import { ReviewTransferSheet } from './review-transfer-sheet';

export const ReviewTransfer = observer(({ setShowTxPage }: { setShowTxPage: (val: boolean) => void }) => {
  const { activeWallet } = useActiveWallet();
  const [showReviewTxSheet, setShowReviewTxSheet] = useState(false);
  const [checkForAutoAdjust, setCheckForAutoAdjust] = useState(false);
  const [routeError, setRouteError] = useState(false);

  const {
    sendDisabled,
    clearTxError,
    fee,
    inputAmount,
    setInputAmount,
    selectedToken,
    selectedAddress,
    setTransferData,
    pfmEnabled,
    isIbcUnwindingDisabled,
    isIBCTransfer,
    fetchAccountDetailsStatus,
    amountError,
    addressError,
    sendActiveChain,
    sendSelectedNetwork,
    hasToUseCw20PointerLogic,
    feeDenom,
    gasError,
  } = useSendContext();
  const { status: aptosGasPriceStatus } = useGetAptosGasPrices(sendActiveChain, sendSelectedNetwork);
  const isAptosTx = isAptosChain(sendActiveChain);

  const { chains } = useChainsStore();
  const userAddress = useAddress(sendActiveChain);
  const { walletClient } = useWalletClient(sendActiveChain);
  const chainInfos = useChainInfos();

  const [minimumRentAmountError, setMinimumRentAmountError] = useState(false);

  const effectiveAmountValue = useEffectiveAmountValue(inputAmount);
  const debouncedAmount = useDebouncedValue(effectiveAmountValue, 500);
  const { data: elementsChains } = useSkipSupportedChains({
    chainTypes: ['cosmos'],
    onlyTestnets: sendSelectedNetwork === 'testnet',
  });
  const { data: featureFlags } = useFeatureFlags();

  const isInitiaTxn = selectedAddress?.address?.startsWith('init') ?? false;

  const { data: allSkipAssets } = useAllSkipAssets({
    only_testnets: sendSelectedNetwork === 'testnet',
  });

  const skipAssets = useMemo(() => {
    return allSkipAssets?.[chains?.[sendActiveChain]?.chainId];
  }, [allSkipAssets, chains, sendActiveChain]);

  const asset: SkipSupportedAsset = useMemo(() => {
    const skipAsset = skipAssets?.find((a) => {
      const skipDenom = a.denom?.replace(/(cw20:|erc20\/)/g, '');
      if (selectedToken?.ibcDenom) {
        return skipDenom === selectedToken.ibcDenom;
      }
      return skipDenom === selectedToken?.coinMinimalDenom;
    });
    if (!skipAsset) {
      return {
        denom: (selectedToken?.ibcDenom || selectedToken?.coinMinimalDenom) ?? '',
        symbol: selectedToken?.symbol || '',
        logoUri: selectedToken?.img || '',
        decimals: selectedToken?.coinDecimals || 0,
        originDenom: selectedToken?.coinMinimalDenom || '',
        trace: selectedToken?.ibcChainInfo ? `transfer/${selectedToken.ibcChainInfo?.channelId}` : '',
        name: selectedToken?.name || '',
        chainId: selectedToken?.ibcChainInfo?.name || '',
        originChainId: selectedToken?.ibcChainInfo?.name || '',
        isCw20: false,
        coingeckoId: selectedToken?.coinGeckoId || '',
      };
    }
    return {
      ...skipAsset,
      trace: selectedToken?.ibcChainInfo ? `transfer/${selectedToken.ibcChainInfo?.channelId}` : skipAsset.trace,
    };
  }, [selectedToken, skipAssets]);

  const destinationAsset: SkipSupportedAsset | undefined = useMemo(() => {
    if (
      selectedAddress &&
      selectedAddress.address?.startsWith('init') &&
      selectedAddress.chainName !== sendActiveChain
    ) {
      const chain = chains[selectedAddress?.chainName as SupportedChain];
      const asset = allSkipAssets?.[chain?.chainId]?.find(
        (asset) => asset.denom === Object.values(chain?.nativeDenoms)[0]?.coinMinimalDenom,
      );
      return asset;
    }
    return undefined;
  }, [allSkipAssets, chains, selectedAddress, sendActiveChain]);

  const transferData: useTransferReturnType = useTransfer({
    amount: debouncedAmount,
    asset: asset,
    destinationChain: elementsChains?.find(
      // @ts-ignore
      (d) => d.chainId === chains[selectedAddress?.chainName]?.chainId,
    ),
    destinationAsset: destinationAsset,
    destinationAddress: selectedAddress?.address,
    sourceChain: elementsChains?.find((chain) => chain.chainId === chains[sendActiveChain].chainId),
    userAddress: userAddress ?? '',
    walletClient: walletClient,
    enabled: (isIBCTransfer || isInitiaTxn) && featureFlags?.ibc?.extension !== 'disabled',
    isMainnet: sendSelectedNetwork === 'mainnet',
  });

  const { data: minimumRentAmount } = useQuery(
    [
      'minimum-rent-amount',
      selectedAddress?.address,
      sendActiveChain,
      selectedToken?.chain,
      selectedNetworkStore.selectedNetwork,
    ],
    async () => {
      if (isSolanaChain(sendActiveChain) && isSolanaChain(selectedToken?.chain ?? '')) {
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
    // @ts-ignore
    if (transferData?.messages) {
      setTransferData(transferData);
    } else {
      setTransferData({
        isSkipTransfer: false,
        isGasFeesLoading: false,
        gasFees: undefined,
        gasFeesError: undefined,
      });
    }
  }, [selectedToken?.coinMinimalDenom, selectedAddress?.chainName, transferData?.messages, transferData, setTransferData]);

  useEffect(() => {
    if (isInitiaTxn) {
      if (
        !transferData?.isLoadingMessages &&
        !transferData?.isLoadingRoute &&
        selectedAddress?.chainName &&
        chains[selectedAddress?.chainName as SupportedChain]?.chainId !== chains[sendActiveChain]?.chainId &&
        !transferData?.messages
      ) {
        setRouteError(true);
      } else {
        setRouteError(false);
      }
    }
  }, [
    chains,
    isInitiaTxn,
    selectedAddress?.chainName,
    sendActiveChain,
    transferData?.isLoadingMessages,
    transferData?.messages,
    transferData?.isLoadingRoute,
  ]);

  const btnText = useMemo(() => {
    if (!!addressError && !!selectedAddress) {
      return `Select a different token or address`;
    }
    if (!inputAmount) return 'Enter amount';
    if (routeError) return 'No routes found';

    if (amountError) {
      if (amountError.includes('IBC transfers are not supported')) {
        return 'Select different chain or address';
      } else if (amountError.includes('You can only send this token to a SEI address')) {
        return 'Address not supported';
      } else {
        return amountError;
      }
    }

    if (addressError) {
      if (addressError === 'The entered address is invalid') {
        return 'Invalid address';
      } else if (addressError.includes('IBC transfers are not supported')) {
        return 'Select different chain or address';
      } else {
        return addressError;
      }
    }

    if (
      selectedToken?.chain === 'solana' &&
      selectedToken?.coinMinimalDenom === 'lamports' &&
      sendActiveChain === 'solana'
    ) {
      if (minimumRentAmount > Number(inputAmount)) {
        setMinimumRentAmountError(true);
        return `A minimum of ${minimumRentAmount} SOL is required`;
      } else {
        setMinimumRentAmountError(false);
      }
    }

    if (!selectedAddress) {
      return 'Select address';
    }

    return 'Review Transfer';
  }, [
    addressError,
    amountError,
    inputAmount,
    routeError,
    minimumRentAmount,
    selectedToken?.chain,
    sendActiveChain,
    selectedToken?.coinMinimalDenom,
    selectedAddress,
  ]);

  const showAdjustmentSheet = () => {
    if (activeWallet?.watchWallet) {
      // globalSheetsStore.setImportWatchWalletSeedPopupOpen(true)
    } else {
      setCheckForAutoAdjust(true);
    }
  };

  const hideAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(false);
  }, []);

  const isReviewDisabled = useMemo(() => {
    if (
      isInitiaTxn &&
      (transferData?.isLoadingRoute ||
        transferData?.isLoadingMessages ||
        (selectedAddress?.chainName &&
          chains[selectedAddress?.chainName as SupportedChain]?.chainId !== chains[sendActiveChain]?.chainId &&
          !transferData?.messages))
    ) {
      return true;
    }

    if (isAptosTx && aptosGasPriceStatus === 'loading') {
      return true;
    }

    return (
      sendDisabled ||
      !!gasError ||
      (!pfmEnabled && !isIbcUnwindingDisabled) ||
      (['error', 'loading'].includes(fetchAccountDetailsStatus) && !hasToUseCw20PointerLogic) ||
      minimumRentAmountError
    );
  }, [
    isInitiaTxn,
    transferData?.isLoadingRoute,
    transferData?.isLoadingMessages,
    transferData?.messages,
    selectedAddress?.chainName,
    gasError,
    chains,
    sendActiveChain,
    sendDisabled,
    pfmEnabled,
    isIbcUnwindingDisabled,
    fetchAccountDetailsStatus,
    hasToUseCw20PointerLogic,
    aptosGasPriceStatus,
    isAptosTx,
    minimumRentAmountError,
  ]);

  const feeValue = {
    amount: fee?.amount[0].amount.toString() ?? '',
    denom: feeDenom.coinMinimalDenom,
  };

  if (isAptosTx && aptosGasPriceStatus === 'loading') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {inputAmount &&
          (FIXED_FEE_CHAINS.includes(sendActiveChain) ? (
            <FixedFee />
          ) : (
            <FeesView rootBalanceStore={rootBalanceStore} rootDenomsStore={rootDenomsStore} />
          ))}
        <Button
          onPress={showAdjustmentSheet}
          disabled={isReviewDisabled}
          // You may want to handle conditional styles using your custom Button
          style={[
            styles.button,
            (addressError || amountError || routeError || gasError || minimumRentAmountError) && styles.buttonError,
          ]}
          testID="send-review-transfer-btn"
        >
          {btnText}
        </Button>
      </View>

      {selectedToken && fee && checkForAutoAdjust ? (
        <AutoAdjustAmountSheet
          amount={inputAmount}
          setAmount={setInputAmount}
          selectedToken={selectedToken}
          fee={feeValue}
          setShowReviewSheet={setShowReviewTxSheet}
          closeAdjustmentSheet={hideAdjustmentSheet}
          forceChain={sendActiveChain}
          forceNetwork={sendSelectedNetwork}
          rootDenomsStore={rootDenomsStore}
        />
      ) : null}

      <ReviewTransferSheet
        isOpen={showReviewTxSheet}
        onClose={() => {
          setShowReviewTxSheet(false);
          clearTxError();
        }}
        setShowTxPage={setShowTxPage}
        rootERC20DenomsStore={rootERC20DenomsStore}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    paddingBottom: 24,
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#F7F8FA', // secondary-100
    zIndex: 10,
  },
  card: {
    flexDirection: 'column',
    gap: 16, // If unsupported, use marginBottom
    width: '100%',
  },
  button: {
    width: '100%',
    backgroundColor: '#0564E4',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  buttonError: {
    backgroundColor: '#EF4444',
  },
});
