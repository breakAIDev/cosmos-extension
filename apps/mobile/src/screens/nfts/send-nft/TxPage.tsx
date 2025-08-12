import { DeliverTxResponse, isDeliverTxSuccess } from '@cosmjs/stargate';
import {
  CosmosTxType,
  getMetaDataForSendTx,
  LeapWalletApi,
  useActiveChain,
  useAddress,
  useChainId,
  useGetExplorerTxnUrl,
  useInvalidateActivity,
  usePendingTxState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import { CaretRight } from 'phosphor-react-native';
import BigNumber from 'bignumber.js';
import BottomModal from '../../../components/new-bottom-modal';
import Text from '../../../components/text';
import { Button } from '../../../components/ui/button';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { rootBalanceStore } from '../../../context/root-store';
import { formatTokenAmount, sliceWord } from '../../../utils/strings';
import { View, Image, TouchableOpacity, Linking, StyleSheet, Platform } from 'react-native';

export enum TxType {
  SEND = 'Send',
  NFTSEND = 'NFTSend',
}

const TxPage = observer(
  ({ isOpen, onClose, txType }: { isOpen: boolean; onClose: (clear?: boolean) => void; txType: TxType }) => {
    const navigation = useNavigation();
    const [txHash, setTxHash] = useState('');
    const { pendingTx, setPendingTx } = usePendingTxState();
    const txPostToDB = LeapWalletApi.useOperateCosmosTx();

    const {
      txStatus,
      txHash: _txHash,
      sourceChain,
      sourceNetwork,
      toAddress,
      toChain,
      sentAmount,
      sentTokenInfo,
    } = pendingTx ?? {};

    const _activeChain = useActiveChain();
    const activeChain = useMemo(() => sourceChain || _activeChain, [_activeChain, sourceChain]);
    const _selectedNetwork = useSelectedNetwork();
    const selectedNetwork = useMemo(() => sourceNetwork || _selectedNetwork, [_selectedNetwork, sourceNetwork]);
    const activeChainId = useChainId(activeChain, selectedNetwork);
    const address = useAddress(activeChain);

    const invalidateBalances = useCallback(() => {
      rootBalanceStore.refetchBalances(activeChain, selectedNetwork);
      if (toAddress) {
        rootBalanceStore.refetchBalances(toChain ?? activeChain, selectedNetwork, toAddress);
      }
    }, [activeChain, selectedNetwork, toAddress, toChain]);

    const invalidateActivity = useInvalidateActivity();

    const copies = useMemo(() => {
      switch (txType) {
        case TxType.SEND:
          return {
            title:
              txStatus === 'loading'
                ? 'Transaction in progress'
                : txStatus === 'success' || txStatus === 'submitted'
                ? 'Transfer successful!'
                : 'Transfer failed',
            subtite:
              txStatus === 'loading'
                ? 'Tokens will be deposited in recipient’s account once the transaction is complete'
                : txStatus === 'success' || txStatus === 'submitted'
                ? `You sent ${formatTokenAmount(sentAmount ?? '', sentTokenInfo?.coinDenom)} to ${sliceWord(
                    toAddress ?? '',
                    7,
                    3,
                  )}`
                : '',
          };
        case TxType.NFTSEND:
          return {
            title:
              txStatus === 'loading'
                ? 'Transfer in progress'
                : txStatus === 'success' || txStatus === 'submitted'
                ? 'Transfer successful!'
                : 'Transfer failed',
            subtite:
              txStatus === 'loading'
                ? 'NFT will be deposited in recipient’s account once the transaction is complete'
                : txStatus === 'success' || txStatus === 'submitted'
                ? 'NFT has been deposited in recipient’s account'
                : '',
          };
      }
    }, [sentAmount, sentTokenInfo?.coinDenom, toAddress, txStatus, txType]);

    useEffect(() => {
      const invalidateQueries = () => {
        invalidateBalances();
        invalidateActivity(activeChain);
      };

      if (pendingTx && pendingTx.promise) {
        pendingTx.promise
          .then(async (result) => {
            if ('code' in result) {
              if (result && isDeliverTxSuccess(result as DeliverTxResponse)) {
                setPendingTx({ ...pendingTx, txStatus: 'success' });
              } else {
                setPendingTx({ ...pendingTx, txStatus: 'failed' });
              }
            } else if (pendingTx.txType === 'cw20TokenTransfer') {
              setPendingTx({ ...pendingTx, txStatus: 'success' });
            } else if ('status' in result) {
              setPendingTx({ ...pendingTx, txStatus: 'submitted' });
            }
            if (pendingTx.txType === 'cw20TokenTransfer') {
              setTxHash(result.transactionHash);

              txPostToDB({
                txHash: result.transactionHash,
                txType: CosmosTxType.Send,
                metadata: getMetaDataForSendTx(pendingTx?.toAddress ?? '', {
                  amount: new BigNumber(pendingTx.sentAmount ?? '')
                    .times(10 ** (pendingTx.sentTokenInfo?.coinDecimals ?? 6))
                    .toString(),
                  denom: pendingTx.sentTokenInfo?.coinMinimalDenom ?? '',
                }),
                feeQuantity: pendingTx.feeQuantity,
                feeDenomination: pendingTx.feeDenomination,
                amount: pendingTx.txnLogAmount,
                forceChain: activeChain,
                forceNetwork: selectedNetwork,
                forceWalletAddress: address,
                chainId: activeChainId,
              });
            }

            invalidateQueries();
          })
          .catch(() => {
            if (pendingTx.txType === 'cw20TokenTransfer') {
              setPendingTx({ ...pendingTx, txStatus: 'failed' });
            }
            invalidateQueries();
          });
      }
    }, [activeChain, address, selectedNetwork, activeChainId, pendingTx, invalidateBalances, invalidateActivity, setPendingTx, txPostToDB]);

    useEffect(() => {
      if (_txHash) setTxHash(_txHash);
    }, [_txHash]);

    const { explorerTxnUrl: txnUrl } = useGetExplorerTxnUrl({
      forceTxHash: txHash,
      forceChain: activeChain,
      forceNetwork: selectedNetwork,
    });

    const handleHome = () => {
      // navigation to Home (adapt as needed)
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    };

    const handleAgain = () => {
      onClose(txStatus !== 'failed');
    };

    const handleOpenTxnUrl = () => {
      if (txnUrl) {
        Linking.openURL(txnUrl);
      }
    };

    // Helper to get image source (require or remote uri)
    const getImageSrc = (img: any) => {
      if (typeof img === 'string') return { uri: img };
      return img;
    };

    // Select animation/image for status
    let statusBgColor = '#edf3f3';
    let statusImage = Images.Swap.rotate;
    if (txStatus === 'loading') {
      statusBgColor = '#e5e8ef';
      statusImage = Images.Swap.rotate;
    }
    if (txStatus === 'success' || txStatus === 'submitted') {
      statusBgColor = '#5df2b7';
      statusImage = Images.Swap.check_green;
    }
    if (txStatus === 'failed') {
      statusBgColor = Platform.OS === 'ios' ? '#e6555a' : '#e6555a';
      statusImage = Images.Swap.failed_circle_red;
    }

    return (
      <BottomModal
        title={''}
        fullScreen={true}
        onClose={onClose}
        isOpen={isOpen}
        style={styles.modal}
      >
        <View style={styles.centerContainer}>
          <View style={[styles.statusCircle, { backgroundColor: statusBgColor }]}>
            <Image
              source={getImageSrc(statusImage)}
              style={{ width: 48, height: 48, alignSelf: 'center' }}
              resizeMode="contain"
            />
          </View>
          <View style={styles.textBlock}>
            <Text size="xl" style={styles.titleText}>
              {copies.title}
            </Text>
            {copies.subtite ? (
              <Text size="sm" style={styles.subtitleText}>
                {copies.subtite}
              </Text>
            ) : null}
            {txnUrl ? (
              <TouchableOpacity style={styles.txnLinkRow} onPress={handleOpenTxnUrl} activeOpacity={0.8}>
                <Text size="sm" style={styles.txnLinkText}>View transaction</Text>
                <CaretRight size={14} color="#5df2b7" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <View style={styles.bottomActions}>
          <Button
            style={[styles.flex1, { marginRight: 8 }]}
            variant="mono"
            onPress={handleHome}
          >
            Home
          </Button>
          <Button
            style={styles.flex1}
            disabled={txStatus !== 'success' && txStatus !== 'submitted'}
            onPress={handleAgain}
          >
            {txStatus === 'failed' ? 'Try Again' : 'Transfer Again'}
          </Button>
        </View>
      </BottomModal>
    );
  },
);

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    padding: 0,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 36,
  },
  statusCircle: {
    height: 100,
    width: 100,
    borderRadius: 50,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  textBlock: {
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 36,
  },
  titleText: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontWeight: '400',
    color: '#2d333a',
    textAlign: 'center',
    marginBottom: 10,
  },
  txnLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  txnLinkText: {
    color: '#5df2b7',
    fontWeight: '500',
    textDecorationLine: 'underline',
    marginRight: 2,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    zIndex: 100,
  },
  flex1: {
    flex: 1,
    minWidth: 0,
  },
});

export default TxPage;
