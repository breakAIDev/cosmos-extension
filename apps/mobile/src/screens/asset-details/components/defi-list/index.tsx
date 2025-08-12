import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useInvestData } from '@leapwallet/cosmos-wallet-hooks';
import { BigNumber } from 'bignumber.js';
import { CaretRight } from 'phosphor-react-native';
import Text from '../../../../components/text'; // Ensure this is a React Native Text component
import { LEAPBOARD_URL } from '../../../../services/config/constants';

import DefiRow from '../DefiRow/DefiRow';
import { SortingButton } from '../DefiRow/SortingButton';
import { CardDivider } from '@leapwallet/leap-ui';

function sortByDefiName(a: any, b: any) {
  return b?.productName?.toLowerCase() <= a?.productName?.toLowerCase() ? -1 : 1;
}
function sortByDefiType(a: any, b: any) {
  return b?.dappCategory?.toLowerCase() <= a?.dappCategory?.toLowerCase() ? -1 : 1;
}
function sortByDefiTvl(a: any, b: any) {
  return new BigNumber(b?.tvl ?? '0').comparedTo(a?.tvl);
}
function sortByDefiApr(a: any, b: any) {
  return new BigNumber(b?.apr ?? '0').comparedTo(a?.apr);
}

function DefiList({ tokenName }: { tokenName: string }) {
  const [selectedSortBy, setSelectedSortBy] = useState<string>('apr');
  const [sortingDirection, setSortingDirection] = useState<string>('dsc');
  const [searchInput] = useState<string>(tokenName);

  const investData: any = useInvestData();
  const { products: _products } = investData?.data ?? { products: undefined };

  const data = useMemo(() => {
    return Object.values(_products || {}).filter((d: any) => d?.visible);
  }, [_products]);

  const sortedTokens = useMemo(() => {
    return data
      ?.filter((a: any) => {
        return a?.tokens?.map((t: any) => t?.toUpperCase())?.indexOf(searchInput?.trim()?.toUpperCase()) !== -1;
      })
      ?.sort((a: any, b: any) => {
        let sortOrder = -1;
        switch (selectedSortBy) {
          case 'dappCategory': sortOrder = sortByDefiType(a, b); break;
          case 'tvl': sortOrder = sortByDefiTvl(a, b); break;
          case 'apr': sortOrder = sortByDefiApr(a, b); break;
          case 'productName':
          default: sortOrder = sortByDefiName(a, b); break;
        }
        return sortingDirection === 'asc' ? -1 * sortOrder : sortOrder;
      });
  }, [data, searchInput, selectedSortBy, sortingDirection]);

  if (!investData?.data || sortedTokens.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text size='sm' style={styles.headerText}>{`Top ${tokenName.toUpperCase()} Yields`}</Text>
      </View>
      <View style={styles.defiListBox}>
        <View style={styles.gridRow}>
          <SortingButton
            sortBy={selectedSortBy}
            sortDir={sortingDirection}
            setSortDir={setSortingDirection}
            setSortBy={setSelectedSortBy}
            label='Name'
            sortName='productName'
            style={styles.sortBtn}
          />
          <SortingButton
            sortBy={selectedSortBy}
            sortDir={sortingDirection}
            setSortDir={setSortingDirection}
            setSortBy={setSelectedSortBy}
            label='TVL'
            sortName='tvl'
            style={styles.sortBtn}
          />
          <SortingButton
            sortBy={selectedSortBy}
            sortDir={sortingDirection}
            setSortDir={setSortingDirection}
            setSortBy={setSelectedSortBy}
            label='APR'
            sortName='apr'
            style={styles.sortBtn}
          />
          <View style={{ flex: 1 }} />
        </View>
        <ScrollView>
          {sortedTokens?.map((token: any, i: number) => (
            <React.Fragment key={token?.productName + token?.chain}>
              <CardDivider />
              <DefiRow token={token} />
            </React.Fragment>
          ))}
          <CardDivider />
        </ScrollView>
        <TouchableOpacity
          style={styles.viewAllRow}
          activeOpacity={0.7}
          onPress={() => Linking.openURL(`${LEAPBOARD_URL}/explore/defi`)}
        >
          <Text size='sm' style={styles.viewAllText}>
            View All
          </Text>
          <CaretRight size={20} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  headerRow: { borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  headerText: { fontWeight: 'bold', color: '#666' },
  defiListBox: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
    marginBottom: 16,
    paddingBottom: 8,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 4,
  },
  sortBtn: { flex: 2, height: 40, justifyContent: 'center', alignItems: 'center' },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 12,
    marginRight: 8,
  },
  viewAllText: {
    fontWeight: 'bold',
    color: '#888',
    marginRight: 4,
  },
});

export default DefiList;
