import React, { useCallback, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import HCaptcha from '@hcaptcha/react-native-hcaptcha';
import { RecaptchaRef } from 'react-native-recaptcha-that-works';
import Recaptcha from '../../components/re-captcha/Recaptcha';
import { Faucet, useActiveChain, useAddress, useChainInfo, useGetFaucet } from '@leapwallet/cosmos-wallet-hooks';
import { getBlockChainFromAddress } from '@leapwallet/cosmos-wallet-sdk';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useSelectedNetwork } from '../../hooks/settings/useNetwork';
import { useQueryParams } from '../../hooks/useQuery';
// import { rootBalanceStore } from '../../context/root-store'; // Provide your actual implementation
import { getChainColor } from '../../theme/colors';
import CustomText from '../../components/text'; // replace with your Text component
// import CssLoader from '../../components/css-loader/CssLoader'; // replace or use ActivityIndicator
import { RECAPTCHA_CHAINS } from '../../services/config/config';
import { rootBalanceStore } from '../../context/root-store';

dayjs.extend(utc);

export default function RequestFaucet() {
  const chain = useChainInfo();
  const activeChain = useActiveChain();
  const selectedNetwork = useSelectedNetwork();
  const hCaptchaRef = useRef<any>(null);
  const reCaptchaRef = useRef<RecaptchaRef>(null);
  const address = useAddress();
  const query = useQueryParams();

  const invalidateBalances = useCallback(() => {
    rootBalanceStore.refetchBalances(activeChain, selectedNetwork);
  }, [activeChain, selectedNetwork]);

  let faucetDetails: Faucet = useGetFaucet(chain?.testnetChainId ?? chain?.chainId ?? '');

  faucetDetails = RECAPTCHA_CHAINS.includes(activeChain)
    ? {
        title: 'Pryzm Testnet Faucet',
        description: 'Claim Pryzm testnet tokens directly from Leap Wallet',
        url: 'https://testnet-pryzmatics.pryzm.zone/pryzmatics/faucet/claim',
        network: 'testnet',
        security: {
          type: 'recaptcha',
          key: process.env.PRYZM_RECAPTCHA_KEY ?? '',
        },
        method: 'GET',
        payloadResolution: {
          address: '${walletAddress}',
          recaptcha_response: '${captchaKey}',
        },
      }
    : faucetDetails;

  const {
    data: faucetResponse,
    mutate: requestTokens,
    isLoading,
  } = useMutation(
    async (args: Record<string, string>) => {
      const { method } = faucetDetails;
      let payload: Record<string, any> = {};
      if (faucetDetails.payloadResolution) {
        payload = Object.entries(faucetDetails.payloadResolution).reduce((acc, val) => {
          let resolve;
          switch (val[1]) {
            case '${walletAddress}':
              resolve = address;
              break;
            case '${captchaKey}':
              resolve = args['captchaKey'];
              break;
            default:
              resolve = val[1];
              break;
          }
          return { ...acc, [val[0]]: resolve };
        }, {});
      }
      if (method === 'POST') {
        return fetch(faucetDetails.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        const url = new URL(faucetDetails.url);
        Object.keys(args).forEach((field: string) => url.searchParams.set(field, encodeURIComponent(args[field])));
        return fetch(url.toString());
      }
    },
    { cacheTime: 0 }
  );

  const setShowFaucetResp = useCallback((data: { msg: string; status: 'success' | 'fail' | null }) => {
    if (!data.status) {
      query.remove('faucet-success');
      query.remove('faucet-error');
      return;
    }
    query.set(data.status === 'success' ? 'faucet-success' : 'faucet-error', data.msg);
  });

  const handleSubmit = async () => {
    try {
      if (getBlockChainFromAddress(address) === 'sei') {
        // RN: Linking.openURL
        import('react-native').then(({ Linking }) => Linking.openURL('https://atlantic-2.app.sei.io/faucet'));
        return;
      }

      if (RECAPTCHA_CHAINS.includes(activeChain)) {
        reCaptchaRef.current?.open();
        return;
      }

      const result = await hCaptchaRef.current?.show(); // library-specific, may be .show() or .open()
      if (!result) {
        throw new Error('could not get hCaptcha response');
      }

      requestTokens({
        address,
        captchaKey: result, // adjust if the library returns { response }
      });
    } catch (error) {
      setShowFaucetResp({
        status: 'fail',
        msg: 'Failed to verify captcha. Please try again.',
      });
    }
  };

  const handleRecaptchaVerify = (token: string) => {
    requestTokens({
      address,
      recaptcha_response: token,
    });
  };

  useEffect(() => {
    const fn = async () => {
      if (faucetResponse?.ok || faucetResponse?.status) {
        let data: Record<string, unknown> | null = {};
        try {
          data = await faucetResponse.json();
        } catch (e) {
          setShowFaucetResp({
            status: 'fail',
            msg: 'Something went wrong. Please try again.',
          });
        }
        if (faucetResponse.status === 200 && data?.status !== 'fail') {
          // invalidateBalances(); // implement as needed
          setShowFaucetResp({
            status: 'success',
            msg: 'Your wallet will receive the tokens shortly',
          });
        } else {
          setShowFaucetResp({
            status: 'fail',
            msg: (data?.message ?? data?.error) as string,
          });
        }
      }
    };
    fn();
  }, [faucetResponse, setShowFaucetResp]);

  if (!faucetDetails) return null;

  return (
    <View>
      {/* Invisible captchas */}
      <HCaptcha
        ref={hCaptchaRef}
        siteKey={faucetDetails?.security?.key ?? ''}
        size="invisible"
        theme="dark"
      />

      <Recaptcha
        ref={reCaptchaRef}
        siteKey={faucetDetails?.security?.key ?? ''}
        baseUrl={'https://your-app-base-url.com'} // required for recaptcha-that-works
        size="invisible"
        theme="dark"
        onVerify={handleRecaptchaVerify}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: chain?.theme?.gradient || '#3381FF' },
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {/* Chain logo as background */}
        <Image
          source={{ uri: chain?.chainSymbolImageUrl }}
          style={styles.bgLogo}
          resizeMode="contain"
          blurRadius={2}
        />
        {isLoading ? (
          <View style={styles.loaderRow}>
            <View
              style={[
                styles.loaderCircle,
                { backgroundColor: getChainColor(activeChain) },
              ]}
            >
              <ActivityIndicator color="#fff" size="small" />
            </View>
            <CustomText size="sm" style={styles.claimText}>
              Claim in progress
            </CustomText>
          </View>
        ) : (
          <View style={styles.contentRow}>
            <Image
              source={{ uri: chain?.chainSymbolImageUrl }}
              style={[
                styles.chainIcon,
                { borderColor: getChainColor(activeChain) },
              ]}
            />
            <View>
              <CustomText size="sm" style={styles.titleText}>
                {faucetDetails?.title}
              </CustomText>
              <CustomText size="xs" style={styles.descText}>
                {faucetDetails?.description}
              </CustomText>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    width: 344,
    marginVertical: 12,
    padding: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  bgLogo: {
    position: 'absolute',
    right: 0,
    opacity: 0.2,
    height: '100%',
    width: 80,
    zIndex: 0,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loaderCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimText: {
    fontWeight: 'bold',
    color: '#111',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 3,
  },
  titleText: {
    fontWeight: 'bold',
    color: '#222',
  },
  descText: {
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
    textAlign: 'left',
  },
});
