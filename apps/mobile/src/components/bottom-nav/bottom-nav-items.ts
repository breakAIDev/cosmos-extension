import { ClockIcon } from '../../../assets/icons/clock-icon';
import { CompassIcon2 } from '../../../assets/icons/compass-icon';
import { GalleryIcon } from '../../../assets/icons/gallery-icon';
import { HomeIcon } from '../../../assets/icons/home-icon';
import { SwapIconBottomNav } from '../../../assets/icons/swap-icon';

// Lottie animation imports
import activityOffOn from '../../../assets/lottie-files/bottom-nav/activity-off-on.json';
import activityOnOff from '../../../assets/lottie-files/bottom-nav/activity-on-off.json';
import compassOffOn from '../../../assets/lottie-files/bottom-nav/compass-off-on.json';
import compassOnOff from '../../../assets/lottie-files/bottom-nav/compass-on-off.json';
import homeOffOn from '../../../assets/lottie-files/bottom-nav/home-off-on.json';
import homeOnOff from '../../../assets/lottie-files/bottom-nav/home-on-off.json';
import nftOffOn from '../../../assets/lottie-files/bottom-nav/nft-off-on.json';
import nftOnOff from '../../../assets/lottie-files/bottom-nav/nft-on-off.json';
import swapOffOn from '../../../assets/lottie-files/bottom-nav/swap-off-on.json';
import swapOnOff from '../../../assets/lottie-files/bottom-nav/swap-on-off.json';

// Route names for React Navigation
export enum BottomNavRoute {
  Home = 'Home',
  NFTs = 'NFTs',
  Activity = 'Activity',
  Swap = 'Swap',
  Rewards = 'Rewards',
}

export enum BottomNavLabel {
  Home = 'Home',
  NFTs = 'NFTs',
  Activity = 'Activity',
  Swap = 'Swap',
  Rewards = 'Rewards',
}

export const allBottomNavItems = [
  {
    label: BottomNavLabel.Home,
    lottie: {
      on: homeOffOn,
      off: homeOnOff,
    },
    Icon: HomeIcon,
    route: BottomNavRoute.Home, // React Navigation route name
    visibleOn: new Set<string>(),
  },
  {
    label: BottomNavLabel.NFTs,
    lottie: {
      on: nftOffOn,
      off: nftOnOff,
    },
    Icon: GalleryIcon,
    route: BottomNavRoute.NFTs,
  },
  {
    label: BottomNavLabel.Swap,
    lottie: {
      on: swapOffOn,
      off: swapOnOff,
    },
    Icon: SwapIconBottomNav,
    route: BottomNavRoute.Swap,
    params: { pageSource: 'bottomNav' },
  },
  {
    label: BottomNavLabel.Rewards,
    lottie: {
      on: compassOffOn,
      off: compassOnOff,
    },
    Icon: CompassIcon2,
    route: BottomNavRoute.Rewards,
  },
  {
    label: BottomNavLabel.Activity,
    lottie: {
      on: activityOffOn,
      off: activityOnOff,
    },
    Icon: ClockIcon,
    route: BottomNavRoute.Activity,
  },
];

// Items for watch-only wallets
export const bottomNavItemsForWatchWallet = allBottomNavItems.filter(
  (item) => item.label !== BottomNavLabel.Swap,
);

// Map routes to labels
export const routeToLabelMap: Record<string, BottomNavLabel> = allBottomNavItems.reduce(
  (acc, item) => {
    acc[item.route] = item.label;

    item.visibleOn?.forEach?.((route) => {
      acc[route] = item.label;
    });

    return acc;
  },
  {} as Record<string, BottomNavLabel>,
);
