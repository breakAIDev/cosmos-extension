import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { isDeliverTxSuccess } from '@cosmjs/stargate';
import {
  CosmosTxType,
  formatTokenAmount,
  getMetaDataForSecretTokenTransfer,
  getMetaDataForSendTx,
  LeapWalletApi,
  MobileAppBanner,
  useActiveChain,
  useAddress,
  useChainId,
  useGetExplorerTxnUrl,
  useInvalidateActivity,
  useMobileAppBanner,
  usePendingTxState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import { RootBalanceStore, RootStakeStore } from '@leapwallet/cosmos-wallet-store';
import { Header, useTheme } from '@leapwallet/leap-ui';
import { ArrowSquareOut,  UserCircle } from 'phosphor-react-native';
import BigNumber from 'bignumber.js';
import PopupLayout from '../../components/layout/popup-layout';
import { LoaderAnimation } from '../../components/loader/Loader';
import { Images } from '../../../assets/images';
import { Cross } from '../../../assets/images/misc';
import { TxResponse } from 'secretjs';
import { hideAssetsStore } from '../../context/hide-assets-store';
import { UserClipboard } from '../../utils/clipboard';


const txStatusStyles = {
  loading: {
    title: 'In Progress...',
  },
  success: {
    title: 'Complete',
  },
  submitted: {
    title: 'Submitted',
  },
  failed: {
    title: 'Failed',
  },
};

function MobileQrCode({ setShowMobileQrCode, data }: { setShowMobileQrCode: (show: boolean) => void; data: MobileAppBanner }) {
  const handleClose = () => {
    setShowMobileQrCode(false);
  };
  return (
    <View style={styles.qrContainer}>
      <Image source={{ uri: data.img_src }} style={styles.qrImage} />
      <TouchableOpacity style={styles.qrCloseButton} onPress={handleClose}>
        <Image source={{uri: Cross}} style={styles.qrCloseIcon} />
      </TouchableOpacity>
    </View>
  );
}

type PendingTxProps = {
  rootBalanceStore: RootBalanceStore;
  rootStakeStore: RootStakeStore;
};

const PendingTx = ({ rootBalanceStore, rootStakeStore }: PendingTxProps) => {
  const navigation = useNavigation();
  const [txHash, setTxHash] = useState('');
  const [showMobileQrCode, setShowMobileQrCode] = useState(true);
  const [isCopiedClick, setIsCopiedClick] = useState(false);
  const { theme } = useTheme();
  const { pendingTx, setPendingTx } = usePendingTxState();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();
  const {
    txType,
    title1,
    subtitle1,
    sentTokenInfo,
    sentAmount,
    receivedAmount,
    sentUsdValue,
    receivedTokenInfo,
    txStatus,
    txHash: _txHash,
    sourceChain,
    sourceNetwork,
    toAddress,
    toChain,
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
  }, [activeChain, rootBalanceStore, selectedNetwork, toAddress, toChain]);

  const invalidateDelegations = useCallback(() => {
    rootStakeStore.updateStake(activeChain, selectedNetwork, true);
  }, [activeChain, rootStakeStore, selectedNetwork]);

  const invalidateActivity = useInvalidateActivity();
  useEffect(() => {
    const invalidateQueries = () => {
      invalidateBalances();
      invalidateDelegations();
      invalidateActivity(activeChain);
    };

    if (pendingTx && pendingTx.promise) {
      pendingTx.promise
        .then(async (result) => {
          if ('code' in result) {
            if (result && 'txType' in result) {
              setPendingTx({ ...pendingTx, txStatus: result.code === 0 ? 'success' : 'failed' });
            } else if (result && isDeliverTxSuccess(result)) {
              setPendingTx({ ...pendingTx, txStatus: 'success' });
            } else {
              setPendingTx({ ...pendingTx, txStatus: 'failed' });
            }
          } else if (pendingTx.txType === 'cw20TokenTransfer') {
            setPendingTx({ ...pendingTx, txStatus: 'success' });
          } else if ('status' in result) {
            setPendingTx({ ...pendingTx, txStatus: 'submitted' });
          }

          if (pendingTx.txType === 'secretTokenTransfer') {
            setTxHash(result.transactionHash);

            const _result = result as unknown as TxResponse;
            let feeQuantity;

            if (_result?.tx?.auth_info?.fee?.amount) {
              feeQuantity = _result?.tx?.auth_info?.fee?.amount[0].amount;
            }

            txPostToDB({
              txHash: _result.transactionHash,
              txType: CosmosTxType.SecretTokenTransaction,
              metadata: getMetaDataForSecretTokenTransfer(pendingTx.sentTokenInfo?.coinMinimalDenom ?? ''),
              feeQuantity,
              feeDenomination: 'uscrt',
              amount: pendingTx.txnLogAmount,
              forceChain: activeChain,
              forceNetwork: selectedNetwork,
              forceWalletAddress: address,
              chainId: activeChainId,
            });
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
  }, [activeChain, address, selectedNetwork, activeChainId, pendingTx, invalidateBalances, invalidateDelegations, invalidateActivity, setPendingTx, txPostToDB]);

  useEffect(() => {
    if (_txHash) setTxHash(_txHash);
  }, [_txHash]);

  const { status, data } = useMobileAppBanner();

  const sentAmountInfo =
    sentAmount && sentTokenInfo ? formatTokenAmount(sentAmount, sentTokenInfo.coinDenom) : undefined;
  const receivedAmountInfo =
    receivedAmount && receivedTokenInfo ? formatTokenAmount(receivedAmount, receivedTokenInfo.coinDenom) : undefined;

  const balanceReduced = txType === 'delegate' || txType === 'send' || txType === 'liquidity/add';

  const { explorerTxnUrl: txnUrl } = useGetExplorerTxnUrl({
    forceTxHash: txHash,
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  const isSendTxn = txType
    ? ['ibc/transfer', 'send', 'secretTokenTransfer', 'cw20TokenTransfer'].includes(txType)
    : false;

  const handleCopyTxHash = () => {
    UserClipboard.copyText(txHash);
    setIsCopiedClick(true);
    setTimeout(() => setIsCopiedClick(false), 2000);
  };

  const handleOpenExplorer = () => {
    if (txnUrl) {
      Linking.openURL(txnUrl).catch(() => Alert.alert('Unable to open URL'));
    }
  };

  return (
    <PopupLayout style={styles.popupLayout}>
      <Header title={`Transaction ${txStatusStyles[txStatus ?? 'loading'].title}`} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {txStatus === 'loading' && <LoaderAnimation color="#29a874" style={styles.statusIcon} />}
          {(txStatus === 'success' || txStatus === 'submitted') && (
            <Image source={{uri: Images.Activity.SendDetails}} style={styles.statusIcon} />
          )}
          {txStatus === 'failed' && (
            <Image source={{uri: Images.Activity.Error}} style={styles.statusIcon} />
          )}

          <Text style={styles.title}>{title1}</Text>

          {isSendTxn && txStatus !== 'submitted' && (
            <Text style={styles.statusLabel}>
              {txStatus === 'success'
                ? 'sent successfully to'
                : txStatus === 'failed'
                ? 'failed sending to'
                : 'sending to'}
            </Text>
          )}

          {isSendTxn ? (
            <View style={styles.recipientBadge}>
              <UserCircle size={18} style={{ color: theme === 'dark' ? '#1F2937' : '#E5E7EB' }} />
              <Text style={styles.recipientText}>{subtitle1}</Text>
            </View>
          ) : (
            <Text style={styles.subTitle}>{subtitle1}</Text>
          )}

          {!isSendTxn ? (
            <View style={styles.row}>
              {txType === 'swap' ? (
                <>
                  {receivedAmountInfo && (
                    <Text style={[styles.textRight, styles.fontSemibold, styles.textGreen]}>
                      + {hideAssetsStore.formatHideBalance(receivedAmountInfo)}
                    </Text>
                  )}
                  {sentAmountInfo && (
                    <Text style={[styles.textRight, theme !== 'dark' ? styles.textGrayLight : styles.textGrayDark]}>
                      - {hideAssetsStore.formatHideBalance(sentAmountInfo)}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  {sentUsdValue && (
                    <Text style={[styles.textRight, styles.fontSemibold]}>
                      ({balanceReduced ? '-' : ''}
                      ${hideAssetsStore.formatHideBalance(Number(sentUsdValue).toFixed(2))})
                    </Text>
                  )}
                  {sentAmountInfo && (
                    <Text style={[styles.textRight, theme !== 'dark' ? styles.textGrayLight : styles.textGrayDark]}>
                      {balanceReduced ? '-' : ''}
                      {hideAssetsStore.formatHideBalance(sentAmountInfo)}
                    </Text>
                  )}
                </>
              )}
            </View>
          ) : (
            null
          )}
        </View>

        {txHash ? (
          <TouchableOpacity style={styles.txHashRow} onPress={handleCopyTxHash}>
            <View style={{ flex: 1 }}>
              <Text style={styles.txHashLabel}>Transaction ID</Text>
              <Text style={styles.txHashValue}>{txHash}</Text>
            </View>
            {isCopiedClick ? (
              <Text style={styles.copiedText}>Copied!</Text>
            ) : (
              <Image source={{uri: Images.Activity.Copy}} style={styles.copyIcon} />
            )}
            {txnUrl ? (
              <TouchableOpacity onPress={handleOpenExplorer}>
                <ArrowSquareOut
                  size={20}
                  color={theme === 'dark' ? '#FFF' : '#111'} // white or black
                  style={styles.openIcon}
                />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        ) : null}

        {showMobileQrCode && status === 'success' && data && data.visible ? (
          <MobileQrCode setShowMobileQrCode={setShowMobileQrCode} data={data} />
        ) : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendAgainButton, { opacity: txStatus === 'success' || txStatus === 'submitted' ? 1 : 0.5 }]}
            onPress={() => {navigation.navigate('Send')}}
            disabled={!(txStatus === 'success' || txStatus === 'submitted')}
          >
            <Text style={styles.sendAgainButtonText}>Send Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PopupLayout>
  );
};

const styles = StyleSheet.create({
  popupLayout: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 24,
    paddingBottom: 12,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#f7f8fa',
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  statusIcon: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
    textAlign: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginTop: 4,
  },
  subTitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f5',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  recipientText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  txHashRow: {
    backgroundColor: '#f7f8fa',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  txHashLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  txHashValue: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  copyIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  copiedText: {
    color: '#29a874',
    marginLeft: 8,
    fontWeight: '500',
  },
  openIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  qrContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  qrCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 10,
  },
  qrCloseIcon: {
    width: 18,
    height: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 16,
  },
  homeButton: {
    flex: 1,
    backgroundColor: '#F3F3F5',
    borderRadius: 999,
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 8,
  },
  homeButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sendAgainButton: {
    flex: 1,
    backgroundColor: '#29a874',
    borderRadius: 999,
    alignItems: 'center',
    paddingVertical: 12,
    marginLeft: 8,
  },
  sendAgainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,            // mt-2
    alignItems: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  fontSemibold: {
    fontWeight: '600',
  },
  // Color styles
  textGreen: {
    color: '#16A34A',        // tailwind 'text-green-600'
  },
  textGrayLight: {
    color: '#4B5563',        // tailwind 'text-gray-600'
  },
  textGrayDark: {
    color: '#9CA3AF',        // tailwind 'dark:text-gray-400'
  },
  textBlack: {
    color: '#222222',        // tailwind 'text-black-100'
  },
  textWhite: {
    color: '#FFFFFF',        // tailwind 'dark:text-white-100'
  },
  textRedLight: {
    color: '#DC2626',        // tailwind 'text-red-600'
  },
  textRedDark: {
    color: '#FCA5A5',        // tailwind 'dark:text-red-300'
  },
});

export default PendingTx;
