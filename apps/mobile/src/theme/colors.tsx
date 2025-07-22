import { ChainInfo } from '@leapwallet/cosmos-wallet-provider/dist/provider/types';
import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants';

// Gradients are not strings; use react-native-linear-gradient for real gradients!
export const Colors = {
  compassPrimary: '#224874',
  compassPrimaryDark: '#0D233D',
  // For gradients, use react-native-linear-gradient
  compassGradient: ['rgba(34, 72, 116, 0.7)', 'rgba(34, 72, 116, 0)'],

  aggregatePrimary: '#fcb045eb',
  aggregateGradient: [
    'rgba(252, 176, 69, 0.28)',
    'rgba(131, 58, 180, 0.24)',
    'rgba(58, 141, 180, 0.12)',
    'rgba(58, 141, 180, 0)',
  ],

  cosmosPrimary: '#754F9C',
  juno: '#E18881',
  gray900: '#212121',
  gray400: '#9E9E9E',
  gray300: '#B8B8B8',
  gray200: '#D6D6D6',
  gray100: '#E8E8E8',
  gray800: '#383838',
  gray950: '#141414',
  green500: '#3ACF92',
  green600: '#29A874',

  Indigo300: '#8583EC',
  junoPrimary: '#E18881',
  osmosisPrimary: '#726FDC',
  white100: '#FFFFFF',
  black100: '#000000',

  red300: '#FF707E',
  red400: '#FF3D50',
  red600: '#D10014',

  orange100: '#FFEDD1',
  orange200: '#FFDFAD',
  orange300: '#FFC770',
  orange500: '#FF9F0A',
  orange600: '#D17F00',
  orange800: '#704400',
  orange900: '#422800',

  blue200: '#ADD6FF',
  blue400: '#3D9EFF',
  blue600: '#0A84FF',
  blue800: '#003870',
  blue900: '#002142',

  // Helper functions (put outside of the object for tree-shaking/flexibility)
};

export const walletColors = [
  '#29A874',
  '#1E1CB5',
  '#811DB4',
  '#C01189',
  '#D10014',
  '#D17F00',
  '#D1A700',
  '#3ACF92',
  '#0094D1',
  '#696969',
];

export function getChainColor(
  chainName: SupportedChain,
  activeChainInfo?: { theme?: ChainInfo['theme'] }
): string {
  const chainInfo = activeChainInfo ?? ChainInfos[chainName];
  return chainInfo?.theme?.primaryColor ?? Colors.cosmosPrimary;
}

export function getWalletColorAtIndex(index: number | undefined): string {
  return walletColors[(index ?? 0) % walletColors.length];
}
