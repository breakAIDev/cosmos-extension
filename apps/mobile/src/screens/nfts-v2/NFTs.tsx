import { NftPage, useAddress } from '@leapwallet/cosmos-wallet-hooks';
import React, { useState } from 'react';
import { View } from 'react-native'; // Import View for React Native

import { chainTagsStore } from '../../context/chain-infos-store';
import { nftStore } from '../../context/nft-store';

import { ChainNftsDetails, CollectionDetails, NftContextProvider, NftDetails, ShowNfts } from './index';

export default function NFTs() {
  // usePageView(PageName.NFT)

  const address = useAddress();
  const [activePage, setActivePage] = useState<NftPage>('ShowNfts');
  const value = { activePage, setActivePage };

  return (
    <View style={{ flex: 1 }}>
      <NftContextProvider value={value} key={address}>
        {activePage === 'ShowNfts' && (
          <ShowNfts nftStore={nftStore} chainTagsStore={chainTagsStore} />
        )}
        {activePage === 'CollectionDetails' && <CollectionDetails nftStore={nftStore} />}
        {activePage === 'NftDetails' && <NftDetails />}
        {activePage === 'ChainNftsDetails' && <ChainNftsDetails nftStore={nftStore} />}
      </NftContextProvider>
    </View>
  );
}
