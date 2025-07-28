import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, useColorScheme  }
from 'react-native';
import {
  currencyDetail,
  formatTokenAmount,
  IbcChainInfo,
  sliceWord,
  useActiveChain,
  useGetChains,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { GenericCard } from '@leapwallet/leap-ui';
import BigNumber from 'bignumber.js';
import Badge from '../badge/Badge';
import IBCTokenBadge from '../badge/IbcTokenBadge';
import TokenImageWithFallback  from '../token-image-with-fallback';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { useFormatCurrency } from '../../hooks/settings/useCurrency'; // Replace with your hook
import { hideAssetsStore } from '../../context/hide-assets-store'; // Replace with your store
import { AggregatedSupportedChain } from '../../types/utility';

// -------- TokenCard Implementation --------
type TokenCardProps = {
  readonly title: string;
  readonly usdValue: string | undefined;
  readonly amount: string;
  readonly symbol: string;
  readonly assetImg: string | undefined;
  readonly isRounded: boolean;
  readonly onClick?: () => void;
  readonly cardClassName?: string;
  readonly isIconVisible?: boolean;
  readonly iconSrc?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly ibcChainInfo?: IbcChainInfo | undefined;
  readonly hasToShowIbcTag?: boolean;
  readonly hasToShowEvmTag?: boolean;
  readonly isEvm?: boolean;
  readonly hideAmount?: boolean;
  readonly tokenBalanceOnChain?: SupportedChain;
};

export function TokenCard({
  title,
  ibcChainInfo,
  usdValue,
  amount,
  symbol,
  assetImg,
  isRounded,
  onClick,
  isIconVisible,
  iconSrc,
  size,
  hasToShowIbcTag,
  hasToShowEvmTag,
  isEvm,
  hideAmount = false,
  tokenBalanceOnChain,
  cardClassName, // not used in RN
} : TokenCardProps) {
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === 'dark' ? '#333333' : '#cccccc';

  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const chains = useGetChains();
  const [formatCurrency] = useFormatCurrency();

  const [preferredCurrency] = useUserPreferredCurrency();
  const formattedFiatValue = usdValue ? formatCurrency(new BigNumber(usdValue)) : '-';

  // Compose ibcInfo
  const ibcInfo = useMemo(() => {
    if (!ibcChainInfo) return '';
    return `${ibcChainInfo.pretty_name} / ${sliceWord(ibcChainInfo.channelId ?? '', 7, 5)}`;
  }, [ibcChainInfo]);

  // Title with badges
  const Title = useMemo(() => {
    let _Title = (
      <Text style={styles.titleText} numberOfLines={1}>{sliceWord(title, 7, 4)}</Text>
    );
    if (activeChain === AGGREGATED_CHAIN_KEY && ibcChainInfo) {
      _Title = (
        <View style={styles.titleWithBadge}>
          <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
          {<Badge text='IBC' title={ibcInfo}/>}
        </View>
      );
    }
    return _Title;
  }, [title, activeChain, ibcChainInfo, ibcInfo]);

  // Subtitle with badges/chains
  const Subtitle = (
    <View style={styles.subtitleRow}>
      {activeChain === AGGREGATED_CHAIN_KEY && tokenBalanceOnChain ? (
        <Text>{chains[tokenBalanceOnChain]?.chainName ?? 'Unknown Chain'}</Text>
      ) : (
        <>
          {ibcChainInfo && !hasToShowIbcTag ? <IBCTokenBadge text={ibcInfo} /> : null}
          {ibcChainInfo && hasToShowIbcTag ? <Badge text='IBC' /> : null}
          {isEvm && hasToShowEvmTag ? <Badge text='EVM' /> : null}
        </>
      )}
    </View>
  );

  return (
    <GenericCard
      title={Title}
      subtitle={Subtitle}
      title2={
        (!!formattedFiatValue && formattedFiatValue !== '-') && (
          <Text style={styles.fiatValue}>
            {hideAssetsStore.formatHideBalance(formattedFiatValue)}
          </Text>
        )
      }
      subtitle2={
        hideAmount === false && (
          <Text style={styles.tokenAmount}>
            {hideAssetsStore.formatHideBalance(
              formatTokenAmount(amount, sliceWord(symbol, 4, 4), 3, currencyDetail[preferredCurrency].locale)
            )}
          </Text>
        )
      }
      img={
        <TokenImageWithFallback
          assetImg={assetImg}
          text={symbol}
          altText={symbol}
          imageStyle={styles.tokenImageContainer && styles.tokenImg && { borderColor }}
          containerStyle={styles.tokenImageContainer && {borderColor}}
          textStyle={styles.tokenImageText}
        />
      }
      icon={<Image style={[styles.icon, !isIconVisible && styles.hidden,]} src={iconSrc} />}
      isRounded={isRounded}
      className={cardClassName}
      onClick={onClick}
      size={size}
    />
  );   
}

// ----------- Styles ------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    width: '95%',
    alignSelf: 'center',
  },
  rounded: {
    borderRadius: 30,
  },
  sizeSm: {
    padding: 8,
  },
  sizeLg: {
    padding: 22,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    color: '#111',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  badge: {
    backgroundColor: '#DEF4FC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 11,
    color: '#1E90FF',
    fontWeight: '600',
  },
  ibcBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  ibcBadgeText: {
    fontSize: 11,
    color: '#E9B518',
    fontWeight: '600',
  },
  tokenImageContainer: {
    width: 28,
    height: 28,
    marginRight: 8, // mr-2 = 8px in Tailwind default scale
    borderWidth: 1,
    borderColor: '#cccccc', // Default mode border
  },
  tokenImg: {
    borderRadius: 14,
    resizeMode: 'contain',
  },
  tokenImageText: {
    fontSize: 7,
    lineHeight: 9,
    // Add color, fontWeight, etc. as needed
  },
  icon: {
    width: 20,        // w-5 (5 * 4px)
    height: 20,       // h-5
    marginLeft: 8,    // ml-2
  },
  hidden: {
    display: 'none',
  },
  fiatValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#69788A',
    marginTop: 3,
    marginBottom: 1,
  },
  tokenAmount: {
    fontSize: 12,
    color: '#97A3B9',
    fontWeight: '600',
  },
});
