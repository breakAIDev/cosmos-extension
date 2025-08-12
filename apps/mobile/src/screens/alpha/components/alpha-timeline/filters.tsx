import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CaretDown } from 'phosphor-react-native';
import { Button } from '../../../../components/ui/button'; // RN Button or TouchableOpacity
import Text from '../../../../components/text'; // RN Button or TouchableOpacity
import { PageName } from '../../../../services/config/analytics';
import { useAlphaOpportunities } from '../../../../hooks/useAlphaOpportunities';
import { useQueryParams } from '../../../../hooks/useQuery';
import { SquareGridIcon } from '../../../../../assets/icons/square-grid'; // Must be RN SVG or icon
import { TuneIcon } from '../../../../../assets/icons/tune-icon';         // Must be RN SVG or icon
import { FilterButton, Searchbar, SearchToggleIcon } from '../../../../screens/alpha/chad-components/ChadTimeline/filters';
import { EcosystemFilterDrawer } from '../FilterDrawer';

export const AlphaTimelineFilters = ({
  setSearchedTerm,
  setIsFilterDrawerOpen,
}: {
  setSearchedTerm: (term: string) => void;
  setIsFilterDrawerOpen: (open: boolean) => void;
}) => {
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setSearchedTerm('');
  }, [showSearch, setSearchedTerm]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <EcosystemFilter />

        <FilterButton
          style={styles.iconButton}
          size="sm"
          onPress={() => setShowSearch(!showSearch)}
        >
          <Text>Search</Text>
          <SearchToggleIcon showSearch={showSearch} style={styles.icon} />
        </FilterButton>

        <FilterButton
          style={styles.iconButton}
          onPress={() => setIsFilterDrawerOpen(true)}
        >
          <Text>Filters</Text>
          <TuneIcon style={styles.icon} />
        </FilterButton>
      </View>

      <Searchbar showSearch={showSearch} setSearch={setSearchedTerm} />
    </View>
  );
};

const EcosystemFilter = () => {
  const [isShown, setIsShown] = useState(false);
  const { opportunities } = useAlphaOpportunities();

  const params = useQueryParams();
  const ecosystems = params.get('ecosystem');

  const selectedEcosystems = useMemo(() => {
    if (!ecosystems?.length) return 'All ecosystem';
    const ecosystemArr = ecosystems.split(',');
    return ecosystemArr.length > 1 ? `${ecosystemArr.length} ecosystems` : ecosystemArr[0];
  }, [ecosystems]);

  return (
    <>
      <Button
        variant="ghost"
        style={styles.filterButton}
        size="sm"
        onPress={() => setIsShown(true)}
      >
        <SquareGridIcon style={styles.icon} />
        <View style={{ marginHorizontal: 8 }}>
          <Text style={styles.filterButtonText}>{selectedEcosystems}</Text>
        </View>
        <CaretDown weight="bold" size={14} color="#AAA" />
      </Button>

      <EcosystemFilterDrawer
        isShown={isShown}
        onClose={() => setIsShown(false)}
        opportunities={opportunities}
        pageName={PageName.Alpha}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-between',
  },
  iconButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 38,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 15,
    color: '#222',
  },
});

