import React, { useEffect, useState, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import BigNumber from 'bignumber.js';
import { useformatCurrency } from '@leapwallet/cosmos-wallet-hooks'; // Update as per mobile SDK
import { CaretDoubleDown, CaretRight } from 'phosphor-react-native';
import { DEFAULT_SWAP_FEE } from '../../services/config/config'; // Update import path
import {Images} from '../../../assets/images'; // Update with your assets

type Swap = {
  name: string;
  icon?: string;
  balance: string;
};

export type SwapInputProps = Swap & {
  targetName: string;
  targetTokenIcon: string;
  amount: string;
  targetAmount: string;
  feeInCurrency: string;
  
  setAmount: (amount: string) => void;
  onSwapClick: () => void;
  placeholder?: string;
  onTokenClick?: () => void;
  onMaxClick?: () => void;
  onTargetTokenClick?: () => void;
  onSlippageClick: () => void;
  onReviewClick: () => void;
  targetUnitPrice: string;
  slippage: string;
  isFeeAvailable?: boolean;
  junoDollarValue: number | undefined;
};

const SwapInput = forwardRef(({
  name,
  icon,
  balance,
  amount,
  targetAmount,
  feeInCurrency,
  setAmount,
  onMaxClick,
  onSwapClick,
  onTokenClick,
  onTargetTokenClick,
  targetName,
  targetTokenIcon,
  targetUnitPrice,
  onSlippageClick,
  onReviewClick,
  slippage,
  isFeeAvailable,
  junoDollarValue,
  placeholder,
} : SwapInputProps, ref) => {
  const [isError, setIsError] = useState(false);
  const [formatBalance] = useformatCurrency(); // Use your mobile implementation

  useEffect(() => {
    if (name === 'JUNO' && Number(amount) > Number(balance) - 0.004) {
      setIsError(true);
    } else if (name !== 'JUNO' && Number(amount) > Number(balance)) {
      setIsError(true);
    } else {
      setIsError(false);
    }
  }, [amount, balance, name]);

  // Placeholder formatter, replace with the real one
  const dollarValueDisplay = junoDollarValue === undefined ? '-' : formatBalance(new BigNumber(junoDollarValue).multipliedBy(amount));

  return (
    <View style={styles.container}>
      {/* From Section */}
      <View style={styles.swapSectionTop}>
        <View style={styles.tokenRow}>
          <TouchableOpacity style={styles.tokenSelector} onPress={onTokenClick}>
            {icon && <Image source={icon} style={styles.tokenIcon} />}
            <Text style={styles.tokenName}>{name}</Text>
            <Image source={Images.Misc.ArrowDown} style={styles.arrowIcon}/>
          </TouchableOpacity>
          <TextInput
            ref={ref}
            style={styles.input}
            placeholder={placeholder || 'enter amount'}
            value={amount}
            onChangeText={setAmount}
            keyboardType='decimal-pad'
            textAlign='right'
          />
        </View>
        <View style={styles.balanceRow}>
          <Text style={[styles.balanceText, isError ? styles.errorText : styles.grayText]}>
            {isError ? 'Insufficient Funds' : 'Balance'}: {balance} {name === 'Select token' ? '' : name}
          </Text>
          <View>
            <Text style={styles.dollarValue}>{dollarValueDisplay}</Text>
            {!isError && (
              <TouchableOpacity style={styles.swapAllBtn} onPress={onMaxClick}>
                <Text style={styles.swapAllBtnText}>Swap all</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      
      {/* Swap Button Section */}
      <View style={styles.swapButtonSection}>
        <View style={styles.divider} />
        <TouchableOpacity onPress={onSwapClick} style={styles.swapIconContainer}>
          <CaretDoubleDown />
        </TouchableOpacity>
        <View style={styles.divider} />
      </View>

      {/* To Section */}
      <View style={styles.swapSectionBottom}>
        <View style={styles.tokenRow}>
          <TouchableOpacity style={styles.tokenSelector} onPress={onTargetTokenClick}>
            {targetTokenIcon && <Image source={targetTokenIcon} style={styles.tokenIcon} />}
            <Text style={styles.tokenName}>{targetName}</Text>
            <Image source={Images.Misc.ArrowDown} style={styles.arrowIcon}/>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder='0'
            value={targetAmount}
            editable={false}
            textAlign='right'
            keyboardType='decimal-pad'
          />
        </View>
        <Text style={styles.dollarValue}>{dollarValueDisplay}</Text>
      </View>

      {/* Slippage and per unit cost */}
      {(!!amount && name !== 'Select token' && targetName !== 'Select token' && Number(amount) > 0 && Number(targetAmount) > 0) && (
        <View style={styles.row}>
          <View style={styles.unitBox}>
            <Image source={Images.Logos.JunoSwap} />
            <View>
              <Text>
                <Text style={{fontWeight: 'bold'}}>{targetUnitPrice} {targetName}</Text>
                <Text style={styles.grayText}> per {name}</Text>
              </Text>
              <Text style={styles.grayText}>Juno Swap</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.slippageBox} onPress={onSlippageClick}>
            <View>
              <Text style={styles.grayText}>Max slippage</Text>
              <Text style={{fontWeight: 'bold'}}>{slippage}%</Text>
            </View>
            <CaretRight size={16} style={styles.arrowRight}/>
          </TouchableOpacity>
        </View>
      )}

      {/* Review Button */}
      <View style={styles.reviewSection}>
        <TouchableOpacity
          style={[
            styles.reviewButton,
            (isError || !amount || Number(amount) <= 0 || targetName === name || targetName === 'Select token' || name === 'Select token' || !isFeeAvailable) && styles.reviewButtonDisabled
          ]}
          onPress={onReviewClick}
          disabled={
            isError ||
            !amount ||
            Number(amount) <= 0 ||
            targetName === name ||
            targetName === 'Select token' ||
            name === 'Select token' ||
            !isFeeAvailable
          }
        >
          <Text style={styles.reviewButtonText}>Review Swap</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction Fee */}
      {(amount && name !== 'Select token' && targetAmount !== '0' && targetName !== 'Select token') && (
        <View style={styles.feeSection}>
          <Text style={styles.feeText}>
            Transaction Fee: {DEFAULT_SWAP_FEE} JUNO (${feeInCurrency})
          </Text>
        </View>
      )}
    </View>
  );
});

SwapInput.displayName = 'SwapInput';

export default SwapInput;

// --------- Styles ---------
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  swapSectionTop: {
    backgroundColor: '#F3F3F3',
    padding: 16,
    width: 344,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  swapSectionBottom: {
    backgroundColor: '#F3F3F3',
    padding: 16,
    width: 344,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 16,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    marginBottom: 8,
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  tokenIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
    resizeMode: 'contain',
  },
  arrowIcon: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  tokenName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginHorizontal: 8,
  },
  input: {
    width: 110,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlign: 'right',
    padding: 0,
  },
  balanceRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e27c7c',
  },
  grayText: {
    color: '#aaa',
  },
  dollarValue: {
    fontSize: 12,
    color: '#444',
    textAlign: 'right',
    marginTop: 2,
  },
  swapAllBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 999,
    marginTop: 4,
    paddingHorizontal: 16,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapAllBtnText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 13,
  },
  swapButtonSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    width: 344,
    position: 'relative',
    backgroundColor: '#F3F3F3',
  },
  swapIconContainer: {
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  swapIcon: {
    fontSize: 22,
    color: '#222',
  },
  divider: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 2,
  },
  unitBox: {
    backgroundColor: '#F3F3F3',
    flexDirection: 'row',
    alignItems: 'center',
    width: 206,
    height: 56,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  slippageBox: {
    backgroundColor: '#F3F3F3',
    flexDirection: 'row',
    alignItems: 'center',
    width: 130,
    height: 56,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-between',
  },
  arrowRight: {
    fontSize: 18,
    color: '#aaa',
    marginLeft: 6,
  },
  reviewSection: {
    width: 344,
    alignItems: 'center',
    marginVertical: 12,
  },
  reviewButton: {
    backgroundColor: '#E18881',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewButtonDisabled: {
    backgroundColor: '#F2C4C2',
  },
  feeSection: {
    marginTop: 12,
    alignItems: 'center',
    width: 344,
  },
  feeText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 14,
  },
});
