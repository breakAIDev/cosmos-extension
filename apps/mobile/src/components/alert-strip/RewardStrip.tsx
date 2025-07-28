import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Text from '../../components/text';
import { useAddress } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import LottieView from 'lottie-react-native';
import ArrowRight from 'react-native-vector-icons/Feather';
import CheckCircle from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { Images } from '../../../assets/images';
import loadingAnimation from '../../../assets/lottie-files/swaps-btn-loading.json'; // adjust path if needed
import axios from 'axios';
import { captureException } from '@sentry/react-native'; // or omit
import { observer } from 'mobx-react-lite';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { useQueryParams } from '../../hooks/useQuery';
import { activeChainStore } from '../../context/active-chain-store';
import { chainInfoStore } from '../../context/chain-infos-store';
import { rootBalanceStore } from '../../context/root-store';

// You'd need to replace hCaptcha with a real React Native solution (e.g. WebView hack, or alternative)
const HCaptcha = React.forwardRef((_props, ref) => null);

const faucetsURL = `${process.env.LEAP_WALLET_BACKEND_API_URL}/faucets`;
const showFaucetsForChain: string[] = [];

type Faucet = {
  faucet_id: number;
  faucet_name: string;
  chain_id: string;
  funds_wallet_address: string;
  secret_key_name: string;
  frequency: string;
  status: string;
  amount: number;
  gas_price: string;
  endpoint_url: string;
  denom: string;
};

type EligibilityData = {
  eligible: boolean;
  code: 'ELIGIBLE' | 'ALREADY_CLAIMED' | 'CAPACITY_FULL' | 'IP_LIMIT_REACHED' | 'PENDING_CLAIM_EXISTS';
};

const MAX_TRIES = 20;

const RewardStrip = observer(() => {
  const activeChain = activeChainStore.activeChain;
  const chainInfos = chainInfoStore.chainInfos;
  const { activeWallet } = useActiveWallet();
  const activeChainAddress = useAddress();
  const navigation = useNavigation();
  const query = useQueryParams();
  const activeWalletId = activeWallet?.id;
  const chain = chainInfos[activeChain as SupportedChain];
  const faucetSupported = showFaucetsForChain.includes(chain?.chainId ?? '');

  // hCaptcha stub (see notes above)
  const hCaptchaRef = useRef<any>(null);

  const [faucet, setFaucet] = useState<Faucet>();
  const [eligibility, setEligibility] = useState<EligibilityData>({
    eligible: false,
    code: 'ALREADY_CLAIMED',
  });
  const [successClaim, setSuccessClaim] = useState(false);

  const faucetInactive = useMemo(() => faucet?.status === 'inactive', [faucet?.status]);

  const checkEligibility = useCallback(async () => {
    if (!faucetInactive) {
      try {
        const { data } = await axios.post(`${faucetsURL}/eligibility`, {
          wallet: activeWalletId,
          wallet_address: activeChainAddress,
          faucet_id: faucet?.faucet_id,
        });
        setEligibility({
          eligible: data.eligible,
          code: data.code,
        });
      } catch (error: any) {
        captureException(error);
      }
    }
  }, [activeChainAddress, activeWalletId, faucet?.faucet_id, faucetInactive]);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get(faucetsURL);
      setFaucet(data.data.find((item: any) => item.chain_id === chain?.chainId && item.status !== 'upcoming'));
    } catch (error: any) {
      captureException(error);
    }
  }, [chain?.chainId]);

  const checkClaimStatus = useCallback(async (claimId: string) => {
    try {
      const response = await axios.get(`${faucetsURL}/claim/${claimId}/status`);
      return response;
    } catch (error) {
      captureException(error);
    }
  }, []);

  const claimRewards = useCallback(
    async (_captcha_token: string) => {
      try {
        const response = await axios.post(`${faucetsURL}/v2/claim`, {
          wallet: activeWalletId,
          wallet_address: activeChainAddress,
          faucet_id: faucet?.faucet_id,
          captcha_token: 'dummy', // Replace with real token if using WebView-based hCaptcha
        });
        if (response.status === 200) {
          setEligibility({
            eligible: false,
            code: 'PENDING_CLAIM_EXISTS',
          });
          let retries = 0;
          const poll = setInterval(async () => {
            retries++;
            const res: any = await checkClaimStatus(response.data.claimId);
            if (retries === MAX_TRIES || res.data?.status === 'success') {
              clearInterval(poll);
            }
            if (res.data?.status === 'success') {
              setEligibility({
                eligible: false,
                code: 'ALREADY_CLAIMED',
              });
              setSuccessClaim(true);
              setTimeout(() => setSuccessClaim(false), 3000);
              setTimeout(() => rootBalanceStore.refetchBalances(), 3000);
            }
          }, 2000);
        }
      } catch (error) {
        captureException(error);
      }
    },
    [activeChainAddress, activeWalletId, checkClaimStatus, faucet?.faucet_id],
  );

  const handleSubmit = useCallback(async () => {
    if (eligibility.code === 'CAPACITY_FULL') {
      query.set('faucet-error', 'Experiencing high traffic. Please try after few minutes.');
      return;
    }
    if (eligibility.code === 'IP_LIMIT_REACHED') {
      query.set('faucet-error', 'You have reached the maximum limit to claim tokens.');
      return;
    }
    if (eligibility.eligible && !faucetInactive) {
      try {
        // This is a stub. Use a real hCaptcha RN solution in production!
        claimRewards('dummy-captcha-token');
      } catch (error) {
        captureException(error);
      }
    }
  }, [claimRewards, eligibility.code, eligibility.eligible, faucetInactive, query]);

  useEffect(() => {
    if (faucetSupported) {
      fetchData();
    }
  }, [faucetSupported, fetchData]);

  useEffect(() => {
    if (faucet?.chain_id) {
      checkEligibility();
    }
  }, [faucet?.chain_id, activeChainAddress, checkEligibility]);

  const titleText = useMemo(() => {
    if (faucetInactive) {
      return (
        <>
          Are you ready for more Mantra missions?{'\n'}Stay tuned...
        </>
      );
    }
    if (eligibility.code !== 'ALREADY_CLAIMED' || successClaim) {
      return 'Claim OMLY & start your Mantra missions.';
    } else {
      return (
        <>
          You’ve claimed your exclusive OMLY tokens.{'\n'}Stay tuned for more!
        </>
      );
    }
  }, [eligibility.code, faucetInactive, successClaim]);

  if (!faucetSupported || !faucet) return null;

  return (
    <>
      <TouchableOpacity onPress={handleSubmit} style={styles.stripContainer}>
        <Image
          source={Images.Banners.faucet}
          style={styles.faucetBanner}
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text size="xs" style={styles.titleText}>
            {titleText}
          </Text>
          {!faucetInactive && (eligibility.code !== 'ALREADY_CLAIMED' || successClaim) && (
            <View
              style={[
                styles.claimBox,
                eligibility.code === 'PENDING_CLAIM_EXISTS'
                  ? { backgroundColor: '#f59e42' }
                  : successClaim
                  ? { backgroundColor: '#10B981' }
                  : { backgroundColor: '#fff' },
              ]}
            >
              <Text
                size="xs"
                style={[
                  styles.claimText,
                  (eligibility.code === 'PENDING_CLAIM_EXISTS' || successClaim)
                    ? { color: '#fff' }
                    : { color: '#18181b' },
                ]}
              >
                {eligibility.code === 'PENDING_CLAIM_EXISTS'
                  ? 'Claiming'
                  : successClaim
                  ? '0.88 OMLY claimed'
                  : 'Claim 0.88 OMLY'}
              </Text>
              {eligibility.code === 'PENDING_CLAIM_EXISTS' ? (
                <LottieView
                  loop
                  autoPlay
                  source={loadingAnimation}
                  style={styles.lottie}
                />
              ) : (
                successClaim ? (
                  <CheckCircle name="check-circle" size={20} color="#18181b" />
                ) : (
                  <ArrowRight name="arrow-right" size={20} color="#18181b" />
                )
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
      {/* HCaptcha stub: in production, implement WebView for hCaptcha */}
    </>
  );
});

export default RewardStrip;

const styles = StyleSheet.create({
  stripContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 12,
  },
  faucetBanner: {
    width: '100%',
    height: 64,
    borderRadius: 12,
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    height: 64,
    width: 288,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 4,
  },
  titleText: {
    fontWeight: 'bold',
    color: '#27272a',
  },
  claimBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
    width: '66%',
    justifyContent: 'space-between',
  },
  claimText: {
    fontWeight: 'bold',
  },
  lottie: {
    height: 16,
    width: 16,
  },
});
