// src/screens/.../SuggestChain.tsx (React Native)

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, Pressable, StyleSheet, Text as TextRN } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';

import { Key as WalletKey, useCustomChains } from '@leapwallet/cosmos-wallet-hooks';
import { sleep, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { GenericCard } from '@leapwallet/leap-ui';

import { Divider, Key, Value } from '../../components/dapp';
import { LoaderAnimation } from '../../components/loader/Loader';

import { BETA_CHAINS, BG_RESPONSE, NEW_CHAIN_REQUEST } from '../../services/config/storage-keys';
import { usePerformanceMonitor } from '../../hooks/perf-monitoring/usePerformanceMonitor';
import { useSetActiveChain } from '../../hooks/settings/useActiveChain';
import useActiveWallet, { useUpdateKeyStore } from '../../hooks/settings/useActiveWallet';
import { useChainInfos, useSetChainInfos } from '../../hooks/useChainInfos';
import { useDefaultTokenLogo } from '../../hooks/utility/useDefaultTokenLogo';

import { addToConnections } from '../ApproveConnection/utils';
import { Colors } from '../../theme/colors';

import { ChildrenParams, Footer, FooterAction, Heading, SubHeading, SuggestContainer } from './components';
import { chainTagsStore } from '../../context/chain-infos-store';

const SuggestChain = observer(({ handleRejectBtnClick }: ChildrenParams) => {
  const navigation = useNavigation<any>();

  const chainInfos = useChainInfos();
  const setChainInfos = useSetChainInfos();
  const customChains = useCustomChains();

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  const [newChain, setNewChain] = useState<any | null>(null);
  const siteName = newChain?.origin?.replace?.('https://', '') ?? '';

  const updateKeyStore = useUpdateKeyStore();
  const { activeWallet, setActiveWallet } = useActiveWallet();
  const [showMore, setShowMore] = useState(false);

  const originRef = useRef<string | undefined>(undefined);
  const setActiveChain = useSetActiveChain();
  const defaultTokenLogo = useDefaultTokenLogo();
  const [logoUri, setLogoUri] = useState<string | undefined>(defaultTokenLogo);

  const chainRegistryPath = useMemo(() => {
    if (!newChain?.chainInfo) return null;
    return (
      customChains.find((c) => c.chainId === newChain.chainInfo.chainId)?.chainRegistryPath ??
      newChain.chainInfo.chainRegistryPath ??
      null
    );
  }, [customChains, newChain]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(NEW_CHAIN_REQUEST);
      if (!raw) return;
      const payload = JSON.parse(raw); // expecting the same structure as web
      setNewChain(payload);
      originRef.current = payload?.origin;

      const pathFromPayload =
        customChains.find((c) => c.chainId === payload?.chainInfo?.chainId)?.chainRegistryPath ??
        payload?.chainInfo?.chainRegistryPath;

      if (pathFromPayload && payload?.chainInfo) {
        setChainInfos({ ...chainInfos, [pathFromPayload]: payload.chainInfo });
      }

      setLogoUri(payload?.chainInfo?.chainSymbolImageUrl ?? defaultTokenLogo);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBetaChainTags = useCallback(async () => {
    const info = newChain?.chainInfo;
    if (!info) return;
    if (info.chainId) await chainTagsStore.setBetaChainTags(info.chainId, ['Cosmos']);
    if (info.testnetChainId) await chainTagsStore.setBetaChainTags(info.testnetChainId, ['Cosmos']);
    if (info.evmChainId) await chainTagsStore.setBetaChainTags(info.evmChainId, ['Cosmos']);
    if (info.evmChainIdTestnet) await chainTagsStore.setBetaChainTags(info.evmChainIdTestnet, ['Cosmos']);
  }, [newChain]);

  const approveNewChain = useCallback(async () => {
    if (!newChain?.chainInfo || !chainRegistryPath) return;
    await sleep(200);
    setIsLoading(true);
    setErr('');

    try {
      const updatedKeystore = await updateKeyStore(
        activeWallet as WalletKey,
        chainRegistryPath as unknown as SupportedChain,
        'UPDATE',
        newChain.chainInfo,
      );

      // merge into BETA_CHAINS
      const stored = await AsyncStorage.getItem(BETA_CHAINS);
      const betaChains = stored ? JSON.parse(stored) : {};
      const newBetaChains = { ...betaChains, [chainRegistryPath]: newChain.chainInfo };
      await AsyncStorage.setItem(BETA_CHAINS, JSON.stringify(newBetaChains));

      await addBetaChainTags();

      if (activeWallet) {
        await addToConnections([newChain.chainInfo.chainId], [activeWallet.id], originRef.current ?? '');
        await setActiveWallet(updatedKeystore[activeWallet.id] as WalletKey);
      }

      await setActiveChain(chainRegistryPath);

      await AsyncStorage.setItem(BG_RESPONSE, JSON.stringify({ data: 'Approved', success: 'Chain enabled' }));

      setTimeout(async () => {
        await AsyncStorage.removeItem(BG_RESPONSE);
        setIsLoading(false);

        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('Home');
      }, 100);
    } catch (e) {
      setErr('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  }, [
    activeWallet,
    addBetaChainTags,
    chainRegistryPath,
    navigation,
    newChain,
    setActiveChain,
    setActiveWallet,
    updateKeyStore,
  ]);

  usePerformanceMonitor({
    page: 'suggest-chain',
    queryStatus: newChain ? 'loading' : 'success',
    op: 'suggestedChainLoad',
    description: 'loading state on suggested chain approval',
  });

  return (
    <>
      <View style={styles.centerCol}>
        <Heading text="Add Network" />
        <SubHeading text="This will allow this network to be used within Leap Wallet." />

        <GenericCard
          title={
            <View>
              <TextRN numberOfLines={1} style={styles.cardTitle}>
                {newChain?.chainInfo?.chainName ?? ''}
              </TextRN>
            </View>
          }
          subtitle={siteName}
          style={styles.card}
          img={
            <Image
              source={{ uri: logoUri }}
              onError={() => setLogoUri(defaultTokenLogo)}
              style={styles.logo}
            />
          }
          size="sm"
          isRounded
        />

        <View style={styles.infoBox}>
          <Key>Network Name</Key>
          <Value>{newChain?.chainInfo?.chainName ?? ''}</Value>
          {Divider}

          <Key>Network URL</Key>
          <Value>{newChain?.chainInfo?.apis?.rest || newChain?.chainInfo?.apis?.restTest || ''}</Value>
          {Divider}

          <Key>Chain ID</Key>
          <Value>{newChain?.chainInfo?.chainId ?? ''}</Value>
          {Divider}

          <Key>Currency Symbol</Key>
          <Value>{newChain?.chainInfo?.denom ?? ''}</Value>

          {showMore && (
            <>
              {Divider}
              <Key>Coin Type</Key>
              <Value>{newChain?.chainInfo?.bip44?.coinType ?? ''}</Value>
              {Divider}
              <Key>Address Prefix</Key>
              <Value>{newChain?.chainInfo?.addressPrefix ?? ''}</Value>
              {Divider}
              <Key>Chain Registry Path</Key>
              <Value>{newChain?.chainInfo?.chainRegistryPath ?? ''}</Value>
            </>
          )}

          <Pressable onPress={() => setShowMore((v) => !v)}>
            <TextRN style={styles.showMoreText}>{showMore ? 'Show less' : 'Show more'}</TextRN>
          </Pressable>
        </View>
      </View>

      <Footer error={err}>
        <FooterAction
          rejectBtnClick={handleRejectBtnClick}
          rejectBtnText="Reject"
          confirmBtnText={isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
          confirmBtnClick={approveNewChain}
          isConfirmBtnDisabled={isLoading}
        />
      </Footer>
    </>
  );
});

export default function SuggestChainWrapper() {
  return (
    <SuggestContainer suggestKey={NEW_CHAIN_REQUEST}>
      {({ handleRejectBtnClick }) => (
        <SuggestChain handleRejectBtnClick={handleRejectBtnClick} />
      )}
    </SuggestContainer>
  );
}

const styles = StyleSheet.create({
  centerCol: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  card: {
    paddingVertical: 8, // py-8
    marginVertical: 20, // my-5
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  logo: {
    height: 40,
    width: 40,
    marginRight: 12,
    borderRadius: 8,
  },
  infoBox: {
    width: '100%',
    backgroundColor: Colors.white100, // add dark-mode swap if needed
    borderRadius: 16,
    padding: 16,
    rowGap: 10 as any,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#726FDC',
    height: 20,
    marginTop: 4,
  },
});
