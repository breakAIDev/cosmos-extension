import { toBase64, toUtf8 } from '@cosmjs/encoding';
import {
  currencyDetail,
  formatTokenAmount,
  useActiveChain,
  useGetChains,
  useGetExplorerAccountUrl,
} from '@leapwallet/cosmos-wallet-hooks';
import { MarketDataStore } from '@leapwallet/cosmos-wallet-store';
import { useTheme } from '@leapwallet/leap-ui';
import { ArrowSquareOut, CopySimple } from 'phosphor-react-native';
import BigNumber from 'bignumber.js';
import Text from '../../../components/text';
import { AGGREGATED_CHAIN_KEY } from '../../../services/config/constants';
import { useFormatCurrency, useUserPreferredCurrency } from '../../../hooks/settings/useCurrency';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useMemo, useState } from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import { SourceChain, SourceToken } from '../../../types/swap';
import { AggregatedSupportedChain } from '../../../types/utility';
import { UserClipboard } from '../../../utils/clipboard';
import { sliceWord } from '../../../utils/strings';

import { View, Text as RNText, TouchableOpacity, Image, StyleSheet, Linking } from 'react-native';

export const TokenCardSkeleton = () => {
  return (
    <SkeletonPlaceholder>
      <View style={styles.container}>
        {/* Left: Circle Skeleton */}
        <View style={styles.left}>
          <SkeletonPlaceholder.Item width={40} height={40} borderRadius={20} />
        </View>
        {/* Center: Two lines */}
        <View style={styles.centerSkel}>
          <SkeletonPlaceholder.Item width={80} height={14} borderRadius={4} marginBottom={8} />
          <SkeletonPlaceholder.Item width={60} height={12} borderRadius={4} />
        </View>
        {/* Right: Two lines */}
        <View style={styles.right}>
          <SkeletonPlaceholder.Item width={50} height={14} borderRadius={4} marginBottom={8} />
          <SkeletonPlaceholder.Item width={70} height={12} borderRadius={4} />
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

function TokenCardView({
  onTokenSelect,
  token,
  isSelected,
  verified = false,
  hideAmount = false,
  showRedirection = false,
  selectedChain,
  isChainAbstractionView,
  isLast = false,
}: {
  onTokenSelect: (token: SourceToken) => void;
  token: SourceToken;
  isSelected: boolean;
  verified?: boolean;
  hideAmount?: boolean;
  selectedChain: SourceChain | undefined;
  showRedirection?: boolean;
  isChainAbstractionView?: boolean;
  marketDataStore?: MarketDataStore;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const [formatCurrency] = useFormatCurrency();
  const [preferredCurrency] = useUserPreferredCurrency();
  const defaultTokenLogo = useDefaultTokenLogo();
  const { theme } = useTheme();
  const chains = useGetChains();

  const formattedFiatValue = hideAssetsStore.formatHideBalance(
    token.usdValue ? formatCurrency(new BigNumber(token.usdValue)) : '-',
  );
  const { getExplorerAccountUrl, explorerAccountUrl } = useGetExplorerAccountUrl({
    forceChain: selectedChain?.key,
  });

  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [_showRedirection, showAddressCopy] = useMemo(() => {
    const _showRedirection = showRedirection && selectedChain;
    if (
      _showRedirection &&
      token.coinMinimalDenom.toLowerCase().startsWith('factory/') &&
      !explorerAccountUrl?.toLowerCase().includes('mintscan')
    ) {
      return [false, true];
    }
    return [_showRedirection, false];
  }, [explorerAccountUrl, selectedChain, showRedirection, token.coinMinimalDenom]);

  const handleRedirectionClick = useCallback(() => {
    let explorerURL : string | undefined = '';
    if (token.coinMinimalDenom.toLowerCase().startsWith('factory/')) {
      // You might need to encode to base64 on mobile as well
      const asset = toBase64(toUtf8(token.coinMinimalDenom));
      explorerURL = getExplorerAccountUrl(asset, true);
    } else {
      explorerURL = getExplorerAccountUrl(token.coinMinimalDenom);
    }
    // Open in system browser
    if (explorerURL) {
      // Use Linking for RN
     Linking.openURL(explorerURL);
    }
  }, [getExplorerAccountUrl, token.coinMinimalDenom]);

  const handleContentCopyClick = useCallback(async () => {
    setIsAddressCopied(true);
    UserClipboard.copyText(token.coinMinimalDenom);
    setTimeout(() => setIsAddressCopied(false), 2000);
  }, [token.coinMinimalDenom]);

  const handleTokenSelect = useCallback(() => {
    if (isSelected) return;
    onTokenSelect(token);
  }, [isSelected, onTokenSelect, token]);

  const tokenName = token.symbol ?? token?.name;

  return (
    <>
      <TouchableOpacity
        onPress={handleTokenSelect}
        disabled={isSelected}
        style={[
          styles.card,
          isSelected ? styles.cardSelected : styles.cardUnselected,
          isLast && { marginBottom: 16 },
        ]}
      >
        <View style={styles.row}>
          {/* Left: Token logo + verified */}
          <View style={styles.logoWrap}>
            <Image
              source={{ uri: token.img ?? defaultTokenLogo }}
              style={styles.tokenImg}
              onError={() => { /* optionally set fallback */ }}
            />
            {verified && (
              <View style={styles.verifiedIconWrap}>
                <Image
                  source={{
                    uri:
                      theme === 'dark'
                        ? Images.Misc.VerifiedWithBgStarDark
                        : Images.Misc.VerifiedWithBgStar,
                  }}
                  style={styles.verifiedIcon}
                />
                {/* Tooltip not supported on RN - you can show onPress tip if wanted */}
              </View>
            )}
          </View>

          {/* Center: Name, IBC, chain */}
          <View style={styles.center}>
            <View style={styles.centerNameRow}>
              <Text
                size="md"
                style={[
                  styles.tokenName,
                  (activeChain === AGGREGATED_CHAIN_KEY || isChainAbstractionView) && token?.ibcChainInfo
                    ? { flexDirection: 'row', alignItems: 'center' }
                    : {},
                ]}
              >
                {tokenName?.length > 20 ? sliceWord(tokenName, 6, 6) : tokenName}
              </Text>
              {token.ibcChainInfo && (
                <View style={styles.ibcTag}>
                  <RNText style={styles.ibcTagText}>IBC</RNText>
                </View>
              )}
              {_showRedirection ? (
                <TouchableOpacity onPress={handleRedirectionClick} style={styles.iconBtn}>
                  <ArrowSquareOut size={16} color="#888" />
                </TouchableOpacity>
              ) : null}
              {showAddressCopy ? (
                !isAddressCopied ? (
                  <TouchableOpacity onPress={handleContentCopyClick} style={styles.iconBtn}>
                    <CopySimple size={16} color="#888" />
                  </TouchableOpacity>
                ) : (
                  <RNText style={styles.copied}>copied</RNText>
                )
              ) : null}
            </View>
            {token.tokenBalanceOnChain && (
              <Text size="xs" color="text-muted-foreground" style={{ fontWeight: '500' }}>
                {chains[token.tokenBalanceOnChain]?.chainName}
              </Text>
            )}
          </View>

          {/* Right: Amount */}
          {hideAmount === false && (
            <View style={styles.rightAmountCol}>
              {formattedFiatValue !== '-' && (
                <Text size="sm" style={styles.fiatText}>
                  {formattedFiatValue}
                </Text>
              )}
              {parseFloat(token.amount) > 0 && (
                <Text size="xs" style={styles.tokenAmount}>
                  {formatTokenAmount(
                    token.amount,
                    sliceWord(token.symbol, 4, 4),
                    3,
                    currencyDetail[preferredCurrency].locale,
                  )}
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
      {isLast && <View style={{ height: 8, backgroundColor: 'transparent' }} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    zIndex: 0,
  },
  left: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSkel: {
    maxWidth: 80,
    marginLeft: 8,
    justifyContent: 'center',
  },
  right: {
    maxWidth: 70,
    marginLeft: 'auto',
    alignItems: 'flex-end',
    flexDirection: 'column',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardUnselected: {
    backgroundColor: '#f6f8fa',
  },
  cardSelected: {
    backgroundColor: '#e8ecf2',
    borderColor: '#21b26d',
  },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  logoWrap: { marginRight: 12, position: 'relative' },
  tokenImg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee' },
  verifiedIconWrap: {
    position: 'absolute',
    bottom: -3,
    right: -8,
    width: 20,
    height: 20,
  },
  verifiedIcon: { width: 20, height: 20 },
  center: { flex: 1, flexDirection: 'column', justifyContent: 'center' },
  centerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tokenName: { fontWeight: 'bold', fontSize: 16 },
  ibcTag: {
    backgroundColor: '#e8ecf2',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
    marginRight: 2,
  },
  ibcTagText: { fontSize: 10, color: '#444', fontWeight: '500' },
  iconBtn: { marginLeft: 6, padding: 2 },
  copied: { color: '#888', fontSize: 12, marginLeft: 2, fontWeight: 'bold' },
  rightAmountCol: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 60 },
  fiatText: { fontWeight: 'bold', fontSize: 15, color: '#222' },
  tokenAmount: { fontWeight: '500', fontSize: 12, color: '#666' },
});

export const TokenCard = observer(TokenCardView);
