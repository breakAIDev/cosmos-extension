import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { sliceAddress, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { CaretRight } from 'phosphor-react-native';
import { nameServices, useNameServiceResolver } from '../../../../hooks/nameService/useNameService';
import { useActiveChain } from '../../../../hooks/settings/useActiveChain';
import { useSelectedNetwork } from '../../../../hooks/settings/useNetwork';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { Images } from '../../../../../assets/images';
import { GenericLight } from '../../../../../assets/images/logos';
import { SelectedAddress } from '../../../send/types';
import { AggregatedSupportedChain } from '../../../../types/utility';
import { Bech32Address } from '../../../../utils/bech32';

const NameServiceItemSkeleton = () => (
  <View style={styles.skeletonRow}>
    <View style={styles.skeletonCircle} />
    <View style={styles.skeletonLines}>
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineShort} />
    </View>
  </View>
);

type MatchListItemProps = {
  address: string;
  title: string;
  nameServiceImg: any; // ImageSourcePropType
  chainIcon?: any;
  handleClick: () => void;
};
const MatchListItem: React.FC<MatchListItemProps> = ({
  address,
  title,
  handleClick,
}) => (
  <TouchableOpacity style={styles.matchRow} onPress={handleClick} activeOpacity={0.85}>
    <View style={styles.matchLeft}>
      <Image
        source={{uri: Images.Misc.getWalletIconAtIndex(0)}}
        style={styles.avatar}
      />
      <View style={styles.matchTextBox}>
        <Text style={styles.matchTitle}>{title}</Text>
        <Text style={styles.matchAddress}>{sliceAddress(address)}</Text>
      </View>
    </View>
    <CaretRight size={20} color="#ADB5BD" weight="regular" />
  </TouchableOpacity>
);

type NameServiceMatchListProps = {
  address: string;
  handleContactSelect: (contact: SelectedAddress) => void;
};

const NameServiceMatchList: React.FC<NameServiceMatchListProps> = ({
  address,
  handleContactSelect,
}) => {
  const network = useSelectedNetwork();
  const chainInfos = useChainInfos();
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const chains = useGetChains();

  const [isLoading, nameServiceResults] = useNameServiceResolver(address, network);

  // Convert result to a flat list for FlatList
  const resultsList: Array<{
    key: string;
    title: string;
    address: string;
    nameService: string;
    nameServiceImg: any;
    chainIcon?: any;
    chainName?: string;
    chain_id?: string;
    info?: any;
  }> = useMemo(() => {
    const entries = Object.entries(nameServiceResults);
    let results: any[] = [];

    for (const [nameService, result] of entries) {
      const nameServiceImg = Images.Logos.getNameServiceLogo(nameService);
      if (result && typeof result === 'string') {
        const chain = Bech32Address.getChainKey(result);
        results.push({
          key: `${nameService}-${result}`,
          title: nameService,
          address: result,
          nameService,
          nameServiceImg,
          chainIcon: chain ? chainInfos[chain].chainSymbolImageUrl ?? GenericLight : GenericLight,
          chainName: chain ? chainInfos[chain].chainName : 'Chain',
          chain_id: chain ? chainInfos[chain].chainName : null,
          info: {
            nameService: nameServices[nameService],
            chain_id: chain ? chainInfos[chain].chainName : null,
          },
        });
      } else if (result && Array.isArray(result)) {
        for (const { chain_id, address: resolvedAddress } of result) {
          const chain = Bech32Address.getChainKey(resolvedAddress);
          const chainDetails = Object.values(chainInfos).find((chain) => chain.chainId === chain_id);
          const chainImage = chainDetails?.chainSymbolImageUrl ?? GenericLight;
          let shouldShow = true;
          if (activeChain !== 'aggregated') {
            if (chains[activeChain]?.evmOnlyChain) {
              if (chainDetails?.key !== activeChain) shouldShow = false;
            } else {
              if (resolvedAddress.startsWith('0x')) shouldShow = false;
            }
          }
          if (shouldShow) {
            results.push({
              key: `${nameService}-${chain_id}-${resolvedAddress}`,
              title: chainDetails?.chainName ?? nameService,
              address: resolvedAddress,
              nameService,
              nameServiceImg,
              chainIcon: chainImage,
              chainName: chainDetails?.chainName ?? 'Chain',
              chain_id,
              info: {
                nameService: nameServices[nameService],
                chain_id,
              },
            });
          }
        }
      }
    }
    return results;
  }, [nameServiceResults, chainInfos, activeChain, chains]);

  const showNoResult =
    !isLoading && (!resultsList || resultsList.length === 0);

  return (
    <View style={styles.wrapper}>
      {isLoading ? (
        <View style={{ marginTop: 16 }}>
          <NameServiceItemSkeleton />
        </View>
      ) : showNoResult ? (
        <Text style={styles.noResultText}>
          No results found in any name service
        </Text>
      ) : (
        <FlatList
          data={resultsList}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <MatchListItem
              address={item.address}
              title={item.title}
              nameServiceImg={item.nameServiceImg}
              chainIcon={item.chainIcon}
              handleClick={() => {
                handleContactSelect({
                  avatarIcon: item.nameServiceImg,
                  chainIcon: item.chainIcon,
                  chainName: item.chainName as string,
                  name: address,
                  address: item.address,
                  emoji: undefined,
                  selectionType: 'nameService',
                  information: item.info,
                });
              }}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    minHeight: 10,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 2,
    backgroundColor: 'transparent',
  },
  matchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  matchTextBox: {
    flexDirection: 'column',
  },
  matchTitle: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
    textTransform: 'capitalize',
  },
  matchAddress: {
    color: '#8c8c8c',
    fontSize: 13,
    marginTop: 2,
  },
  noResultText: {
    marginTop: 22,
    color: '#f87171',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  skeletonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  skeletonLines: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
  },
  skeletonLine: {
    width: 100,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginBottom: 6,
  },
  skeletonLineShort: {
    width: 80,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
});

export default NameServiceMatchList;
