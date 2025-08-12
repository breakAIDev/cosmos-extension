
import {
  AccountAuthenticatorEd25519,
  AptosApiError,
  Ed25519PublicKey,
  generateUserTransactionHash,
  Serializer,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk';
import { StdFee } from '@cosmjs/stargate';
import {
  CosmosTxType,
  GasOptions,
  LeapWalletApi,
  useActiveWallet,
  useChainApis,
  useChainInfo,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
  useNativeFeeDenom,
  useTxMetadata,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  AptosTx,
  chainIdToChain,
  DefaultGasEstimates,
  GasPrice,
  NativeDenom,
  sleep,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { Avatar, Buttons, Header, ThemeName, useTheme } from '@leapwallet/leap-ui';
import { CheckSquare, Square } from 'phosphor-react-native';
import { base64 } from '@scure/base';
import { captureException } from '@sentry/react-native';
import BigNumber from 'bignumber.js';
import Tooltip from '../../components/better-tooltip';
import { ErrorCard } from '../../components/ErrorCard';
import GasPriceOptions, { useDefaultGasPrice } from '../../components/gas-price-options';
import PopupLayout from '../../components/layout/popup-layout';
import LedgerConfirmationModal from '../../components/ledger-confirmation/confirmation-modal';
import { LoaderAnimation } from '../../components/loader/Loader';
import { Tabs } from '../../components/tabs';
import Text from '../../components/text';
import { walletLabels } from '../../services/config/constants';
import { MessageTypes } from '../../services/config/message-types';
import { BG_RESPONSE } from '../../services/config/storage-keys';
import { decodeChainIdToChain } from '../../context/utils';
import { usePerformanceMonitor } from '../../hooks/perf-monitoring/usePerformanceMonitor';
import { useSiteLogo } from '../../hooks/utility/useSiteLogo';
import { Wallet } from '../../hooks/wallet/useWallet';
import { Images } from '../../../assets/images';
import { GenericDark, GenericLight } from '../../../assets/images/logos';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { feeTokensStore } from '../../context/fee-store';
import { rootBalanceStore } from '../../context/root-store';
import { Colors, getChainColor } from '../../theme/colors';
import { assert } from '../../utils/assert';
import { formatWalletName } from '../../utils/formatWalletName';
import { trim } from '../../utils/strings';

import { NotAllowSignTxGasOptions } from './additional-fee-settings';
import StaticFeeDisplay from './static-fee-display';
import { getAptosSignDoc } from './utils/sign-aptos';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Image, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';

const useGetWallet = Wallet.useGetWallet;
const useAptosSigner = Wallet.useAptosSigner;

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
    const { theme } = useTheme();

    const [showLedgerPopup, setShowLedgerPopup] = useState(false);
    const [signingError, setSigningError] = useState<string | null>(null);
    const [ledgerError] = useState<string | null>(null);
    const [gasPriceError, setGasPriceError] = useState<string | null>(null);

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

    const chainInfo = useChainInfo(activeChain);
    const activeWallet = useActiveWallet();
    const getAptosSigner = useAptosSigner();
    const getWallet = useGetWallet(activeChain);
    const navigation = useNavigation();

    const selectedNetwork = useMemo(() => {
      return !!chainInfo?.testnetChainId && chainInfo?.testnetChainId === chainId ? 'testnet' : 'mainnet';
    }, [chainInfo?.testnetChainId, chainId]);

    const denoms = rootDenomsStore.allDenoms;
    const defaultGasPrice = useDefaultGasPrice(denoms, { activeChain });
    const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetwork);
    const txPostToDb = LeapWalletApi.useLogCosmosDappTx();
    const selectedGasOptionRef = useRef(false);
    const [isFeesValid, setIsFeesValid] = useState<boolean | null>(null);
    const [highFeeAccepted, setHighFeeAccepted] = useState<boolean>(false);
    const globalTxMeta = useTxMetadata();

    const activeChainfeeTokensStore = feeTokensStore.getStore(activeChain, selectedNetwork, false);
    const feeTokens = activeChainfeeTokensStore?.data;

    const errorMessageRef = useRef<any>(null);

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

    const { lcdUrl } = useChainApis(activeChain, selectedNetwork);

    const {
      allowSetFee,
      message,
      signDoc,
      fee,
      defaultFee,
    }: {
      allowSetFee: boolean;
      message: string;
      signDoc: SimpleTransaction;
      fee: StdFee | undefined;
      defaultFee: StdFee | undefined;
    } = useMemo(() => {
      // Sign message parsing
      if (isSignMessage) {
        const message = txnSigningRequest.signDoc
          ?.split('\n')
          ?.find((line: string) => line.includes('message: '))
          ?.replace('message: ', '');
        return {
          allowSetFee: false,
          message,
          signDoc: txnSigningRequest.signDoc,
          fee: undefined,
          defaultFee: undefined,
        };
      }

      const { allowSetFee, updatedSignDoc, updatedFee, defaultFee } = getAptosSignDoc({
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
    }, [txnSigningRequest, gasPriceOption.gasPrice, userPreferredGasLimit, nativeFeeDenom, isSignMessage]);

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

      try {
        // mixpanel.track(
        //   EventName.DappTxnRejected,
        //   {
        //     dAppURL: siteOrigin,
        //     signMode: 'sign-aptos',
        //     walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
        //     chainId: chainInfo.chainId,
        //     chainName: chainInfo.chainName,
        //     productVersion: browser.runtime.getManifest().version,
        //     time: Date.now() / 1000,
        //   },
        //   mixpanelTrackOptions,
        // )
      } catch (e) {
        captureException(e);
      }

      navigation.goBack();
    }, [navigation]);

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
      setIsSigning(true);
      try {
        const aptos = await getAptosSigner(activeChain);
        const aptosSigner = aptos.signer;
        if (isSignMessage) {
          const signature = await aptosSigner.sign(signDoc as unknown as string);
          const serializer = new Serializer();
          signature.serialize(serializer);
          await sleep(100);
          setIsSigning(false);
          refetchData();
          navigation.goBack();

          return;
        }

        const data = await aptosSigner.signTransaction(signDoc);
        const accountAuthenticator = new AccountAuthenticatorEd25519(
          new Ed25519PublicKey(aptosSigner.publicKey.toUint8Array()),
          data,
        );
        const signedTxn = {
          transaction: signDoc,
          senderAuthenticator: accountAuthenticator,
        };
        const txHash = generateUserTransactionHash(signedTxn);
        try {
          await txPostToDb({
            txHash,
            txType: CosmosTxType.Dapp,
            metadata: {
              ...globalTxMeta,
              dapp_url: siteOrigin,
            },
            feeQuantity: fee?.amount[0]?.amount,
            feeDenomination: fee?.amount[0]?.denom,
            chain: activeChain,
            chainId,
            address: activeAddress,
            network: selectedNetwork,
            isAptos: true,
          });
        } catch (e) {
          captureException(e);
        }
        const serializer = new Serializer();
        accountAuthenticator.serialize(serializer);
        await sleep(100);

        if (!shouldSubmit) {
          setIsSigning(false);
          refetchData();
          navigation.goBack();
          return;
        }

        setIsSigning(false);
        refetchData();
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
      window.addEventListener('beforeunload', handleCancel);
      AsyncStorage.removeItem(BG_RESPONSE);
      return () => {
        window.removeEventListener('beforeunload', handleCancel);
      };
    }, [handleCancel]);

    useEffect(() => {
      async function fetchGasEstimate() {
        if (isSignMessage) {
          return;
        }
        if (!allowSetFee) {
          if (signDoc?.rawTransaction?.max_gas_amount !== undefined) {
            setRecommendedGasLimit(Number(signDoc?.rawTransaction?.max_gas_amount));
          }
          return;
        }
        try {
          setIsLoadingGasLimit(true);
          let gasUsed = defaultGasLimit;

          const aptosSigner = await getAptosSigner(activeChain);
          const publicKey = new Ed25519PublicKey(base64.decode(activeWallet?.pubKeys?.[activeChain] ?? ''));
          const aptosClient = await AptosTx.getAptosClient(lcdUrl ?? '', aptosSigner.signer);
          const { gasEstimate } = await aptosClient.simulateTransaction(signDoc, publicKey);
          if (gasEstimate) {
            gasUsed = Number(gasEstimate);
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
    }, [activeChain, activeWallet?.pubKeys, defaultGasLimit, lcdUrl]);

    useEffect(() => {
      if (!siteOrigin) return;

      if (isDappTxnInitEventLogged.current) return;

      try {
        // mixpanel.track(
        //   EventName.DappTxnInit,
        //   {
        //     dAppURL: siteOrigin,
        //     signMode: 'sign-aptos',
        //     walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
        //     chainId: chainInfo.chainId,
        //     chainName: chainInfo.chainName,
        //     productVersion: browser.runtime.getManifest().version,
        //     time: Date.now() / 1000,
        //   },
        //   mixpanelTrackOptions,
        // )

        isDappTxnInitEventLogged.current = true;
      } catch (e) {
        captureException(e);
      }
    }, [activeWallet.walletType, chainInfo.chainId, chainInfo.chainName, siteOrigin]);

    usePerformanceMonitor({
      page: 'sign-aptos-transaction',
      queryStatus: txnSigningRequest ? 'success' : 'loading',
      op: 'signAptosTransactionPageLoad',
      description: 'Load tome for sign aptos transaction page',
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

    const isDark = theme === ThemeName.DARK;
    const windowHeight = useWindowDimensions().height;
    const calcHeight = windowHeight - 144;

    return (
      <View
        style={[
          styles.outerPanel,
          styles.innerPanel,
        ]}
      >
        <PopupLayout
          style={{flex: 1, flexDirection: 'column'}}
          header={
            <View style={styles.headerWrap}>
              <Image source={{uri: chainInfo.chainSymbolImageUrl ?? (isDark ? GenericDark : GenericLight)}}/>
                <Buttons.Wallet
                  title={trim(walletName, 10)}
                  style={styles.walletTitle}
                />
            </View>
          }
        >
          <ScrollView
            style={[styles.scrollContainer, {height: calcHeight }]}
            contentContainerStyle={styles.innerContent}
            // If you need to limit vertical scrolling only:
            horizontal={false}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.headerText}>Approve Transaction</Text>
            <View style={styles.infoPanel}>
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
                setGasLimit={(value: string | BigNumber | number) => setUserPreferredGasLimit(value.toString())}
                recommendedGasLimit={String(recommendedGasLimit)}
                gasPriceOption={
                  selectedGasOptionRef.current || allowSetFee
                    ? gasPriceOption
                    : { ...gasPriceOption, option: '' as GasOptions }
                }
                onGasPriceOptionChange={(value: any) => {
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
                onInvalidFees={(_: NativeDenom, isFeesValid: boolean | null) => {
                  try {
                    if (isFeesValid === false) {
                      setIsFeesValid(false);
                    }
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
                  style={{marginTop: 12}}
                  tabsList={[
                    { id: 'fees', label: 'Fees' },
                    { id: 'data', label: 'Data' },
                  ]}
                  tabsContent={{
                    fees: allowSetFee ? (
                      <View style={[
                        styles.panel,
                        isDark && { backgroundColor: '#111827' }
                      ]}>
                        <View style={styles.row}>
                          <Text style={styles.label}>
                            Gas Fees <Text style={styles.optionText}>({gasPriceOption.option})</Text>
                          </Text>

                          <Tooltip
                            content={
                              <Text style={styles.tooltipText}>
                                You can choose higher gas fees for faster transaction processing.
                              </Text>
                            }
                          >
                            <View style={styles.iconWrap1}>
                              <Image
                                source={{uri: Images.Misc.InfoCircle}}
                                style={styles.icon}
                                resizeMode="contain"
                              />
                            </View>
                          </Tooltip>
                        </View>

                        <GasPriceOptions.Selector style={{marginTop: 8}} />

                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end'}}>
                          <GasPriceOptions.AdditionalSettingsToggle style={{padding: 0, marginTop: 12}} />
                        </View>

                        <GasPriceOptions.AdditionalSettings
                          style={{marginTop: 8}}
                          showGasLimitWarning={true}
                          rootDenomsStore={rootDenomsStore}
                          rootBalanceStore={rootBalanceStore}
                        />

                        {gasPriceError ? (
                          <Text style={styles.errorText}>{gasPriceError}</Text>
                        ) : null}
                      </View>
                    ) : (
                      <>
                        <View style={[
                          styles.panel,
                          isDark && { backgroundColor: '#111827' }
                        ]}>
                          <StaticFeeDisplay
                            fee={fee}
                            error={gasPriceError}
                            setError={setGasPriceError}
                            disableBalanceCheck={disableBalanceCheck}
                            rootBalanceStore={rootBalanceStore}
                            activeChain={activeChain}
                            selectedNetwork={selectedNetwork}
                            feeTokensList={feeTokens}
                          />
                          <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end'}}>
                            <GasPriceOptions.AdditionalSettingsToggle style={{padding: 0, marginTop: 12}}/>
                          </View>
                          <NotAllowSignTxGasOptions gasPriceOption={gasPriceOption} gasPriceError={gasPriceError} />
                        </View>
                      </>
                    ),
                    data: (
                      <ScrollView
                        horizontal
                        style={[
                          styles.preBlock,
                          isDark && { backgroundColor: '#111827' }
                        ]}
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsHorizontalScrollIndicator
                      >
                        <Text
                          style={[
                            styles.preText,
                            isDark && { color: '#F9FAFB' }
                          ]}
                        >
                          {JSON.stringify(
                            signDoc,
                            (_, value) => {
                              if (typeof value === 'bigint') {
                                return value.toString();
                              }
                              return value;
                            },
                            2,
                          )}
                        </Text>
                      </ScrollView>
                    ),
                  }}
                />
              </GasPriceOptions>
            ) : (
              <ScrollView
                horizontal
                style={styles.preBlock}
                contentContainerStyle={{ flexGrow: 1 }}
                showsHorizontalScrollIndicator={true}
              >
                <Text
                  style={styles.preText}
                >
                  {message}
                </Text>
              </ScrollView>
            )}

            <div className='mt-3'>
              {signingError ?? ledgerError ? <ErrorCard text={signingError ?? ledgerError ?? ''} /> : null}
            </div>

            <LedgerConfirmationModal
              showLedgerPopup={showLedgerPopup}
              onClose={() => {
                setShowLedgerPopup(false);
              }}
            />
            {isFeesValid === false && (
              <View
                ref={errorMessageRef}
                style={styles.container}
              >
                <TouchableOpacity style={styles.iconWrap} onPress={() => setHighFeeAccepted(!highFeeAccepted)}>
                  {!highFeeAccepted ? (
                    <Square size={16} color="#374151" /* text-gray-700 */ />
                  ) : (
                    <CheckSquare
                      size={16}
                      color={getChainColor(activeChain)}
                    />
                  )}
                </TouchableOpacity>
                <Text style={styles.warningText}>
                  The selected fee amount is unusually high.{"\n"}
                  I confirm and agree to proceed
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footerPanel}>
            <View style={styles.buttonRow}>
              <Buttons.Generic
                title="Reject Button"
                color={Colors.gray900}
                onClick={handleCancel}
                style={styles.button}
              >
                Reject
              </Buttons.Generic>
              <Buttons.Generic
                title="Approve Button"
                color={getChainColor(activeChain)}
                onClick={approveTransaction}
                disabled={isApproveBtnDisabled}
                style={[
                  styles.button,
                  isApproveBtnDisabled && styles.disabledButton,
                ]}
              >
                {isSigning ? 'Signing...' : 'Approve'}
              </Buttons.Generic>
            </View>
          </View>
        </PopupLayout>
      </View>
    );
  },
);

/**
 * This HOC helps makes sure that the txn signing request is decoded and the chain is set
 */
const withTxnSigningRequest = (Component: React.FC<any>) => {
  const Wrapped = () => {
    const [chain, setChain] = useState<SupportedChain>();
    const [_chainIdToChain, setChainIdToChain] = useState(chainIdToChain);

    const [txnData, setTxnData] = useState<any | null>(null);
    const [chainId, setChainId] = useState<string>();
    const [error] = useState<{
      message: string;
      code: string;
    } | null>(null);

    const navigation = useNavigation();

    useEffect(() => {
      decodeChainIdToChain().then(setChainIdToChain).catch(captureException);
    }, []);

    useEffect(() => {
      // Listen for messages with DeviceEventEmitter, WebSocket, or a native bridge in RN.
      // Remove browser.runtime/onMessage code here and implement as needed for mobile.
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
      const heading = ((code) => {
        switch (code) {
          case 'no-data':
            return 'No Transaction Data';
          default:
            return 'Something Went Wrong';
        }
      })(error.code);

      return (
        <PopupLayout header={<Header title='Sign Transaction' />}>
          <View style={styles.centeredPanel}>
            <Text style={styles.errorHeading}>{heading}</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Text style={styles.closeButtonText}>Close Wallet</Text>
            </TouchableOpacity>
          </View>
        </PopupLayout>
      );
    }

    return (
      <PopupLayout header={<Header title='Sign Transaction' />}>
        <View style={styles.centeredPanel}>
          <LoaderAnimation color="white" />
        </View>
      </PopupLayout>
    );
  };

  Wrapped.displayName = `withTxnSigningRequest(${Component.displayName})`;

  return Wrapped;
};


const signTxAptos = withTxnSigningRequest(React.memo(SignTransaction));

export default signTxAptos;

const styles = StyleSheet.create({
  centeredPanel: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16, // If not supported in your RN version, use marginBottom on children
  },
  errorHeading: {
    color: '#FCA5A5',      // text-red-300
    fontSize: 24,          // text-2xl
    fontWeight: 'bold',
    paddingHorizontal: 16, // px-4
    textAlign: 'center',
  },
  errorMessage: {
    color: '#18181b',      // text-black-100
    fontSize: 14,          // text-sm
    fontWeight: '500',
    paddingHorizontal: 16,
    textAlign: 'center',
    // For dark mode, color: '#F9FAFB'
  },
  closeButton: {
    marginTop: 32,         // mt-8
    paddingVertical: 4,    // py-1
    paddingHorizontal: 16, // px-4
    backgroundColor: '#818cf8', // bg-indigo-300
    borderRadius: 999,     // rounded-full
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#18181b',      // text-black-100
    fontSize: 14,          // text-sm
    fontWeight: '500',
    textAlign: 'center',
    // For dark mode, color: '#F9FAFB'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#6B7280', // text-gray-500
    fontSize: 14,     // text-sm
    fontWeight: '500',// font-medium
    letterSpacing: 0.4, // tracking-wide
  },
  optionText: {
    textTransform: 'capitalize',
  },
  tooltipText: {
    color: '#6B7280', // text-gray-500
    fontSize: 14,
  },
  iconWrap1: {
    position: 'relative',
    marginLeft: 8, // ml-2
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 18,
    height: 18,
  },
  errorText: {
    color: '#FCA5A5',      // text-red-300
    fontSize: 14,          // text-sm
    fontWeight: '500',     // font-medium
    marginTop: 8,          // mt-2
    paddingHorizontal: 4,  // px-1
  },
  panel: {
    borderRadius: 16,        // rounded-2xl
    padding: 16,             // p-4
    marginTop: 12,           // mt-3
    backgroundColor: '#fff', // bg-white-100 (light)
    // For dark mode: override with backgroundColor: '#111827'
  },
  preBlock: {
    backgroundColor: '#fff',    // bg-white-100
    // For dark mode: backgroundColor: '#111827'
    padding: 16,                // p-4
    width: '100%',
    marginTop: 12,              // mt-3
    borderRadius: 16,           // rounded-2xl
  },
  preText: {
    fontSize: 12,               // text-xs
    color: '#111827',           // text-gray-900
    // For dark mode: color: '#F9FAFB'
    fontFamily: 'monospace',    // mimic <pre>
    flexWrap: 'wrap',           // break-words/whitespace-pre-line equivalent
    // whitespace-pre-line: not natively in RN; line breaks in strings are honored
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff', // bg-white-100
    // For dark mode: backgroundColor: '#111827',
    paddingHorizontal: 16, // px-4
    paddingVertical: 12,   // py-3
    width: '100%',
    borderRadius: 16,      // rounded-2xl
    alignItems: 'center',
    marginTop: 12,         // mt-3
  },
  iconWrap: {
    marginRight: 12, // mr-3
  },
  warningText: {
    color: '#9CA3AF', // text-gray-400
    fontSize: 14,     // size 'sm'
    flex: 1,
  },
  footerPanel: {
    paddingVertical: 12,    // py-3 = 3*4
    paddingHorizontal: 28,  // px-7 = 7*4
    backgroundColor: '#F9FAFB', // bg-gray-50
    width: '100%',
    marginTop: 'auto',      // mt-auto
    // For dark mode: backgroundColor: '#18181b',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12, // Modern React Native supports `gap`. For older versions, use marginRight on the first button
  },
  button: {
    // Optional: add common button styles
  },
  disabledButton: {
    opacity: 0.5,
    // 'cursor-not-allowed' is not needed in RN, just visual opacity
  },
  headerText: {
    textAlign: 'center',
    fontSize: 18,          // text-lg
    fontWeight: 'bold',    // font-bold
    color: '#111827',      // text-gray-900
    width: '100%',
    // For dark mode, use a theme prop or Appearance API to set color: '#F9FAFB'
  },
  infoPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,         // mt-3
    borderRadius: 16,      // rounded-2xl
    backgroundColor: '#fff', // bg-white-100
    padding: 16,           // p-4
    // For dark mode, backgroundColor: '#111827'
  },
  avatar: {
    borderRadius: 999,     // rounded-full
    overflow: 'hidden',
    // Size can be managed inside Avatar if needed
  },
  siteInfo: {
    marginLeft: 12,        // ml-3
  },
  siteName: {
    textTransform: 'capitalize',
    color: '#111827',      // text-gray-900
    fontSize: 16,          // text-base
    fontWeight: 'bold',    // font-bold
    // For dark mode, color: '#F9FAFB'
  },
  siteOrigin: {
    textTransform: 'lowercase',
    color: '#6B7280',      // text-gray-500
    fontSize: 12,          // text-xs
    fontWeight: '500',     // font-medium
    // For dark mode, color: '#9CA3AF'
  },
  outerPanel: {
    // panel-width & enclosing-panel: map to width, maxWidth, padding, etc. as needed
    width: '100%',
    height: '100%',
    position: 'relative',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    // Add more as needed based on your Tailwind CSS mappings
  },
  innerPanel: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden', // overflow-clip
    borderRadius: 8, // rounded-md
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-gray-300
    // For dark mode, use a color prop or theme-aware logic for borderColor
    // backgroundColor: '#fff' // add if needed
  },
    headerWrap: {
    width: 396, // px in RN is density-independent
  },
  walletTitle: {
    paddingRight: 16, // pr-4 in Tailwind = 16px
  },
  scrollContainer: {
    paddingHorizontal: 28, // px-7 in Tailwind = 7*4=28
    paddingVertical: 12,   // py-3 in Tailwind = 3*4=12
    position: 'relative',
    // maxHeight is set dynamically
  },
  innerContent: {
    // Add if you want spacing between items or vertical alignment
  },
});