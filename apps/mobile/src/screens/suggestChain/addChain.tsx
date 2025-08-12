// src/screens/.../AddChain.tsx (React Native)

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Image, Pressable, Text as TextRN } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ExclamationMark } from 'phosphor-react-native';
import mixpanel from '../../mixpanel';

import {
  fetchEvmChainId,
  Key as WalletKey,
  removeTrailingSlash,
  useCustomChains,
} from '@leapwallet/cosmos-wallet-hooks';
import {
  chainIdToChain,
  ChainInfo,
  defaultGasPriceStep,
  sleep,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';

import { ErrorCard } from '../../components/ErrorCard';
import { InputComponent } from '../../components/input-component/InputComponent';
import Loader from '../../components/loader/Loader';
import NewBottomModal from '../../components/new-bottom-modal';
import { Button } from '../../components/ui/button';

import { ButtonName, ButtonType, EventName } from '../../services/config/analytics';
import { BETA_CHAINS } from '../../services/config/storage-keys';

import { usePerformanceMonitor } from '../../hooks/perf-monitoring/usePerformanceMonitor';
import { useSetActiveChain } from '../../hooks/settings/useActiveChain';
import useActiveWallet, { useUpdateKeyStore } from '../../hooks/settings/useActiveWallet';
import { useChainInfos, useSetChainInfos } from '../../hooks/useChainInfos';
import { useDefaultTokenLogo } from '../../hooks/utility/useDefaultTokenLogo';

import { chainTagsStore } from '../../context/chain-infos-store';
import { rootStore } from '../../context/root-store';
import { isNotValidNumber, isNotValidURL } from '../../utils/regex';
import { Images } from '../../../assets/images';
import { Colors } from '../../theme/colors';
import { captureException } from '@sentry/react-native';

// -----------------------------
// AddChainForm
// -----------------------------
type TAddChainFormProps = {
  updateKeyStore: (
    wallet: WalletKey,
    activeChain: SupportedChain,
    actionType?: 'UPDATE' | 'DELETE',
    chainInfo?: ChainInfo,
  ) => Promise<Record<string, WalletKey>>;
  activeWallet: WalletKey;
  setActiveWallet: (wallet: WalletKey) => Promise<void>;
  setActiveChain: (chain: SupportedChain, chainInfo?: ChainInfo) => Promise<void>;
};

const AddChainForm = observer(
  ({ updateKeyStore, activeWallet, setActiveWallet, setActiveChain }: TAddChainFormProps) => {
    const navigation = useNavigation<any>();
    const chainInfos = useChainInfos();
    const customChains = useCustomChains();
    const setChainInfos = useSetChainInfos();

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [evmChainInfo, setEvmChainInfo] = useState({ isEvmChain: true, chainId: '' });
    const [chainInfo, setChainInfo] = useState({
      chainName: '',
      chainId: '',
      denom: '',
      coinType: '',
      rpcUrl: '',
      restUrl: '',
      addressPrefix: '',
      explorerUrl: '',
      decimals: '',
    });

    const { chainName, chainId, denom, coinType, rpcUrl, restUrl, addressPrefix, explorerUrl, decimals } = chainInfo;

    const customChainIds = useMemo(() => customChains.map((c) => c.chainId), [customChains]);

    const fetchChainInfo = useCallback(
      async (id: string) => {
        try {
          if (!id?.trim()) return;
          if (customChainIds.includes(id)) {
            setErrors((v) => ({ ...v, chainId: `Please add ${id} from switch chain list` }));
            return;
          }
          const chain = chainIdToChain[id.trim()];
          if (!chain) return;

          const mainnetBaseURL = 'https://chains.cosmos.directory';
          const { data: mainnetData }: any = await axios.get(`${mainnetBaseURL}/${chain}`).catch(() => ({}));

          const testnetBaseURL = 'https://chains.testcosmos.directory';
          const { data: testnetData }: any = mainnetData
            ? { data: null }
            : await axios.get(`${testnetBaseURL}/${chain}`).catch(() => ({}));

          const info = mainnetData?.chain || testnetData?.chain;
          if (!info) return;

          setEvmChainInfo((v) => ({ ...v, isEvmChain: false }));

          const mintscanExplorer = info.explorers?.find?.((e: any) => e.kind === 'mintscan');
          const txBase =
            mintscanExplorer?.tx_page?.slice?.(0, -10) ??
            info.explorers?.[0]?.tx_page?.slice?.(0, -10) ??
            '';

          setChainInfo((s) => ({
            ...s,
            chainId: info.chain_id ?? s.chainId,
            chainName: info.pretty_name ?? s.chainName,
            denom: info.denom ?? s.denom,
            coinType: String(info.slip44 ?? s.coinType),
            addressPrefix: info.bech32_prefix ?? s.addressPrefix,
            decimals: String(info.decimals ?? s.decimals),
            restUrl: info.best_apis?.rest?.[0]?.address ?? s.restUrl,
            rpcUrl: info.best_apis?.rpc?.[0]?.address ?? s.rpcUrl,
            explorerUrl: txBase,
          }));
        } catch {
          /* ignore */
        }
      },
      [customChainIds],
    );

    const fetchChainId = useCallback(async (rpc: string) => {
      if (!rpc) {
        setEvmChainInfo((v) => ({ ...v, isEvmChain: true }));
        return;
      }
      const id = await fetchEvmChainId(rpc);
      if (!id) {
        setEvmChainInfo((v) => ({ ...v, isEvmChain: false }));
        return;
      }
      setEvmChainInfo({ isEvmChain: true, chainId: String(id) });
    }, []);

    const trackCTAEvent = useCallback(
      (buttonName: string, redirectURL?: string) => {
        try {
          mixpanel.track(EventName.ButtonClick, {
            buttonType: ButtonType.CHAIN_MANAGEMENT,
            buttonName,
            addedChainName: chainName,
            redirectURL,
            time: Date.now() / 1000,
          });
        } catch (e) {
          captureException(e);
        }
      },
      [chainName],
    );

    // RN input onChange helpers
    const setField =
      (name: keyof typeof chainInfo) =>
      (value: string) => {
        const clean = ['rpcUrl', 'restUrl', 'explorerUrl'].includes(name as string)
          ? value.replace(/ /g, '')
          : value;

        // validation block
        const enabledChains = Object.values(chainInfos).filter((c: any) => c.enabled);
        let error = '';
        if (clean) {
          if (['coinType', 'decimals'].includes(name as string) && isNotValidNumber(clean)) {
            error = `Invalid ${name} provided`;
          } else if (
            ['rpcUrl', 'restUrl', 'explorerUrl'].includes(name as string) &&
            isNotValidURL(clean) &&
            clean.length > 0
          ) {
            error = `Invalid ${name} provided`;
          } else if (
            name === 'chainName' &&
            enabledChains.some((c: any) => c.chainName?.toLowerCase() === clean.toLowerCase())
          ) {
            error = 'Chain with same name already exists';
          } else if (name === 'chainId') {
            if (enabledChains.some((c: any) => c.chainId?.toLowerCase() === clean.toLowerCase())) {
              error = 'Chain with same id already exists';
            } else if (
              enabledChains.some((c: any) => (c.testnetChainId ?? '')?.toLowerCase() === clean.toLowerCase())
            ) {
              error = 'Test chain with same id already exists';
            }
          }
        }
        setErrors((s) => {
          if (error) return { ...s, [name]: error };
          const next = { ...s };
          delete (next as any)[name];
          return next;
        });

        setChainInfo((s) => ({ ...s, [name]: clean }));
      };

    const handleSubmit = useCallback(async () => {
      setLoading(true);

      const data: any = {
        chainId,
        chainName,
        chainRegistryPath: addressPrefix,
        key: chainName,
        chainSymbolImageUrl: Images.Logos.GenericLight,
        txExplorer: { mainnet: { name: 'Explorer', txUrl: explorerUrl } },
        apis: {
          rest: removeTrailingSlash(restUrl),
          rpc: removeTrailingSlash(rpcUrl),
        },
        denom,
        bip44: { coinType: evmChainInfo.isEvmChain ? '60' : coinType },
        addressPrefix,
        gasPriceStep: defaultGasPriceStep,
        ibcChannelIds: {},
        nativeDenoms: {
          [denom]: {
            coinDenom: denom,
            coinMinimalDenom: denom,
            coinDecimals: evmChainInfo.isEvmChain ? 18 : Number(decimals),
            coinGeckoId: '',
            icon: Images.Logos.GenericLight,
            chain: chainName,
          },
        },
        theme: {
          primaryColor: '#E18881',
          gradient:
            'linear-gradient(180deg, rgba(225, 136, 129, 0.32) 0%, rgba(225, 136, 129, 0) 100%)',
        },
        enabled: true,
        beta: true,
        features: [],
      };

      if (evmChainInfo.isEvmChain) {
        data.evmChainId = chainId;
        data.apis.evmJsonRpc = removeTrailingSlash(rpcUrl);
        data.evmOnlyChain = true;
        data.chainRegistryPath = chainId;
        data.addressPrefix = denom;
      }

      try {
        setChainInfos({ ...chainInfos, [chainName]: data });
        rootStore.setChains({ ...chainInfos, [chainName]: data });
        await sleep(500);

        const stored = await AsyncStorage.getItem(BETA_CHAINS);
        let betaChains = stored ? JSON.parse(stored) : {};

        const updatedKeystore = await updateKeyStore(
          activeWallet,
          chainName as unknown as SupportedChain,
          'UPDATE',
          data,
        );

        betaChains[chainName] = data;
        await AsyncStorage.setItem(BETA_CHAINS, JSON.stringify(betaChains));

        if (data.evmOnlyChain) {
          chainTagsStore.setBetaChainTags(data.chainId, ['EVM']);
        } else {
          chainTagsStore.setBetaChainTags(data.chainId, ['Cosmos']);
        }

        await setActiveWallet(updatedKeystore[activeWallet.id] as WalletKey);
        await setActiveChain(chainName as unknown as SupportedChain, data);

        navigation.navigate('Login');
      } catch (e) {
        setErrors((s) => ({ ...s, submit: 'Unable to add chain' }));
      } finally {
        setLoading(false);
        trackCTAEvent(ButtonName.ADD_NEW_CHAIN, '/add-chain');
      }
    }, [activeWallet, addressPrefix, chainId, chainInfos, chainName, coinType, decimals, denom, evmChainInfo.isEvmChain, explorerUrl, navigation, restUrl, rpcUrl, setActiveChain, setActiveWallet, setChainInfos, trackCTAEvent, updateKeyStore]);

    const handleOnBlurChainId = useCallback(() => {
      fetchChainInfo(chainId);
    }, [chainId, fetchChainInfo]);

    const handleOnBlurRpcUrl = useCallback(() => {
      fetchChainId(rpcUrl);
    }, [rpcUrl, fetchChainId]);

    const disableSubmit =
      !chainId ||
      !chainName ||
      !denom ||
      !rpcUrl ||
      (!evmChainInfo.isEvmChain && (!coinType || !decimals || !restUrl || !addressPrefix)) ||
      Object.values(errors).length > 0;

    useEffect(() => {
      if (evmChainInfo.chainId && chainInfo.chainId && chainInfo.chainId !== evmChainInfo.chainId) {
        setErrors((e) => ({
          ...e,
          chainId: `The RPC URL you have entered returned a different chain ID ${evmChainInfo.chainId}`,
        }));
      }
    }, [chainInfo.chainId, evmChainInfo.chainId]);

    usePerformanceMonitor({
      page: 'add-chain',
      queryStatus: 'success',
      op: 'addChainFormLoad',
      description: 'render add chain form',
    });

    return (
      <>
        <View style={styles.scrollArea}>
          <View style={styles.banner}>
            <ExclamationMark style={styles.bannerIcon} size={20} />
            <TextRN style={styles.bannerText}>Only add custom networks you trust.</TextRN>
          </View>

          {/* Inputs (RN): Assuming InputComponent supports onChangeText + onBlur */}
          <InputComponent
            placeholder="Chain id (Ex: juno-1)"
            value={chainId}
            name="chainId"
            onChange={setField('chainId')}
            error={errors.chainId}
            onBlur={handleOnBlurChainId}
          />

          <InputComponent
            placeholder="Chain name (Ex: Juno)"
            value={chainName}
            name="chainName"
            onChange={setField('chainName')}
            error={errors.chainName}
          />

          <InputComponent
            placeholder="New RPC URL (without trailing slash)"
            value={rpcUrl}
            name="rpcUrl"
            onChange={setField('rpcUrl')}
            error={errors.rpcUrl}
            onBlur={handleOnBlurRpcUrl}
          />

          {!evmChainInfo.isEvmChain && (
            <InputComponent
              placeholder="New REST URL (without trailing slash)"
              value={restUrl}
              name="restUrl"
              onChange={setField('restUrl')}
              error={errors.restUrl}
            />
          )}

          {!evmChainInfo.isEvmChain && (
            <InputComponent
              placeholder="Address prefix (Ex: juno)"
              value={addressPrefix}
              name="addressPrefix"
              onChange={setField('addressPrefix')}
            />
          )}

          <InputComponent
            placeholder="Native denom (Ex: ujuno)"
            value={denom}
            name="denom"
            onChange={setField('denom')}
          />

          {!evmChainInfo.isEvmChain && (
            <InputComponent
              placeholder="Coin type (Ex: 118)"
              value={coinType}
              name="coinType"
              onChange={setField('coinType')}
              error={errors.coinType}
            />
          )}

          {!evmChainInfo.isEvmChain && (
            <InputComponent
              placeholder="Decimals (Ex: 6)"
              value={decimals}
              name="decimals"
              onChange={setField('decimals')}
              error={errors.decimals}
            />
          )}

          <InputComponent
            placeholder="Block explorer URL (Optional)"
            value={explorerUrl}
            name="explorerUrl"
            onChange={setField('explorerUrl')}
            error={errors.explorerUrl}
          />

          {errors.submit ? <ErrorCard text={errors.submit} /> : null}
        </View>

        <View style={styles.bottomBar}>
          {loading ? (
            <View style={{ height: 44 }}>
              <Loader />
            </View>
          ) : (
            <Button
              style={styles.cta}
              disabled={loading || disableSubmit}
              onPress={handleSubmit}
            >
              Add chain
            </Button>
          )}
        </View>
      </>
    );
  },
);

// -----------------------------
// Modal Wrapper
// -----------------------------
export default function AddChain({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const updateKeyStore = useUpdateKeyStore();
  const { activeWallet, setActiveWallet } = useActiveWallet();
  const setActiveChain = useSetActiveChain();

  return (
    <NewBottomModal
      isOpen={isOpen}
      onClose={onClose}
      fullScreen
      title="Add Chain"
      secondaryActionButton={
        <Pressable onPress={onClose} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.compassPrimary} />
        </Pressable>
      }
      contentStyle={styles.modalContent}
      hideActionButton
    >
      {/* Casts below are to satisfy the generic types at callsite */}
      <AddChainForm
        updateKeyStore={updateKeyStore as any}
        activeWallet={activeWallet as any}
        setActiveWallet={setActiveWallet as any}
        setActiveChain={setActiveChain as any}
      />
    </NewBottomModal>
  );
}

// -----------------------------
// Styles
// -----------------------------
const styles = StyleSheet.create({
  scrollArea: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 56, // leave room above bottom bar
  },
  banner: {
    borderRadius: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#F1F3FF', // secondary-100-ish
    marginBottom: 28,
    columnGap: 10 as any,
  },
  bannerIcon: {
    backgroundColor: '#FFDA6A', // accent yellow
    borderRadius: 999,
    padding: 2,
    color: '#3B3B5A',
  } as any,
  bannerText: {
    fontWeight: '500',
    fontSize: 14,
    color: Colors.compassPrimary,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#F1F3FF',
  },
  cta: {
    borderRadius: 999,
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    padding: 4,
  },
  modalContent: {
    // full height modal body padding
    padding: 24,
  },
});
