// src/screens/.../SuggestErc20.tsx (React Native)

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';

import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { LoaderAnimation } from '../../components/loader/Loader';
import TokenImageWithFallback from '../../components/token-image-with-fallback';

import { BG_RESPONSE, SUGGEST_TOKEN } from '../../services/config/storage-keys';

import { betaERC20DenomsStore, enabledCW20DenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';
import { Colors } from '../../theme/colors';

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

// ---- small helpers for JSON storage ----
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

const SuggestErc20 = observer(({ handleRejectBtnClick }: ChildrenParams) => {
  const navigation = useNavigation<any>();
  const _activeChain = useActiveChain();
  const [isLoading, setIsLoading] = useState(false);
  const [activeChain, setActiveChain] = useState<SupportedChain>(_activeChain);
  const [contractInfo, setContractInfo] = useState({
    address: '',
    symbol: '',
    image: '',
    decimals: 0,
    coinGeckoId: '',
  });

  const enabledCW20Tokens = enabledCW20DenomsStore.getEnabledCW20DenomsForChain(activeChain);

  useEffect(() => {
    (async () => {
      const payload = await getJSON<any>(SUGGEST_TOKEN, null);
      if (payload?.params?.options) {
        setContractInfo({ ...payload.params.options });
      }
      if (payload?.activeChain) {
        setActiveChain(payload.activeChain);
      }
    })();
  }, []);

  const handleApproveBtn = async () => {
    setIsLoading(true);

    try {
      const erc20Token = {
        coinDenom: contractInfo.symbol,
        coinMinimalDenom: contractInfo.address,
        coinDecimals: contractInfo.decimals,
        coinGeckoId: contractInfo.coinGeckoId ?? '',
        icon: contractInfo.image ?? '',
        chain: activeChain,
      };

      await betaERC20DenomsStore.setBetaERC20Denoms(contractInfo.address, erc20Token, activeChain);
      const _enabledCW20Tokens = [...enabledCW20Tokens, contractInfo.address];
      await enabledCW20DenomsStore.setEnabledCW20Denoms(_enabledCW20Tokens, activeChain);
      rootBalanceStore.refetchBalances(activeChain);

      await setJSON(BG_RESPONSE, { data: 'Approved' });

      setTimeout(async () => {
        await AsyncStorage.removeItem(SUGGEST_TOKEN);
        await AsyncStorage.removeItem(BG_RESPONSE);
        setIsLoading(false);

        // No window.close in RN; go back or to Home
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('Home');
      }, 50);
    } catch (e) {
      // If you want, we can surface errors via a toast/snackbar here.
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={styles.centerCol}>
        <Heading text="Add Token" />
        <SubHeading text="This will allow this token to be viewed within Leap Wallet" />

        <TokenContractAddress
          address={contractInfo.address}
          img={
            <TokenImageWithFallback
              assetImg={contractInfo.image}
              text={contractInfo.symbol}
              altText={contractInfo.symbol + ' logo'}
              imageStyle={{width: 36, height: 36, borderRadius: 18}}
              containerStyle={{width: 36, height: 36, borderRadius: 18, marginRight: 8}}
              textStyle={{fontSize: 10}}
            />
          }
        />

        <TokenContractInfo
          name={contractInfo.symbol}
          symbol={contractInfo.symbol}
          decimals={contractInfo.decimals}
        />
      </View>

      <Footer>
        <FooterAction
          rejectBtnClick={handleRejectBtnClick}
          rejectBtnText="Reject"
          confirmBtnText={isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
          confirmBtnClick={handleApproveBtn}
          isConfirmBtnDisabled={isLoading}
        />
      </Footer>
    </>
  );
});

export default function SuggestErc20Wrapper() {
  return (
    <SuggestContainer suggestKey={SUGGEST_TOKEN}>
      {({ handleRejectBtnClick }) => <SuggestErc20 handleRejectBtnClick={handleRejectBtnClick} />}
    </SuggestContainer>
  );
}

const styles = StyleSheet.create({
  centerCol: {
    alignItems: 'center',
    flexDirection: 'column',
  },
});
