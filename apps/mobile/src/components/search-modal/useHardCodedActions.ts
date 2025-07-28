import { sliceAddress, useAddress, useChainInfo, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks';
import { useActiveChain } from '../../hooks/settings/useActiveChain';
import { AggregatedSupportedChain } from '../../types/utility';
import { useAuth } from '../../context/auth-context';
import { useProviderFeatureFlags } from '../../screens/swaps-v2/hooks';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import mixpanel from 'mixpanel-browser'; // or omit if not used
import { captureException } from '@sentry/react-native';
import { earnFeatureShowStore } from '../../context/earn-feature-show';
import { AGGREGATED_CHAIN_KEY, LEAPBOARD_URL } from '../../services/config/constants';
import { PageName, EventName, ButtonName, ButtonType } from '../../services/config/analytics';

export function useHardCodedActions() {
  const navigation = useNavigation();
  const auth = useAuth();
  const { data: featureFlags } = useFeatureFlags();
  const { isEvmSwapEnabled } = useProviderFeatureFlags();

  const address = useAddress();
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const activeChainInfo = useChainInfo();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleBuyClick = () => {
    navigation.navigate('Buy', { pageSource: PageName.Home });

    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonName: ButtonName.ONRAMP_TOKEN_SELECTION,
        buttonType: ButtonType.ONRAMP,
      });
    } catch (error) {
      captureException(error);
    }
  };

  const handleSwapClick = (_redirectUrl?: string, navigateUrl?: string) => {
    if (featureFlags?.all_chains?.swap === 'redirect') {
      const fallbackUrl = activeChainInfo?.chainId
        ? `https://swapfast.app/?sourceChainId=${activeChainInfo.chainId}`
        : 'https://swapfast.app';
      Linking.openURL(_redirectUrl ?? fallbackUrl);
    } else {
      navigation.navigate(navigateUrl ?? 'Swap');
    }
  };

  const handleNftsClick = (_redirectUrl?: string) => {
    if (featureFlags?.nfts?.extension === 'redirect') {
      Linking.openURL(_redirectUrl ?? `${LEAPBOARD_URL}/portfolio/nfts`);
    } else {
      navigation.navigate('NFTs');
    }
  };

  const handleVoteClick = (_redirectUrl?: string) => {
    if (featureFlags?.gov?.extension === 'redirect') {
      Linking.openURL(_redirectUrl ?? `${LEAPBOARD_URL}/portfolio/gov`);
    } else {
      navigation.navigate('Gov');
    }
  };

  const handleBridgeClick = (navigateUrl?: string) => {
    let redirectURL = '';

    if (
      featureFlags?.all_chains?.swap === 'redirect' ||
      !isEvmSwapEnabled ||
      ['mainCoreum', 'coreum'].includes(activeChainInfo?.key)
    ) {
      const baseUrl = 'https://swapfast.app/bridge';
      redirectURL = `${baseUrl}?destinationChainId=${activeChainInfo?.chainId}`;

      if (['mainCoreum', 'coreum'].includes(activeChainInfo?.key)) {
        redirectURL = 'https://sologenic.org/bridge/coreum-bridge';
      } else if (activeChainInfo?.key === 'mantra') {
        redirectURL = 'https://mantra.swapfast.app';
      } else if (activeChain === AGGREGATED_CHAIN_KEY) {
        redirectURL = baseUrl;
      }

      Linking.openURL(redirectURL);
    } else {
      navigation.navigate(navigateUrl ?? 'Swap');
    }

    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonType: ButtonType.HOME,
        buttonName: ButtonName.BRIDGE,
        redirectURL,
        time: Date.now() / 1000,
      });
    } catch (e) {
      captureException(e);
    }
  };

  const onSendClick = (_redirectUrl?: string) => {
    if (featureFlags?.ibc?.extension === 'redirect') {
      const fallbackUrl = activeChainInfo?.chainId
        ? `${LEAPBOARD_URL}/transact/send?sourceChainId=${activeChainInfo.chainId}`
        : `${LEAPBOARD_URL}/transact/send`;
      Linking.openURL(_redirectUrl ?? fallbackUrl);
    } else {
      navigation.navigate('Send');
    }
  };

  const handleNobleEarnClick = () => {
    if (earnFeatureShowStore.show !== 'false') {
      navigation.navigate('Home', { openEarnUSDN: true });
    } else {
      navigation.navigate('EarnUSDN');
    }
  };

  const handleConnectLedgerClick = () => {
    navigation.navigate('OnboardingImport', { walletName: 'ledger' });
  };

  const handleCopyAddressClick = () => {
    Clipboard.setString(address);
    setAlertMessage(`Address Copied (${sliceAddress(address)})`);
    setShowAlert(true);
  };

  const handleLockWalletClick = () => {
    auth?.signout?.(); // Update depending on your RN auth context
  };

  return {
    handleBuyClick,
    handleSwapClick,
    handleConnectLedgerClick,
    showAlert,
    setShowAlert,
    handleCopyAddressClick,
    alertMessage,
    setAlertMessage,
    handleLockWalletClick,
    handleNftsClick,
    handleVoteClick,
    onSendClick,
    handleBridgeClick,
    handleNobleEarnClick,
  };
}
