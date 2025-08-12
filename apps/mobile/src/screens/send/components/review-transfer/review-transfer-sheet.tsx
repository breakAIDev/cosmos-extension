import {
  isERC20Token,
  sliceAddress,
  TxCallback,
  useformatCurrency,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  getBech32Address,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  LeapLedgerSignerEth,
  LedgerError,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { RootERC20DenomsStore } from '@leapwallet/cosmos-wallet-store';
import { EthWallet } from '@leapwallet/leap-keychain';
import { ArrowDown, Check } from 'phosphor-react-native';
import { captureException } from '@sentry/react-native';
import BigNumber from 'bignumber.js';
import { ErrorCard } from '../../../../components/ErrorCard';
import LedgerConfirmationPopup from '../../../../components/ledger-confirmation/LedgerConfirmationPopup';
import BottomModal from '../../../../components/new-bottom-modal';
import { Button } from '../../../../components/ui/button';
import { useCaptureTxError } from '../../../../hooks/utility/useCaptureTxError';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Wallet } from '../../../../hooks/wallet/useWallet';
import { CopyIcon } from '../../../../../assets/icons/copy-icon';
import { Images } from '../../../../../assets/images';
import loadingImage from '../../../../../assets/lottie-files/swaps-btn-loading.json';
import { observer } from 'mobx-react-lite';
import { useExecuteSkipTx } from '../../../send/components/review-transfer/executeSkipTx';
import { useSendContext } from '../../../send/context';
import { UserClipboard } from '../../../../utils/clipboard';
import { transition150 } from '../../../../utils/motion-variants';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text as RNText, Image, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native'; // install: npm i lottie-react-native
import { AnimatePresence, MotiText } from 'moti';

type ReviewTransactionSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  setShowTxPage: (val: boolean) => void;
  rootERC20DenomsStore: RootERC20DenomsStore;
};

export const ReviewTransferSheet = observer(
  ({ isOpen, onClose, setShowTxPage, rootERC20DenomsStore }: ReviewTransactionSheetProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const [formatCurrency] = useformatCurrency();
    const defaultTokenLogo = useDefaultTokenLogo();
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
      sendActiveChain,
      setIsSending,
    } = useSendContext();

    const { confirmSkipTx, txnProcessing, error, showLedgerPopupSkipTx, setShowLedgerPopupSkipTx, setError } =
      useExecuteSkipTx();
    const fiatValue = useMemo(
      () => formatCurrency(new BigNumber(inputAmount).multipliedBy(tokenFiatValue ?? 0)),
      [formatCurrency, inputAmount, tokenFiatValue],
    );

    const modifiedCallback: TxCallback = useCallback(
      (status) => {
        setShowTxPage(true);
        onClose();
      },
      [onClose, setShowTxPage],
    );

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

        if (chains[sendActiveChain]?.evmOnlyChain) {
          const wallet = await getWallet(sendActiveChain, true);
          const nativeTokenKey = Object.keys(chains[sendActiveChain]?.nativeDenoms ?? {})?.[0];

          await confirmSendEth(
            toAddress,
            inputAmount,
            userPreferredGasLimit ?? gasEstimate,
            wallet as unknown as EthWallet,
            modifiedCallback,
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
          // If skiptranfer is supported and ibc unwinding in not disabled and it is ibc transfer
          // we use Skip API for transfer or
          // else we use default Cosmos API

          const wallet = await getWallet(sendActiveChain, true);
          if (sendActiveChain === 'evmos' && wallet instanceof LeapLedgerSignerEth) {
            await confirmSend(
              {
                selectedToken: selectedToken,
                toAddress: selectedAddress?.address || '',
                amount: new BigNumber(inputAmount),
                memo: memo,
                fees: fee,
              },
              modifiedCallback,
            );
          } else {
            confirmSkipTx(modifiedCallback);
          }
        } else {
          const sendChainInfo = chains[sendActiveChain];
          let toAddress = selectedAddress?.address;
          if (
            Number(sendChainInfo.bip44.coinType) === 60 &&
            toAddress.toLowerCase().startsWith('0x') &&
            sendChainInfo.key !== 'injective'
          ) {
            toAddress = getBech32Address(sendChainInfo.addressPrefix, toAddress);
          }
          await confirmSend(
            {
              selectedToken: selectedToken,
              toAddress,
              amount: new BigNumber(inputAmount),
              memo: memo,
              fees: fee,
            },
            modifiedCallback,
          );
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
      fee,
      selectedAddress?.address,
      selectedToken,
      allERC20Denoms,
      chains,
      sendActiveChain,
      fetchAccountDetailsData?.pubKey?.key,
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
      modifiedCallback,
      confirmSkipTx,
      setIsSending,
      setTxError,
      setShowLedgerPopup,
      setShowLedgerPopupSkipTx,
    ]);

    useCaptureTxError(txError);

    const onCloseLedgerPopup = useCallback(() => {
      setShowLedgerPopup(false);
      setShowLedgerPopupSkipTx(false);
    }, [setShowLedgerPopup, setShowLedgerPopupSkipTx]);

    useEffect(() => {
      if (isCopied) {
        setTimeout(() => {
          setIsCopied(false);
        }, 2_000);
      }
    }, [isCopied]);

    const senderChainIcon = useMemo(() => {
      if (selectedToken?.tokenBalanceOnChain) {
        return chains?.[selectedToken?.tokenBalanceOnChain as SupportedChain]?.chainSymbolImageUrl;
      }
      return null;
    }, [chains, selectedToken?.tokenBalanceOnChain]);

    const receiverChainIcon = useMemo(() => {
      if (
        !!chains?.[sendActiveChain]?.evmOnlyChain ||
        isAptosChain(sendActiveChain) ||
        isSuiChain(sendActiveChain) ||
        isSolanaChain(sendActiveChain)
      ) {
        return chains?.[sendActiveChain]?.chainSymbolImageUrl;
      }
      return chains?.[selectedAddress?.chainName as SupportedChain]?.chainSymbolImageUrl;
    }, [chains, sendActiveChain, selectedAddress?.chainName]);

    const handleClose = useCallback(() => {
      setError('');
      onClose();
    }, [onClose, setError]);

    // Copy address handler
    const handleCopy = async () => {
      await UserClipboard.copyText(selectedAddress?.ethAddress || selectedAddress?.address || '');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    return (
      <>
        <BottomModal
          isOpen={isOpen}
          onClose={handleClose}
          title="Review transfer"
          containerStyle={{ padding: 24, paddingTop: 32 }}
        >
          <View style={styles.container}>
            {/* Amount + Token Logo */}
            <View style={styles.cardRow}>
              <View>
                <RNText style={styles.amountText}>
                  {/* {formatTokenAmount(inputAmount, selectedToken?.symbol ?? '')} */}
                  123.456 ATOM
                </RNText>
                <RNText style={styles.fiatText}>{fiatValue}</RNText>
              </View>
              <View style={styles.tokenLogoWrap}>
                <Image
                  source={{ uri: selectedToken?.img ?? defaultTokenLogo}}
                  style={styles.tokenLogo}
                />
                {senderChainIcon ?
                  <Image
                    source={{ uri: senderChainIcon}}
                    style={styles.chainLogo}
                  />
                  : null
                }
              </View>
            </View>

            {/* Arrow */}
            <View style={styles.arrowDownWrap}>
              <ArrowDown size={40} color="#23b26d" />
            </View>

            {/* To Address/Receiver */}
            <View style={styles.cardRow}>
              <TouchableOpacity style={styles.toRow} onPress={handleCopy}>
                <RNText style={styles.toAddressText}>
                    {selectedAddress?.ethAddress
                    ? sliceAddress(selectedAddress.ethAddress)
                    : selectedAddress?.selectionType === 'currentWallet'
                    ? selectedAddress?.name?.split('-')[0]
                    : sliceAddress(selectedAddress?.address)}
                </RNText>
                <AnimatePresence>
                  {isCopied ? (
                    <MotiText
                      key='copied'
                      transition={transition150}
                      animate='visible'
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <Check size={20} color="#23b26d" style={{ marginLeft: 8 }} />
                    </MotiText>
                  ) : (
                    <MotiText
                      key='address'
                      transition={transition150}
                      animate='visible'
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                      >
                      <CopyIcon size={20} style={{marginLeft: 8}} />
                    </MotiText>
                  )}
                </AnimatePresence>
              </TouchableOpacity>
              <Image
                source={{ uri: receiverChainIcon || selectedAddress?.avatarIcon || Images.Misc.getWalletIconAtIndex(0)}}
                style={styles.tokenLogoLarge}
              />
            </View>

            {/* Memo */}
            {!!memo && (
              <View style={styles.memoBox}>
                <RNText style={styles.memoLabel}>Memo:</RNText>
                <RNText style={styles.memoText}>{memo}</RNText>
              </View>
            )}

            {/* Error Card */}
            {!!txError && <ErrorCard text={txError || error} />}

            {/* Confirm Send Button */}
            <View style={{ width: '100%', marginTop: 20 }}>
              <Button
                style={styles.confirmBtn}
                onPress={handleSend}
                disabled={showLedgerPopup || isSending || sendDisabled || txnProcessing}
              >
                {isSending || txnProcessing ? (
                  <LottieView
                    autoPlay
                    loop
                    source={loadingImage}
                    style={{ width: 24, height: 24 }}
                  />
                ) : (
                  <RNText style={styles.confirmBtnText}>Confirm Send</RNText>
                )}
              </Button>
            </View>
          </View>
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
  container: { width: '100%', gap: 18, alignItems: 'center' },
  cardRow: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f6f8fa',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountText: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  fiatText: { fontSize: 15, color: '#666', marginTop: 4 },
  tokenLogoWrap: { position: 'relative', width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  tokenLogo: { width: 42, height: 42, borderRadius: 21 },
  chainLogo: { width: 18, height: 18, borderRadius: 9, position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff' },
  arrowDownWrap: {
    marginTop: -20, marginBottom: -20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e8ffe0', borderRadius: 20, borderWidth: 4, borderColor: '#fff', padding: 2,
  },
  toRow: { flexDirection: 'row', alignItems: 'center' },
  toAddressText: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  tokenLogoLarge: { width: 48, height: 48, borderRadius: 24 },
  memoBox: {
    width: '100%', flexDirection: 'row', alignItems: 'baseline', gap: 10,
    backgroundColor: '#f6f8fa', borderRadius: 12, padding: 16, marginTop: 10,
  },
  memoLabel: { fontSize: 14, color: '#999', fontWeight: '500' },
  memoText: { fontSize: 14, color: '#222', fontWeight: '600' },
  confirmBtn: {
    width: '100%',
    backgroundColor: '#23b26d',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
