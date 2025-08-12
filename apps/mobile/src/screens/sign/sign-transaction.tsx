
import { AminoSignResponse, OfflineAminoSigner, StdSignature, StdSignDoc } from '@cosmjs/amino';
import { DirectSignResponse, OfflineDirectSigner } from '@cosmjs/proto-signing';
import {
  convertObjectCasingFromCamelToSnake,
  DirectSignDocDecoder,
  MsgConverter,
  UnknownMessage,
} from '@leapwallet/buffer-boba';
import {
  GasOptions,
  LeapWalletApi,
  useActiveWallet,
  useChainInfo,
  useDappDefaultFeeStore,
  useDefaultGasEstimates,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  chainIdToChain,
  ethSign,
  ethSignEip712,
  GasPrice,
  NativeDenom,
  sleep,
  SupportedChain,
  transactionDeclinedError,
} from '@leapwallet/cosmos-wallet-sdk';
import { EvmBalanceStore, RootBalanceStore, RootDenomsStore, RootStakeStore } from '@leapwallet/cosmos-wallet-store';
import { EthWallet } from '@leapwallet/leap-keychain';
import { Avatar, Buttons, Header, ThemeName, useTheme } from '@leapwallet/leap-ui';
import { MessageParser, parfait, ParsedMessage, ParsedMessageType } from '@leapwallet/parser-parfait';
import { CheckSquare, Square } from 'phosphor-react-native';
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
import { MessageTypes } from '../../services/config/message-types';
import { BG_RESPONSE } from '../../services/config/storage-keys';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { decodeChainIdToChain } from '../../context/utils';
import { usePerformanceMonitor } from '../../hooks/perf-monitoring/usePerformanceMonitor';
import { useSiteLogo } from '../../hooks/utility/useSiteLogo';
import { Wallet } from '../../hooks/wallet/useWallet';
import { Images } from '../../../assets/images';
import { GenericDark, GenericLight } from '../../../assets/images/logos';
import Long from 'long';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { evmBalanceStore } from '../../context/balance-store';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { dappDefaultFeeStore, feeTokensStore } from '../../context/fee-store';
import { rootBalanceStore, rootStakeStore } from '../../context/root-store';
import { Colors, getChainColor } from '../../theme/colors';
import { assert } from '../../utils/assert';
import { formatWalletName } from '../../utils/formatWalletName';
import { uiErrorTags } from '../../utils/sentry';
import { trim } from '../../utils/strings';
import { uint8ArrayToBase64 } from '../../utils/uint8Utils';

import { NotAllowSignTxGasOptions } from './additional-fee-settings';
import { useFeeValidation } from './fee-validation';
import { MemoInput } from './memo-input';
import MessageDetailsSheet from './message-details-sheet';
import MessageList from './message-list';
import StaticFeeDisplay from './static-fee-display';
import TransactionDetails from './transaction-details';
import { isGenericOrSendAuthzGrant } from './utils/is-generic-or-send-authz-grant';
import { mapWalletTypeToMixpanelWalletType } from './utils/mixpanel-config';
import { getAminoSignDoc } from './utils/sign-amino';
import { getDirectSignDoc, getProtoSignDocDecoder } from './utils/sign-direct';
import {
  getTxHashFromAminoSignResponse,
  getTxHashFromDirectSignResponse,
  logDirectTx,
  logSignAmino,
  logSignAminoInj,
} from './utils/tx-logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

const useGetWallet = Wallet.useGetWallet;

const messageParser = new MessageParser();

type SignTransactionProps = {
  data: Record<string, any>;
  chainId: string;
  isSignArbitrary: boolean;
  rootBalanceStore: RootBalanceStore;
  rootStakeStore: RootStakeStore;
  evmBalanceStore: EvmBalanceStore;
  rootDenomsStore: RootDenomsStore;
  activeChain: SupportedChain;
};

const SignTransaction = observer(
  ({
    data: txnSigningRequest,
    chainId,
    isSignArbitrary,
    rootBalanceStore,
    rootStakeStore,
    rootDenomsStore,
    activeChain,
  }: SignTransactionProps) => {
    const isDappTxnInitEventLogged = useRef(false);
    const isRejectedRef = useRef(false);
    const isApprovedRef = useRef(false);
    const { theme } = useTheme();

    const [showMessageDetailsSheet, setShowMessageDetailsSheet] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<{
      index: number;
      parsed: ParsedMessage;
      raw: null;
    } | null>(null);

    const [showLedgerPopup, setShowLedgerPopup] = useState(false);
    const [ledgerError, setLedgerError] = useState<string>();
    const [signingError, setSigningError] = useState<string | null>(null);
    const [gasPriceError, setGasPriceError] = useState<string | null>(null);
    const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<string | BigNumber>('');
    const [userMemo, setUserMemo] = useState<string>('');

    const [checkedGrantAuthBox, setCheckedGrantAuthBox] = useState(false);
    const chainInfo = useChainInfo(activeChain);
    const activeWallet = useActiveWallet();
    const getWallet = useGetWallet(activeChain);
    const navigation = useNavigation();

    const selectedNetwork = useMemo(() => {
      return !!chainInfo?.testnetChainId && chainInfo?.testnetChainId === chainId ? 'testnet' : 'mainnet';
    }, [chainInfo?.testnetChainId, chainId]);

    const denoms = rootDenomsStore.allDenoms;
    const defaultGasPrice = useDefaultGasPrice(denoms, { activeChain });
    const txPostToDb = LeapWalletApi.useLogCosmosDappTx();
    const defaultGasEstimates = useDefaultGasEstimates();
    const selectedGasOptionRef = useRef(false);
    const [isFeesValid, setIsFeesValid] = useState<boolean | null>(null);
    const [highFeeAccepted, setHighFeeAccepted] = useState<boolean>(false);

    const { setDefaultFee: setDappDefaultFee } = useDappDefaultFeeStore();

    const errorMessageRef = useRef<any>(null);
    const activeChainfeeTokensStore = feeTokensStore.getStore(activeChain, selectedNetwork, false);
    const feeTokens = activeChainfeeTokensStore?.data;
    const isFeeTokensLoading = activeChainfeeTokensStore?.isLoading;
    const feeValidation = useFeeValidation(denoms, activeChain, feeTokens, isFeeTokensLoading);

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
      return formatWalletName(activeWallet.name);
    }, [activeWallet.name]);

    const { isAmino, isAdr36, ethSignType, signOptions, eip712Types } = useMemo(() => {
      const isAmino = !!txnSigningRequest?.isAmino;
      const isAdr36 = !!txnSigningRequest?.isAdr36;

      const ethSignType = txnSigningRequest?.ethSignType;
      const eip712Types = txnSigningRequest?.eip712Types;
      const signOptions = txnSigningRequest?.signOptions;

      return { isAmino, isAdr36, ethSignType, signOptions, eip712Types };
    }, [txnSigningRequest]);

    const [allowSetFee, messages, txnDoc, signDoc, fee, defaultFee, defaultMemo]: [
      boolean,
      (
        | {
            parsed: ParsedMessage;
            raw: any;
          }[]
        | null
      ),
      any,
      SignDoc | StdSignDoc,
      any,
      any,
      string,
    ] = useMemo(() => {
      if (isAmino) {
        const result = getAminoSignDoc({
          signRequestData: {
            'sign-request': txnSigningRequest,
          },
          gasPrice: gasPriceOption.gasPrice,
          gasLimit: userPreferredGasLimit,
          isAdr36: !!isAdr36,
          memo: userMemo,
          isGasOptionSelected: selectedGasOptionRef.current,
        });

        let parsedMessages;

        if (isSignArbitrary) {
          parsedMessages = txnSigningRequest?.signOptions?.isADR36WithString
            ? Buffer.from(result.signDoc.msgs[0].value.data, 'base64').toString('utf-8')
            : result.signDoc.msgs[0].value.data;
        } else if (ethSignType) {
          parsedMessages = [
            {
              raw: result.signDoc.msgs,
              parsed: {
                __type: 'sign/MsgSignData',
                message: result.signDoc.msgs[0].value.data,
              },
            },
          ];
        } else {
          parsedMessages = result.signDoc.msgs.map((msg: any) => {
            let convertedMessage;
            try {
              convertedMessage = MsgConverter.convertFromAminoToDirect(msg.type, msg);
              if (!convertedMessage) throw new Error('unable to convert amino message to direct');
              return {
                raw: msg,
                parsed: messageParser.parse({
                  '@type': convertedMessage.typeUrl,
                  ...msg.value,
                }),
              };
            } catch (e) {
              return {
                raw: msg,
                parsed: {
                  __type: ParsedMessageType.Unimplemented,
                  message: msg,
                } as parfait.unimplemented,
              };
            }
          });
        }

        return [
          result.allowSetFee,
          parsedMessages,
          result.signDoc,
          result.signDoc,
          result.fee,
          result.defaultFee,
          result.defaultMemo,
        ];
      } else {
        const result = getDirectSignDoc({
          signRequestData: {
            'sign-request': txnSigningRequest,
          },
          gasPrice: gasPriceOption.gasPrice,
          gasLimit: userPreferredGasLimit,
          memo: userMemo,
          isGasOptionSelected: selectedGasOptionRef.current,
        });

        const docDecoder = getProtoSignDocDecoder({
          'sign-request': {
            signDoc: result.signDoc,
          },
        });

        const parsedMessages = docDecoder.txMsgs.map((msg: { unpacked: any; typeUrl: string }) => {
          if (msg instanceof UnknownMessage) {
            const raw = msg.toJSON();
            return {
              raw: raw,
              parsed: {
                __type: ParsedMessageType.Unimplemented,
                message: {
                  '@type': raw.type_url,
                  body: raw.value,
                },
              } as parfait.unimplemented,
            };
          }

          if (msg.unpacked.msg instanceof Uint8Array) {
            const base64String = uint8ArrayToBase64(msg.unpacked.msg);
            const decodedString = Buffer.from(base64String, 'base64').toString();
            try {
              const decodedJson = JSON.parse(decodedString);
              msg.unpacked.msg = decodedJson;
            } catch {
              msg.unpacked.msg = decodedString;
            }
          }

          const convertedMsg = convertObjectCasingFromCamelToSnake((msg as unknown as { unpacked: any }).unpacked);

          return {
            raw: {
              '@type': msg.typeUrl,
              ...convertedMsg,
            },
            parsed: messageParser.parse({
              '@type': msg.typeUrl,
              ...convertedMsg,
            }),
          };
        });
        return [
          result.allowSetFee,
          parsedMessages,
          docDecoder.toJSON(),
          result.signDoc,
          result.fee,
          result.defaultFee,
          result.defaultMemo,
        ];
      }
    }, [
      isAmino,
      txnSigningRequest,
      gasPriceOption.gasPrice,
      userPreferredGasLimit,
      isAdr36,
      userMemo,
      isSignArbitrary,
      ethSignType,
    ]);

    const siteOrigin = txnSigningRequest?.origin as string | undefined;
    const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2);
    const siteLogo = useSiteLogo(siteOrigin);

    const transactionTypes = useMemo(() => {
      if (Array.isArray(messages)) {
        return messages.map((msg) => msg.raw['@type'] ?? msg.raw['type']).filter(Boolean);
      }
      return undefined;
    }, [messages]);

    const refetchData = useCallback(() => {
      setTimeout(() => {
        rootBalanceStore.refetchBalances(activeChain, selectedNetwork);
        rootStakeStore.updateStake(activeChain, selectedNetwork, true);
      }, 3000);
    }, [activeChain, rootBalanceStore, rootStakeStore, selectedNetwork]);

    const handleCancel = useCallback(async () => {
      if (isRejectedRef.current || isApprovedRef.current) return;
      isRejectedRef.current = true;

      try {
        // mixpanel.track(
        //   EventName.DappTxnRejected,
        //   {
        //     dAppURL: siteOrigin,
        //     transactionTypes,
        //     signMode: isAmino ? 'sign-amino' : 'sign-direct',
        //     walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
        //     chainId: chainInfo.chainId,
        //     chainName: chainInfo.chainName,
        //     productVersion: DeviceInfo.getVersion(),
        //     time: Date.now() / 1000,
        //   },
        //   mixpanelTrackOptions,
        // )
      } catch (e) {
        captureException(e);
      }

      navigation.goBack();
    }, [navigation]);

    const recommendedGasLimit: string = useMemo(() => {
      if (defaultFee) {
        return 'gasLimit' in defaultFee ? defaultFee.gasLimit.toString() : defaultFee.gas.toString();
      }
      return defaultGasEstimates[activeChain].DEFAULT_GAS_IBC.toString();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChain, defaultFee]);

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
      const skipFeeCheck = isSignArbitrary || ethSignType;
      // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, no-unused-vars
      const onValidationFailed = (txFee: any) => () => {};

      if (!isAmino) {
        try {
          if (!skipFeeCheck) {
            let feeCheck: boolean | null = null;
            const decodedTx = new DirectSignDocDecoder(signDoc as SignDoc);
            const fee = decodedTx.authInfo.fee;
            if (!fee) {
              throw new Error('Transaction does not have fee');
            }
            try {
              feeCheck = await feeValidation(
                {
                  feeDenom: fee.amount[0].denom,
                  feeAmount: fee.amount[0].amount,
                  gaslimit: fee.gasLimit,
                  chain: activeChain,
                },
                onValidationFailed(fee),
              );
            } catch (e) {
              captureException(e);
            }
            if (feeCheck === false) {
              throw new Error('Unusually high fees detected, could not process transaction. Please try again.');
            }
          }

          const wallet = (await getWallet(activeChain)) as OfflineDirectSigner;
          const data = await (async () => {
            try {
              if (typeof wallet.signDirect === 'function') {
                return wallet.signDirect(activeAddress, SignDoc.fromPartial(signDoc as any));
              }
              return null;
            } catch (e) {
              captureException(e, {
                tags: uiErrorTags,
              });
              return null;
            }
          })();

          if (!data) {
            throw new Error('Could not sign transaction');
          }

          isApprovedRef.current = true;
          logDirectTx(
            data as DirectSignResponse,
            messages ?? [],
            siteOrigin ?? origin,
            fee,
            activeChain,
            activeWallet?.addresses[activeChain] as string,
            txPostToDb,
            txnDoc.chain_id,
            selectedNetwork,
          ).catch((e) => {
            captureException(e);
          });

          try {
            const txHash = getTxHashFromDirectSignResponse(data);

            // mixpanel.track(
            //   EventName.DappTxnApproved,
            //   {
            //     dAppURL: siteOrigin,
            //     transactionTypes: Array.isArray(messages)
            //       ? messages?.map((msg) => msg.raw['@type'] ?? msg.raw['type']).filter(Boolean)
            //       : [],
            //     signMode: 'sign-direct',
            //     walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
            //     txHash,
            //     chainId: chainInfo.chainId,
            //     chainName: chainInfo.chainName,
            //     productVersion: DeviceInfo.getVersion(),
            //     time: Date.now() / 1000,
            //   },
            //   mixpanelTrackOptions,
            // )
          } catch (e) {
            captureException(e);
          }
          
          await sleep(100);

          navigation.goBack();
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === transactionDeclinedError) {
            } else {
              setSigningError(e.message);
            }
          }
        }
      } else {
        setSigningError(null);
        try {
          if (!skipFeeCheck) {
            let feeCheck = null;
            try {
              const fee = (signDoc as StdSignDoc).fee;
              feeCheck = await feeValidation(
                {
                  feeDenom: fee.amount[0].denom,
                  feeAmount: fee.amount[0].amount,
                  gaslimit: Long.fromString(fee.gas),
                  chain: activeChain,
                },
                onValidationFailed(fee),
              );
            } catch (e) {
              captureException(e);
            }

            if (feeCheck === false) {
              throw new Error('Unusually high fees detected, could not process transaction. Please try again.');
            }
          }

          const wallet = (await getWallet(activeChain, !!(ethSignType || eip712Types))) as OfflineAminoSigner & {
            signAmino: (
              
              address: string,
              
              signDoc: StdSignDoc,
              
              options?: { extraEntropy?: boolean },
            ) => Promise<StdSignature>;
          };
          if (activeWallet.walletType === WALLETTYPE.LEDGER) {
            setShowLedgerPopup(true);
          }
          const walletAccounts = await wallet.getAccounts();
          const publicKey = walletAccounts[0].pubkey;

          const data = await (async () => {
            try {
              if (ethSignType) {
                return ethSign(activeAddress, wallet as unknown as EthWallet, signDoc as StdSignDoc, ethSignType);
              }
              if (eip712Types) {
                return ethSignEip712(activeAddress, wallet as unknown as EthWallet, signDoc as StdSignDoc, eip712Types);
              }
              return wallet.signAmino(activeAddress, signDoc as StdSignDoc, {
                extraEntropy: !signOptions?.enableExtraEntropy ? false : signOptions?.enableExtraEntropy,
              });
            } catch (e) {
              captureException(e, {
                tags: uiErrorTags,
              });
              return null;
            }
          })();

          if (!data) {
            throw new Error('Could not sign transaction');
          }

          if (!isSignArbitrary) {
            try {
              if (chainInfo.bip44.coinType === '60' && activeChain === 'injective') {
                const evmChainId =
                  chainInfo.chainId === (signDoc as StdSignDoc).chain_id
                    ? chainInfo.evmChainId
                    : chainInfo.evmChainIdTestnet;
                await logSignAminoInj(
                  data as AminoSignResponse,
                  publicKey,
                  txPostToDb,
                  evmChainId ?? '1',
                  activeChain,
                  activeAddress,
                  siteOrigin ?? origin,
                  selectedNetwork,
                );
              } else {
                await logSignAmino(
                  data as AminoSignResponse,
                  publicKey,
                  txPostToDb,
                  activeChain,
                  activeAddress,
                  siteOrigin ?? origin,
                  selectedNetwork,
                );
              }
            } catch (e) {
              captureException(e);
            }
          }

          try {
            const trackingData: Record<string, unknown> = {
              dAppURL: siteOrigin,
              transactionTypes: Array.isArray(messages) ? messages?.map((msg) => msg.raw['type']).filter(Boolean) : [],
              signMode: 'sign-amino',
              walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
              productVersion: DeviceInfo.getVersion(),
              time: Date.now() / 1000,
            };

            try {
              const txHash = getTxHashFromAminoSignResponse(data as AminoSignResponse, publicKey);
              trackingData.txHash = txHash;
            } catch (_) {
              //
            }
          } catch (e) {
            captureException(e);
          }

          isApprovedRef.current = true;
          await sleep(100);

          navigation.goBack();
        } catch (e) {
          if (e instanceof Error) {
            setLedgerError(e.message);
          }
        } finally {
          setShowLedgerPopup(false);
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      activeWallet.addresses,
      selectedNetwork,
      activeChain,
      refetchData,
      signDoc,
      isAmino,
      getWallet,
      siteOrigin,
      fee,
      txPostToDb,
      ethSignType,
    ]);

    useEffect(() => {
      setDappDefaultFee(defaultFee);
      dappDefaultFeeStore.setDefaultFee(defaultFee);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultFee]);

    useEffect(() => {
      AsyncStorage.removeItem(BG_RESPONSE);
    }, []);

    useEffect(() => {
      if (!siteOrigin || !transactionTypes) return;
      if (isDappTxnInitEventLogged.current) return;

      try {
        isDappTxnInitEventLogged.current = true;
      } catch (e) {
        captureException(e);
      }
    }, [activeWallet.walletType, chainInfo.chainId, chainInfo.chainName, isAmino, siteOrigin, transactionTypes]);

    usePerformanceMonitor({
      page: 'sign-transaction',
      queryStatus: txnSigningRequest ? 'success' : 'loading',
      op: 'signTransactionPageLoad',
      description: 'Load tome for sign transaction page',
    });

    const hasToShowCheckbox = useMemo(() => {
      if (isSignArbitrary) {
        return '';
      }

      return Array.isArray(messages)
        ? isGenericOrSendAuthzGrant(Array.isArray(messages) ? messages?.map((msg) => msg.parsed) : null)
        : '';
    }, [isSignArbitrary, messages]);

    const disableBalanceCheck = useMemo(() => {
      return !!fee?.granter || !!fee?.payer || !!signOptions?.disableBalanceCheck;
    }, [fee?.granter, fee?.payer, signOptions?.disableBalanceCheck]);

    const isApproveBtnDisabled =
      !dappFeeDenom ||
      !!signingError ||
      !!gasPriceError ||
      (!!hasToShowCheckbox && checkedGrantAuthBox === false) ||
      (isFeesValid === false && !highFeeAccepted);
    
    const isDark = theme === ThemeName.DARK;
    const windowHeight = useWindowDimensions().height;
    const calcHeight = windowHeight - 72 - (hasToShowCheckbox ? 152 : 72);

    return (
      <SafeAreaView style={styles.safeRoot}>
        <PopupLayout
          style={{flex: 1, flexDirection: 'column'}}
          header={(
            <View style={{ width: 396 }}>
              <Image source={{uri: chainInfo.chainSymbolImageUrl ?? (isDark ? GenericDark : GenericLight)}}/>
              <View style={{ paddingRight: 16 }}>
                <Buttons.Wallet title={trim(walletName, 10)} />
              </View>
            </View>
          )}
        >
          <ScrollView
            style={{
              width: '100%',
              paddingHorizontal: 28,
              paddingVertical: 12,
              position: 'relative',
              height: calcHeight,
            }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20, // 'text-lg'
                fontWeight: 'bold',
                color: isDark ? '#F1F5F9' : '#111827', // dark:text-white-100, text-gray-900
                width: '100%',
              }}
            >
              Approve Transaction
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
                borderRadius: 16,
                backgroundColor: isDark ? '#111827' : '#fff',
                padding: 16,
              }}
            >
              <Avatar
                avatarImage={siteLogo}
                avatarOnError={() => {}}
                size="sm"
                style={{ borderRadius: 999, overflow: 'hidden' }}
              />
              <View style={{ marginLeft: 12 }}>
                <Text
                  style={{
                    textTransform: 'capitalize',
                    color: isDark ? '#F1F5F9' : '#111827',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  {siteName}
                </Text>
                <Text
                  style={{
                    textTransform: 'lowercase',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    fontSize: 12,
                    fontWeight: '500',
                  }}
                >
                  {siteOrigin}
                </Text>
              </View>
            </View>
            {!ethSignType && !isSignArbitrary && (
              <TransactionDetails
                activeChain={activeChain}
                selectedNetwork={selectedNetwork}
                parsedMessages={Array.isArray(messages) ? messages?.map((msg) => msg.parsed) : null}
              />
            )}
            {!ethSignType && !isSignArbitrary ? (
              <GasPriceOptions
                initialFeeDenom={dappFeeDenom}
                gasLimit={userPreferredGasLimit || recommendedGasLimit}
                setGasLimit={(value: string | BigNumber | number) => setUserPreferredGasLimit(value.toString())}
                recommendedGasLimit={recommendedGasLimit}
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
                validateFee={!isAdr36}
                onInvalidFees={(feeTokenData: NativeDenom, isFeesValid: boolean | null) => {
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
                    //{ id: 'memo', label: 'Memo' }, //Hiding  memo for now.
                    {
                      id: 'messages',
                      label: `Messages${messages?.length ? ` (${messages.length})` : ''}`,
                    },
                    { id: 'data', label: 'Data' },
                  ]}
                  tabsContent={{
                    fees: allowSetFee ? (
                      <View style={{
                        borderRadius: 16,
                        padding: 16,
                        marginTop: 12,
                        backgroundColor: isDark ? '#111827' : '#f9fafb', // gray-900 : white-100
                      }}>
                        <View style={styles.rowCenter}>
                          <Text style={[styles.feeTitle, isDark && styles.feeTitleDark]}>
                            Gas Fees 
                          </Text>
                          <Text style={{ textTransform: 'capitalize' }}>({gasPriceOption.option})</Text>
                          <Tooltip
                            content={
                              <Text style={[styles.tooltipText, isDark && styles.tooltipTextDark]}>
                                You can choose higher gas fees for faster transaction processing.
                              </Text>
                            }
                          >
                            <View style={styles.tooltipIcon}>
                              <Image source={{uri: Images.Misc.InfoCircle}} alt={'Hint'} style={{width: 20, height: 20}} />
                            </View>
                          </Tooltip>
                        </View>

                        <GasPriceOptions.Selector style={styles.mt2} />

                        <View style={styles.rowEnd}>
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
                      <>
                        <View style={{
                          borderRadius: 16,
                          padding: 16,
                          marginTop: 12,
                          backgroundColor: isDark ? '#111827' : '#f9fafb', // gray-900 : white-100
                        }}>
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
                          <View style={styles.rowEnd}>
                            <GasPriceOptions.AdditionalSettingsToggle style={styles.mt3} />
                          </View>
                          <NotAllowSignTxGasOptions gasPriceOption={gasPriceOption} gasPriceError={gasPriceError} />
                        </View>
                      </>
                    ),
                    memo: (
                      <View style={{ marginTop: 12 }}>
                        {defaultMemo || userMemo ? (
                          <MemoInput
                            disabled={!!defaultMemo}
                            memo={defaultMemo ? defaultMemo : userMemo}
                            setMemo={setUserMemo}
                            activeChain={activeChain}
                          />
                        ) : (
                          <View>
                            <Text style={{ color: isDark ? '#f3f4f6' : '#6b7280', fontSize: 14 }}>
                              No information available. The transaction can still be approved.
                            </Text>
                          </View>
                        )}
                      </View>
                    ),
                    messages: (
                      <View style={{ marginTop: 12 }}>
                        {messages && messages.length > 0 ? (
                          <MessageList
                            parsedMessages={messages.map((msg) => msg.parsed)}
                            onMessageSelect={(msg, index) => {
                              setSelectedMessage({
                                index,
                                parsed: messages[index].parsed,
                                raw: messages[index].raw,
                              });
                              setShowMessageDetailsSheet(true);
                            }}
                          />
                        ) : (
                          <View>
                            <Text style={{ color: isDark ? '#f3f4f6' : '#6b7280', fontSize: 14 }}>
                              No information available. The transaction can still be approved.
                            </Text>
                          </View>
                        )}
                      </View>
                    ),
                    data: (
                      <View style={{ marginTop: 12, borderRadius: 16, backgroundColor: isDark ? '#111827' : '#fff', padding: 16 }}>
                        <ScrollView horizontal style={{ width: '100%' }}>
                          <Text
                            style={{
                              fontFamily: 'monospace',
                              fontSize: 12,
                              color: isDark ? '#f3f4f6' : '#111827',
                            }}
                          >
                            {JSON.stringify(
                              txnDoc,
                              (_, value) => (typeof value === 'bigint' ? value.toString() : value),
                              2
                            )}
                          </Text>
                        </ScrollView>
                      </View>
                    ),
                  }}
                />
              </GasPriceOptions>
            ) : (
              <View
                style={{
                  marginTop: 12,
                  borderRadius: 16,
                  backgroundColor: isDark ? '#111827' : '#fff',
                  padding: 16,
                  width: '100%',
                }}
              >
                <ScrollView
                  horizontal
                  style={{ width: '100%' }}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <Text
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: isDark ? '#f3f4f6' : '#111827',
                      // Add line break support if needed
                    }}
                    selectable
                  >
                    {isSignArbitrary && typeof messages === 'string'
                      ? messages
                      : JSON.stringify(
                          (() => {
                            try {
                              return JSON.parse(Array.isArray(messages) ? messages?.[0].parsed?.message : null);
                            } catch (e) {
                              return {};
                            }
                          })(),
                          null,
                          2
                        )}
                  </Text>
                </ScrollView>
              </View>
            )}

            <View style={{marginTop: 12}}>
              {signingError ?? ledgerError ? <ErrorCard text={signingError ?? ledgerError} /> : null}
            </View>

            <LedgerConfirmationModal
              showLedgerPopup={showLedgerPopup}
              onClose={() => {
                setShowLedgerPopup(false);
              }}
            />

            <MessageDetailsSheet
              isOpen={showMessageDetailsSheet}
              setIsOpen={setShowMessageDetailsSheet}
              onClose={() => setSelectedMessage(null)}
              message={selectedMessage}
              activeChain={activeChain}
              selectedNetwork={selectedNetwork}
            />
            
            {isFeesValid === false && (
              <View
                ref={errorMessageRef}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#111827' : '#fff',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 16,
                  width: '100%',
                  marginTop: 12,
                }}
              >
                <TouchableOpacity
                  style={{ marginRight: 12 }}
                  onPress={() => setHighFeeAccepted(!highFeeAccepted)}
                  hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
                >
                  {!highFeeAccepted ? (
                    <Square size={16} color={isDark ? '#d1d5db' : '#374151'} />
                  ) : (
                    <CheckSquare size={16} color={getChainColor(activeChain)} />
                  )}
                </TouchableOpacity>

                <Text size='sm' color='text-gray-400'>
                  The selected fee amount is unusually high.{"\n"}
                  I confirm and agree to proceed
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={{
            paddingVertical: 12,         // py-3
            paddingHorizontal: 28,       // px-7
            backgroundColor: darkMode ? Colors.black100 : Colors.gray50, // dark:bg-black-100 bg-gray-50
            width: '100%',
            marginTop: 'auto',
          }}>
            {hasToShowCheckbox ? (
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 12,       // mb-3
                borderWidth: 1,
                borderColor: '#eab308', // border-yellow-600
                borderRadius: 8,        // rounded-lg
                padding: 4,
              }}>
                <TouchableOpacity
                  style={{ marginRight: 8 }} // mr-2
                  onPress={() => setCheckedGrantAuthBox(!checkedGrantAuthBox)}
                  activeOpacity={0.8}
                >
                  {!checkedGrantAuthBox ? (
                    <Square size={16} color={Colors.gray900} />
                  ) : (
                    <CheckSquare size={16} color={getChainColor(activeChain)} />
                  )}
                </TouchableOpacity>
                <Text style={{ color: Colors.gray400, fontSize: 15 }}>
                  {hasToShowCheckbox}
                </Text>
              </View>
            ) : null}

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: 12, // RN 0.71+, else use marginRight on left button
              marginTop: 8, // mt-2
            }}>
              <Buttons.Generic
                title={'Reject'}
                color={Colors.gray900}
                onClick={handleCancel}
                // No children in RN unless you need them
                // style can be passed if needed
              />
              <Buttons.Generic
                title={'Approve'}
                color={getChainColor(activeChain)}
                onClick={approveTransaction}
                disabled={isApproveBtnDisabled}
                style={isApproveBtnDisabled ? { opacity: 0.5 } : {}}
              />
            </View>
          </View>
        </PopupLayout>
      </SafeAreaView>
    );
  },
);

const withTxnSigningRequest = (Component: React.FC<any>) => {
  const Wrapped = () => {
    const [chain, setChain] = useState<SupportedChain>();
    const [_chainIdToChain, setChainIdToChain] = useState(chainIdToChain);
    const [isSignArbitrary, setIsSignArbitrary] = useState(false);

    const [txnData, setTxnData] = useState<any | null>(null);
    const [chainId, setChainId] = useState<string>();
    const [error] = useState<{ message: string; code: string } | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
      decodeChainIdToChain()
        .then(setChainIdToChain)
        .catch(captureException);
    }, []);

    // --- Render ---
    if (chain && txnData && chainId) {
      return (
        <Component
          data={txnData}
          chainId={chainId}
          activeChain={chain}
          isSignArbitrary={isSignArbitrary}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
          evmBalanceStore={evmBalanceStore}
          rootStakeStore={rootStakeStore}
        />
      );
    }

    if (error) {
      const heading =
        error.code === 'no-data' ? 'No Transaction Data' : 'Something Went Wrong';

      return (
        <SafeAreaView style={{ flex: 1 }}>
          <PopupLayout
            header={<Header title="Sign Transaction" />}
            style={styles.popupLayout}
          >
            <View style={styles.centered}>
              <Text style={styles.errorHeading}>{heading}</Text>
              <Text style={styles.errorMsg}>{error.message}</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Text style={styles.closeBtnText}>Close Wallet</Text>
              </TouchableOpacity>
            </View>
          </PopupLayout>
        </SafeAreaView>
      );
    }

    // Loading state
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <PopupLayout
          header={<Header title="Sign Transaction" />}
          style={styles.popupLayout}
        >
          <View style={styles.centered}>
            <LoaderAnimation color="white" />
          </View>
        </PopupLayout>
      </SafeAreaView>
    );
  };

  Wrapped.displayName = `withTxnSigningRequest(${Component.displayName})`;
  return Wrapped;
};

const signTx = withTxnSigningRequest(React.memo(SignTransaction));

export default signTx;

const styles = StyleSheet.create({
  popupLayout: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorHeading: { color: '#db2777', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  errorMsg: { color: '#333', fontSize: 14, textAlign: 'center', marginBottom: 28 },
  closeBtn: { backgroundColor: '#818cf8', borderRadius: 20, paddingHorizontal: 28, paddingVertical: 10 },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  safeRoot: {
    flex: 1,
    backgroundColor: '#fff',
    alignSelf: 'center',       // self-center
    justifyContent: 'center',  // justify-center
    alignItems: 'center',      // items-center
    width: '100%',             // panel-width - adjust as needed
    position: 'relative',      // relative
    overflow: 'hidden',        // overflow-clip
    borderRadius: 12,          // rounded-md (adjust px as needed)
    borderWidth: 1,
    borderColor: '#D1D5DB',    // gray-300, use dynamic theme for dark
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeTitle: {
    color: '#6b7280', // gray-500
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  feeTitleDark: {
    color: '#f3f4f6', // gray-100
  },
  tooltipText: {
    color: '#6b7280', // gray-500
    fontSize: 14,
  },
  tooltipTextDark: {
    color: '#f3f4f6', // gray-100
  },
  tooltipIcon: {
    marginLeft: 8,
    position: 'relative',
  },
  mt2: {
    marginTop: 8,
  },
  mt3: {
    marginTop: 12,
  },
  rowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  errorText: {
    color: '#fca5a5', // red-300
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    paddingHorizontal: 4,
  },
});