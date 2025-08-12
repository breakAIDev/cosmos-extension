import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { observer } from 'mobx-react-lite';
import { ArrowRight } from 'phosphor-react-native';
import BigNumber from 'bignumber.js';

// --- Custom Imports, assumed available in RN project ---
import { formatTokenAmount, isERC20Token, sliceAddress, useformatCurrency, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { LeapLedgerSignerEth, LedgerError, pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { RootERC20DenomsStore } from '@leapwallet/cosmos-wallet-store';
import { EthWallet } from '@leapwallet/leap-keychain';
import { Avatar, Buttons } from '@leapwallet/leap-ui';
import { captureException } from '@sentry/react-native';
import BottomModal from '../../../../components/bottom-modal'; // Must use RN modal (not web)
import { ErrorCard } from '../../../../components/ErrorCard';
import LedgerConfirmationPopup from '../../../../components/ledger-confirmation/LedgerConfirmationPopup';
import TokenImageWithFallback from '../../../../components/token-image-with-fallback';
import { useCaptureTxError } from '../../../../hooks/utility/useCaptureTxError';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Wallet } from '../../../../hooks/wallet/useWallet';
import { Colors } from '../../../../theme/colors';
import { useExecuteSkipTx } from './executeSkipTx';
import { useSendContext } from '../../../send-v2/context';

type ReviewTransactionSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  rootERC20DenomsStore: RootERC20DenomsStore;
};

export const ReviewTransferSheet = observer(
  ({ isOpen, onClose, rootERC20DenomsStore }: ReviewTransactionSheetProps) => {
    const [formatCurrency] = useformatCurrency();
    const defaultTokenLogo = useDefaultTokenLogo();
    const [useChainImgFallback, setUseChainImgFallback] = useState(false);
    const chains = useGetChains();
    const getWallet = Wallet.useGetWallet();
    const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms;

    const {
      memo,
      selectedToken,
      selectedAddress,
      fee,
      showLedgerPopup,
      inputAmount,
      tokenFiatValue,
      isSending,
      txError,
      isIBCTransfer,
      sendDisabled,
      confirmSend,
      setTxError,
      confirmSendEth,
      clearTxError,
      setShowLedgerPopup,
      userPreferredGasPrice,
      userPreferredGasLimit,
      gasEstimate,
      transferData,
      isIbcUnwindingDisabled,
      fetchAccountDetailsData,
      associatedSeiAddress,
      sendActiveChain,
      associated0xAddress,
      setIsSending,
    } = useSendContext();

    const { confirmSkipTx, txnProcessing, error, showLedgerPopupSkipTx, setShowLedgerPopupSkipTx, setError } = useExecuteSkipTx();

    const fiatValue = useMemo(
      () => formatCurrency(new BigNumber(inputAmount).multipliedBy(tokenFiatValue ?? 0)),
      [formatCurrency, inputAmount, tokenFiatValue],
    );

    const receiverChainName = useMemo(() => {
      return chains?.[selectedAddress?.chainName as SupportedChain]?.chainName;
    }, [chains, selectedAddress?.chainName]);

    const handleClose = useCallback(() => {
      setError('');
      onClose();
    }, [setError, onClose]);

    const handleSend = useCallback(async () => {
      clearTxError();
      if (!fee || !selectedAddress?.address || !selectedToken) {
        return;
      }

      try {
        let toAddress = selectedAddress.address;
        const _isERC20Token = isERC20Token(Object.keys(allERC20Denoms), selectedToken?.coinMinimalDenom);

        if (
          chains[sendActiveChain]?.evmOnlyChain &&
          _isERC20Token &&
          toAddress.toLowerCase().startsWith(chains[sendActiveChain].addressPrefix) &&
          fetchAccountDetailsData?.pubKey.key
        ) {
          toAddress = pubKeyToEvmAddressToShow(fetchAccountDetailsData.pubKey.key);
        }

        if (selectedAddress.address.toLowerCase().startsWith('0x') && associatedSeiAddress) {
          toAddress = associatedSeiAddress;
        }

        if (associated0xAddress) {
          toAddress = associated0xAddress;
        }

        if (chains[sendActiveChain]?.evmOnlyChain) {
          const wallet = await getWallet(sendActiveChain, true);
          const nativeTokenKey = Object.keys(chains[sendActiveChain]?.nativeDenoms ?? {})?.[0];

          await confirmSendEth(
            toAddress,
            inputAmount,
            userPreferredGasLimit ?? gasEstimate,
            wallet as unknown as EthWallet,
            parseInt(userPreferredGasPrice?.amount?.toString() ?? ''),
            {
              isERC20Token: _isERC20Token,
              contractAddress: selectedToken.coinMinimalDenom,
              decimals: selectedToken.coinDecimals,
              nativeTokenKey,
            },
          );
        } else if (
          transferData?.isSkipTransfer &&
          !isIbcUnwindingDisabled &&
          (isIBCTransfer || selectedAddress?.address?.startsWith('init'))
        ) {
          const wallet = await getWallet(sendActiveChain, true);
          if (sendActiveChain === 'evmos' && wallet instanceof LeapLedgerSignerEth) {
            await confirmSend({
              selectedToken: selectedToken,
              toAddress: associatedSeiAddress || selectedAddress?.address || '',
              amount: new BigNumber(inputAmount),
              memo: memo,
              fees: fee,
            });
          } else {
            confirmSkipTx();
          }
        } else {
          await confirmSend({
            selectedToken: selectedToken,
            toAddress: associatedSeiAddress || selectedAddress?.address || '',
            amount: new BigNumber(inputAmount),
            memo: memo,
            fees: fee,
          });
        }
      } catch (err: unknown) {
        if (err instanceof LedgerError) {
          setTxError(err.message);
          setShowLedgerPopup(false);
          setShowLedgerPopupSkipTx(false);
        }
        setIsSending(false);
        captureException(err);
      }
    }, [
      clearTxError,
      setShowLedgerPopup,
      setTxError,
      setShowLedgerPopupSkipTx,
      fee,
      selectedAddress?.address,
      selectedToken,
      allERC20Denoms,
      chains,
      sendActiveChain,
      fetchAccountDetailsData?.pubKey?.key,
      associatedSeiAddress,
      associated0xAddress,
      transferData?.isSkipTransfer,
      isIbcUnwindingDisabled,
      isIBCTransfer,
      getWallet,
      confirmSendEth,
      inputAmount,
      userPreferredGasLimit,
      gasEstimate,
      userPreferredGasPrice?.amount,
      confirmSend,
      memo,
      confirmSkipTx,
      setIsSending,
    ]);

    useCaptureTxError(txError);

    const onCloseLedgerPopup = useCallback(() => {
      setShowLedgerPopup(false);
      setShowLedgerPopupSkipTx(false);
    }, [setShowLedgerPopup, setShowLedgerPopupSkipTx]);

    // ---- RN Modal UI ----
    return (
      <>
        <BottomModal
          isOpen={isOpen}
          onClose={handleClose}
          title="Review Transaction"
          containerStyle={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.content}>
            {/* Top transfer row */}
            <View style={styles.tokenTransferRow}>
              {/* Token left */}
              <View style={styles.tokenCol}>
                <View style={styles.tokenAvatarWrap}>
                  <TokenImageWithFallback
                    assetImg={selectedToken?.img}
                    text={selectedToken?.symbol ?? ''}
                    altText={selectedToken?.symbol ?? ''}
                    imageStyle={styles.tokenAvatar}
                    containerStyle={styles.tokenAvatar}
                    textStyle={styles.tokenText}
                  />
                  {!!chains?.[sendActiveChain]?.chainSymbolImageUrl && !useChainImgFallback && (
                    <Image
                      source={{ uri: chains?.[sendActiveChain]?.chainSymbolImageUrl }}
                      style={styles.chainSymbolImg}
                      onError={() => setUseChainImgFallback(true)}
                    />
                  )}
                </View>
                <Text style={styles.tokenAmount} testID="send-review-sheet-inputAmount-ele">
                  {formatTokenAmount(inputAmount, selectedToken?.symbol ?? '')}
                </Text>
                <Text style={styles.tokenFiat}>
                  {fiatValue} &middot; on {chains?.[sendActiveChain]?.chainName}
                </Text>
              </View>

              <View style={{ justifyContent: 'center', marginHorizontal: 8 }}>
                <ArrowRight size={24} color="#111" style={styles.arrow} />
              </View>

              {/* To address col */}
              <View style={styles.tokenCol}>
                <Avatar
                  avatarImage={selectedAddress?.avatarIcon}
                  emoji={selectedAddress?.emoji}
                  chainIcon={selectedAddress?.chainIcon}
                  size="sm"
                  avatarOnError={() =>{}}
                  style={styles.avatar}
                />
                <Text style={styles.addressLabel} testID="send-review-sheet-to-ele">
                  {selectedAddress?.ethAddress && selectedAddress?.chainName !== 'injective'
                    ? sliceAddress(selectedAddress.ethAddress)
                    : selectedAddress?.selectionType === 'currentWallet'
                    ? selectedAddress?.name?.split('-')[0]
                    : selectedAddress?.name}
                </Text>
                {!!receiverChainName && (
                  <Text style={styles.tokenFiat}>on {receiverChainName}</Text>
                )}
              </View>
            </View>

            {/* Memo row */}
            {!!memo && (
              <View style={styles.memoRow}>
                <Text style={styles.memoTitle}>Memo</Text>
                <Text style={styles.memoContent}>{memo}</Text>
              </View>
            )}

            <Buttons.Generic
              color={Colors.green600}
              size="normal"
              title="Send"
              style={styles.sendButton}
              onClick={handleSend}
              disabled={showLedgerPopup || isSending || sendDisabled || txnProcessing}
              testID="send-review-sheet-send-btn"
            >
              {isSending || txnProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                'Confirm Send'
              )}
            </Buttons.Generic>
            {(txError || error) ? <ErrorCard text={txError || error} /> : null}
          </ScrollView>
        </BottomModal>

        <LedgerConfirmationPopup
          showLedgerPopup={(showLedgerPopup || showLedgerPopupSkipTx) && !txError}
          onCloseLedgerPopup={onCloseLedgerPopup}
        />
      </>
    );
  }
);

const styles = StyleSheet.create({
  modalContainer: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fff',
    minHeight: 300,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  tokenTransferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
    backgroundColor: '#f6f6f9',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  tokenCol: {
    flex: 1,
    alignItems: 'center',
  },
  tokenAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e5e5',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tokenAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  chainSymbolImg: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f6f6f9',
  },
  tokenText: {
    fontSize: 8,
    lineHeight: 11,
  },
  tokenAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111',
    marginBottom: 4,
  },
  tokenFiat: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  arrow: {
    backgroundColor: '#e5e5e5',
    borderRadius: 16,
    padding: 2,
  },
  avatar: {
    marginBottom: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#111',
    textAlign: 'center',
    marginBottom: 2,
  },
  memoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f9',
    borderRadius: 16,
    width: '100%',
    padding: 12,
    gap: 16,
  },
  memoTitle: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: 14,
    minWidth: 60,
  },
  memoContent: {
    color: '#111',
    fontSize: 15,
    flex: 1,
  },
  sendButton: {
    width: '100%',
    marginTop: 16,
  },
});

export default ReviewTransferSheet;
