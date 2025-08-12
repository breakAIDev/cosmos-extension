import { calculateFee } from '@cosmjs/stargate';
import {
  CosmosTxType,
  GasOptions,
  LeapWalletApi,
  useActiveWallet,
  useAddress,
  useChainApis,
  useChainInfo,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
  useTxMetadata,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks';
import { BtcTx, DefaultGasEstimates, estimateVSize, fetchUtxos, GasPrice } from '@leapwallet/cosmos-wallet-sdk';
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { BtcWallet } from '@leapwallet/leap-keychain/dist/browser/key/btc-wallet';
import { Avatar, Buttons, Header, ThemeName, useTheme } from '@leapwallet/leap-ui';
import { captureException } from '@sentry/react-native';
import assert from 'assert';
import BigNumber from 'bignumber.js';
import Tooltip from '../../../components/better-tooltip';
import { ErrorCard } from '../../../components/ErrorCard';
import GasPriceOptions, { useDefaultGasPrice } from '../../../components/gas-price-options';
import PopupLayout from '../../../components/layout/popup-layout';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { Tabs } from '../../../components/tabs';
import { MessageTypes } from '../../../services/config/message-types';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { useSiteLogo } from '../../../hooks/utility/useSiteLogo';
import { Wallet } from '../../../hooks/wallet/useWallet';
import { Images } from '../../../../assets/images';
import { GenericDark, GenericLight } from '../../../../assets/images/logos';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Colors, getChainColor } from '../../../theme/colors';
import { TransactionStatus } from '../../../types/utility';
import { formatWalletName } from '../../../utils/formatWalletName';
import { trim } from '../../../utils/strings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BG_RESPONSE } from '../../../services/config/storage-keys';
import { DeviceEventEmitter, View, Text, ScrollView, StyleSheet } from 'react-native';

import { useHandleRejectClick } from '../utils/shared-functions';

const useGetWallet = Wallet.useGetWallet;

type SendBitcoinProps = {
  txnData: Record<string, any>;
  rootDenomsStore: RootDenomsStore;
  rootBalanceStore: RootBalanceStore;
};

export const SendBitcoin = observer(({ txnData, rootDenomsStore, rootBalanceStore }: SendBitcoinProps) => {
  const getWallet = useGetWallet();
  const globalTxMeta = useTxMetadata();
  const navigation = useNavigation();
  const activeChain = useActiveChain();
  const chainInfo = useChainInfo(activeChain);
  const activeWallet = useActiveWallet();
  const { theme } = useTheme();
  const { setHandleRejectClick } = useHandleRejectClick();

  assert(activeWallet !== null, 'activeWallet is null');
  const walletName = useMemo(() => formatWalletName(activeWallet.name), [activeWallet.name]);
  const address = useAddress();

  const siteOrigin = txnData?.origin as string | undefined;
  const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2);
  const siteLogo = useSiteLogo(siteOrigin);

  const { rpcUrl } = useChainApis(activeChain);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<string>('');
  const defaultGasEstimates = useDefaultGasEstimates();
  const gasAdjustment = useGasAdjustmentForChain(activeChain);
  const defaultGasLimit = useMemo(
    () =>
      parseInt(
        (
          (defaultGasEstimates[activeChain]?.DEFAULT_GAS_IBC ?? DefaultGasEstimates.DEFAULT_GAS_IBC) * gasAdjustment
        ).toString(),
      ),
    [activeChain, defaultGasEstimates, gasAdjustment],
  );

  const [recommendedGasLimit, setRecommendedGasLimit] = useState<number>(defaultGasLimit);
  const [gasPriceError, setGasPriceError] = useState<string | null>(null);
  const defaultGasPrice = useDefaultGasPrice(rootDenomsStore.allDenoms, {
    activeChain,
  });
  const [gasPriceOption, setGasPriceOption] = useState<{
    option: GasOptions;
    gasPrice: GasPrice;
  }>({ gasPrice: defaultGasPrice.gasPrice, option: GasOptions.LOW });

  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [signingError, setSigningError] = useState<string | null>(null);
  const [isLoadingGasLimit, setIsLoadingGasLimit] = useState<boolean>(false);

  const txPostToDB = LeapWalletApi.useLogCosmosDappTx();

  // This is the fee used in the transaction.
  const fee = useMemo(() => {
    const gasLimit = userPreferredGasLimit || recommendedGasLimit;
    if (!gasPriceOption.gasPrice) return;
    return calculateFee(Math.ceil(Number(gasLimit)), gasPriceOption.gasPrice);
  }, [userPreferredGasLimit, recommendedGasLimit, gasPriceOption.gasPrice]);

  useEffect(() => {
    (async function fetchGasEstimate() {
      if (rpcUrl) {
        setIsLoadingGasLimit(true);
        const utxos = await fetchUtxos(address, rpcUrl);
        const estimatedVSize = estimateVSize(utxos.length, 2, 'p2wpkh');
        setRecommendedGasLimit(estimatedVSize);
        setIsLoadingGasLimit(false);
      }
    })();
  }, [address, rpcUrl]);

  const refetchData = useCallback(() => {
    setTimeout(() => {
      rootBalanceStore.refetchBalances(activeChain);
    }, 3000);
  }, [activeChain, rootBalanceStore]);

  const handleApproveClick = async () => {
    try {
      if (activeWallet.walletType === WALLETTYPE.LEDGER) {
        throw new Error('Ledger transactions are not supported yet');
      }

      if (fee) {
        setSigningError(null);
        setTxStatus('loading');

        const wallet = (await getWallet(activeChain)) as unknown as BtcWallet;
        const network = activeChain === 'bitcoin' ? 'mainnet' : 'testnet';
        const btcTx = new BtcTx(network, wallet, rpcUrl);
        const feeRate = parseInt(fee.amount[0].amount) / parseInt(fee.gas);
        const accounts = wallet.getAccounts();

        if (!accounts[0].pubkey) {
          throw new Error('No public key found');
        }

        const result = await btcTx.createTransaction({
          sourceAddress: address,
          addressType: 'p2wpkh',
          destinationAddress: txnData.signTxnData.to,
          amount: Number(txnData.signTxnData.amount),
          feeRate: feeRate,
          pubkey: accounts[0].pubkey,
        });

        try {
          await txPostToDB({
            txHash: result.txHex,
            txType: CosmosTxType.Dapp,
            metadata: { ...globalTxMeta, dapp_url: siteOrigin ?? origin },
            feeQuantity: fee.amount[0].amount,
            feeDenomination: fee.amount[0].denom,
            address,
            chain: activeChain,
          });
        } catch (e) {
          captureException(e, {
            extra: {
              extra_info: 'Bitcoin dApp sendBitcoin Error -- txPostToDB: ',
            },
          });
        }

        setTxStatus('success');
        try {
          DeviceEventEmitter.emit('bitcoinSignEvent', {
            type: MessageTypes.signBitcoinResponse,
            payloadId: txnData?.payloadId,
            payload: { status: 'success', data: result.txId },
          });
        } catch {
          throw new Error('Could not send transaction to the dApp');
        }

        DeviceEventEmitter.emit(
          MessageTypes.signBitcoinResponse,
          {payloadId: txnData?.payloadId, status: 'success', data: result.txId}
        );
        navigation.goBack()
      }
    } catch (error) {
      setTxStatus('error');
      setSigningError((error as Error).message);
    }
  };

  const isApproveBtnDisabled = !!signingError || txStatus === 'loading' || !!gasPriceError || isLoadingGasLimit;

  return (
    <PopupLayout
      style={{ flex: 1 }}
      header={
        <Header
          imgSrc={chainInfo.chainSymbolImageUrl ?? (theme === ThemeName.DARK ? GenericDark : GenericLight)}
          title={<Buttons.Wallet title={trim(walletName, 10)} style={styles.pr4} />}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Approve Transaction</Text>
        <View style={styles.siteRow}>
          <Avatar
            avatarImage={siteLogo}
            avatarOnError={() => {}}
            size='sm'
            style={styles.avatar}
          />
          <View style={styles.siteInfo}>
            <Text style={styles.siteName}>{siteName}</Text>
            <Text style={styles.siteOrigin}>{siteOrigin}</Text>
          </View>
        </View>

        {/* GasPriceOptions and Tabs - if these are web-only, replace with RN components */}
        <GasPriceOptions
          gasLimit={userPreferredGasLimit || recommendedGasLimit?.toString()}
          setGasLimit={(value: string | number | BigNumber) => setUserPreferredGasLimit(value.toString())}
          recommendedGasLimit={recommendedGasLimit?.toString()}
          gasPriceOption={gasPriceOption}
          onGasPriceOptionChange={(value: any) => setGasPriceOption(value)}
          error={gasPriceError}
          setError={setGasPriceError}
          considerGasAdjustment={false}
          chain={activeChain}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        >
          <Tabs
            tabsList={[
              { id: 'fees', label: 'Fees' },
              { id: 'details', label: 'Details' },
            ]}
            tabsContent={{
              fees: (
                <View style={styles.feeCard}>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>
                      Gas Fees <Text style={{ textTransform: 'capitalize' }}>({gasPriceOption.option})</Text>
                    </Text>
                    <Tooltip content={<Text>You can choose higher gas fees for faster transaction processing.</Text>}>
                      <View style={styles.infoIcon}>
                        {/* Replace with Image if needed */}
                      </View>
                    </Tooltip>
                  </View>

                  {/* Add GasPriceOptions.Selector if implemented in RN */}
                  <GasPriceOptions.Selector style={styles.mt2} />
                  <View style={styles.mt3End}>
                    <GasPriceOptions.AdditionalSettingsToggle style={styles.p0} />
                  </View>
                  <GasPriceOptions.AdditionalSettings
                    style={styles.mt2}
                    showGasLimitWarning={true}
                    rootDenomsStore={rootDenomsStore}
                    rootBalanceStore={rootBalanceStore}
                  />

                  {gasPriceError ? (
                    <Text style={styles.gasPriceError}>{gasPriceError}</Text>
                  ) : null}
                </View>
              ),
              details: (
                <View style={styles.detailsCard}>
                  <Text style={styles.detailsText}>
                    {JSON.stringify(
                      txnData.signTxnData.details,
                      (_, value) => (typeof value === 'bigint' ? value.toString() : value),
                      2,
                    )}
                  </Text>
                </View>
              ),
            }}/>
        </GasPriceOptions>

        {signingError && txStatus === 'error' ? (
          <ErrorCard text={signingError} style={styles.errorCard} />
        ) : null}
      </ScrollView>

      <View style={styles.actionBar}>
        <Buttons.Generic
          title="Reject"
          color={Colors.gray900}
          onClick={() => setHandleRejectClick(txnData?.payloadId)}
          disabled={txStatus === 'loading'}
        >
          Reject
        </Buttons.Generic>

        <Buttons.Generic
          title="Approve"
          color={getChainColor(activeChain)}
          onClick={handleApproveClick}
          disabled={isApproveBtnDisabled}
          style={isApproveBtnDisabled ? styles.disabledBtn : undefined}
        >
          {txStatus === 'loading' ? <LoaderAnimation color='white' /> : 'Approve'}
        </Buttons.Generic>
      </View>
    </PopupLayout>
  );
});

// ---- Styles ----
const styles = StyleSheet.create({
  pr4: { paddingRight: 16 },
  scrollView: {
    padding: 16,
    paddingBottom: 120,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  siteInfo: { marginLeft: 12 },
  siteName: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: '#222',
    fontSize: 16,
  },
  siteOrigin: {
    fontSize: 12,
    color: '#888',
    textTransform: 'lowercase',
  },
  feeCard: {
    borderRadius: 12,
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
    marginBottom: 8,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  feeLabel: {
    color: '#555',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoIcon: {
    marginLeft: 8,
  },
  mt2: { marginTop: 8 },
  mt3End: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  gasPriceError: {
    color: '#f44',
    fontSize: 13,
    marginTop: 8,
    paddingLeft: 2,
  },
  detailsCard: {
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    zIndex: 1,
  },
  errorCard: { marginTop: 12 },
  disabledBtn: {
    opacity: 0.5,
  },
});
