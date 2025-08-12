import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import BigNumber from 'bignumber.js';
import currency from 'currency.js';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { observer } from 'mobx-react-lite';

import { useActiveStakingDenom, useSelectedNetwork, useValidatorImage, sliceWord, SelectedNetwork } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk';

import { useActiveChain } from '../../../hooks/settings/useActiveChain';
// Replace these with your React Native modal and button components:
import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import { Images } from '../../../../assets/images';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { SearchInput } from '../../../components/ui/input/search-input';
import Sort from '../../../../assets/icons/sort';
import ValidatorListSkeleton from '../../../components/Skeletons/ValidatorListSkeleton';
import SelectSortBySheet from './SelectSortBySheet';

// ----------- Types -----------
export type STAKE_SORT_BY = 'Amount staked' | 'APR' | 'Random';

type SelectValidatorSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  onValidatorSelect: (validator: Validator) => void;
  validators: Validator[];
  apr?: Record<string, number>;
  selectedValidator?: Validator;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
};

// ----------- ValidatorCard -----------
const ValidatorCard = observer(({
  validator,
  onPress,
  activeChain,
  activeNetwork,
  isSelected,
}: {
  validator: Validator;
  onPress: () => void;
  activeChain?: SupportedChain;
  activeNetwork?: SelectedNetwork;
  isSelected?: boolean;
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [activeStakingDenom] = useActiveStakingDenom(rootDenomsStore.allDenoms, activeChain, activeNetwork);
  const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator);
  const imageUrl = validator?.image || validatorImage || Images.Misc.Validator;

  const moniker = useMemo(
    () => sliceWord(
      validator.moniker,
      26 + Math.floor(((Math.min(400, 400) - 320) / 81) * 7), // Static for RN, could adjust
      0
    ),
    [validator.moniker]
  );
  const tokens = useMemo(
    () => `${currency((validator.delegations?.total_tokens_display ?? validator.tokens ?? '') as string, {
      symbol: '',
      precision: 0,
    }).format()} ${activeStakingDenom.coinDenom}`,
    [activeStakingDenom.coinDenom, validator]
  );
  const commission = useMemo(
    () => validator.commission?.commission_rates.rate
      ? `${new BigNumber(validator.commission.commission_rates.rate).multipliedBy(100).toFixed(0)}%`
      : 'N/A',
    [validator]
  );
  const isPromoted = validator.custom_attributes?.priority !== undefined && validator.custom_attributes.priority >= 1;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isPromoted && styles.cardPromoted,
        isSelected && styles.selectedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.avatarBox}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.avatar}
          onLoadEnd={() => setIsImageLoaded(true)}
        />
        {!isImageLoaded && (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item width={36} height={36} borderRadius={18} />
          </SkeletonPlaceholder>
        )}
      </View>
      <View style={styles.middleCol}>
        <Text style={styles.moniker}>{moniker}</Text>
        {isPromoted && <Text style={styles.promoted}>Promoted</Text>}
      </View>
      <View style={styles.rightCol}>
        <Text style={styles.tokens}>{tokens}</Text>
        <Text style={styles.commission}>Commission: {commission}</Text>
      </View>
    </TouchableOpacity>
  );
});

// ----------- Main SelectValidatorSheet -----------
const SelectValidatorSheet = observer((props: SelectValidatorSheetProps) => {
  const {
    isVisible,
    onClose,
    onValidatorSelect,
    validators,
    apr,
    selectedValidator,
    forceChain,
    forceNetwork,
  } = props;

  const [searchedTerm, setSearchedTerm] = useState('');
  const [sortBy, setSortBy] = useState<STAKE_SORT_BY>('Random');
  const [isLoading, setIsLoading] = useState(false);
  const [showSortBy, setShowSortBy] = useState(false);

  const _activeChain = useActiveChain();
  const _activeNetwork = useSelectedNetwork();
  const activeChain = forceChain ?? _activeChain;
  const activeNetwork = forceNetwork ?? _activeNetwork;

  // Sorting & Filtering
  const [activeValidators, inactiveValidators] = useMemo(() => {
    setIsLoading(true);
    const filteredValidators = validators.filter(
      (validator) =>
        validator.moniker.toLowerCase().includes(searchedTerm.toLowerCase()) ||
        validator.address.includes(searchedTerm),
    );
    filteredValidators.sort((a, b) => {
      switch (sortBy) {
        case 'Amount staked':
          return +(a.tokens ?? '') < +(b.tokens ?? '') ? 1 : -1;
        case 'APR':
          return apr ? (apr[a.address] < apr[b.address] ? 1 : -1) : 0;
        case 'Random':
        default:
          return Math.random() - 0.5;
      }
    });
    const _activeValidators = filteredValidators.filter((validator) => validator.active !== false);
    const _inactiveValidators = filteredValidators.filter((validator) => validator.active === false);
    setIsLoading(false);
    return [_activeValidators, searchedTerm ? _inactiveValidators : []];
  }, [validators, searchedTerm, sortBy, apr]);

  // List items: active then (optional) inactive
  const listItems = useMemo(() => {
    const items: (Validator | { itemType: 'inactiveHeader' })[] = [...activeValidators];
    if (inactiveValidators.length > 0) {
      items.push({ itemType: 'inactiveHeader' });
      items.push(...inactiveValidators);
    }
    return items;
  }, [activeValidators, inactiveValidators]);

  const renderItem = useCallback(
    ({ item }: { item: Validator | { itemType: 'inactiveHeader' } }) => {
      if ('itemType' in item) {
        return (
          <Text style={{ marginVertical: 8, color: '#aaa', fontSize: 13, fontWeight: '600' }}>
            Inactive Validator
          </Text>
        );
      }
      return (
        <ValidatorCard
          validator={item}
          onPress={() => onValidatorSelect(item)}
          activeChain={activeChain}
          activeNetwork={activeNetwork}
          isSelected={selectedValidator?.address === item.address}
        />
      );
    },
    [onValidatorSelect, selectedValidator?.address, activeChain, activeNetwork]
  );

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      title="Select Validator"
    >
      <View style={styles.container}>
        {/* Search Input & Sort */}
        <View style={styles.searchRow}>
          <SearchInput
            value={searchedTerm}
            onChangeText={setSearchedTerm}
            style={styles.input}
            placeholder="Enter validator name"
            placeholderTextColor="#888"
            onClear={() => setSearchedTerm('')}
          />
          <Button
            onPress={() => setShowSortBy(true)}
            style={styles.sortBtn} children={<Sort size={20} />} />
        </View>

        {/* List */}
        {isLoading ? (
          <ValidatorListSkeleton />
        ) : listItems.length === 0 ? (
          <SelectSortBySheet
            onClose={() => setShowSortBy(false)}
            isVisible={showSortBy}
            setVisible={setShowSortBy}
            setSortBy={setSortBy}
            sortBy={sortBy}
            activeChain={activeChain}
          />
        ) : (
          <FlatList
            data={listItems}
            renderItem={renderItem}
            keyExtractor={(item, idx) => 'itemType' in item ? 'inactive' + idx : item.address}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )}
      </View>
    </BottomModal>
  );
});

export default SelectValidatorSheet;

// ----------- Styles -----------
const styles = StyleSheet.create({
  container: {
    padding: 18,
    flex: 1,
    backgroundColor: '#FFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#F7F8FA',
    fontSize: 16,
  },
  sortBtn: {
    marginLeft: 10,
    minWidth: 64,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F3F4F6',
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderRadius: 16,
  },
  cardPromoted: {
    borderWidth: 1,
    borderColor: '#7ED957',
    backgroundColor: '#f6fff5',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2250C5',
    backgroundColor: '#E9EEFB',
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  middleCol: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  moniker: {
    fontWeight: '700',
    fontSize: 15,
    color: '#222',
  },
  promoted: {
    fontSize: 12,
    color: '#1abc75',
    fontWeight: '600',
    marginTop: 2,
  },
  rightCol: {
    minWidth: 85,
    alignItems: 'flex-end',
    flexDirection: 'column',
    gap: 2,
  },
  tokens: {
    fontWeight: '600',
    fontSize: 15,
    color: '#343b4f',
  },
  commission: {
    fontSize: 12,
    color: '#888',
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 32,
  },
});

