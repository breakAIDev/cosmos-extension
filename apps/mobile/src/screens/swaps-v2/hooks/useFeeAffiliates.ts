import { useFeeAddresses, UseRouteResponse } from '@leapwallet/elements-hooks';
import { useMemo } from 'react';

type ChainId = string;
type FeeAddresses = Record<ChainId, string>;

type FeeInfo = {
  basisPointFee: number;
  feeAddresses: FeeAddresses;
};

export const useFeeAffiliates = (
  routeResponse: UseRouteResponse | undefined,
  leapFeeBps: string,
  feesInfo?: FeeInfo[],
  enabled: boolean = true,
) => {
  const leapFeeAddresses = useFeeAddresses();

  const affiliates = useMemo(() => {
    if (!routeResponse?.response || !enabled) return undefined;
    let lastSwapVenue = routeResponse?.response?.swap_venue;
    if (!lastSwapVenue) {
      lastSwapVenue = routeResponse?.response?.swap_venues?.[routeResponse?.response?.swap_venues?.length - 1];
    }
    const lastSwapVenueChainId = lastSwapVenue?.chain_id as string;
    if (!lastSwapVenueChainId) return undefined;
    const externalAffiliates = feesInfo?.map(({ basisPointFee, feeAddresses }) => {
      return {
        basis_points_fee: String(basisPointFee),
        address: feeAddresses[lastSwapVenueChainId],
      };
    });
    if (leapFeeAddresses?.data?.[lastSwapVenueChainId]) {
      return {
        [lastSwapVenueChainId]: {
          affiliates: [
            {
              basis_points_fee: leapFeeBps,
              address: leapFeeAddresses.data?.[lastSwapVenueChainId] as string,
            },
            ...(externalAffiliates ?? []),
          ],
        },
      };
    }
    return undefined;
  }, [routeResponse?.response, feesInfo, leapFeeAddresses.data, leapFeeBps, enabled]);

  return {
    affiliates,
  };
};
