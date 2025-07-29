import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk';
import { EventName, PageName } from '../../services/config/analytics';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { useActiveChain } from '../settings/useActiveChain';
import mixpanel from '../../mixpanel'; // <-- Your RN Mixpanel singleton import
import { useEffect } from 'react';
import { AggregatedSupportedChain } from '../../types/utility';

/**
 * Track page view on mixpanel (React Native)
 */

export const usePageView = (
  pageName: PageName,
  enable = true,
  additionalProperties?: any,
  callback?: () => void
) => {
  const chain = useChainInfo() as ChainInfo | undefined;
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const isAggregatedView = activeChain === AGGREGATED_CHAIN_KEY;
  const chainId = isAggregatedView ? 'all' : chain?.chainId ?? '';
  const chainName = isAggregatedView ? 'All Chains' : chain?.chainName ?? '';

  useEffect(() => {
    if (!enable) {
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        mixpanel.track(
          EventName.PageView,
          {
            pageName,
            chainId,
            chainName,
            time: Date.now() / 1000,
            ...(additionalProperties ?? {}),
          }
        );
        callback?.();
      } catch (_) {
        //
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [additionalProperties, callback, chain?.chainId, chain?.chainName, chainId, chainName, enable, pageName]);
};
