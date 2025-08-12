import BottomModal from '../../../components/new-bottom-modal';
import { PageName } from '../../../services/config/analytics';
import { AlphaOpportunity } from '../../../hooks/useAlphaOpportunities';
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import CategoryFilter from './CategoryFilter';
import EcosystemFilter from './EcosystemFilter';

type FilterDrawerProps = {
  opportunities: AlphaOpportunity[];
  isShown: boolean;
  onClose: () => void;
  selectedOpportunities: string[] | undefined;
  selectedEcosystems: string[] | undefined;
  setOpportunities: (opportunities: string[]) => void;
  setEcosystems: (ecosystems: string[]) => void;
  pageName: PageName;
};

export function FilterDrawer({
  opportunities,
  isShown,
  onClose,
  pageName,
}: Omit<FilterDrawerProps, 'selectedOpportunities' | 'selectedEcosystems' | 'setOpportunities' | 'setEcosystems'>) {
  const categoryFilters = useMemo(() => {
    const categories = new Set<string>();
    opportunities?.forEach((opportunity) => {
      opportunity.categoryFilter.forEach((category) => {
        const trimmed = category.trim();
        if (trimmed) categories.add(trimmed);
      });
    });
    return Array.from(categories);
  }, [opportunities]);

  const ecosystemFilters = useMemo(() => {
    const ecosystems = new Set<string>();
    opportunities?.forEach((opportunity) => {
      opportunity.ecosystemFilter.forEach((ecosystem) => {
        const trimmed = ecosystem.trim();
        if (trimmed) ecosystems.add(trimmed);
      });
    });
    return Array.from(ecosystems);
  }, [opportunities]);

  return (
    <BottomModal
      fullScreen
      isOpen={isShown}
      onClose={onClose}
      title="Filter by"
      style={styles.modalContent}
    >
      <View style={styles.section}>
        <CategoryFilter categoryFilters={categoryFilters} pageName={pageName} />
      </View>
      <View style={styles.section}>
        <EcosystemFilter ecosystemFilters={ecosystemFilters} pageName={pageName} />
      </View>
    </BottomModal>
  );
}

export function EcosystemFilterDrawer({
  opportunities,
  isShown,
  onClose,
  pageName,
}: Omit<FilterDrawerProps, 'selectedOpportunities' | 'selectedEcosystems' | 'setOpportunities' | 'setEcosystems'>) {
  const ecosystemFilters = useMemo(() => {
    const ecosystems = new Set<string>();
    opportunities?.forEach((opportunity) => {
      opportunity.ecosystemFilter.forEach((ecosystem) => {
        const trimmed = ecosystem.trim();
        if (trimmed) ecosystems.add(trimmed);
      });
    });
    return Array.from(ecosystems);
  }, [opportunities]);

  return (
    <BottomModal
      fullScreen
      isOpen={isShown}
      onClose={onClose}
      title="Filter by"
      style={styles.modalContent}
    >
      <View style={styles.section}>
        <EcosystemFilter ecosystemFilters={ecosystemFilters} pageName={pageName} />
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    flexDirection: 'column',
    padding: 16,
    gap: 32, // Not supported in all RN versions; use marginBottom on section if needed
  },
  section: {
    marginBottom: 24,
  },
});
