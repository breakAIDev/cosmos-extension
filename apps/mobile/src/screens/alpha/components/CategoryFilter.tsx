import { EyeSlash } from 'phosphor-react-native';
import { EventName, PageName } from '../../../services/config/analytics';
import { Images } from '../../../../assets/images';
import mixpanel from '../../../mixpanel';
import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useFilters } from '../context/filter-context';
import { CategoryIcon } from '../utils/filters';
import FilterItem from './FilterItem';

export default function CategoryFilter({
  categoryFilters,
  pageName,
}: {
  categoryFilters: string[];
  pageName: PageName;
}) {
  const { selectedOpportunities, selectedEcosystems, setOpportunities } = useFilters();

  const handleCategoryToggle = useCallback(
    (category: string) => {
      try {
        const newCategories = selectedOpportunities?.includes(category)
          ? selectedOpportunities.filter((o) => o !== category)
          : [...(selectedOpportunities || []), category];

        setOpportunities(newCategories);
        mixpanel.track(EventName.Filters, {
          filterSelected: [...(newCategories || []), ...(selectedEcosystems || [])],
          filterApplySource: pageName,
        });
      } catch (err) {
        // ignore
      }
    },
    [selectedOpportunities, selectedEcosystems, setOpportunities, pageName],
  );

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Category</Text>
      <View>
        {categoryFilters
          ?.sort((a, b) => a.localeCompare(b))
          ?.map((category) => (
            <FilterItem
              key={category}
              icon={CategoryIcon[category] ?? Images.Alpha.nftGiveaway}
              label={category}
              isSelected={selectedOpportunities?.includes(category)}
              onSelect={() => handleCategoryToggle(category)}
              onRemove={() => handleCategoryToggle(category)}
            />
          ))}

        <FilterItem
          key={'hidden'}
          icon={
            <View style={styles.hiddenIconContainer}>
              <EyeSlash size={20} color="#334155" />
            </View>
          }
          label={'Hidden'}
          isLast={true}
          isSelected={selectedOpportunities?.includes('hidden')}
          onSelect={() => handleCategoryToggle('hidden')}
          onRemove={() => handleCategoryToggle('hidden')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    gap: 20,
  },
  title: {
    color: '#888',
    fontSize: 14,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hiddenIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
