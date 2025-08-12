import { useNonNativeCustomChains } from '../../../hooks';
import { useChainInfos } from '../../../hooks/useChainInfos';
import { useCoingeckoChains } from '../../../hooks/useCoingeckoChains';
import React, { useState } from 'react';
import { Image } from 'react-native';

export default function ListingImage({
  ecosystemFilter,
  categoryFilter,
  image,
}: {
  ecosystemFilter: string | undefined;
  categoryFilter: string | undefined;
  image: string | undefined;
}) {
  const { chains } = useCoingeckoChains();
  const nativeChains = useChainInfos();
  const nonNative = useNonNativeCustomChains();

  const nativeChainsList = Object.values(nativeChains);
  const nonNativeChainsList = Object.values(nonNative);

  const coingeckoChain = ecosystemFilter
    ? chains.find((chain) => chain.name.toLowerCase().startsWith(ecosystemFilter.toLowerCase().split(' ')[0]))
    : null;

  const chain = ecosystemFilter
    ? [...nativeChainsList, ...nonNativeChainsList].find((chain) =>
        chain.chainName.toLowerCase().startsWith(ecosystemFilter.toLowerCase().split(' ')[0]),
      )
    : null;

  const icon =
    chain?.chainSymbolImageUrl ??
    coingeckoChain?.image?.small ??
    coingeckoChain?.image?.large ??
    `https://placehold.co/40x40?text=${categoryFilter}`;

  // Use local state for fallback if image load fails
  const [src, setSrc] = useState(image || icon);

  return (
    <Image
      source={{ uri: src }}
      style={{ width: '100%', height: '100%', borderRadius: 8 }}
      resizeMode="cover"
      onError={() => {
        setSrc(icon);
      }}
      // Optionally add defaultPlaceholder here as last fallback
    />
  );
}
