import { sortStringArr } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useChainPageInfo } from '../../../hooks';
import { useChainInfos } from '../../../hooks/useChainInfos';
import { Images } from '../../../../assets/images';
import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { getChainName } from '../../../utils/getChainName';

import { Chip } from './index';

type SelectedSortsByChipsProps = {
  selectedSortsBy: SupportedChain[];
  setSelectedSortsBy: React.Dispatch<React.SetStateAction<SupportedChain[]>>;
};

export function SelectedSortsByChips({ selectedSortsBy, setSelectedSortsBy }: SelectedSortsByChipsProps) {
  const chainInfos = useChainInfos();
  const { topChainColor } = useChainPageInfo();

  return (
    <ScrollView horizontal style={styles.scroll} contentContainerStyle={styles.scrollContent} showsHorizontalScrollIndicator={false}>
      {sortStringArr(selectedSortsBy).map((chain) => {
        const chainInfo = chainInfos[chain as SupportedChain];

        return (
          <View key={chain} style={styles.chipWrap}>
            <Chip style={styles.chip}>
              <Chip.Image
                source={{ uri: chainInfo.chainSymbolImageUrl }}
                style={styles.logo}
              />
              <Chip.Text
                style={styles.chainText}
                numberOfLines={1}
              >
                {getChainName(chainInfo.chainName)}
              </Chip.Text>
              <TouchableOpacity
                onPress={() =>
                  setSelectedSortsBy((prevValue) => prevValue.filter((prevChain) => prevChain !== chain))
                }
              >
                <Chip.Image
                  source={{uri: Images.Misc.Cross}}
                  style={styles.cross}
                />
              </TouchableOpacity>
            </Chip>
          </View>
        );
      })}

      <View style={styles.chipWrap}>
        <TouchableOpacity onPress={() => setSelectedSortsBy([])}>
          <Chip style={[styles.resetChip, { borderColor: topChainColor }]}>
            <Chip.Text style={[styles.resetText, { color: topChainColor }]}>
              Reset
            </Chip.Text>
          </Chip>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 16,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipWrap: {
    marginRight: 12,
  },
  chip: {
    backgroundColor: '#f3f4f6', // bg-gray-100
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    minWidth: 125,
  },
  logo: {
    width: 15,
    height: 15,
    marginRight: 8,
    borderRadius: 8,
  },
  chainText: {
    color: '#18181b',
    fontSize: 14,
    maxWidth: 90,
    flexShrink: 1,
  },
  cross: {
    width: 12,
    height: 12,
    marginLeft: 8,
  },
  resetChip: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  resetText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
