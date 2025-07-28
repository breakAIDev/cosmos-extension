import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

import BottomModal from '../bottom-modal';
import { Colors } from '../../theme/colors';

import {
  AdjustmentType,
  formatTokenAmount,
  getAutoAdjustAmount,
  getKeyToUseForDenoms,
  Token,
  useChainInfo,
  useShouldShowAutoAdjustSheet,
} from '@leapwallet/cosmos-wallet-hooks';
import { fromSmall, NativeDenom, SupportedChain, toSmall } from '@leapwallet/cosmos-wallet-sdk';
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store';

// ---- Optional Sheet ----
type OptionalAutoAdjustAmountSheetProps = {
  onCancel: () => void;
  onAdjust: () => void;
  isOpen: boolean;
  tokenAmount: string;
  feeAmount: string;
  setAmount: (amount: string) => void;
  nativeDenom: NativeDenom;
  decimalsToUse?: number;
  onBack: () => void;
};

const OptionalAutoAdjustAmountSheet = ({
  onCancel,
  onAdjust,
  isOpen,
  tokenAmount,
  feeAmount,
  setAmount,
  nativeDenom,
  decimalsToUse,
  onBack,
}: OptionalAutoAdjustAmountSheetProps) => {
  const updatedAmount = useMemo(() => {
    return getAutoAdjustAmount({
      tokenAmount,
      feeAmount,
      nativeDenom,
      decimalsToUse,
    });
  }, [feeAmount, nativeDenom, decimalsToUse, tokenAmount]);

  const handleAdjust = useCallback(() => {
    if (updatedAmount) {
      setAmount(updatedAmount);
      onAdjust();
    } else {
      onCancel();
    }
  }, [onAdjust, onCancel, setAmount, updatedAmount]);

  const displayTokenAmount = useMemo(() => {
    const displayString = fromSmall(tokenAmount, decimalsToUse ?? 6);
    return formatTokenAmount(displayString, nativeDenom?.coinDenom ?? '', Math.min(decimalsToUse ?? 6, 6));
  }, [decimalsToUse, nativeDenom?.coinDenom, tokenAmount]);

  const displayUpdatedAmount = useMemo(() => {
    if (updatedAmount) {
      return formatTokenAmount(updatedAmount, nativeDenom?.coinDenom ?? '', Math.min(decimalsToUse ?? 6, 6));
    }
    return null;
  }, [decimalsToUse, nativeDenom?.coinDenom, updatedAmount]);

  return (
    <BottomModal
      isOpen={isOpen}
      title="Adjust for Transaction Fees"
      closeOnBackdropClick={true}
      onClose={onCancel}
      onActionButtonClick={onBack}
    >
      <Text style={styles.grayText}>
        Confirming this transaction may leave you with insufficient {nativeDenom?.coinDenom ?? ''} balance for future
        transaction fees.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>Should we auto-adjust the amount?</Text>
        <View style={styles.amountRow}>
          <Text style={[styles.amount, { textAlign: 'right' }]}>{displayTokenAmount}</Text>
          <Text style={styles.arrow}>{'→'}</Text>
          <Text style={[styles.amount, { color: Colors.green600 || '#22C55E' }]}>{displayUpdatedAmount}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.gray300 || '#E5E7EB' }]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Don't adjust</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.green600 || '#22C55E' }]}
          onPress={handleAdjust}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
};

// ---- Compulsory Sheet ----
type CompulsoryAutoAdjustAmountSheetProps = {
  onCancel: () => void;
  onAdjust: () => void;
  isOpen: boolean;
  tokenAmount: string;
  tokenBalance: string;
  feeAmount: string;
  setAmount: (amount: string) => void;
  nativeDenom: NativeDenom;
  decimalsToUse?: number;
};

const CompulsoryAutoAdjustAmountSheet = ({
  onCancel,
  onAdjust,
  isOpen,
  tokenAmount,
  tokenBalance,
  feeAmount,
  setAmount,
  nativeDenom,
  decimalsToUse,
}: CompulsoryAutoAdjustAmountSheetProps) => {
  const updatedAmount = useMemo(() => {
    return getAutoAdjustAmount({
      tokenAmount: tokenBalance,
      feeAmount,
      nativeDenom,
      decimalsToUse,
    });
  }, [tokenBalance, feeAmount, nativeDenom, decimalsToUse]);

  const handleAdjust = useCallback(() => {
    if (updatedAmount) {
      setAmount(updatedAmount);
      onAdjust();
    } else {
      onCancel();
    }
  }, [onAdjust, onCancel, setAmount, updatedAmount]);

  const displayTokenAmount = useMemo(() => {
    const displayString = fromSmall(tokenAmount, decimalsToUse ?? 6);
    return formatTokenAmount(displayString, nativeDenom?.coinDenom ?? '', Math.min(decimalsToUse ?? 6, 6));
  }, [decimalsToUse, nativeDenom?.coinDenom, tokenAmount]);

  const displayUpdatedAmount = useMemo(() => {
    if (updatedAmount) {
      return formatTokenAmount(updatedAmount, nativeDenom?.coinDenom ?? '', Math.min(decimalsToUse ?? 6, 6));
    }
    return null;
  }, [decimalsToUse, nativeDenom?.coinDenom, updatedAmount]);

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onCancel}
      closeOnBackdropClick={false}
      title="Adjust for Transaction Fees"
    >
      <Text style={styles.grayText}>
        You seem to have insufficient {nativeDenom?.coinDenom ?? ''} balance to pay transaction fees.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>Should we auto-adjust the amount?</Text>
        <View style={styles.amountRow}>
          <Text style={[styles.amount, { textAlign: 'right' }]}>{displayTokenAmount}</Text>
          <Text style={styles.arrow}>{'→'}</Text>
          <Text style={[styles.amount, { color: Colors.green600 || '#22C55E' }]}>{displayUpdatedAmount}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.gray300 || '#E5E7EB' }]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Don't adjust</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.green600 || '#22C55E' }]}
          onPress={handleAdjust}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
};

type ObserverAutoAdjustAmountSheetProps = {
  amount: string;
  setAmount: (amount: string) => void;
  selectedToken: {
    amount: Token['amount'];
    coinMinimalDenom: Token['coinMinimalDenom'];
    chain?: Token['chain'];
  };
  fee: { amount: string; denom: string };
  setShowReviewSheet: (show: boolean) => void;
  closeAdjustmentSheet: () => void;
  rootDenomsStore: RootDenomsStore;
  forceChain?: SupportedChain;
  forceNetwork?: 'mainnet' | 'testnet';
};

// ---- Main observer wrapper ----
export const AutoAdjustAmountSheet = observer(({
  amount,
  setAmount,
  selectedToken,
  fee,
  setShowReviewSheet,
  closeAdjustmentSheet,
  rootDenomsStore,
  forceChain,
  forceNetwork,
}: ObserverAutoAdjustAmountSheetProps) => {
  const chainInfo = useChainInfo(forceChain);
  const denoms = rootDenomsStore.allDenoms;
  const shouldShowAutoAdjustSheet = useShouldShowAutoAdjustSheet(denoms, forceChain, forceNetwork);

  const nativeDenom = useMemo(() => {
    if (chainInfo.beta) {
      return Object.values(chainInfo.nativeDenoms)[0];
    }
    const key = getKeyToUseForDenoms(selectedToken.coinMinimalDenom, selectedToken.chain ?? '');
    return denoms[key];
  }, [chainInfo.beta, chainInfo.nativeDenoms, denoms, selectedToken.chain, selectedToken.coinMinimalDenom]);

  const allowReview = useCallback(() => {
    closeAdjustmentSheet();
    setShowReviewSheet(true);
  }, [closeAdjustmentSheet, setShowReviewSheet]);

  const decimalsToUse = useMemo(() => nativeDenom?.coinDecimals ?? 6, [nativeDenom?.coinDecimals]);
  const tokenBalance = useMemo(
    () => toSmall(selectedToken?.amount ?? '0', decimalsToUse),
    [decimalsToUse, selectedToken?.amount]
  );
  const tokenAmount = useMemo(
    () => toSmall(amount, decimalsToUse),
    [amount, decimalsToUse]
  );

  const adjustmentType = useMemo(() => {
    return shouldShowAutoAdjustSheet({
      feeAmount: fee.amount,
      feeDenom: fee.denom,
      tokenAmount,
      tokenDenom: selectedToken.coinMinimalDenom,
      tokenBalance,
    });
  }, [fee.amount, fee.denom, selectedToken.coinMinimalDenom, shouldShowAutoAdjustSheet, tokenAmount, tokenBalance]);

  return (
    <>
      <OptionalAutoAdjustAmountSheet
        isOpen={adjustmentType === AdjustmentType.OPTIONAL}
        nativeDenom={nativeDenom}
        tokenAmount={tokenAmount}
        feeAmount={fee.amount}
        setAmount={setAmount}
        onBack={closeAdjustmentSheet}
        onAdjust={allowReview}
        onCancel={allowReview}
        decimalsToUse={decimalsToUse}
      />
      <CompulsoryAutoAdjustAmountSheet
        isOpen={adjustmentType === AdjustmentType.COMPULSORY}
        nativeDenom={nativeDenom}
        tokenAmount={tokenAmount}
        tokenBalance={tokenBalance}
        feeAmount={fee.amount}
        setAmount={setAmount}
        onAdjust={allowReview}
        onCancel={closeAdjustmentSheet}
        decimalsToUse={decimalsToUse}
      />
    </>
  );
});

// ---- Styles ----
const styles = StyleSheet.create({
  grayText: {
    color: Colors.gray400 || '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  infoBox: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: Colors.gray50 || '#F9FAFB',
    marginBottom: 16,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray800 || '#1F2937',
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100 || '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 0,
  },
  amount: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray800 || '#1F2937',
  },
  arrow: {
    fontSize: 24,
    color: Colors.gray400 || '#9CA3AF',
    marginHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    color: Colors.gray800 || '#1F2937',
  },
});
