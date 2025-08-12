import { Token } from '@leapwallet/cosmos-wallet-store';
import { formatTokenAmount } from '@leapwallet/cosmos-wallet-store/dist/utils';
import { ArrowRight } from 'phosphor-react-native';
import LedgerConfirmationPopup from '../../components/ledger-confirmation/LedgerConfirmationPopup';
import BottomModal from '../../components/new-bottom-modal';
import Text from '../../components/text';
import loadingImage from '../../../assets/lottie-files/swaps-btn-loading.json';
import LottieView from 'lottie-react-native';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  showLedgerPopup: boolean;
  source: Token;
  destination: Token;
  amountIn: string;
  amountOut: string;
  isProcessing: boolean;
  error?: string;
};

const ReviewTxSheet = observer(
  ({
    isOpen,
    onClose,
    onConfirm,
    source,
    showLedgerPopup,
    amountIn,
    amountOut,
    destination,
    isProcessing,
    error,
  }: Props) => {
    return (
      <>
        <BottomModal title="Confirm transaction" isOpen={isOpen} onClose={onClose} style={{ zIndex: 10 }}>
          <View style={styles.container}>
            <View style={styles.tokenRow}>
              <View style={styles.tokenBox}>
                <Image
                  source={{ uri: source.img ?? '../../../assets/images/default-token.png'}}
                  style={styles.tokenImg}
                  resizeMode="contain"
                />
                <Text style={styles.tokenAmt}>{formatTokenAmount(amountIn, source.symbol, 4)}</Text>
              </View>
              <View style={styles.arrowContainer}>
                <ArrowRight
                  size={24}
                  color="#222"
                  style={styles.arrow}
                />
              </View>
              <View style={styles.tokenBox}>
                <Image
                  source={{ uri: destination.img ?? '../../../assets/images/default-token.png'}}
                  style={styles.tokenImg}
                  resizeMode="contain"
                />
                <Text style={styles.tokenAmt}>{formatTokenAmount(amountOut, destination.symbol, 4)}</Text>
              </View>
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.confirmBtn, isProcessing && styles.confirmBtnDisabled]}
              onPress={onConfirm}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <LottieView
                  source={loadingImage}
                  autoPlay
                  loop
                  style={{ height: 24, width: 24 }}
                />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm Swap</Text>
              )}
            </TouchableOpacity>
          </View>
        </BottomModal>
        {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}
      </>
    );
  },
);

export default ReviewTxSheet;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  tokenRow: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 18,
    marginBottom: 8,
  },
  tokenBox: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 140,
    width: '40%',
  },
  tokenImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  tokenAmt: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 16,
    textAlign: 'center',
  },
  arrowContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  confirmBtn: {
    width: '100%',
    marginTop: 18,
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
});
