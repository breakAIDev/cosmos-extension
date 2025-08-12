import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, AppStateStatus, DeviceEventEmitter } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { GasOptions } from '@leapwallet/cosmos-wallet-hooks';
import { GasPrice, NativeDenom, sleep } from '@leapwallet/cosmos-wallet-sdk';

import { SourceChain, SourceToken } from '../../../types/swap';
import {
  addTxToCurrentTxList,
  addTxToPendingTxList,
  generateObjectKey,
  removeCurrentSwapTxs,
} from '../../../utils/pendingSwapsTxsStore';

import { RoutingInfo } from './useSwapsTx';

export function useHandleTxProgressPageBlurEvent(
  isLoading: boolean,
  isOnline: boolean,
  initialRoutingInfo: RoutingInfo,
  initialInAmount: string,
  initialAmountOut: string,
  initialFeeAmount: string,
  initialSourceChain: SourceChain | undefined,
  initialSourceToken: SourceToken | null,
  initialDestinationChain: SourceChain | undefined,
  initialDestinationToken: SourceToken | null,
  initialFeeDenom: NativeDenom & { ibcDenom?: string | undefined },
  initialGasEstimate: number,
  initialGasOption: GasOptions,
  initialUserPreferredGasLimit: number | undefined,
  initialUserPreferredGasPrice: GasPrice | undefined,
  feeAmount: string | undefined,
) {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const routeHasTxHash =
    !!initialRoutingInfo?.messages && initialRoutingInfo.messages.every((msg) => !!msg.customTxHash);

  const isTrackingStatusUnresolved = useMemo(() => {
    return !isOnline || isLoading;
  }, [isOnline, isLoading]);

  const txStoreObject = useMemo(() => {
    return {
      routingInfo: initialRoutingInfo,
      sourceChain: initialSourceChain,
      sourceToken: initialSourceToken,
      destinationChain: initialDestinationChain,
      destinationToken: initialDestinationToken,
      feeDenom: initialFeeDenom,
      gasEstimate: initialGasEstimate,
      gasOption: initialGasOption,
      userPreferredGasLimit: initialUserPreferredGasLimit,
      userPreferredGasPrice: initialUserPreferredGasPrice,
      inAmount: initialInAmount,
      amountOut: initialAmountOut,
      feeAmount: feeAmount ?? initialFeeAmount,
    };
  }, [feeAmount, initialAmountOut, initialDestinationChain, initialDestinationToken, initialFeeAmount, initialFeeDenom, initialGasEstimate, initialGasOption, initialInAmount, initialRoutingInfo, initialSourceChain, initialSourceToken, initialUserPreferredGasLimit, initialUserPreferredGasPrice]);

  const handleCloseCleanUp = useCallback(async () => {
    if (isTrackingStatusUnresolved && routeHasTxHash) {
      await addTxToPendingTxList(txStoreObject, isOnline);
    }
  }, [isTrackingStatusUnresolved, routeHasTxHash, txStoreObject, isOnline]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      if (isTrackingStatusUnresolved && routeHasTxHash) {
        await addTxToCurrentTxList(txStoreObject, isOnline);
        return;
      }
      if (initialRoutingInfo?.messages && initialRoutingInfo.messages.every((msg) => !!msg.customTxHash)) {
        const messageKey = generateObjectKey(initialRoutingInfo);
        if (messageKey) {
          await removeCurrentSwapTxs(messageKey);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialRoutingInfo, isOnline, routeHasTxHash, isTrackingStatusUnresolved, txStoreObject]);

  // Screen blur
  useFocusEffect(
    useCallback(() => {
      return () => {
        handleCloseCleanUp();
      };
    }, [handleCloseCleanUp]),
  );

  // App state change
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      const prev = appState.current;
      appState.current = nextState;

      if ((prev === 'active' || prev === 'unknown') && (nextState === 'background' || nextState === 'inactive')) {
        if (isTrackingStatusUnresolved && routeHasTxHash) {
          await addTxToPendingTxList(txStoreObject, isOnline);
          // Emit event for background listener
          DeviceEventEmitter.emit('pending-swaps', {
            payload: txStoreObject,
            override: isOnline,
          });
          await sleep(100);
        }
      }
    });
    return () => sub.remove();
  }, [isTrackingStatusUnresolved, routeHasTxHash, txStoreObject, isOnline]);

  // Manual trigger equivalent to "extension close"
  const handleExtensionClose = useCallback(async () => {
    if (isTrackingStatusUnresolved && routeHasTxHash) {
      await addTxToPendingTxList(txStoreObject, isOnline);
      DeviceEventEmitter.emit('pending-swaps', {
        payload: txStoreObject,
        override: isOnline,
      });
      await sleep(100);
    }
  }, [isTrackingStatusUnresolved, routeHasTxHash, txStoreObject, isOnline]);

  return { handleClose: handleCloseCleanUp, handleExtensionClose };
}
