import type { CategoryId, InvestData } from '@leapwallet/cosmos-wallet-hooks';
import React, { useMemo, useState } from 'react';

import { TxFee } from '../../../../assets/images/activity'; // If SVG: ensure react-native-svg import
import { HelpIcon } from '../../../../assets/images/misc'; // PNG/SVG, adjust as needed

import { DisplaySettings } from '../types';
import { InvestmentProductList } from './investment-product-list'; // Your RN version
import BottomModal from '../../../components/bottom-modal'; // Your RN modal

import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';

type InvestViewProps = {
  data: InvestData;
  displaySettings: DisplaySettings;
};

export const InvestView: React.FC<InvestViewProps> = ({ data, displaySettings }) => {
  const [showDescription, setShowDescription] = useState<CategoryId | undefined>(undefined);

  const { dappCategories, dapps: _dapps, products: _products, disclaimer } = data;

  const dapps = useMemo(() => Object.values(_dapps), [_dapps]);
  const products = useMemo(() => Object.values(_products), [_products]);

  const visibleDappCategories = useMemo(() => {
    return Object.entries(dappCategories)
      .filter(([categoryId, categoryData]) => {
        if (!categoryData.visible) return false;
        if (
          !products.some((product) => {
            const productBelongsToCategory = product.dappCategory === categoryId;
            const productIsVisible = product.visible;
            const productsDappIsVisible =
              dapps.find((dapp) => {
                return product.chain === dapp.chain && product.dappName === dapp.name;
              })?.visible ?? false;
            return productBelongsToCategory && productIsVisible && productsDappIsVisible;
          })
        ) {
          return false;
        }
        return true;
      })
      .sort(([, a], [, b]) => a.position - b.position);
  }, [dappCategories, dapps, products]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        {visibleDappCategories.map(([categoryId, categoryData], index) => {
          const isFirstOfList = index === 0;

          return (
            <View key={categoryId}>
              {isFirstOfList ? (
                <View style={styles.categoryHeader}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>{categoryData.label}</Text>
                    <TouchableOpacity
                      onPress={() => setShowDescription(categoryId)}
                    >
                      <Image source={{uri: HelpIcon}} style={styles.helpIcon} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.value}>TVL</Text>
                  <Text style={styles.value}>APR</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.label, { color: '#d1d5db' } /* gray-300 */]}>
                    {categoryData.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDescription(categoryId)}
                  >
                    <Image source={{uri: HelpIcon}} style={styles.helpIcon} />
                  </TouchableOpacity>
                </View>
              )}

              <InvestmentProductList
                dapps={dapps}
                products={products}
                categoryId={categoryId}
                sortBy={displaySettings.sortBy}
              />
            </View>
          );
        })}

        <View>
          <Text style={styles.disclaimerTitle}>Disclaimer</Text>
          <Text style={styles.disclaimerText}>{disclaimer}</Text>
        </View>
      </View>

      <BottomModal
        title="Earn Section Help"
        isOpen={!!showDescription}
        onClose={() => setShowDescription(undefined)}
        closeOnBackdropClick={true}
      >
        {showDescription ? (
          <View style={styles.modalContent}>
            <Image source={{uri: TxFee}} style={styles.modalIcon} resizeMode="contain" />
            <Text style={styles.modalTitle}>
              What are {dappCategories[showDescription].label}?
            </Text>
            <Text style={styles.modalDescription}>
              {dappCategories[showDescription].description}
            </Text>
          </View>
        ) : null}
      </BottomModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    marginVertical: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 184,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151', // gray-700
  },
  helpIcon: {
    marginLeft: 8,
    opacity: 0.4,
    width: 14,
    height: 14,
  },
  value: {
    flex: 1,
    color: '#9ca3af', // gray-400
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  disclaimerTitle: {
    color: '#9ca3af', // gray-400
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 16,
  },
  disclaimerText: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 4,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#1f2937', // gray-900
    fontWeight: 'bold',
    marginTop: 16,
    fontSize: 16,
  },
  modalDescription: {
    color: '#6b7280', // gray-500
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalIcon: {
    width: 48,
    height: 48,
    opacity: 0.5,
    marginBottom: 8,
  },
});