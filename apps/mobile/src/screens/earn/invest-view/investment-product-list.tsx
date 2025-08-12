import type { CategoryId, DappData, ProductData } from '@leapwallet/cosmos-wallet-hooks';
import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';

import { infoField } from '../types';
import { InvestmentProductItem } from './investment-product-item';

type InvestmentProductListProps = {
  dapps: DappData[];
  products: ProductData[];
  categoryId: CategoryId;
  sortBy: infoField;
};

export const InvestmentProductList: React.FC<InvestmentProductListProps> = ({
  products,
  dapps,
  categoryId,
  sortBy,
}) => {
  const categoryProducts = useMemo(() => {
    return products
      .filter((product) => {
        const productBelongsToCategory = product.dappCategory === categoryId;
        const productIsVisible = product.visible;
        const productsDappIsVisible =
          dapps.find((dapp) => {
            return product.chain === dapp.chain && product.dappName === dapp.name;
          })?.visible ?? false;
        return productBelongsToCategory && productIsVisible && productsDappIsVisible;
      })
      .sort((a, b) => {
        return Number(b[sortBy]) - Number(a[sortBy]);
      });
  }, [categoryId, dapps, products, sortBy]);

  // Build data for FlatList (exclude items with no dapp)
  const flatListData = categoryProducts
    .map((product) => {
      const productDapp = dapps.find(
        (dapp) => product.chain === dapp.chain && product.dappName === dapp.name,
      );
      if (!productDapp) return null;
      return { product, productDapp };
    })
    .filter(Boolean) as { product: ProductData; productDapp: DappData }[];

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={flatListData}
        keyExtractor={({ product }) =>
          `${product.chain}_${product.dappName}_${product.productName}`
        }
        renderItem={({ item }) => (
          <InvestmentProductItem
            product={item.product}
            productDapp={item.productDapp}
          />
        )}
        scrollEnabled={false} // Parent ScrollView handles scroll
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingVertical: 2 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff', // or '#212121' for dark mode, see note below
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6', // gray-100
  },
});
