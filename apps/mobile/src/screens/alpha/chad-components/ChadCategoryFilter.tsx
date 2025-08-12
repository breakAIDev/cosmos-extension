import { EventName, PageName } from '../../../services/config/analytics';
import { Images } from '../../../../assets/images';
import React, { useCallback } from 'react';
import { mixpanelTrack } from '../../../utils/tracking';
import { View, Text, StyleSheet } from 'react-native';

import FilterItem from '../components/FilterItem';
import { useChadProvider } from '../context/chad-exclusives-context';
import { CategoryIcon } from '../utils/filters';

type Props = {
  categoryFilters: string[];
  pageName: PageName;
  isChad: boolean;
  onClose: () => void;
};

export default function CategoryFilter({
  categoryFilters,
  pageName,
  isChad,
  onClose,
}: Props) {
  const { selectedOpportunities, selectedEcosystems, setOpportunities } = useChadProvider();

  const handleCategoryToggle = useCallback(
    (category: string) => {
      const newCategories = selectedOpportunities?.includes(category)
        ? selectedOpportunities.filter((o) => o !== category)
        : [...(selectedOpportunities || []), category];

      setOpportunities(newCategories);
      onClose();
      mixpanelTrack(EventName.Filters, {
        filterSelected: [...(newCategories || []), ...(selectedEcosystems || [])],
        filterApplySource: pageName,
        isChad,
      });
    },
    [selectedOpportunities, setOpportunities, selectedEcosystems, pageName, isChad, onClose],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>CATEGORY</Text>
      <View style={styles.filtersContainer}>
        {categoryFilters
          ?.sort((a, b) => a.localeCompare(b))
          ?.map((category, index) => (
            <FilterItem
              key={category}
              icon={CategoryIcon[category] ?? Images.Alpha.nftGiveaway}
              label={category}
              isLast={index === categoryFilters.length - 1}
              isSelected={selectedOpportunities?.includes(category)}
              onSelect={() => handleCategoryToggle(category)}
              onRemove={() => handleCategoryToggle(category)}
              style={index < categoryFilters.length - 1 ? styles.filterItem : undefined}
            />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 20,
  },
  label: {
    color: '#97A3B9', // muted-foreground
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  filtersContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  filterItem: {
    marginBottom: 8,
  },
});
