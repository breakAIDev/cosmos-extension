import { Token } from '@leapwallet/cosmos-wallet-hooks';
import { fromSmall, toSmall } from '@leapwallet/cosmos-wallet-sdk';
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui';
import BigNumber from 'bignumber.js';
import BottomModal from '../../../components/new-bottom-modal';
import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../../theme/colors';

type AutoAdjustSheetProps = {
  onCancel: () => void;
  onAdjust: () => void;
  isOpen: boolean;
  tokenAmount: string;
  fee: { amount: string; denom: string };
  setTokenAmount: (amount: string) => void;
  token: Token;
};

export default function AutoAdjustAmountSheet({
  isOpen,
  tokenAmount,
  fee,
  setTokenAmount,
  onAdjust,
  onCancel,
  token,
}: AutoAdjustSheetProps) {
  const { theme } = useTheme();

  const updatedAmount = useMemo(() => {
    const tokenAmountSmall = toSmall(token.amount ?? '0', token?.coinDecimals ?? 6);
    const maxMinimalTokens = new BigNumber(tokenAmountSmall).minus(fee?.amount ?? '');
    if (maxMinimalTokens.lte(0)) return '0';
    const maxTokens = new BigNumber(fromSmall(maxMinimalTokens.toString(), token?.coinDecimals ?? 6)).toFixed(6, 1);
    return maxTokens;
  }, [fee?.amount, token.amount, token?.coinDecimals]);

  const handleAdjust = useCallback(() => {
    if (updatedAmount) {
      setTokenAmount(updatedAmount);
      onAdjust();
    } else {
      onCancel();
    }
  }, [onAdjust, onCancel, setTokenAmount, updatedAmount]);

  useEffect(() => {
    if (updatedAmount) {
      setTokenAmount(updatedAmount);
      onAdjust();
    } else {
      onCancel();
    }
  }, [onAdjust, onCancel, setTokenAmount, updatedAmount]);

  const displayTokenAmount = useMemo(() => {
    return `${tokenAmount} ${token.symbol ?? ''}`;
  }, [token.symbol, tokenAmount]);

  const displayUpdatedAmount = useMemo(() => {
    if (updatedAmount) {
      return `${updatedAmount} ${token.symbol ?? ''}`;
    }
    return null;
  }, [token.symbol, updatedAmount]);

  return (
    <BottomModal isOpen={isOpen} onClose={onCancel} title="Adjust for Transaction Fees">
      <View style={{
        borderRadius: 16,
        padding: 16,
        backgroundColor: theme === ThemeName.DARK ? '#111827' : '#fff',
      }}>
        <Text style={{
          color: theme === ThemeName.DARK ? '#E5E7EB' : '#1F2937',
          fontSize: 16,
        }}>
          Insufficient {token.symbol ?? ''} balance to pay transaction fees.
        </Text>
        <Text style={{ marginTop: 8, color: theme === ThemeName.DARK ? '#E5E7EB' : '#1F2937', fontSize: 16 }}>
          Should we adjust the amount from{' '}
          <Text style={{ color: Colors.green600, fontWeight: '500' }}>{displayTokenAmount}</Text> to{' '}
          <Text style={{ color: Colors.green600, fontWeight: '500' }}>{displayUpdatedAmount ?? '-'}</Text>?
        </Text>
      </View>
      <View style={{ flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 20 }}>
        <Buttons.Generic
          color={theme === ThemeName.DARK ? Colors.gray900 : Colors.gray300}
          size="normal"
          style={{ width: '100%' }}
          title="Don't adjust"
          onClick={onCancel}
        >
          Cancel Transaction
        </Buttons.Generic>
        <Buttons.Generic
          color={Colors.green600}
          size="normal"
          style={{ width: '100%' }}
          title="Auto-adjust"
          onClick={handleAdjust}
        >
          Auto-adjust
        </Buttons.Generic>
      </View>
    </BottomModal>
  );
}
