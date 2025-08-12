
import { parseUnits } from '@ethersproject/units';
import {
  CosmosTxType,
  GasOptions,
  hasToAddEvmDetails,
  LeapWalletApi,
  useActiveWallet,
  useAddress,
  useChainApis,
  useChainId,
  useChainInfo,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
  useGetEvmGasPrices,
  useNativeFeeDenom,
  useSeiLinkedAddressState,
  useTxMetadata,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  DefaultGasEstimates,
  GasPrice,
  LedgerError,
  NetworkType,
  pubKeyToEvmAddressToShow,
  SeiEvmTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { EvmBalanceStore, RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { EthWallet } from '@leapwallet/leap-keychain';
import { Avatar, Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui';
import { captureException } from '@sentry/react-native';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import Tooltip from '../../../components/better-tooltip';
import { ErrorCard } from '../../../components/ErrorCard';
import GasPriceOptions, { useDefaultGasPrice } from '../../../components/gas-price-options';
import PopupLayout from '../../../components/layout/popup-layout';
import LedgerConfirmationModal from '../../../components/ledger-confirmation/confirmation-modal';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { Tabs } from '../../../components/tabs';
import Text from '../../../components/text';
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from '../../../services/config/constants';
import { MessageTypes } from '../../../services/config/message-types';
import { useSiteLogo } from '../../../hooks/utility/useSiteLogo';
import { Wallet } from '../../../hooks/wallet/useWallet';
import { Images } from '../../../../assets/images';
import { GenericDark, GenericLight } from '../../../../assets/images/logos';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { feeTokensStore } from '../../../context/fee-store';
import { Colors, getChainColor } from '../../../theme/colors';
import { TransactionStatus } from '../../../types/utility';
import { assert } from '../../../utils/assert';
import { formatWalletName } from '../../../utils/formatWalletName';
import { uiErrorTags } from '../../../utils/sentry';
import { trim } from '../../../utils/strings';

import { useHandleRejectClick } from '../utils';
import { Loading } from './index';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, View, Image, StyleSheet, DeviceEventEmitter } from 'react-native';

const useGetWallet = Wallet.useGetWallet;

export type SignTransactionProps = {
  txnData: Record<string, any>;
  rootDenomsStore: RootDenomsStore;
  rootBalanceStore: RootBalanceStore;
  evmBalanceStore: EvmBalanceStore;
  donotClose: boolean;
  activeChain: SupportedChain;
  activeNetwork: NetworkType;
  handleTxnListUpdate: () => void;
};

export const SignTransaction = observer(
  ({
    txnData,
    rootDenomsStore,
    rootBalanceStore,
    evmBalanceStore,
    donotClose,
    handleTxnListUpdate,
    activeChain,
    activeNetwork,
  }: SignTransactionProps) => {
    const navigation = useNavigation();
    const getWallet = useGetWallet(activeChain);
    const { theme } = useTheme();
    const { addressLinkState } = useSeiLinkedAddressState(activeChain);
    const evmBalance = evmBalanceStore.evmBalance;
    const chainInfo = useChainInfo(activeChain);
    const activeWallet = useActiveWallet();
    const allAssets = rootBalanceStore.getBalancesForChain(activeChain, activeNetwork);
    feeTokensStore.getStore(activeChain, activeNetwork, true);

    const [showLedgerPopup, setShowLedgerPopup] = useState(false);
    const {setHandleRejectClick} = useHandleRejectClick();

    const assets = useMemo(() => {
      let _assets = allAssets;
      const addEvmDetails = hasToAddEvmDetails(false, addressLinkState, chainInfo?.evmOnlyChain ?? false);

      if (addEvmDetails) {
        _assets = [..._assets, ...(evmBalance.evmBalance ?? [])].filter((token) => new BigNumber(token.amount).gt(0));
      }

      return _assets;
    }, [addressLinkState, allAssets, chainInfo?.evmOnlyChain, evmBalance.evmBalance]);

    const isEvmTokenExist = useMemo(
      () =>
        (assets ?? []).some((asset) => asset?.isEvm && (asset?.coinMinimalDenom === 'usei' || chainInfo?.evmOnlyChain)),
      [assets, chainInfo?.evmOnlyChain],
    );

    assert(activeWallet !== null, 'activeWallet is null');
    const globalTxMeta = useTxMetadata();
    const txPostToDb = LeapWalletApi.useLogCosmosDappTx();
    const walletName = useMemo(() => {
      return formatWalletName(activeWallet.name);
    }, [activeWallet.name]);

    const address = useAddress(activeChain);
    const evmChainId = useChainId(activeChain, activeNetwork, true);
    const { evmJsonRpc } = useChainApis(activeChain, activeNetwork);
    const defaultGasPrice = useDefaultGasPrice(rootDenomsStore.allDenoms, {
      activeChain,
      isSeiEvmTransaction: true,
    });
    const { status: gasPriceStatus } = useGetEvmGasPrices(activeChain, activeNetwork);

    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
    const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<string>('');
    const [gasPriceError, setGasPriceError] = useState<string | null>(null);
    const [signingError, setSigningError] = useState<string | null>(null);

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

    const [gasPriceOption, setGasPriceOption] = useState<{
      option: GasOptions;
      gasPrice: GasPrice;
    }>({ gasPrice: defaultGasPrice.gasPrice, option: GasOptions.LOW });

    const siteOrigin = txnData?.origin as string | undefined;
    const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2);
    const siteLogo = useSiteLogo(siteOrigin);

    const nativeFeeDenom = useNativeFeeDenom(rootDenomsStore.allDenoms, activeChain, activeNetwork);

    const nativeFeeToken = useMemo(() => {
      if (!nativeFeeDenom) {
        return undefined;
      }

      return (assets ?? []).find((asset) => asset?.coinMinimalDenom === nativeFeeDenom.coinMinimalDenom);
    }, [assets, nativeFeeDenom]);

    useEffect(() => {
      rootBalanceStore.loadBalances(activeChain, activeNetwork);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChain, activeNetwork]);

    const { data: recommendedGasLimit, isLoading: isLoadingGasLimit } = useQuery({
      queryKey: [
        activeChain,
        activeWallet?.pubKeys,
        defaultGasLimit,
        evmJsonRpc,
        gasAdjustment,
        txnData.signTxnData.data,
        txnData.signTxnData.gas,
        txnData.signTxnData.params,
        txnData.signTxnData.to,
        txnData.signTxnData.value,
      ],
      queryFn: async function fetchGasEstimate() {
        if (txnData?.signTxnData?.gas) {
          return Math.ceil(Number(txnData.signTxnData.gas) * gasAdjustment);
        }

        try {
          let gasUsed = defaultGasLimit;

          if (txnData.signTxnData.params) {
            const _gasUsed = await SeiEvmTx.ExecuteEthEstimateGas(txnData.signTxnData.params, evmJsonRpc);

            gasUsed = Math.ceil(Number(_gasUsed) * gasAdjustment);
          } else {
            const fromEthAddress = pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[activeChain]);

            gasUsed = await SeiEvmTx.SimulateTransaction(
              txnData.signTxnData.to,
              txnData.signTxnData.value,
              evmJsonRpc,
              txnData.signTxnData.data,
              undefined,
              fromEthAddress,
            );
            gasUsed = Math.ceil(Number(gasUsed) * gasAdjustment);
          }

          return gasUsed;
        } catch (_) {
          return defaultGasLimit;
        }
      },
      initialData: defaultGasLimit,
    });

    useEffect(() => {
      function resetGasPriceError() {
        if (gasPriceError?.includes('Insufficient funds to cover gas and transaction amount.')) {
          setGasPriceError('');
        }
      }

      async function checkIfFundsAreSufficient() {
        if (gasPriceStatus === 'loading' || !gasPriceOption?.gasPrice?.amount) {
          resetGasPriceError();
          return;
        }

        const amount = txnData.signTxnData.value;
        const gasAmount = new BigNumber(userPreferredGasLimit || recommendedGasLimit).multipliedBy(
          gasPriceOption.gasPrice.amount.toString(),
        );

        const decimals = Number(nativeFeeToken?.coinDecimals ?? 18);
        if (
          nativeFeeToken &&
          !!amount &&
          Number(amount) !== 0 &&
          gasAmount
            .plus(parseUnits(Number(amount).toFixed(decimals), decimals).toString())
            .gt(parseUnits(Number(nativeFeeToken.amount).toFixed(decimals), decimals).toString())
        ) {
          setGasPriceError(`Insufficient funds to cover gas and transaction amount.`);
          return;
        }

        resetGasPriceError();
      }

      checkIfFundsAreSufficient();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      evmJsonRpc,
      gasPriceOption,
      gasPriceStatus,
      nativeFeeToken,
      recommendedGasLimit,
      txnData.signTxnData.value,
      userPreferredGasLimit,
    ]);

    const refetchData = useCallback(() => {
      setTimeout(() => {
        rootBalanceStore.refetchBalances(activeChain, activeNetwork);
      }, 3000);
    }, [activeChain, activeNetwork, rootBalanceStore]);

    const handleApproveClick = async () => {
      try {
        if (activeWallet.walletType === WALLETTYPE.LEDGER) {
          if (chainInfo?.evmOnlyChain) {
            setShowLedgerPopup(true);
          } else {
            throw new Error(SEI_EVM_LEDGER_ERROR_MESSAGE);
          }
        }

        setSigningError(null);
        setTxStatus('loading');

        const wallet = (await getWallet(activeChain, true)) as unknown as EthWallet;

        const seiEvmTx = SeiEvmTx.GetSeiEvmClient(wallet, evmJsonRpc ?? '', Number(evmChainId));
        const result = await seiEvmTx.sendTransaction(
          '',
          txnData.signTxnData.to,
          txnData.signTxnData.value,
          parseInt(Number(userPreferredGasLimit || recommendedGasLimit).toString()),
          parseInt(gasPriceOption.gasPrice.amount.toString()),
          txnData.signTxnData.data,
          false,
        );

        try {
          const evmTxHash = result.hash;
          const feeQuantity = new BigNumber(Number(userPreferredGasLimit || recommendedGasLimit).toString())
            .multipliedBy(gasPriceOption.gasPrice.amount.toString())
            .dividedBy(1)
            .toFixed(0);
          const feeDenomination = nativeFeeDenom.coinMinimalDenom;

          if (chainInfo?.evmOnlyChain) {
            await txPostToDb({
              txType: CosmosTxType.Dapp,
              txHash: evmTxHash,
              metadata: { ...globalTxMeta, dapp_url: siteOrigin ?? origin },
              address: pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[activeChain]),
              chain: activeChain,
              network: activeNetwork,
              isEvmOnly: true,
              feeQuantity,
              feeDenomination,
            });
          } else {
            const cosmosTxHash = await SeiEvmTx.GetCosmosTxHash(evmTxHash, evmJsonRpc ?? '');
            await txPostToDb({
              txType: CosmosTxType.Dapp,
              txHash: cosmosTxHash,
              metadata: { ...globalTxMeta, dapp_url: siteOrigin ?? origin },
              address,
              chain: activeChain,
              network: activeNetwork,
              feeQuantity,
              feeDenomination,
            });
          }
        } catch {
          // Added here as the GetCosmosTxHash call is currently failing causing the send flow to break
        }

        setTxStatus('success');
        try {
          DeviceEventEmitter.emit('signTransaction', {
            type: MessageTypes.signSeiEvmResponse,
            payloadId: txnData?.payloadId,
            payload: { status: 'success', data: result.hash },
          });
        } catch {
          throw new Error('Could not send transaction to the dApp');
        }

        if (!donotClose) {
          navigation.goBack();
        } else {
          handleTxnListUpdate();
        }
      } catch (error) {
        setTxStatus('error');
        if (error instanceof LedgerError) {
          setTimeout(() => {
            setSigningError(null);
          }, 5000);
        }
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong.';
        if (errorMessage.includes('intrinsic gas too low')) {
          setSigningError('Please try again with higher gas fee.');
          return;
        }

        setSigningError(errorMessage);
        captureException(error, {
          tags: uiErrorTags,
        });
      }
    };

    if (chainInfo?.evmOnlyChain && evmBalanceStore.evmBalance.status === 'loading') {
      return <Loading />;
    }

    const isApproveBtnDisabled =
      !!signingError || txStatus === 'loading' || !!gasPriceError || isLoadingGasLimit || gasPriceStatus === 'loading';

  return (
      <View style={styles.root}>
        <View style={styles.panel}>
          <PopupLayout
            style={{ flex: 1 }}
            header={
              <View>
                <Image source={{uri: chainInfo.chainSymbolImageUrl ?? (theme === ThemeName.DARK ? GenericDark : GenericLight)}}/>
                <Buttons.Wallet title={trim(walletName, 10)} style={styles.pr4} />
              </View>
            }
          >
            <ScrollView contentContainerStyle={styles.scrollView}>
              <Text style={styles.title}>Approve Transaction</Text>
              <View style={styles.siteRow}>
                <Avatar
                  avatarImage={siteLogo}
                  size="sm"
                  style={styles.avatar}
                />
                <View style={styles.siteInfo}>
                  <Text style={styles.siteName}>{siteName}</Text>
                  <Text style={styles.siteOrigin}>{siteOrigin}</Text>
                </View>
              </View>

              <GasPriceOptions
                gasLimit={userPreferredGasLimit || recommendedGasLimit?.toString()}
                setGasLimit={value => setUserPreferredGasLimit(value.toString())}
                recommendedGasLimit={recommendedGasLimit?.toString()}
                gasPriceOption={gasPriceOption}
                onGasPriceOptionChange={setGasPriceOption}
                error={gasPriceError}
                setError={setGasPriceError}
                considerGasAdjustment={false}
                chain={activeChain}
                network={activeNetwork}
                isSelectedTokenEvm={isEvmTokenExist}
                isSeiEvmTransaction={true}
                rootDenomsStore={rootDenomsStore}
                rootBalanceStore={rootBalanceStore}
              >
                <Tabs
                  style={{marginTop: 12}}
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
                              <Image source={{uri: Images.Misc.InfoCircle}} style={{ width: 18, height: 18 }} />
                            </View>
                          </Tooltip>
                        </View>
                        <GasPriceOptions.Selector style={styles.mt2} />
                        <View style={styles.mt3End}>
                          <GasPriceOptions.AdditionalSettingsToggle style={{padding: 0, marginTop: 12}} />
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
                  }}
                />
              </GasPriceOptions>

              {signingError && txStatus === 'error' ? (
                <ErrorCard text={signingError} style={styles.errorCard} />
              ) : null}

              {txStatus !== 'error' && showLedgerPopup ? (
                <LedgerConfirmationModal showLedgerPopup={showLedgerPopup} onClose={() => setShowLedgerPopup(false)} />
              ) : null}
            </ScrollView>

            <View style={styles.actionBar}>
              <Buttons.Generic
                title="Reject"
                color={Colors.gray900}
                onClick={() => {
                  setHandleRejectClick(txnData?.payloadId, donotClose);
                  if (donotClose) {
                    handleTxnListUpdate();
                  }
                }}
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
                {txStatus === 'loading' ? <LoaderAnimation color="white" /> : 'Approve'}
              </Buttons.Generic>
            </View>
          </PopupLayout>
        </View>
      </View>
    );
  }
);

// Styles
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fafbfc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginVertical: 16,
    backgroundColor: '#fff',
  },
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