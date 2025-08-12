import React, { useCallback, useMemo, useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { formatPercentAmount, sliceWord, useProviderApr } from '@leapwallet/cosmos-wallet-hooks';
import { Provider } from '@leapwallet/cosmos-wallet-sdk';
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { Info } from 'phosphor-react-native';
import { EmptyCard } from '../../../components/empty-card';
import BottomModal from '../../../components/new-bottom-modal';
import ValidatorListSkeleton from '../../../components/Skeletons/ValidatorListSkeleton';
// import Text from '../../../components/text'; // If you want your custom Text, import and use instead of RN Text.
import { Images } from '../../../../assets/images';
import { GenericLight } from '../../../../assets/images/logos';
import { observer } from 'mobx-react-lite';
// Tooltip/ProviderTooltip assumed to be RN components. Replace with RN/overlay as needed.
import ProviderTooltip from './ProviderTooltip';
import { rootDenomsStore } from '../../../context/denoms-store-instance';

type SelectProviderSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  onProviderSelect: (provider: Provider) => void;
  providers: Provider[];
};

type ProviderCardProps = {
  provider: Provider;
  onPress: () => void;
  rootDenomsStore: RootDenomsStore;
};

export const ProviderCard = observer(({ provider, onPress, rootDenomsStore }: ProviderCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { apr } = useProviderApr(provider.provider, rootDenomsStore.allDenoms);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.providerCard}
      activeOpacity={0.8}
    >
      <Image
        source={{uri: Images.Misc.Validator}}
        onError={() => {}} // Handle as needed for your image assets
        style={styles.providerImg}
        width={36}
        height={36}
      />
      <View style={styles.providerInfo}>
        <Text style={styles.providerMoniker} numberOfLines={1} ellipsizeMode="tail">
          {sliceWord(provider.moniker, 25, 0)}
        </Text>
        {provider.specs.length > 0 && (
          <Text style={styles.providerSpecs}>{`${provider.specs.length} Services`}</Text>
        )}
      </View>
      <View style={styles.providerRight}>
        <TouchableOpacity
          onPress={() => setShowTooltip(true)}
          style={styles.infoBtn}
          hitSlop={12}
        >
          <Info size={18} color="#94a3b8" />
        </TouchableOpacity>
        {parseFloat(apr ?? '0') > 0 && (
          <Text style={styles.providerAPR}>
            Estimated APR <Text style={styles.providerAprBold}>{formatPercentAmount(apr ?? '', 1)}</Text>%
          </Text>
        )}
        {/* Tooltip modal/overlay */}
        {showTooltip && (
          <ProviderTooltip provider={provider} onClose={() => setShowTooltip(false)} />
        )}
      </View>
    </TouchableOpacity>
  );
});

const InactiveHeader = () => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ color: '#64748b', fontSize: 12 }}>Inactive Provider</Text>
  </View>
);

const SelectProviderSheet = observer(({
  isVisible,
  onClose,
  onProviderSelect,
  providers,
}: SelectProviderSheetProps) => {
  const [searchedTerm, setSearchedTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get filtered and grouped providers
  const [activeProviders, inactiveProviders] = useMemo(() => {
    setIsLoading(true);
    const _filteredProviders = providers
      .filter((provider) => provider.moniker && provider.moniker.toLowerCase().includes(searchedTerm.toLowerCase()))
      .slice(0, 100);
    _filteredProviders.sort(() => Math.random() - 0.5);
    const _activeProviders = _filteredProviders.filter((provider) => provider.stakestatus === 'Active');
    const _inactiveProviders = _filteredProviders.filter((provider) => provider.stakestatus === 'Inactive');
    setIsLoading(false);
    return [_activeProviders, searchedTerm ? _inactiveProviders : []];
  }, [providers, searchedTerm]);

  // List items for FlatList
  const listItems = useMemo(() => {
    const items: (Provider | { itemType: 'inactiveHeader' })[] = [...activeProviders];
    if (inactiveProviders.length > 0) {
      items.push({ itemType: 'inactiveHeader' });
      items.push(...inactiveProviders);
    }
    return items;
  }, [activeProviders, inactiveProviders]);

  const renderItem = useCallback(
    ({ item }: { item: Provider | { itemType: 'inactiveHeader' } }) => {
      if ('itemType' in item) {
        return <InactiveHeader />;
      }
      return (
        <ProviderCard
          provider={item}
          onPress={() => onProviderSelect(item)}
          rootDenomsStore={rootDenomsStore}
        />
      );
    },
    [onProviderSelect]
  );

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={() => {
        setSearchedTerm('');
        onClose();
      }}
      title="Select Provider"
      containerStyle={styles.modalContainer}
      contentStyle={styles.modalContent}
    >
      <View style={styles.searchInputWrap}>
        <TextInput
          value={searchedTerm}
          onChangeText={setSearchedTerm}
          placeholder="Enter provider name"
          style={styles.searchInput}
          clearButtonMode="always"
        />
      </View>
      {isLoading && <ValidatorListSkeleton />}
      {!isLoading && listItems.length === 0 && (
        <EmptyCard
          isRounded
          subHeading="Try a different search term"
          src={Images.Misc.Explore}
          heading={`No providers found for '${searchedTerm}'`}
        />
      )}
      {!isLoading && listItems.length > 0 && (
        <FlatList
          data={listItems}
          renderItem={renderItem}
          keyExtractor={(item, idx) =>
            'itemType' in item ? `inactive-${idx}` : (item as Provider).provider
          }
          style={{ flex: 1, width: '100%', paddingBottom: 8 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F1F5F9',
  },
  modalContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 28,
  },
  searchInputWrap: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 40,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 14,
    borderRadius: 16,
    width: '100%',
    backgroundColor: '#e2e8f0', // secondary-100
  },
  providerImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  providerInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  providerMoniker: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'left',
    color: '#0F172A',
    marginBottom: 1,
  },
  providerSpecs: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  providerRight: {
    flexDirection: 'column',
    gap: 2,
    alignItems: 'flex-end',
    minWidth: 90,
  },
  infoBtn: {
    marginBottom: 4,
    padding: 4,
  },
  providerAPR: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  providerAprBold: {
    fontWeight: 'bold',
  },
});

export default SelectProviderSheet;
