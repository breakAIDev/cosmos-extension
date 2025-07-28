import { useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { Images } from '../../../assets/images';
import { useMemo } from 'react';
import { Colors, getChainColor } from '../../theme/colors';
import { AggregatedSupportedChain } from '../../types/utility';
import { useDefaultTokenLogo } from './useDefaultTokenLogo';

export function useChainPageInfo() {
  const chains = useGetChains();
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const defaultTokenLogo = useDefaultTokenLogo();
  const { theme } = useTheme();

  const headerChainImgSrc = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY) {
      return theme === ThemeName.DARK ? Images.Misc.aggregated_view_dark_mode : Images.Misc.aggregated_view;
    }
    return chains[activeChain]?.chainSymbolImageUrl || defaultTokenLogo;
  }, [activeChain, chains, defaultTokenLogo, theme]);

  const gradientChainColor = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY) {
      return Colors.aggregateGradient;
    }
    return chains[activeChain]?.theme?.gradient;
  }, [activeChain, chains]);

  const topChainColor = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY) {
      return Colors.aggregatePrimary;
    }
    return getChainColor(activeChain, chains[activeChain]);
  }, [activeChain, chains]);

  return {
    headerChainImgSrc,
    gradientChainColor,
    topChainColor,
  };
}
