import React, { useMemo, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, Text as RNText, StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CardDivider, ToggleCard} from '@leapwallet/leap-ui'; // Your React Native version
import { capitalize } from '../../utils/strings';
import { deleteChainStore } from '../../context/delete-chain-store';
import type { ManageChainSettings } from '../../context/manage-chains-store';
import { useActiveChain } from '../../hooks/settings/useActiveChain';
import { useChainInfos } from '../../hooks/useChainInfos';
import { GenericLight } from '../../../assets/images/logos';
import Text from '../text'; // Your custom Text component
import Fuse from 'fuse.js';

interface PropTypes {
  chains: ManageChainSettings[];
  searchQuery: string;
  
  updateChainFunction: (chainName: SupportedChain) => void;
  title?: string;
  drag?: any;
}

const BetaCard = ({ chain }: { chain: ManageChainSettings }) => {
  const chainInfos = useChainInfos();
  const img = chainInfos[chain.chainName]?.chainSymbolImageUrl;

  return (
    <View style={styles.betaCardContainer}>
      <Image
        source={{ uri: img ?? GenericLight}}
        style={styles.chainImage}
      />
      <View style={styles.infoCol}>
        <RNText numberOfLines={1} style={styles.chainName}>{chain.chainName}</RNText>
        <RNText style={styles.denom}>{capitalize(chain.denom)}</RNText>
      </View>
      <View style={{ flex: 1 }} />
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => deleteChainStore.setChainInfo(chain)}
      >
        <RNText style={styles.removeBtnText}>Remove</RNText>
      </TouchableOpacity>
    </View>
  );
};

const ManageChainDraggables = ({ drag, chains, searchQuery, updateChainFunction }: PropTypes) => {
  const [errorSwitch, setErrorSwitch] = useState(false);
  const [data, setData] = useState(chains);

  const activeChain = useActiveChain();
  const chainInfos = useChainInfos();

  const chainsFuse = useMemo(() => {
    return new Fuse(data, {
      threshold: 0.3,
      keys: ['chainName'],
    });
  }, [data]);

  const filteredChains = useMemo(() => {
    const clearSearchQuery = searchQuery.trim();
    if (!searchQuery) return data;
    return chainsFuse.search(clearSearchQuery).map((chain) => chain.item);
  }, [searchQuery, data, chainsFuse]);

  return (
    <View style={styles.dndContainer}>
      <DraggableFlatList
        data={filteredChains}
        onDragEnd={({ data }) => setData(data)}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        renderItem={({ item, drag, isActive }) => {
          const img = chainInfos[item.chainName].chainSymbolImageUrl;
          const isFirst = item.id === 0;
          const isLast = item.id === filteredChains.length - 1;
          return (
            <View>
              <ToggleCard
                imgSrc={img}
                isRounded={isLast || isFirst}
                size="lg"
                subtitle={
                  errorSwitch && activeChain === item.chainName
                    ? <Text style={{ color: '#FF707E' }}>Cannot disable a chain in use</Text>
                    : capitalize(item.denom)
                }
                title={capitalize(item.chainName)}
                onClick={() => {
                  if (activeChain === item.chainName) setErrorSwitch(true);
                  else {
                    setErrorSwitch(false);
                    updateChainFunction(item.chainName);
                  }
                }}
                isEnabled={item.active}
                onLongPress={drag}
                isActive={isActive}
              />
              {!isLast ? <CardDivider /> : null}
            </View>
          );
        }}
      />
    </View>
  );
};

const ManageChainNonDraggables = ({ chains, searchQuery, updateChainFunction, title }: PropTypes) => {
  const [errorSwitch, setErrorSwitch] = useState(false);
  const activeChain = useActiveChain();
  const chainInfos = useChainInfos();

  const chainsFuse = useMemo(() => {
    return new Fuse(chains, { threshold: 0.3, keys: ['chainName'] });
  }, [chains]);

  const filteredChains = useMemo(() => {
    const clearSearchQuery = searchQuery.trim();
    if (!searchQuery) return chains;
    return chainsFuse.search(clearSearchQuery).map((chain) => chain.item);
  }, [searchQuery, chains, chainsFuse]);

  return (
    <View style={styles.listContainer}>
      {title && (
        <Text size="xs" style={styles.listTitle}>
          {title}
        </Text>
      )}
      <FlatList
        data={filteredChains}
        keyExtractor={(item, idx) => item.id?.toString() ?? idx.toString()}
        renderItem={({ item, index }) => {
          if (item.beta) return <BetaCard chain={item} />;
          const img = chainInfos[item.chainName].chainSymbolImageUrl;
          const isFirst = index === 0;
          const isLast = index === filteredChains.length - 1;
          return (
            <ToggleCard
              imgSrc={img}
              isRounded={isLast || isFirst}
              size="lg"
              subtitle={
                errorSwitch && activeChain === item.chainName
                  ? <Text style={{ color: '#FF707E' }}>Cannot disable a chain in use</Text>
                  : capitalize(item.denom)
              }
              title={capitalize(item.chainName)}
              onClick={() => {
                if (activeChain === item.chainName) setErrorSwitch(true);
                else {
                  setErrorSwitch(false);
                  updateChainFunction(item.chainName);
                }
              }}
              isEnabled={item.active}
            />
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  betaCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 344,
    height: 76,
    marginVertical: 4,
  },
  chainImage: {
    width: 28,
    height: 28,
    marginRight: 12,
    borderRadius: 14,
  },
  infoCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    maxWidth: 160,
  },
  chainName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  denom: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  removeBtn: {
    backgroundColor: 'rgba(255, 112, 126, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  removeBtnText: {
    color: '#FF707E',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dndContainer: {
    borderRadius: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
  },
  listTitle: {
    paddingTop: 20,
    paddingHorizontal: 16,
    color: '#374151',
    fontWeight: '500',
  },
});

export { ManageChainDraggables, ManageChainNonDraggables };