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
// import classNames from 'classnames';  // Not needed in RN
import BottomModal from '../../../components/new-bottom-modal';
import Text from '../../../components/text';
import { Button } from '../../../components/ui/button';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { rootBalanceStore } from '../../../context/root-store';

const TxPage = observer(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigation = useNavigation();
  const [txHash, setTxHash] = useState('');
  const { pendingTx, setPendingTx } = usePendingTxState();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();

  const { txStatus, txHash: _txHash, sourceChain, sourceNetwork, toAddress, toChain } = pendingTx ?? {};

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

  // Status images
  let statusImage = null;
  let statusImageBg = {};
  if (txStatus === 'loading') {
    statusImage = Images.Swap.rotate;
    statusImageBg = styles.statusLoading;
  }
  if (txStatus === 'success' || txStatus === 'submitted') {
    statusImage = Images.Swap.check_green;
    statusImageBg = styles.statusSuccess;
  }
  if (txStatus === 'failed') {
    statusImage = Images.Swap.failed_circle_red;
    statusImageBg = styles.statusFailed;
  }

  // Status messages
  const mainMsg =
    txStatus === 'loading'
      ? 'Transaction in progress'
      : txStatus === 'success' || txStatus === 'submitted'
      ? 'Transfer successful!'
      : 'Transfer failed';

  const subMsg =
    txStatus === 'loading'
      ? 'Tokens will be deposited in recipient’s account once the transaction is complete'
      : txStatus === 'success' || txStatus === 'submitted'
      ? 'Tokens have been deposited in recipient’s account'
      : '-';

  return (
    <BottomModal
      title={''}
      fullScreen
      onClose={onClose}
      isOpen={isOpen}
      containerStyle={{ flex: 1, backgroundColor: '#fff' }}
    >
      <View style={styles.contentContainer}>
        <View style={styles.statusIconWrap}>
          <View style={[styles.statusIcon, statusImageBg, txStatus === 'loading' ? { transform: [{ rotate: '90deg' }] } : {}]}>
            <Image source={{uri: statusImage!}} style={{ width: 48, height: 48 }} resizeMode="contain" />
          </View>
        </View>
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 10 }}>
          <Text size="xl" style={styles.statusText}>{mainMsg}</Text>
          <Text size="sm" style={styles.subText}>{subMsg}</Text>
        </View>
        {txnUrl ? (
          <TouchableOpacity
            style={styles.txnRow}
            onPress={() => navigation.navigate('Activity')} // replace with your actual Activity route
          >
            <Text size="sm" style={styles.txnLink}>View transaction</Text>
            <CaretRight size={16} color="#23b26d" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.footerRow}>
        <Button
          style={[styles.footerBtn, { backgroundColor: '#222', borderColor: '#222' }]}
          onPress={() => navigation.navigate('Home')}
        >
          Home
        </Button>
        <Button
          style={styles.footerBtn}
          onPress={onClose}
          disabled={txStatus !== 'success' && txStatus !== 'submitted'}
        >
          Transfer Again
        </Button>
      </View>
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 100,
  },
  statusIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    width: 100,
  },
  statusIcon: {
    height: 100,
    width: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  statusLoading: { backgroundColor: '#e8ecf2' },
  statusSuccess: { backgroundColor: '#23b26d' },
  statusFailed: { backgroundColor: '#e3342f' },
  statusText: {
    fontWeight: 'bold',
    color: '#222',
    marginTop: 10,
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 6,
  },
  txnLink: {
    color: '#23b26d',
    fontWeight: 'bold',
  },
  footerRow: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 16,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  footerBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 10,
    paddingVertical: 12,
    // additional styles as needed
  },
});

export default TxPage;
