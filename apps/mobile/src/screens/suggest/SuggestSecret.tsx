// src/screens/.../SuggestSecret.tsx (React Native)

import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';

import {
  useGetChainApis,
  useGetChains,
  useSetBetaCW20Tokens,
  useSetBetaSnip20Tokens,
  useSnipDenoms,
} from '@leapwallet/cosmos-wallet-hooks';
import { SUPPORTED_METHODS } from '@leapwallet/cosmos-wallet-provider/dist/provider/messaging/requester';
import { Sscrt, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { captureException } from '@sentry/react-native';
import { AxiosError } from 'axios';

import { LoaderAnimation } from '../../components/loader/Loader';
import Text from '../../components/text';

import { BG_RESPONSE, SUGGEST_TOKEN } from '../../services/config/storage-keys';
import { decodeChainIdToChain } from '../../context/utils';
import { useCreateViewingKey, verifyViewingKey } from '../../hooks/secret/useCreateViewingKey';

import { betaCW20DenomsStore, enabledCW20DenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';
import { Colors } from '../../theme/colors';
import { getContractInfo } from '../../utils/getContractInfo';
import { uiErrorTags } from '../../utils/sentry';

import {
  ChildrenParams,
  Footer,
  FooterAction,
  Heading,
  SubHeading,
  SuggestContainer,
  TokenContractAddress,
  TokenContractInfo,
} from './components';
import { TokenContractInfoSkeleton } from './components/TokenContractInfoSkeleton';

// ---- small helpers to keep JSON storage ergonomic ----
async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
async function setJSON(key: string, value: unknown) {
  return AsyncStorage.setItem(key, JSON.stringify(value));
}

const SuggestSecret = observer(({ handleRejectBtnClick }: ChildrenParams) => {
  const navigation = useNavigation<any>();
  const chains = useGetChains();
  const createViewingKey = useCreateViewingKey();
  const secretTokens = useSnipDenoms();
  const getChainApis = useGetChainApis('secret', 'mainnet', chains);
  const setBetaCW20Tokens = useSetBetaCW20Tokens();
  const setSnip20Tokens = useSetBetaSnip20Tokens();

  const [customKey, setCustomKey] = useState('');
  const [advancedFeature, setAdvancedFeature] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCustomKeyError, setIsCustomKeyError] = useState(false);

  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [contractInfo, setContractInfo] = useState({
    decimals: 0,
    name: '',
    symbol: '',
  });

  const [payload, setPayload] = useState({
    contractAddress: '',
    address: '',
    viewingKey: '',
    type: '',
    chainId: 'secret-4',
  });

  const isUpdateSecret20Type = payload.type !== SUPPORTED_METHODS.SUGGEST_CW20_TOKEN;

  useEffect(() => {
    (async () => {
      const res = await getJSON<any>(SUGGEST_TOKEN, null);
      const _payload = res;
      const chainIdToChain = await decodeChainIdToChain();
      const chain = _payload ? chainIdToChain[_payload.chainId] : undefined;
      const { lcdUrl } = getChainApis(false, chain as SupportedChain, 'mainnet');

      if (_payload && lcdUrl) {
        try {
          setIsFetching(true);
          setPayload(_payload);
          setError('');

          if (_payload.type !== SUPPORTED_METHODS.SUGGEST_CW20_TOKEN) {
            // secret20
            if (secretTokens?.[_payload.contractAddress]) {
              const denom = secretTokens[_payload.contractAddress];
              setContractInfo({
                name: denom.name,
                symbol: denom.symbol,
                decimals: denom.decimals,
              });
            } else {
              const sscrt = Sscrt.create(lcdUrl, _payload.chainId, _payload.address);
              const resp = await sscrt.getTokenParams(_payload.contractAddress);
              if (resp.token_info) {
                setContractInfo(resp.token_info);
              }
            }
          } else {
            // cw20
            const result = await getContractInfo(lcdUrl, _payload.contractAddress);

            if (typeof result === 'string' && result.includes('Invalid')) {
              setError('Invalid Contract Address');
              return;
            }
            setContractInfo({
              name: result.name,
              symbol: result.symbol,
              decimals: result.decimals,
            });
          }
        } catch (e) {
          if (e instanceof AxiosError) {
            setError(e.response?.data?.message ?? e.message);
          } else {
            setError((e as Error).message);
          }
          captureException(e, { tags: uiErrorTags });
        } finally {
          setIsFetching(false);
        }
      } else {
        setIsFetching(false);
      }
    })();
  }, [getChainApis, secretTokens]);

  const verifyViewingKeyOnChange = useCallback(async () => {
    setIsVerifying(true);
    const chainIdToChain = await decodeChainIdToChain();
    const chain = chainIdToChain[payload.chainId];
    const { lcdUrl = '' } = getChainApis(false, chain as SupportedChain, 'mainnet');

    const validKey = await verifyViewingKey(lcdUrl, customKey, payload.contractAddress, payload.address);

    setIsCustomKeyError(!validKey);
    setIsVerifying(false);
    return validKey;
  }, [customKey, getChainApis, payload.address, payload.chainId, payload.contractAddress]);

  const approveNewToken = useCallback(async () => {
    try {
      if (isUpdateSecret20Type) {
        if (customKey) {
          const validKey = await verifyViewingKeyOnChange();
          if (!validKey) return;
        }

        setIsLoading(true);
        const chainIdToChain = await decodeChainIdToChain();
        const chain = chainIdToChain[payload.chainId];
        const { lcdUrl = '' } = getChainApis(false, chain as SupportedChain, 'mainnet');

        await createViewingKey(
          lcdUrl,
          payload.chainId,
          payload.address,
          payload.contractAddress,
          payload.type === SUPPORTED_METHODS.UPDATE_SECRET20_VIEWING_KEY || (advancedFeature && !!customKey),
          { key: payload.viewingKey || customKey },
        );

        if (!secretTokens[payload.contractAddress]) {
          const newSnipToken = {
            name: contractInfo.symbol,
            symbol: payload.contractAddress,
            decimals: contractInfo.decimals,
            coinGeckoId: '',
            icon: '',
          };
          await setSnip20Tokens(payload.contractAddress, newSnipToken, chain);
        }
      } else {
        setIsLoading(true);
        const chainIdToChain = await decodeChainIdToChain();
        const chain = chainIdToChain[payload.chainId] as SupportedChain;

        const cw20Token = {
          coinDenom: contractInfo.symbol,
          coinMinimalDenom: payload.contractAddress,
          coinDecimals: contractInfo.decimals,
          coinGeckoId: '',
          icon: '',
          chain,
        };

        await betaCW20DenomsStore.setBetaCW20Denoms(payload.contractAddress, cw20Token, chain);

        const enabledCW20Tokens = enabledCW20DenomsStore.getEnabledCW20DenomsForChain(chain);
        const _enabledCW20Tokens = [...enabledCW20Tokens, payload.contractAddress];
        await enabledCW20DenomsStore.setEnabledCW20Denoms(_enabledCW20Tokens, chain);
        rootBalanceStore.loadBalances();
      }

      await setJSON(BG_RESPONSE, { data: 'Approved' });

      // tiny delay to mimic original timing, then clear storage & navigate
      setTimeout(async () => {
        await AsyncStorage.removeItem(SUGGEST_TOKEN);
        await AsyncStorage.removeItem(BG_RESPONSE);
        setIsLoading(false);
        // In RN there is no window.close; go Home or back
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('Home');
      }, 50);
    } catch (e) {
      if (e instanceof AxiosError) {
        setError(e.response?.data?.message ?? e.message);
      } else {
        setError((e as Error).message);
      }
      captureException(e, { tags: uiErrorTags });
      setIsLoading(false);
    }
  }, [
    advancedFeature,
    contractInfo.decimals,
    contractInfo.symbol,
    createViewingKey,
    customKey,
    getChainApis,
    isUpdateSecret20Type,
    navigation,
    payload.address,
    payload.chainId,
    payload.contractAddress,
    payload.type,
    payload.viewingKey,
    secretTokens,
    setSnip20Tokens,
    verifyViewingKeyOnChange,
  ]);

  return (
    <>
      <View style={styles.centerCol}>
        <Heading text="Adding token" />
        <SubHeading text="This will allow this token to be viewed within Leap Wallet" />

        <TokenContractAddress address={payload.contractAddress ?? ''} />

        {isFetching ? (
          <TokenContractInfoSkeleton />
        ) : (
          !!contractInfo && (
            <TokenContractInfo
              name={contractInfo.name ?? ''}
              symbol={contractInfo.symbol ?? ''}
              decimals={contractInfo.decimals ?? 0}
            />
          )
        )}
      </View>

      {!!contractInfo && !isFetching && (
        <View style={styles.fullWidth}>
          {advancedFeature && (
            <View
              style={[
                styles.inputRow,
                (isCustomKeyError && !!customKey) ? styles.borderRed : styles.borderGray,
              ]}
            >
              <TextInput
                placeholder="viewing key"
                placeholderTextColor={Colors.gray400}
                style={styles.textInput}
                value={customKey}
                onChangeText={setCustomKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {isVerifying ? <LoaderAnimation color={Colors.white100} /> : null}
            </View>
          )}

          {isCustomKeyError && !!customKey && (
            <Text size="sm" style={{marginTop: 4}} color="text-red-300">
              Invalid Viewing key provided
            </Text>
          )}
        </View>
      )}

      <Footer error={error} isFetching={isFetching}>
        {isUpdateSecret20Type && (
          <View style={styles.advancedRow}>
            <Switch
              value={advancedFeature}
              onValueChange={() => setAdvancedFeature(!advancedFeature)}
            />
            <Text size="md" style={{marginLeft: 8}} color="dark:text-white-100 text-gray-900">
              (Advanced) Import my own viewing key
            </Text>
          </View>
        )}

        <FooterAction
          error={error}
          rejectBtnClick={handleRejectBtnClick}
          rejectBtnText="Reject"
          confirmBtnClick={approveNewToken}
          confirmBtnText={isLoading || isVerifying ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
          isConfirmBtnDisabled={
            !!error?.length || (isCustomKeyError && customKey?.length > 0) || !contractInfo.name
          }
        />
      </Footer>
    </>
  );
});

export default function SuggestSecretWrapper() {
  return (
    <SuggestContainer suggestKey={SUGGEST_TOKEN}>
      {({ handleRejectBtnClick }) => <SuggestSecret handleRejectBtnClick={handleRejectBtnClick} />}
    </SuggestContainer>
  );
}

const styles = StyleSheet.create({
  centerCol: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  fullWidth: {
    marginVertical: 16, // my-4
    width: '100%',
  },
  inputRow: {
    position: 'relative',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    backgroundColor: Colors.white100, // adjust for dark mode in your theming
    paddingVertical: 8,
    paddingLeft: 20,
    paddingRight: 10,
  },
  borderGray: {
    borderWidth: 1,
    borderColor: Colors.gray400,
  },
  borderRed: {
    borderWidth: 1,
    borderColor: Colors.red300,
  },
  textInput: {
    flexGrow: 1,
    flex: 1,
    fontSize: 16,
    color: Colors.gray400, // replace with dark/light aware color if you have
  },
  advancedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
});
