import { toBase64, toUtf8 } from '@cosmjs/encoding';
import {
  currencyDetail,
  formatPercentAmount,
  formatTokenAmount,
  useActiveChain,
  useGetChains,
  useGetExplorerAccountUrl,
} from '@leapwallet/cosmos-wallet-hooks';
import { MarketDataStore } from '@leapwallet/cosmos-wallet-store';
import { useChains } from '@leapwallet/elements-hooks';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import { ArrowSquareOut, CopySimple } from '@phosphor-icons/react';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import Text from 'components/text';
import { AGGREGATED_CHAIN_KEY } from 'config/constants';
import { useNonNativeCustomChains } from 'hooks';
import { useFormatCurrency, useUserPreferredCurrency } from 'hooks/settings/useCurrency';
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo';
import { Images } from 'images';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { hideAssetsStore } from 'stores/hide-assets-store';
import { SourceChain, SourceToken } from 'types/swap';
import { AggregatedSupportedChain } from 'types/utility';
import { UserClipboard } from 'utils/clipboard';
import { imgOnError } from 'utils/imgOnError';
import { isSidePanel } from 'utils/isSidePanel';
import { sliceWord } from 'utils/strings';

export const TokenCardSkeleton = () => {
  return (
    <div className='flex py-3 w-full z-0'>
      <div className='w-10'>
        <Skeleton
          circle
          className='w-10 h-10'
          style={{
            zIndex: 0,
          }}
        />
      </div>
      <div className='max-w-[80px] z-0 ml-2'>
        <Skeleton width={80} className='z-0' />
        <Skeleton width={60} className='z-0' />
      </div>
      <div className='max-w-[70px] ml-auto z-0 flex flex-col items-end'>
        <Skeleton width={50} className='z-0' />
        <Skeleton width={70} className='z-0' />
      </div>
    </div>
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
  marketDataStore,
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
}) {
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const [formatCurrency] = useFormatCurrency();
  const [preferredCurrency] = useUserPreferredCurrency();
  const defaultTokenLogo = useDefaultTokenLogo();
  const { theme } = useTheme();
  const formattedTokenAmount = hideAssetsStore.formatHideBalance(
    formatTokenAmount(token?.amount, sliceWord(token?.symbol, 4, 4), 3, currencyDetail[preferredCurrency].locale),
  );

  const nonNativeChains = useNonNativeCustomChains();
  const chains = useGetChains();

  const { data: skipChains } = useChains();
  const marketData = marketDataStore?.data;
  const ibcChainInfo = useMemo(() => {
    if (!token.ibcChainInfo) return;

    return (
      Object.values(chains).find(
        (chain) => chain.chainId === token.ibcChainInfo?.name || chain.testnetChainId === token.ibcChainInfo?.name,
      ) ??
      Object.values(nonNativeChains).find(
        (chain) => chain.chainId === token.ibcChainInfo?.name || chain.testnetChainId === token.ibcChainInfo?.name,
      ) ??
      skipChains?.find((chain) => chain.chainId === token.ibcChainInfo?.name)
    );
  }, [chains, nonNativeChains, skipChains, token.ibcChainInfo]);

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

  const ibcInfo = useMemo(() => {
    if (!token?.ibcChainInfo) return '';

    return `${ibcChainInfo?.chainName ?? token.ibcChainInfo?.pretty_name} • Channel ${sliceWord(
      token.ibcChainInfo?.channelId?.replace('channel-', ''),
      4,
      4,
    )}`;
  }, [ibcChainInfo?.chainName, token?.ibcChainInfo]);

  const marketDataForToken = useMemo(() => {
    let key = token.coinGeckoId ?? token.skipAsset?.coingeckoId ?? token.coinMinimalDenom;
    if (marketData?.[key]) {
      return marketData[key];
    }
    key = token.coinMinimalDenom;
    if (marketData?.[key]) {
      return marketData[key];
    }
    key = `${token.skipAsset?.chainId}-${token.coinMinimalDenom}`;
    if (marketData?.[key]) {
      return marketData[key];
    }
    if (!token?.skipAsset?.evmTokenContract) {
      return undefined;
    }
    key = `${token.skipAsset?.chainId}-${token.skipAsset?.evmTokenContract}`;
    return marketData?.[key] ?? marketData?.[key?.toLowerCase()];
  }, [marketData, token]);

  const handleRedirectionClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (token.coinMinimalDenom.toLowerCase().startsWith('factory/')) {
        const asset = toBase64(toUtf8(token.coinMinimalDenom));
        const explorerURL = getExplorerAccountUrl(asset, true);

        window.open(explorerURL, '_blank');
      } else {
        const explorerURL = getExplorerAccountUrl(token.coinMinimalDenom);
        window.open(explorerURL, '_blank');
      }
    },
    [getExplorerAccountUrl, token.coinMinimalDenom],
  );

  const handleContentCopyClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      setIsAddressCopied(true);
      await UserClipboard.copyText(token.coinMinimalDenom);
      setTimeout(() => setIsAddressCopied(false), 2000);
    },
    [token.coinMinimalDenom],
  );

  const tokenName = token.symbol ?? token?.name;

  return (
    <div
      onClick={() => onTokenSelect(token)}
      className={classNames('flex flex-1 items-center py-5 cursor-pointer w-full', {
        'opacity-20': isSelected,
      })}
    >
      <div className='flex items-center flex-1 flex-row justify-between w-full gap-2'>
        <div className='flex items-center flex-1'>
          <div className='relative mr-3'>
            <img
              src={token.img ?? defaultTokenLogo}
              className='h-9 w-9 rounded-full'
              onError={imgOnError(defaultTokenLogo)}
            />

            {verified && (
              <div className='absolute group -bottom-[3px] -right-[6px]'>
                <img
                  src={theme === ThemeName.DARK ? Images.Misc.VerifiedWithBgStarDark : Images.Misc.VerifiedWithBgStar}
                  alt='verified-token'
                  className='h-5 w-5'
                />

                <div
                  className={classNames(
                    'group-hover:!block hidden absolute bottom-0 right-0 translate-x-full bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded-lg text-xs dark:text-white-100',
                    {
                      '!max-w-max': isSidePanel(),
                    },
                  )}
                >
                  Whitelisted
                </div>
              </div>
            )}
          </div>

          <div className='flex flex-col justify-center items-start gap-[2px]'>
            <div className='flex items-center gap-[4px]'>
              <div className='flex flex-col'>
                <Text
                  size='md'
                  className={classNames('font-bold !leading-[21.6px]', {
                    'items-center justify-center gap-1':
                      (activeChain === AGGREGATED_CHAIN_KEY || isChainAbstractionView) && token?.ibcChainInfo,
                  })}
                  data-testing-id={`switch-token-${tokenName.toLowerCase()}-ele`}
                >
                  {tokenName?.length > 20 ? sliceWord(tokenName, 6, 6) : tokenName}
                </Text>
                {parseFloat(token.amount) > 0 && (
                  <Text size='xs' className='font-medium !leading-[19.2px]' color='text-gray-600 dark:text-gray-400'>
                    {formatTokenAmount(
                      token.amount,
                      sliceWord(token.symbol, 4, 4),
                      3,
                      currencyDetail[preferredCurrency].locale,
                    )}
                  </Text>
                )}
              </div>
              {_showRedirection ? (
                <button onClick={handleRedirectionClick} className='text-gray-400'>
                  <ArrowSquareOut size={16} className='!text-md !leading-[20px]' />
                </button>
              ) : null}

              {showAddressCopy ? (
                <>
                  {!isAddressCopied ? (
                    <button onClick={handleContentCopyClick} className='text-gray-400'>
                      <CopySimple size={16} />
                    </button>
                  ) : (
                    <button className='text-gray-400 text-xs font-bold ml-[0.5px]'>copied</button>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>

        {hideAmount === false && (
          <div className='flex flex-col items-end gap-y-0.5'>
            {formattedFiatValue !== '-' && (
              <Text size='sm' className='font-bold !leading-[19.6px]'>
                {formattedFiatValue}
              </Text>
            )}
            <div className='text-xs !leading-[19.2px] font-medium text-gray-600 dark:text-gray-400'>
              {marketDataForToken?.price_change_percentage_24h ? (
                <div
                  className={classNames('text-xs font-medium !leading-[18px]', {
                    'text-green-500 dark:text-green-500': marketDataForToken.price_change_percentage_24h >= 0,
                    'text-red-600 dark:text-red-400': marketDataForToken.price_change_percentage_24h < 0,
                  })}
                >
                  {marketDataForToken.price_change_percentage_24h > 0 ? '+' : ''}
                  {formatPercentAmount(new BigNumber(marketDataForToken.price_change_percentage_24h).toString(), 2)}%
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const TokenCard = observer(TokenCardView);
