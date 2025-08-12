import { BannerAD } from '@leapwallet/cosmos-wallet-hooks';

export const NUMIA_IMPRESSION_INFO = 'numia-impression-info';
export const MIXPANEL_BANNER_VIEWS_INFO = 'mixpanel-banner-views-info';

export type BannerADData = BannerAD & {
  logo?: string;
};

export const getMixpanelBannerId = (bannerId: string, campaignId?: number) => {
  return bannerId.includes('numia') ? `numia-campaign-${campaignId}` : bannerId;
};

export const getMixpanelPositionId = (bannerId: string, banner?: BannerAD) => {
  return bannerId.includes('numia') ? banner?.attributes?.position_id : banner?.position_id;
};

/**
 * Filters out ads that are disabled or not in the valid time window.
 * If disabledBannerAds is null/undefined, treat as empty array (show all valid-time ads).
 */
export const getDisplayAds = (
  bannerAds: BannerAD[],
  disabledBannerAds?: string[] | null
) => {
  const disabledSet = new Set(disabledBannerAds ?? []);
  const now = Date.now();

  return bannerAds.filter((ad) => {
    const startDate = new Date(ad.start_date).getTime();
    const endDate = new Date(ad.end_date).getTime();
    const isCorrectTime = now >= startDate && now <= endDate;
    const isDisabled = disabledSet.has(ad.id);

    return isCorrectTime && !isDisabled;
  });
};
