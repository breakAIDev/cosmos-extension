
import { AptosApiError } from '@aptos-labs/ts-sdk';
import { StdFee } from '@cosmjs/stargate';
import {
  CosmosTxType,
  GasOptions,
  Key,
  LeapWalletApi,
  useActiveWallet,
  useChainApis,
  useChainInfo,
  useChainsStore,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
  useNativeFeeDenom,
  useTxMetadata,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  chainIdToChain,
  ChainInfo,
  DefaultGasEstimates,
  GasPrice,
  NativeDenom,
  sleep,
  SuiAccount,
  SuiTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { Avatar, Buttons, Header, ThemeName, useTheme } from '@leapwallet/leap-ui';
import { CheckSquare, Square } from 'phosphor-react-native';
import { captureException } from '@sentry/react-native';
import BigNumber from 'bignumber.js';
import Tooltip from '../../components/better-tooltip';
import { ErrorCard } from '../../components/ErrorCard';
import GasPriceOptions, { useDefaultGasPrice } from '../../components/gas-price-options';
import PopupLayout from '../../components/layout/popup-layout';
import LedgerConfirmationModal from '../../components/ledger-confirmation/confirmation-modal';
import { LoaderAnimation } from '../../components/loader/Loader';
import SelectWalletSheet from '../../components/select-wallet-sheet';
import { Tabs } from '../../components/tabs';
import Text from '../../components/text';
import { walletLabels } from '../../services/config/constants';
import { MessageTypes } from '../../services/config/message-types';
import { BG_RESPONSE } from '../../services/config/storage-keys';
import { decodeChainIdToChain } from '../../context/utils';
import { usePerformanceMonitor } from '../../hooks/perf-monitoring/usePerformanceMonitor';
import { useUpdateKeyStore } from '../../hooks/settings/useActiveWallet';
import { useSiteLogo } from '../../hooks/utility/useSiteLogo';
import { Wallet } from '../../hooks/wallet/useWallet';
import { Images } from '../../../assets/images';
import { GenericDark, GenericLight } from '../../../assets/images/logos';
import { observer } from 'mobx-react-lite';
import { addToConnections } from '../ApproveConnection/utils';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { feeTokensStore } from '../../context/fee-store';
import { rootBalanceStore } from '../../context/root-store';
import { Colors, getChainColor } from '../../theme/colors';
import { assert } from '../../utils/assert';
import { formatWalletName } from '../../utils/formatWalletName';
import { trim } from '../../utils/strings';

import StaticFeeDisplay from './static-fee-display';
import { getOriginalSignDoc, getSuiSignDoc } from './utils/sign-sui';
import { DeviceEventEmitter } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

const useGetWallet = Wallet.useGetWallet;
const useSuiSigner = Wallet.useSuiSigner;

type SignTransactionProps = {
  data: Record<string, any>;
  chainId: string;
  rootBalanceStore: RootBalanceStore;
  rootDenomsStore: RootDenomsStore;
  activeChain: SupportedChain;
};

const SignTransaction = observer(
  ({ data: txnSigningRequest, chainId, rootBalanceStore, rootDenomsStore, activeChain }: SignTransactionProps) => {
    const isDappTxnInitEventLogged = useRef(false);
    const isRejectedRef = useRef(false);
    const isApprovedRef = useRef(false);
    const addressGenerationDone = useRef<boolean>(false);
    const { theme } = useTheme();
    const navigation = useNavigation();

    const [showWalletSelector, setShowWalletSelector] = useState(false);
    const [showLedgerPopup, setShowLedgerPopup] = useState(false);
    const [signingError, setSigningError] = useState<string | null>(null);
    const [ledgerError] = useState<string | null>(null);
    const [gasPriceError, setGasPriceError] = useState<string | null>(null);
    const [selectedWallets, setSelectedWallets] = useState<[Key] | [] | Key[]>([]);
    const [feeToShow, setFeeToShow] = useState<number>(0);

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
    const [isLoadingGasLimit, setIsLoadingGasLimit] = useState<boolean>(false);
    const [recommendedGasLimit, setRecommendedGasLimit] = useState<number>(0);
    const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<string>('');
    const [isSigning, setIsSigning] = useState<boolean>(false);
    const suiChainIds = ['sui-101', 'sui-103'];

    const chainInfo = useChainInfo(activeChain);
    const activeWallet = useActiveWallet();
    const getSuiSigner = useSuiSigner();
    const getWallet = useGetWallet(activeChain);
    const { chains } = useChainsStore();
    const updateKeyStore = useUpdateKeyStore();

    const selectedNetwork = useMemo(() => {
      return chainId === 'sui:testnet' ? 'testnet' : 'mainnet';
    }, [chainId]);

    const denoms = rootDenomsStore.allDenoms;
    const defaultGasPrice = useDefaultGasPrice(denoms, { activeChain });
    const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetwork);
    const txPostToDb = LeapWalletApi.useLogCosmosDappTx();
    const selectedGasOptionRef = useRef(false);
    const [isFeesValid, setIsFeesValid] = useState<boolean | null>(null);
    const [highFeeAccepted, setHighFeeAccepted] = useState<boolean>(false);
    const globalTxMeta = useTxMetadata();
    const { lcdUrl, rpcUrl } = useChainApis(activeChain, selectedNetwork);
    const activeChainfeeTokensStore = feeTokensStore.getStore(activeChain, selectedNetwork, false);
    const feeTokens = activeChainfeeTokensStore?.data;

    const errorMessageRef = useRef<any>(null);

    useEffect(() => {
      async function generateAddresses() {
        const wallet = activeWallet;
        if (!wallet || addressGenerationDone.current) return;

        const chainsToGenerateAddresses = ['sui'].filter((chain) => {
          const hasAddress = selectedWallets?.[0]?.addresses?.[chain as SupportedChain];
          const hasPubKey = selectedWallets?.[0]?.pubKeys?.[chain as SupportedChain];
          return (chains[chain as SupportedChain] && !hasAddress) || !hasPubKey;
        });

        if (!chainsToGenerateAddresses?.length) {
          return;
        }

        const _chainInfos: Partial<Record<SupportedChain, ChainInfo>> = {};

        for await (const chain of chainsToGenerateAddresses) {
          _chainInfos[chain as SupportedChain] = chains[chain as SupportedChain];
        }
        const keyStore = await updateKeyStore(
          wallet,
          chainsToGenerateAddresses as SupportedChain[],
          'UPDATE',
          undefined,
          _chainInfos,
        );
        addressGenerationDone.current = true;
        const newSelectedWallets = selectedWallets.map((wallet) => {
          if (!keyStore) return wallet;
          const newWallet = keyStore[wallet.id];
          if (!newWallet) {
            return wallet;
          }
          return newWallet;
        });
        setSelectedWallets(newSelectedWallets);
      }

      generateAddresses();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const suiClientPromise = useMemo(async () => {
      const sui = await getSuiSigner(activeChain);
      const suiClient = await SuiTx.getSuiClient(sui as unknown as SuiAccount, selectedNetwork);
      return suiClient;
    }, [activeChain, getSuiSigner, selectedNetwork]);

    useEffect(() => {
      // Check if the error message is rendered and visible
      if (!isFeesValid && errorMessageRef.current) {
        // Scroll the parent component to the error message
        setTimeout(() => {
          errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 10);
      }
    }, [isFeesValid]);

    useEffect(() => {
      rootBalanceStore.loadBalances(activeChain, selectedNetwork);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChain, selectedNetwork]);

    const [gasPriceOption, setGasPriceOption] = useState<{
      option: GasOptions;
      gasPrice: GasPrice;
    }>({ gasPrice: defaultGasPrice.gasPrice, option: GasOptions.LOW });

    assert(activeWallet !== null, 'activeWallet is null');

    const walletName = useMemo(() => {
      return activeWallet.walletType === WALLETTYPE.LEDGER
        ? `${walletLabels[activeWallet.walletType]} Wallet ${activeWallet.addressIndex + 1}`
        : formatWalletName(activeWallet.name);
    }, [activeWallet.addressIndex, activeWallet.name, activeWallet.walletType]);

    const { shouldSubmit, isSignMessage, signOptions } = useMemo(() => {
      const shouldSubmit = txnSigningRequest?.submit;
      const isSignMessage = txnSigningRequest?.isSignMessage;
      const signOptions = txnSigningRequest?.signOptions;
      return {
        shouldSubmit,
        isSignMessage,
        signOptions,
      };
    }, [txnSigningRequest]);

    const {
      allowSetFee,
      message,
      signDoc,
      fee,
      defaultFee,
    }: {
      allowSetFee: boolean;
      message: string;
      signDoc: string | null | Uint8Array;
      fee: StdFee | undefined;
      defaultFee: StdFee | undefined;
    } = useMemo(() => {
      const { allowSetFee, updatedSignDoc, updatedFee, defaultFee } = getSuiSignDoc({
        signRequestData: txnSigningRequest,
        gasPrice: gasPriceOption.gasPrice,
        gasLimit: userPreferredGasLimit,
        isGasOptionSelected: selectedGasOptionRef.current,
        nativeFeeDenom: nativeFeeDenom,
      });

      return {
        allowSetFee,
        message: '',
        signDoc: updatedSignDoc,
        fee: updatedFee,
        defaultFee,
      };
    }, [txnSigningRequest, gasPriceOption.gasPrice, userPreferredGasLimit, nativeFeeDenom]);

    const siteOrigin = txnSigningRequest?.origin as string | undefined;
    const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2);
    const siteLogo = useSiteLogo(siteOrigin);

    const refetchData = useCallback(() => {
      setTimeout(() => {
        rootBalanceStore.refetchBalances(activeChain, selectedNetwork);
      }, 3000);
    }, [activeChain, rootBalanceStore, selectedNetwork]);

    const handleCancel = useCallback(async () => {
      if (isRejectedRef.current || isApprovedRef.current) return;
      isRejectedRef.current = true;

      // try {
      //     mixpanel.track(
      //         EventName.DappTxnRejected,
      //         {
      //             dAppURL: siteOrigin,
      //             signMode: 'sign-sui',
      //             walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
      //             chainId: chainInfo.chainId,
      //             chainName: chainInfo.chainName,
      //             productVersion: browser.runtime.getManifest().version,
      //             time: Date.now() / 1000,
      //         },
      //         mixpanelTrackOptions,
      //     )
      // } catch (e) {
      //     captureException(e)
      // }

      await DeviceEventEmitter.emit('signTransaction', {
        type: MessageTypes.signResponse,
        payload: { status: 'error', data: 'Transaction cancelled by the user.' },
      });
      navigation.goBack();
    }, [navigation]);

    const currentWalletInfo = useMemo(() => {
      if (!activeWallet || !chainId || !siteOrigin) return undefined;
      return {
        wallets: [activeWallet] as [typeof activeWallet],
        chainIds: [chainId] as [string],
        origin: siteOrigin,
      };
    }, [activeWallet, chainId, siteOrigin]);

    const dappFeeDenom = useMemo(() => {
      if (defaultFee && defaultFee?.amount[0]) {
        const { denom } = defaultFee.amount[0];
        // calculate gas price based on recommended gas limit
        return denom;
      }
      return defaultGasPrice.gasPrice.denom;
    }, [defaultFee, defaultGasPrice.gasPrice]);

    const approveTransaction = useCallback(async () => {
      const activeAddress = activeWallet.addresses[activeChain];
      if (!activeChain || !signDoc || !activeAddress) {
        return;
      }

      const suiClient = await suiClientPromise;
      setIsSigning(true);
      try {
        if (isSignMessage) {
          const signedTxData = await suiClient.signMessage(signDoc as Uint8Array);

          await sleep(100);

          try {
            // Check if there's an active connection for this dApp
            const storage = await AsyncStorage.getItem('CONNECTIONS');
            const connections = storage ? JSON.parse(storage) : [];
            const origin = siteOrigin || '';

            const isConnected = connections.some(
              (conn: any) =>
                conn.origin === origin &&
                conn.walletIds.includes(activeWallet.id) &&
                conn.chainIds.includes('sui-101') &&
                conn.chainIds.includes('sui-103'),
            );

            if (!isConnected && origin) {
              const selectedWalletIds = [activeWallet.id];
              await addToConnections(['sui-101', 'sui-103'], selectedWalletIds, origin);
            }

            DeviceEventEmitter.emit('signTransaction', {
              type: MessageTypes.signResponse,
              payload: { status: 'success', data: { signedTxData, activeAddress } },
            });
          } catch (error) {
            throw new Error('Could not send transaction to the dApp');
          }

          setIsSigning(false);
          navigation.goBack();
          return;
        }
        const signedTxData = await suiClient.signTransaction(signDoc);

        try {
          const feeQuantity = feeToShow;
          await txPostToDb({
            txHash: signedTxData.txHash,
            txType: CosmosTxType.Dapp,
            metadata: {
              ...globalTxMeta,
              dapp_url: siteOrigin,
            },
            feeQuantity: feeQuantity.toString(),
            feeDenomination: fee?.amount[0]?.denom ?? 'mist',
            chain: activeChain,
            chainId,
            address: activeAddress,
            network: selectedNetwork,
            isSui: true,
          });
        } catch (e) {
          captureException(e);
        }
        await sleep(100);

        if (!shouldSubmit) {
          try {
            // Check if there's an active connection for this dApp
            const storage = await AsyncStorage.getItem('CONNECTIONS');
            const connections = storage ? JSON.parse(storage) : [];
            const origin = siteOrigin || '';

            // Check if this origin is already connected to the active wallet
            suiChainIds.every(async (chainId) => {
              const isConnected = connections.some(
                (conn: any) =>
                  conn.origin === origin && conn.walletIds.includes(activeWallet.id) && conn.chainIds.includes(chainId),
              );

              // If not connected, add the connection
              if (!isConnected && origin) {
                const selectedWalletIds = [activeWallet.id];
                await addToConnections([chainId], selectedWalletIds, origin);
                // Connection added successfully
              }
            });

            DeviceEventEmitter.emit('signTransaction', {
              type: MessageTypes.signResponse,
              payload: { status: 'success', data: signedTxData },
            });
          } catch {
            throw new Error('Could not send transaction to the dApp');
          }
          setIsSigning(false);
          navigation.goBack();
          return;
        }

        const broadcastedTxn = await suiClient.broadcastTransaction(signedTxData.txnBytes, signedTxData.signature);

        try {
          const storage = await AsyncStorage.getItem('CONNECTIONS');
          const connections = storage ? JSON.parse(storage) : [];
          const origin = siteOrigin || '';

          const isConnected = connections.some(
            (conn: any) =>
              conn.origin === origin && conn.walletIds.includes(activeWallet.id) && conn.chainIds.includes('sui-101'),
          );

          if (!isConnected && origin) {
            const selectedWalletIds = [activeWallet.id];
            await addToConnections(['sui-101', 'sui-103'], selectedWalletIds, origin);
          }

          DeviceEventEmitter.emit('signTransaction', {
            type: MessageTypes.signResponse,
            // payload: { status: 'success', data: signedTxData },
            payload: { status: 'success', data: { broadcastedTxn, signedTxData } },
          });
        } catch {
          throw new Error('Could not send transaction to the dApp');
        }
        setIsSigning(false);
        navigation.goBack();
      } catch (e) {
        captureException(e);
        setIsSigning(false);
        setSigningError((e as AptosApiError)?.data?.error_code ?? (e as Error)?.message ?? 'Unknown error');
        setTimeout(() => {
          setSigningError(null);
        }, 3000);
      }
      return;

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      activeWallet.addresses,
      selectedNetwork,
      activeChain,
      refetchData,
      signDoc,
      getWallet,
      siteOrigin,
      fee,
      txPostToDb,
      handleCancel,
      lcdUrl,
    ]);

    useEffect(() => {
      // window.addEventListener('beforeunload', handleCancel);
      AsyncStorage.removeItem(BG_RESPONSE);
      // return () => {
      //   window.removeEventListener('beforeunload', handleCancel);
      // };
    }, [handleCancel]);

    useEffect(() => {
      async function fetchGasEstimate() {
        if (isSignMessage) {
          return;
        }
        // if (!allowSetFee) {
        //     if (signDoc?.rawTransaction?.max_gas_amount !== undefined) {
        //         setRecommendedGasLimit(Number(signDoc?.rawTransaction?.max_gas_amount))
        //     }
        //     return
        // }
        try {
          setIsLoadingGasLimit(true);
          let gasUsed = defaultGasLimit;

          const sui = await getSuiSigner(activeChain);
          const suiClient = await SuiTx.getSuiClient(sui as unknown as SuiAccount, selectedNetwork);
          const data = await suiClient.simulateTransaction(signDoc as string, selectedNetwork);
          if (data.gasUnits) {
            gasUsed = Number(data.gasUnits);
            const feeToShow =
              Number(data.computationCost) +
              Number(data.storageCost) -
              Number(data.storageRebate) +
              Number(data.nonRefundableStorageFee);
            setFeeToShow(feeToShow / 10 ** 9);
          }

          setRecommendedGasLimit(gasUsed);
        } catch (_) {
          setRecommendedGasLimit(defaultGasLimit);
        } finally {
          setIsLoadingGasLimit(false);
        }
      }

      fetchGasEstimate();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChain, activeWallet?.pubKeys, defaultGasLimit, rpcUrl]);

    //   useEffect(() => {
    //     if (!siteOrigin) return

    //     if (isDappTxnInitEventLogged.current) return

    //     try {
    //       if (!isCompassWallet()) {
    //         mixpanel.track(
    //           EventName.DappTxnInit,
    //           {
    //             dAppURL: siteOrigin,
    //             signMode: 'sign-sui',
    //             walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
    //             chainId: chainInfo.chainId,
    //             chainName: chainInfo.chainName,
    //             productVersion: browser.runtime.getManifest().version,
    //             time: Date.now() / 1000,
    //           },
    //           mixpanelTrackOptions,
    //         )
    //       }

    //       isDappTxnInitEventLogged.current = true
    //     } catch (e) {
    //       captureException(e)
    //     }
    //   }, [activeWallet.walletType, chainInfo.chainId, chainInfo.chainName, siteOrigin])

    usePerformanceMonitor({
      page: 'sign-sui-transaction',
      queryStatus: txnSigningRequest ? 'success' : 'loading',
      op: 'signSuiTransactionPageLoad',
      description: 'Load time for sign sui transaction page',
    });

    const disableBalanceCheck = useMemo(() => {
      return !!fee?.granter || !!fee?.payer || !!signOptions?.disableBalanceCheck;
    }, [fee?.granter, fee?.payer, signOptions?.disableBalanceCheck]);

    const isApproveBtnDisabled =
      !dappFeeDenom ||
      !!signingError ||
      !!gasPriceError ||
      (isFeesValid === false && !highFeeAccepted) ||
      isLoadingGasLimit ||
      isSigning;

  return (
    <View style={[styles.panel, styles.mt2]}>
      <View style={[styles.panelInner]}>
        <PopupLayout
          header={
            <View style={styles.headerContainer}>
              <Image source={{uri: chainInfo.chainSymbolImageUrl ?? (theme === ThemeName.DARK ? GenericDark : GenericLight)}}/>
              <Buttons.Wallet
                title={trim(walletName, 10)}
                style={{ paddingRight: 16 }}
              />
            </View>
          }
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            style={{ height: '100%' }}
          >
            <Text style={styles.title}>Approve Transaction</Text>
            <View style={styles.siteBox}>
              <Avatar
                avatarImage={siteLogo}
                avatarOnError={() => {}}
                size="sm"
                style={styles.avatar}
              />
              <View style={styles.siteInfo}>
                <Text style={styles.siteName}>{siteName}</Text>
                <Text style={styles.siteOrigin}>{siteOrigin}</Text>
              </View>
            </View>

            {!isSignMessage ? (
              <GasPriceOptions
                initialFeeDenom={dappFeeDenom}
                gasLimit={userPreferredGasLimit || String(recommendedGasLimit)}
                setGasLimit={(value) => setUserPreferredGasLimit(value.toString())}
                recommendedGasLimit={String(recommendedGasLimit)}
                gasPriceOption={
                  selectedGasOptionRef.current || allowSetFee
                    ? gasPriceOption
                    : { ...gasPriceOption, option: '' }
                }
                onGasPriceOptionChange={(value) => {
                  selectedGasOptionRef.current = true;
                  setGasPriceOption(value);
                }}
                error={gasPriceError}
                setError={setGasPriceError}
                considerGasAdjustment={false}
                disableBalanceCheck={disableBalanceCheck}
                fee={fee}
                chain={activeChain}
                network={selectedNetwork}
                validateFee={true}
                onInvalidFees={(_, isFeesValid) => {
                  try {
                    if (isFeesValid === false) setIsFeesValid(false);
                  } catch (e) {
                    captureException(e);
                  }
                }}
                hasUserTouchedFees={!!selectedGasOptionRef?.current}
                notUpdateInitialGasPrice={!allowSetFee}
                rootDenomsStore={rootDenomsStore}
                rootBalanceStore={rootBalanceStore}
              >
                <Tabs
                  style={styles.mt4}
                  tabsList={[
                    { id: 'fees', label: 'Fees' },
                    { id: 'data', label: 'Data' },
                  ]}
                  tabsContent={{
                    fees: allowSetFee ? (
                      <View style={styles.feesBox}>
                        <View style={styles.row}>
                          <Text style={styles.feeLabel}>
                            Gas Fees <Text style={{ textTransform: 'capitalize' }}>({gasPriceOption.option})</Text>
                          </Text>
                          <Tooltip
                            content={
                              <Text style={styles.tooltipText}>
                                You can choose higher gas fees for faster transaction processing.
                              </Text>
                            }
                          >
                            <View style={styles.infoIconWrap}>
                              <Image
                                source={{uri: Images.Misc.InfoCircle}}
                                style={styles.infoIcon}
                              />
                            </View>
                          </Tooltip>
                        </View>
                        <GasPriceOptions.Selector style={styles.mt2} />
                        <View style={styles.alignEnd}>
                          <GasPriceOptions.AdditionalSettingsToggle style={styles.mt3} />
                        </View>
                        <GasPriceOptions.AdditionalSettings
                          style={styles.mt2}
                          showGasLimitWarning={true}
                          rootDenomsStore={rootDenomsStore}
                          rootBalanceStore={rootBalanceStore}
                        />
                        {gasPriceError ? (
                          <Text style={styles.errorText}>{gasPriceError}</Text>
                        ) : null}
                      </View>
                    ) : (
                      <View style={styles.feesBox}>
                        <StaticFeeDisplay
                          feeToShow={feeToShow}
                          fee={fee}
                          error={gasPriceError}
                          setError={setGasPriceError}
                          disableBalanceCheck={disableBalanceCheck}
                          rootBalanceStore={rootBalanceStore}
                          activeChain={activeChain}
                          selectedNetwork={selectedNetwork}
                          feeTokensList={feeTokens}
                        />
                      </View>
                    ),
                    data: (
                      <ScrollView
                        style={styles.preBox}
                        horizontal
                        contentContainerStyle={{ flexGrow: 1 }}
                      >
                        <Text selectable style={styles.preText}>
                          {signDoc}
                        </Text>
                      </ScrollView>
                    ),
                  }}
                />
              </GasPriceOptions>
            ) : (
              <ScrollView
                style={styles.preBox}
                horizontal
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <Text selectable style={styles.preText}>
                  {getOriginalSignDoc(signDoc, true).signDoc}
                </Text>
              </ScrollView>
            )}

            <View style={styles.mt3}>
              {(signingError ?? ledgerError) ? <ErrorCard text={signingError ?? ledgerError ?? ''} /> : null}
            </View>

            <LedgerConfirmationModal
              showLedgerPopup={showLedgerPopup}
              onClose={() => setShowLedgerPopup(false)}
            />
            <SelectWalletSheet
              isOpen={showWalletSelector}
              onClose={() => setShowWalletSelector(false)}
              currentWalletInfo={currentWalletInfo}
              title="Select Wallet"
              activeChain={activeChain}
            />

            {isFeesValid === false && (
              <View ref={errorMessageRef} style={styles.highFeeBox}>
                <TouchableOpacity
                  style={styles.checkBox}
                  onPress={() => setHighFeeAccepted(!highFeeAccepted)}
                >
                  {!highFeeAccepted ? (
                    <Square size={16} color="#374151" />
                  ) : (
                    <CheckSquare size={16} color={getChainColor(activeChain)} />
                  )}
                </TouchableOpacity>
                <Text style={styles.highFeeText}>
                  The selected fee amount is unusually high.
                  {'\n'}I confirm and agree to proceed
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Buttons.Generic title={'Reject Button'} color={Colors.gray900} onClick={handleCancel}>
                Reject
              </Buttons.Generic>
              <Buttons.Generic
                title={'Approve Button'}
                color={getChainColor(activeChain)}
                onClick={approveTransaction}
                disabled={isApproveBtnDisabled}
                style={isApproveBtnDisabled ? styles.disabledButton : undefined}
              >
                {isSigning ? 'Signing...' : 'Approve'}
              </Buttons.Generic>
            </View>
          </View>
        </PopupLayout>
      </View>
    </View>
  );
  },
);

const withTxnSigningRequest = (Component: React.FC<any>) => {
  const Wrapped = () => {
    const [chain, setChain] = useState<SupportedChain>();
    const [_chainIdToChain, setChainIdToChain] = useState(chainIdToChain);

    const [txnData, setTxnData] = useState<any | null>(null);
    const [chainId, setChainId] = useState<string>();
    const [error] = useState<{ message: string; code: string } | null>(null);

    const navigation = useNavigation();

    useEffect(() => {
      decodeChainIdToChain().then(setChainIdToChain).catch(captureException);
    }, []);

    const signTxEventHandler = (message: any, sender: any) => {
      if (message.type === MessageTypes.signTransaction) {
        const txnData = message.payload;
        const chainId = txnData.chain ? txnData.chain : 'sui-101';
        const chain = chainId ? (_chainIdToChain['sui-101'] as SupportedChain) : undefined;
        if (!chain) {
          DeviceEventEmitter.emit('signTransaction', {
            type: MessageTypes.signResponse,
            payload: { status: 'error', data: `Invalid chainId ${chainId}` },
          });

          navigation.goBack();
          return;
        }
        setChain(chain);
        setChainId(chainId);
        setTxnData(txnData);
      }
    };

    useEffect(() => {
      // browser.runtime.sendMessage({ type: MessageTypes.signingPopupOpen });
      // browser.runtime.onMessage.addListener(signTxEventHandler);
      // return () => browser.runtime.onMessage.removeListener(signTxEventHandler);
    }, []);

    if (chain && txnData && chainId) {
      return (
        <Component
          data={txnData}
          chainId={chainId}
          activeChain={chain}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        />
      );
    }

    if (error) {
      const heading = ((code: string) => {
        switch (code) {
          case 'no-data':
            return 'No Transaction Data';
          default:
            return 'Something Went Wrong';
        }
      })(error.code);

      return (
        <PopupLayout header={<Header title="Sign Transaction" />}>
          <View style={styles.centered}>
            <Text style={styles.errorHeading}>{heading}</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {navigation.goBack()}}
            >
              <Text style={styles.closeButtonText}>Close Wallet</Text>
            </TouchableOpacity>
          </View>
        </PopupLayout>
      );
    }

    return (
      <PopupLayout header={<Header title="Sign Transaction" />}>
        <View style={styles.centered}>
          <LoaderAnimation color="white" />
        </View>
      </PopupLayout>
    );
  };

  Wrapped.displayName = `withTxnSigningRequest(${Component.displayName})`;
  return Wrapped;
};

const signTxSui = withTxnSigningRequest(React.memo(SignTransaction));

export default signTxSui;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    width: '100%',
    minHeight: 360,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  errorHeading: {
    color: '#FCA5A5', // text-red-300
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 14,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 14,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 32,
    paddingVertical: 7,
    paddingHorizontal: 18,
    backgroundColor: '#818CF8', // bg-indigo-300
    borderRadius: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  panel: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  panelInner: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
  },
  panelHeight: {
    // Add height styling if you need panel-height logic
  },
  headerContainer: { width: 396 },
  scrollContent: { paddingHorizontal: 28, paddingVertical: 12 },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  siteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  avatar: { borderRadius: 999, overflow: 'hidden' },
  siteInfo: { marginLeft: 12 },
  siteName: {
    textTransform: 'capitalize',
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 16,
  },
  siteOrigin: {
    textTransform: 'lowercase',
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  mt2: { marginTop: 8 },
  mt3: { marginTop: 12 },
  mt4: { marginTop: 16 },
  feesBox: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  feeLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  tooltipText: { color: '#6B7280', fontSize: 14 },
  infoIconWrap: { marginLeft: 8, position: 'relative' },
  infoIcon: { width: 18, height: 18, resizeMode: 'contain' },
  alignEnd: { flexDirection: 'row', justifyContent: 'flex-end' },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    paddingLeft: 4,
  },
  preBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 12,
    padding: 16,
    minHeight: 80,
    maxHeight: 240,
  },
  preText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#111827',
  },
  highFeeBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  checkBox: { marginRight: 12 },
  highFeeText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '400',
  },
  footer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 28,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
