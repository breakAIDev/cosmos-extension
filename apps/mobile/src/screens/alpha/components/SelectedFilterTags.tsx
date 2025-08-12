import { X } from 'phosphor-react-native';
import Text from '../../../components/text';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { useChadProvider } from '../context/chad-exclusives-context';
import { useFilters } from '../context/filter-context';

export default function SelectedFilterTags() {
  const { selectedOpportunities, selectedEcosystems, setOpportunities, setEcosystems } = useFilters();

  const handleRemoveCategory = (category: string) => {
    setOpportunities(selectedOpportunities?.filter((c) => c !== category) || []);
  };

  const handleRemoveEcosystem = (ecosystem: string) => {
    setEcosystems(selectedEcosystems?.filter((e) => e !== ecosystem) || []);
  };

  return (
    <View style={styles.tagsContainer}>
      {selectedOpportunities.map((category) => (
        <View key={category} style={styles.tag}>
          <Text size="xs" style={styles.tagLabel}>{category}</Text>
          <TouchableOpacity
            onPress={() => handleRemoveCategory(category)}
            style={styles.tagRemoveBtn}
            activeOpacity={0.7}
          >
            <X size={10} weight="bold" color="#222" />
          </TouchableOpacity>
        </View>
      ))}
      {selectedEcosystems.map((ecosystem) => (
        <View key={ecosystem} style={styles.tag}>
          <Text size="xs" style={styles.tagLabel}>{ecosystem}</Text>
          <TouchableOpacity
            onPress={() => handleRemoveEcosystem(ecosystem)}
            style={styles.tagRemoveBtn}
            activeOpacity={0.7}
          >
            <X size={10} weight="bold" color="#222" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

export function SelectedChadFilterTags() {
  const { selectedOpportunities, selectedEcosystems, setOpportunities, setEcosystems } = useChadProvider();

  const handleRemoveCategory = (category: string) => {
    setOpportunities(selectedOpportunities?.filter((c) => c !== category) || []);
  };

  const handleRemoveEcosystem = (ecosystem: string) => {
    setEcosystems(selectedEcosystems?.filter((e) => e !== ecosystem) || []);
  };

  return (
    <View style={[styles.tagsContainer, { marginBottom: 8 }]}>
      {selectedOpportunities.map((category) => (
        <View key={category} style={styles.chadTag}>
          <Text style={styles.chadTagLabel}>{category}</Text>
          <TouchableOpacity
            onPress={() => handleRemoveCategory(category)}
            style={styles.chadTagRemoveBtn}
            activeOpacity={0.7}
          >
            <X size={10} weight="bold" color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
      {selectedEcosystems.map((ecosystem) => (
        <View key={ecosystem} style={styles.chadTag}>
          <Text style={styles.chadTagLabel}>{ecosystem}</Text>
          <TouchableOpacity
            onPress={() => handleRemoveEcosystem(ecosystem)}
            style={styles.chadTagRemoveBtn}
            activeOpacity={0.7}
          >
            <X size={10} weight="bold" color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // If not supported, use marginRight: 8 on tag
    marginBottom: 2,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // gray-100
    borderRadius: 999,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 8,
    marginRight: 8,
    marginBottom: 6,
  },
  tagLabel: {
    color: '#4B5563', // gray-600
    fontWeight: '600',
    fontSize: 13,
    marginRight: 3,
  },
  tagRemoveBtn: {
    backgroundColor: '#E5E7EB', // gray-200
    borderRadius: 99,
    padding: 2,
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Chad style
  chadTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF', // secondary-200
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#6366F1', // secondary-600
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 8,
    marginRight: 8,
    marginBottom: 6,
  },
  chadTagLabel: {
    color: '#6366F1', // muted-foreground/secondary-600
    fontSize: 13,
    marginRight: 3,
  },
  chadTagRemoveBtn: {
    backgroundColor: '#6366F1', // secondary-600
    borderRadius: 99,
    padding: 3,
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
