import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { MotiText, AnimatePresence } from 'moti';

import BigNumber from 'bignumber.js';

// Your hooks/components (use native-ready ones)
import {
  currencyDetail,
  formatPercentAmount,
  formatTokenAmount,
  IbcChainInfo,
  sliceWord,
  useGetChains,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { observer } from 'mobx-react-lite';
import { miscellaneousDataStore } from '../../../context/chain-infos-store';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import { hidePercentChangeStore } from '../../../context/hide-percent-change';
import TokenImageWithFallback from '../../../components/token-image-with-fallback'; // should be RN component
import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { AGGREGATED_CHAIN_KEY } from '../../../services/config/constants';
import { AggregatedSupportedChain } from '../../../types/utility';
import { Tooltip } from '../../../components/ui/tooltip';

// ... your other imports

type AggregatedTokenCardProps = {
  readonly title: string;
  readonly usdValue: string | undefined;
  readonly amount: string;
  readonly symbol: string;
  readonly assetImg: string | undefined;
  readonly onClick: () => void;
  readonly ibcChainInfo: IbcChainInfo | undefined;
  readonly hasToShowEvmTag: boolean | undefined;
  readonly isEvm: boolean | undefined;
  readonly tokenBalanceOnChain: SupportedChain;
  readonly isPlaceholder?: boolean;
  percentChange24?: number;
  className?: string;
};

export const AggregatedTokenCardView = observer(
  ({
    title,
    usdValue,
    amount,
    symbol,
    assetImg,
    onClick,
    ibcChainInfo,
    hasToShowEvmTag,
    isEvm,
    tokenBalanceOnChain,
    isPlaceholder,
    percentChange24,
  }: AggregatedTokenCardProps & { className?: string }) => {
  const chains = useGetChains();
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const [formatCurrency] = useFormatCurrency();
  const defaultTokenLogo = useDefaultTokenLogo();
  const [preferredCurrency] = useUserPreferredCurrency();

  const formattedFiatValue = usdValue ? formatCurrency(new BigNumber(usdValue || 0), true) : '-';
  const ibcInfo = ibcChainInfo
    ? `${ibcChainInfo.pretty_name} / ${sliceWord(ibcChainInfo?.channelId ?? '', 7, 5)}`
    : '';

  const chainName = chains[tokenBalanceOnChain]?.chainName ?? '';

  const percentChangeText = useMemo(() => {
    if (percentChange24 == null) return '-';
    if (percentChange24 >= 0) return `+${formatPercentAmount(percentChange24.toString(), 2)}%`;
    else return percentChange24 >= -100 ? `${formatPercentAmount(percentChange24.toString(), 2)}%` : '-99.99%';
  }, [percentChange24]);

  // ---- Main Card ----
  return (
    <TouchableOpacity style={[styles.card]} onPress={onClick} activeOpacity={0.8}>
      {/* Token Image */}
      <View style={styles.tokenImageContainer}>
        <TokenImageWithFallback
          assetImg={assetImg}
          text={symbol}
          altText={chainName + ' logo'}
          imageStyle={styles.tokenImage}
        />
        {/* Chain Symbol */}
        {activeChain === AGGREGATED_CHAIN_KEY && (
          <Image
            source={{
              uri:
                chains[tokenBalanceOnChain]?.chainSymbolImageUrl ||
                ChainInfos[tokenBalanceOnChain]?.chainSymbolImageUrl ||
                defaultTokenLogo,
            }}
            // fallback: handleError can set a local state to swap to defaultTokenLogo
            onError={() => {/* optionally handle error, e.g., setImageSource(defaultTokenLogo) */}}
            style={styles.aggregatedImg}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Details Column */}
      <View style={styles.details}>
        {/* Title Row */}
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.tokenTitle}>
            {sliceWord(title, 7, 4)}
          </Text>
          {ibcInfo ? (
            <Text style={styles.ibcLabel}>IBC</Text>
          ) : null}
        </View>
        {/* Amount w/ Tooltip */}
        <Tooltip
          content={
            <View>
              <Text style={{ color: '#222' }}>{chainName}</Text>
            </View>
          }
        >
          <View>
            <AnimatePresence>
              <MotiText
                from={{ opacity: 0, translateY: 4 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -4 }}
                transition={{ type: 'timing', duration: 150 }}
                style={styles.amountText}
                numberOfLines={1}
              >
                {hideAssetsStore.formatHideBalance(
                  formatTokenAmount(amount, sliceWord(symbol, 4, 4), 3, currencyDetail[preferredCurrency].locale)
                )}
                {isEvm && hasToShowEvmTag ? ' · EVM' : ''}
              </MotiText>
            </AnimatePresence>
          </View>
        </Tooltip>
      </View>

      {/* Fiat and Percent Change Column */}
      <View style={styles.rightColumn}>
        {isPlaceholder ? (
          <Text style={styles.usdText}>-</Text>
        ) : (
          <AnimatePresence>
            <MotiText
              from={{ opacity: 0, translateY: 4 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -4 }}
              transition={{ type: 'timing', duration: 150 }}
              style={[
                styles.usdText,
                hideAssetsStore.isHidden && { color: '#A1A1AA' },
              ]}
            >
              {hideAssetsStore.isHidden ? '••••••' : formattedFiatValue}
            </MotiText>
          </AnimatePresence>
        )}

        <AnimatePresence>
          {!hidePercentChangeStore.isHidden && (
            <MotiText
              from={{ opacity: 0, translateY: 2 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -2 }}
              transition={{ type: 'timing', duration: 150 }}
              style={[
                styles.percentText,
                percentChange24
                  ? percentChange24 > 0
                    ? styles.percentUp
                    : styles.percentDown
                  : styles.percentMuted,
                hideAssetsStore.isHidden && styles.percentMuted,
              ]}
            >
              {hideAssetsStore.isHidden ? '•••' : percentChangeText || '-'}
            </MotiText>
          )}
        </AnimatePresence>
      </View>
    </TouchableOpacity>
  );
});

// --- NobleRewards as React Native ---
const NobleRewards = observer(() => {
  const apy =
    parseFloat(miscellaneousDataStore.data?.noble?.usdnEarnApy) > 0
      ? new BigNumber(miscellaneousDataStore.data.noble.usdnEarnApy).multipliedBy(100).toFixed(2) + '%'
      : '-';
  return (
    <View
      style={styles.nobleRewards}
    >
      <Text style={{ color: '#29A874', fontSize: 12, fontWeight: 'bold' }}>
        Earn rewards of up to <Text style={{ fontWeight: 'bold' }}>{apy} APY!</Text>
      </Text>
    </View>
  );
});

// --- AggregatedTokenCard ---
export const AggregatedTokenCard = (props: AggregatedTokenCardProps) => {
  const showNobleRewards = props.tokenBalanceOnChain === 'noble' && props.symbol === 'USDC';

  return (
    <View style={{ flexDirection: 'column', width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 4 }}>
      <AggregatedTokenCardView {...props} />
      {showNobleRewards && <NobleRewards />}
    </View>
  );
};

const styles = StyleSheet.create({
  nobleRewards: {
    width: '100%',
    paddingVertical: 6,
    backgroundColor: 'rgba(36,207,129,0.1)', // bg-accent-green-900 with opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  aggregatedImg: {
    width: 15,
    height: 15,
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 8,
    backgroundColor: '#fff', // use '#18181b' for dark if needed
    // Optionally, add border for clarity
    borderWidth: 1,
    borderColor: '#eee',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // bg-secondary-100
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 6,
  },
  tokenImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  chainSymbolImage: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  details: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  tokenTitle: { fontWeight: 'bold', fontSize: 16, color: '#18181B', flexShrink: 1 },
  ibcLabel: {
    paddingHorizontal: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    fontSize: 10,
    color: '#52525B',
    marginLeft: 4,
    height: 19,
    lineHeight: 19,
    overflow: 'hidden',
  },
  amountText: {
    color: '#6B7280', // text-muted-foreground
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 160,
  },
  rightColumn: { alignItems: 'flex-end', minWidth: 70 },
  usdText: { fontWeight: 'bold', fontSize: 14 },
  percentText: { fontSize: 12, fontWeight: '500', lineHeight: 19 },
  percentUp: { color: '#29A874' }, // text-accent-success-200
  percentDown: { color: '#FF707E' }, // text-destructive-100
  percentMuted: { color: '#A1A1AA' }, // text-muted-foreground
});