import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { X } from 'phosphor-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Button, type Size } from '../../../../components/ui/button';
import { SearchInput } from '../../../../components/ui/input/search-input';
import { useQueryParams } from '../../../../hooks/useQuery';
import { SearchIcon } from '../../../../../assets/icons/search-icon';
import { TuneIcon } from '../../../../../assets/icons/tune-icon';
import { queryParams } from '../../../../utils/query-params';

export enum StatusFilter {
  Live = 'live',
  Upcoming = 'upcoming',
  Ended = 'ended',
};

const quickFilters = [
  { label: 'Live', value: StatusFilter.Live },
  { label: 'Upcoming', value: StatusFilter.Upcoming },
  { label: 'Ended', value: StatusFilter.Ended },
];

// ----------- FilterButton --------------
type FilterButtonProps = {
  size?: Size;
  children: any;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const FilterButton = (props: FilterButtonProps) => (
  <Button
    variant="secondary"
    size={props.size}
    onPress={props.onPress}
    style={[
      styles.filterBtn,
      props.style,
    ]}
    textStyle={[
      styles.filterBtnText,
    ]}
  >
    {props.children}
  </Button>
);

// ----------- Searchbar --------------
type SearchbarProps = {
  showSearch: boolean;
  setSearch: (search: string) => void;
  searchValue?: string;
};0

export const Searchbar = ({
  showSearch,
  setSearch,
  searchValue,
}: SearchbarProps) => (
  <AnimatePresence>
    {showSearch && (
      <MotiView
        from={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 48 }}
        exit={{ opacity: 0, height: 0 }}
        style={styles.searchInputWrapper}
        transition={{ type: 'timing', duration: 250 }}
      >
        <SearchInput
          autoFocus
          style={styles.searchInput}
          placeholder="Search..."
          value={searchValue}
          onClear={() => setSearch('')}
          onChangeText={setSearch}
        />
      </MotiView>
    )}
  </AnimatePresence>
);

// ----------- SearchToggleIcon --------------
export const SearchToggleIcon = (props: { showSearch: boolean; style?: StyleProp<ViewStyle> }) => (
  <AnimatePresence>
    {props.showSearch ? (
      <MotiView
        key="search"
        from={{ opacity: 0, scale: 0.95, rotateZ: '90deg' }}
        animate={{ opacity: 1, scale: 1, rotateZ: '0deg' }}
        exit={{ opacity: 0, scale: 0.95, rotateZ: '90deg' }}
        transition={{ type: 'timing', duration: 250 }}
        style={styles.iconWrapper}
      >
        <X size={20} color="#374151" />
      </MotiView>
    ) : (
      <MotiView
        key="clear"
        from={{ opacity: 0, scale: 0.95, rotateZ: '90deg' }}
        animate={{ opacity: 1, scale: 1, rotateZ: '0deg' }}
        exit={{ opacity: 0, scale: 0.95, rotateZ: '90deg' }}
        transition={{ type: 'timing', duration: 250 }}
        style={styles.iconWrapper}
      >
        <SearchIcon size={20} color="#374151" />
      </MotiView>
    )}
  </AnimatePresence>
);

// ----------- Main Filters Component --------------
type ChadExclusivesFiltersProps = {
  style?: ViewStyle;
  setIsFilterDrawerOpen: (open: boolean) => void;
  setSearch: (search: string) => void;
}

export const ChadExclusivesFilters = ({
  style,
  setIsFilterDrawerOpen,
  setSearch,
}: ChadExclusivesFiltersProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const params = useQueryParams();
  const status = params.get ? params.get(queryParams.alphaDateStatus) : null;

  const handleSetSearch = (val: string) => {
    setSearchValue(val);
    setSearch(val);
  };

  return (
    <View style={[styles.filterContainer, style]}>
      <View style={styles.row}>
        <View style={styles.filterRow}>
          {quickFilters.map((filter) => (
            <FilterButton
              key={filter.value}
              onPress={() => {
                if (status === filter.value && params.remove) {
                  params.remove(queryParams.alphaDateStatus);
                } else if (params.set) {
                  params.set(queryParams.alphaDateStatus, filter.value);
                }
              }}
              style={status === filter.value ? styles.filterBtnActive : {}}
            >
              {filter.label}
            </FilterButton>
          ))}
        </View>
        <FilterButton
          onPress={() => {
            setShowSearch(!showSearch);
            handleSetSearch('');
          }}
          style={styles.roundBtn}
        >
          <SearchToggleIcon showSearch={showSearch} />
        </FilterButton>
        <FilterButton
          onPress={() => setIsFilterDrawerOpen(true)}
          style={styles.roundBtn}
        >
          <TuneIcon size={20} color="#374151" />
        </FilterButton>
      </View>
      <Searchbar showSearch={showSearch} setSearch={handleSetSearch} searchValue={searchValue} />
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBtn: {
    backgroundColor: '#E5E7EB', // secondary-200
    borderRadius: 99,
    height: 40,
    minWidth: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#64748B', // secondary-500
    borderColor: '#A1A1AA',
    borderWidth: 1,
    fontWeight: '500',
  },
  filterBtnText: {
    color: '#6B7280', // muted-foreground
    fontWeight: '400',
    fontSize: 12,
  },
  roundBtn: {
    borderRadius: 99,
    width: 40,
    height: 40,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    backgroundColor: '#E5E7EB',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputWrapper: {
    width: '100%',
    marginTop: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 16,
    color: '#111',
    fontSize: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
});
