
import {
  SelectedNetwork,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useConsensusValidators,
  useFeatureFlags,
  useLiquidStakingProviders,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators';
import {
  AggregatedSupportedChainType,
  ChainTagsStore,
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store';
import BigNumber from 'bignumber.js';
import { EmptyCard } from 'components/empty-card';
import { AGGREGATED_CHAIN_KEY } from 'config/constants';
import { decodeChainIdToChain } from 'extension-scripts/utils';
import { useChainPageInfo, useWalletInfo } from 'hooks';
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor';
import { useSetActiveChain } from 'hooks/settings/useActiveChain';
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain';
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses';
import useQuery from 'hooks/useQuery';
import { Images } from 'images';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nmsStore } from 'stores/balance-store';
import { manageChainsStore } from 'stores/manage-chains-store';

import ClaimInfo from './components/ClaimInfo';
import NotStakedCard from './components/NotStakedCard';
import ReviewClaimAndStakeTx from './components/ReviewClaimAndStakeTx';
import ReviewClaimTx from './components/ReviewClaimTx';
import SelectLSProvider from './components/SelectLSProvider';
import StakeAmountCard from './components/StakeAmountCard';
import StakeHeading from './components/StakeHeading';
import TabList from './components/Tablist/index';
import LavaClaimInfo from './restaking/LavaClaimInfo';
import { ReviewClaimLavaTx } from './restaking/ReviewClaimLavaTx';
import { StakeHeader } from './stake-header';
import { StakeInputPageState } from './StakeInputPage';
import { StakeTxnSheet } from './StakeTxnSheet';

type StakePageProps = {
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
  showBackAction?: boolean;
  onBackClick?: () => void;
  rootDenomsStore: RootDenomsStore;
  delegationsStore: DelegationsStore;
  validatorsStore: ValidatorsStore;
  unDelegationsStore: UndelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
  rootBalanceStore: RootBalanceStore;
  chainTagsStore: ChainTagsStore;
};

const StakePage = observer(
  ({
    forceChain,
    forceNetwork,
    showBackAction,
    onBackClick,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    rootBalanceStore,
    chainTagsStore,
  }: StakePageProps) => {
    const _activeChain = useActiveChain();
    const setActiveChain = useSetActiveChain();
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
    const [claimTxMode, setClaimTxMode] = useState<STAKE_MODE | 'CLAIM_AND_DELEGATE' | null>(null);

    const _activeNetwork = useSelectedNetwork();
    const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);

    const { walletAvatar, walletName, activeWallet } = useWalletInfo();
    const { headerChainImgSrc } = useChainPageInfo();
    const dontShowSelectChain = useDontShowSelectChain(manageChainsStore);
    const walletAddresses = useGetWalletAddresses(activeChain);

    const query = useQuery();
    const paramValidatorAddress = query.get('validatorAddress') ?? undefined;
    const paramChainId = query.get('chainId') ?? undefined;
    const paramAction = query.get('action') ?? undefined;

    const navigate = useNavigate();

    const denoms = rootDenomsStore.allDenoms;
    const chainDelegations = delegationsStore.delegationsForChain(activeChain);
    const chainValidators = validatorsStore.validatorsForChain(activeChain);
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain);
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain);

    const { rewards, delegations, loadingDelegations, loadingNetwork, loadingRewards, loadingUnboundingDelegations } =
      useStaking(
        denoms,
        chainDelegations,
        chainValidators,
        chainUnDelegations,
        chainClaimRewards,
        activeChain,
        activeNetwork,
        rootBalanceStore.allSpendableTokens,
      );

    const isLoadingAll = useMemo(() => {
      return loadingDelegations || loadingRewards || loadingUnboundingDelegations;
    }, [loadingDelegations, loadingRewards, loadingUnboundingDelegations]);

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork);

    const [showReviewClaimTx, setShowReviewClaimTx] = useState(false);
    const [showReviewClaimLavaTx, setShowReviewClaimLavaTx] = useState(false);
    const [showReviewClaimAndStakeTx, setShowReviewClaimAndStakeTx] = useState(false);
    const [showClaimInfo, setShowClaimInfo] = useState(false);
    const [showLavaClaimInfo, setShowLavaClaimInfo] = useState(false);
    const [showSelectLSProvider, setShowSelectLSProvider] = useState(false);

    const { isLoading: isLSProvidersLoading, data: lsProviders = {} } = useLiquidStakingProviders();
    const { data: featureFlags } = useFeatureFlags();

    const tokenLSProviders = useMemo(() => {
      const _sortedTokenProviders = lsProviders[activeStakingDenom?.coinDenom]?.sort((a, b) => {
        const priorityA = a.priority;
        const priorityB = b.priority;

        if (priorityA !== undefined && priorityB !== undefined) {
          return priorityA - priorityB;
        } else if (priorityA !== undefined) {
          return -1;
        } else if (priorityB !== undefined) {
          return 1;
        } else {
          return 0;
        }
      });
      return _sortedTokenProviders;
    }, [activeStakingDenom?.coinDenom, lsProviders]);

    const chainRewards = useMemo(() => {
      const rewardMap: Record<string, any> = {};

      rewards?.rewards?.forEach((rewardObj: any) => {
        const validatorAddress = rewardObj.validator_address;

        if (!rewardMap[validatorAddress]) {
          rewardMap[validatorAddress] = {
            validator_address: validatorAddress,
            reward: [],
          };
        }
        const accumulatedAmounts: any = {};
        rewardObj.reward.forEach((reward: any) => {
          const { denom, amount, tokenInfo } = reward;
          const numAmount = parseFloat(amount);

          if (accumulatedAmounts[denom]) {
            accumulatedAmounts[denom] += numAmount * Math.pow(10, tokenInfo?.coinDecimals ?? 6);
          } else {
            accumulatedAmounts[denom] = numAmount * Math.pow(10, tokenInfo?.coinDecimals ?? 6);
          }
        });
        rewardMap[validatorAddress].reward.push(
          ...Object.keys(accumulatedAmounts).map((denom) => ({
            denom,
            amount: accumulatedAmounts[denom],
          })),
        );
      });

      const totalRewards = rewards?.total.find((reward: any) => reward.denom === activeStakingDenom?.coinMinimalDenom);

      const rewardsStatus = '';
      const usdValueStatus = '';
      return {
        rewardsUsdValue: new BigNumber(totalRewards?.currencyAmount ?? '0'),
        rewardsStatus,
        usdValueStatus,
        denom: totalRewards?.denom,
        rewardsDenomValue: new BigNumber(totalRewards?.amount ?? '0'),
        rewards: {
          rewardMap,
        },
      };
    }, [activeStakingDenom, rewards]);

    useEffect(() => {
      async function updateChain() {
        if (paramChainId && (_activeChain as AggregatedSupportedChainType) !== AGGREGATED_CHAIN_KEY) {
          const chainIdToChain = await decodeChainIdToChain();
          const chain = chainIdToChain[paramChainId] as SupportedChain;
          setActiveChain(chain);
        }
      }
      updateChain();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramChainId]);

    const validators = useMemo(
      () =>
        chainValidators.validatorData.validators?.reduce((acc, validator) => {
          acc[validator.address] = validator;
          return acc;
        }, {} as Record<string, Validator>),
      [chainValidators.validatorData.validators],
    );

    const consensusValidators = useConsensusValidators(validators, nmsStore, activeChain, activeNetwork);

    const redirectToInputPage = useCallback(async () => {
      let chain = activeChain;
      if (paramChainId && (_activeChain as AggregatedSupportedChainType) !== AGGREGATED_CHAIN_KEY) {
        const chainIdToChain = await decodeChainIdToChain();
        chain = chainIdToChain[paramChainId] as SupportedChain;
      }
      const toValidator = paramValidatorAddress ? validators?.[paramValidatorAddress] : undefined;
      const state: StakeInputPageState = {
        mode: 'DELEGATE',
        toValidator,
        forceChain: chain,
        forceNetwork: activeNetwork,
      };
      sessionStorage.setItem('navigate-stake-input-state', JSON.stringify(state));
      // if `toValidator` is not found, we need to redirect to the input page with the validator address
      const queryString = !toValidator ? `?validatorAddress=${paramValidatorAddress}` : '';
      navigate(`/stake/input${queryString}`, {
        state,
        replace: true,
      });
    }, [_activeChain, activeChain, activeNetwork, navigate, paramChainId, paramValidatorAddress, validators]);

    useEffect(() => {
      switch (paramAction) {
        case 'CLAIM_REWARDS':
          setShowReviewClaimTx(true);
          break;
        case 'OPEN_LIQUID_STAKING':
          setShowSelectLSProvider(true);
          break;
        case 'DELEGATE':
          redirectToInputPage();
          break;
        default:
          break;
      }
    }, [paramAction, redirectToInputPage]);

    const onClaim = useCallback(() => {
      if (activeChain === 'lava' && featureFlags?.restaking?.extension) {
        setShowLavaClaimInfo(true);
      } else {
        setShowClaimInfo(true);
      }
    }, [activeChain, featureFlags?.restaking?.extension]);

    usePerformanceMonitor({
      enabled: !!activeWallet,
      page: 'stake',
      op: 'stakePageLoad',
      description: 'loading state on stake page',
      queryStatus: isLoadingAll ? 'loading' : 'success',
    });

    if (!activeWallet) {
      return (
        <div className='relative w-full overflow-clip panel-height flex items-center justify-center'>
          <EmptyCard src={Images.Logos.LeapCosmos} heading='No wallet found' logoClassName='size-14' />
        </div>
      );
    }

    return (
      <>
        <StakeHeader onBackClick={onBackClick} />
        <div className='flex flex-col gap-y-5 px-6 py-7 w-full flex-1'>
          <StakeHeading forceChain={activeChain} forceNetwork={activeNetwork} />

          {isLoadingAll || Object.values(delegations ?? {}).length > 0 ? (
            <StakeAmountCard onClaim={onClaim} forceChain={activeChain} forceNetwork={activeNetwork} />
          ) : (
            <NotStakedCard
              forceChain={activeChain}
              forceNetwork={activeNetwork}
              title='Stake tokens to earn rewards'
              subtitle={`You haven't staked any ${activeStakingDenom?.coinDenom}`}
              buttonText='Stake now'
            />
          )}
          <TabList forceChain={activeChain} forceNetwork={activeNetwork} setClaimTxMode={setClaimTxMode} />
        </div>
        <StakeTxnSheet
          mode={claimTxMode}
          isOpen={!!claimTxMode}
          onClose={() => setClaimTxMode(null)}
          forceChain={activeChain}
          forceNetwork={activeNetwork}
        />
        {!loadingNetwork && (
          <>
            <ReviewClaimTx
              isOpen={showReviewClaimTx}
              onClose={() => setShowReviewClaimTx(false)}
              validators={validators}
              forceChain={activeChain}
              forceNetwork={activeNetwork}
              setClaimTxMode={setClaimTxMode}
            />

            <ClaimInfo
              isOpen={showClaimInfo}
              onClose={() => setShowClaimInfo(false)}
              onClaim={() => {
                setShowClaimInfo(false);
                setShowReviewClaimTx(true);
              }}
              onClaimAndStake={() => {
                setShowClaimInfo(false);
                setShowReviewClaimAndStakeTx(true);
              }}
              forceChain={activeChain}
              forceNetwork={activeNetwork}
            />

            {activeChain === 'lava' && featureFlags?.restaking?.extension === 'active' && (
              <ReviewClaimLavaTx
                isOpen={showReviewClaimLavaTx}
                onClose={() => setShowReviewClaimLavaTx(false)}
                rootDenomsStore={rootDenomsStore}
                rootBalanceStore={rootBalanceStore}
                forceChain={activeChain}
                forceNetwork={activeNetwork}
                setClaimTxMode={setClaimTxMode}
              />
            )}

            {activeChain === 'lava' && featureFlags?.restaking?.extension === 'active' && (
              <LavaClaimInfo
                isOpen={showLavaClaimInfo}
                onClose={() => setShowLavaClaimInfo(false)}
                onClaimValidatorRewards={() => {
                  setShowLavaClaimInfo(false);
                  setShowReviewClaimTx(true);
                }}
                onClaimProviderRewards={() => {
                  setShowLavaClaimInfo(false);
                  setShowReviewClaimLavaTx(true);
                }}
                rootDenomsStore={rootDenomsStore}
                delegationsStore={delegationsStore}
                validatorsStore={validatorsStore}
                unDelegationsStore={unDelegationsStore}
                claimRewardsStore={claimRewardsStore}
                rootBalanceStore={rootBalanceStore}
                forceChain={forceChain}
                forceNetwork={forceNetwork}
              />
            )}

            {chainRewards && (
              <ReviewClaimAndStakeTx
                isOpen={showReviewClaimAndStakeTx}
                onClose={() => setShowReviewClaimAndStakeTx(false)}
                validators={validators}
                chainRewards={chainRewards}
                forceChain={activeChain}
                forceNetwork={activeNetwork}
                setClaimTxMode={setClaimTxMode}
              />
            )}
          </>
        )}

        {tokenLSProviders && (
          <SelectLSProvider
            isVisible={showSelectLSProvider}
            onClose={() => setShowSelectLSProvider(false)}
            providers={tokenLSProviders}
            rootDenomsStore={rootDenomsStore}
            forceChain={activeChain}
            forceNetwork={activeNetwork}
          />
        )}
      </>
    );
  },
);

export default StakePage;
