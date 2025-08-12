import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';

import { Key as WalletKey, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { RootStore } from '@leapwallet/cosmos-wallet-store';
import { GenericCard } from '@leapwallet/leap-ui';

import { Divider, Key, Value } from '../../components/dapp';
import { LoaderAnimation } from '../../components/loader/Loader';

import { BETA_CHAINS, BG_RESPONSE, NEW_CHAIN_REQUEST } from '../../services/config/storage-keys';
import { useDefaultTokenLogo } from '../../hooks';
import { useSetActiveChain } from '../../hooks/settings/useActiveChain';
import useActiveWallet, { useUpdateKeyStore } from '../../hooks/settings/useActiveWallet';

import { addToConnections } from '../ApproveConnection/utils';

import { chainTagsStore } from '../../context/chain-infos-store';
import { rootStore } from '../../context/root-store';
import { Colors } from '../../theme/colors';

import { ChildrenParams, Footer, FooterAction, Heading, SubHeading, SuggestContainer } from './components';

type SuggestEthereumChainProps = ChildrenParams & {
  rootStore: RootStore;
};

const SuggestEthereumChain = observer(({ handleRejectBtnClick }: SuggestEthereumChainProps) => {
  const navigation = useNavigation<any>();

  const [chainInfo, setChainInfo] = useState<ChainInfo | undefined>(undefined);
  const [origin, setOrigin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  const defaultTokenLogo = useDefaultTokenLogo();
  const updateKeyStore = useUpdateKeyStore();
  const { activeWallet, setActiveWallet } = useActiveWallet();
  const setActiveChain = useSetActiveChain();
  const { setChains, chains } = useChainsStore();

  const siteName = useMemo(() => origin.replace('https://', ''), [origin]);
  const chainKey = useMemo(() => chainInfo?.key || chainInfo?.chainName || '', [chainInfo]);

  const [logoUri, setLogoUri] = useState<string | undefined>(undefined);
  useEffect(() => setLogoUri(chainInfo?.chainSymbolImageUrl ?? defaultTokenLogo), [chainInfo?.chainSymbolImageUrl, defaultTokenLogo]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NEW_CHAIN_REQUEST);
        if (!raw) return;
        // Expecting { msg: { chainInfo, origin } }
        const parsed = JSON.parse(raw);
        const info: ChainInfo | undefined = parsed?.msg?.chainInfo;
        const siteOrigin: string = parsed?.msg?.origin ?? '';
        setChainInfo(info);
        setOrigin(siteOrigin);
      } catch {
        // ignore parse errors
      }
    })();
  }, []);

  const addBetaChainTags = useCallback(async () => {
    if (chainInfo?.chainId) await chainTagsStore.setBetaChainTags(chainInfo.chainId, ['EVM']);
    if (chainInfo?.testnetChainId) await chainTagsStore.setBetaChainTags(chainInfo.testnetChainId, ['EVM']);
    if (chainInfo?.evmChainId) await chainTagsStore.setBetaChainTags(chainInfo.evmChainId, ['EVM']);
    if (chainInfo?.evmChainIdTestnet) await chainTagsStore.setBetaChainTags(chainInfo.evmChainIdTestnet, ['EVM']);
  }, [chainInfo]);

  const handleConfirmClick = useCallback(async () => {
    setIsLoading(true);
    setErr('');

    try {
      const updatedKeystore = await updateKeyStore(
        activeWallet as WalletKey,
        chainKey as SupportedChain,
        'UPDATE',
        chainInfo,
      );

      // Read/merge BETA_CHAINS
      const raw = await AsyncStorage.getItem(BETA_CHAINS);
      const betaChains = raw ? JSON.parse(raw) : {};
      const newBetaChains = { ...betaChains, [chainKey]: chainInfo };
      await AsyncStorage.setItem(BETA_CHAINS, JSON.stringify(newBetaChains));

      await addBetaChainTags();
      await setActiveChain(chainKey as SupportedChain, chainInfo);

      if (activeWallet) {
        await addToConnections([chainInfo?.evmChainId || ''], [activeWallet.id], origin ?? '');
        await setActiveWallet(updatedKeystore[activeWallet.id] as WalletKey);
      }

      const updatedChains = { ...chains, [chainKey]: chainInfo };
      setChains(updatedChains);
      rootStore.setChains(updatedChains);
      rootStore.reloadAddresses();

      await AsyncStorage.setItem(BG_RESPONSE, JSON.stringify({ data: 'Approved' }));
      await AsyncStorage.removeItem(NEW_CHAIN_REQUEST);
      await AsyncStorage.removeItem(BG_RESPONSE);

      // Close screen
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('Home');

      setIsLoading(false);
    } catch (_) {
      setErr('Failed to add network');
      setIsLoading(false);
    }
  }, [
    activeWallet,
    addBetaChainTags,
    chainInfo,
    chainKey,
    chains,
    navigation,
    origin,
    setActiveChain,
    setActiveWallet,
    setChains,
    updateKeyStore,
  ]);

  return (
    <>
      <View style={styles.centerCol}>
        <Heading text="Add Network" />
        <SubHeading text="This will allow this network to be used within Leap Wallet." />

        <GenericCard
          title={<View><TextRN numberOfLines={1} style={styles.cardTitle}>{chainInfo?.chainName ?? ''}</TextRN></View>}
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
          <Value>{chainInfo?.chainName ?? ''}</Value>
          {Divider}

          <Key>Network URL</Key>
          <Value>{chainInfo?.apis?.evmJsonRpc || chainInfo?.apis?.evmJsonRpcTest || ''}</Value>
          {Divider}

          <Key>Chain ID</Key>
          <Value>{chainInfo?.evmChainId ?? ''}</Value>
          {Divider}

          <Key>Currency Symbol</Key>
          <Value>{chainInfo?.denom ?? ''}</Value>
        </View>
      </View>

      <Footer error={err}>
        <FooterAction
          rejectBtnClick={handleRejectBtnClick}
          rejectBtnText="Reject"
          confirmBtnText={isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
          confirmBtnClick={handleConfirmClick}
          isConfirmBtnDisabled={isLoading}
        />
      </Footer>
    </>
  );
});

export default function SuggestEthereumChainWrapper() {
  return (
    <SuggestContainer suggestKey={NEW_CHAIN_REQUEST}>
      {({ handleRejectBtnClick }) => (
        <SuggestEthereumChain
          handleRejectBtnClick={handleRejectBtnClick}
          rootStore={rootStore}
        />
      )}
    </SuggestContainer>
  );
}

// --- local RN Text import (since we used a raw <TextRN> in the GenericCard title) ---
import { Text as TextRN } from 'react-native';

const styles = StyleSheet.create({
  centerCol: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  card: {
    paddingVertical: 8, // was py-8; adjust as needed
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
    backgroundColor: Colors.white100, // theme this for dark mode
    borderRadius: 16,
    padding: 16,
    rowGap: 10 as any,
  },
});
