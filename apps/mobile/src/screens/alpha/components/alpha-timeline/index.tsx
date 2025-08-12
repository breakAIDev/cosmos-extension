import { useDebounce } from '@leapwallet/cosmos-wallet-hooks';
import { EventName, PageName } from '../../../../services/config/analytics';
import Fuse from 'fuse.js';
import {MotiView} from 'moti';
import { usePageView } from '../../../../hooks/analytics/usePageView';
import {
  AlphaOpportunity as AlphaOpportunityType,
  Raffle,
  useAlphaOpportunities,
  useRaffles,
  useRaffleWins,
} from '../../../../hooks/useAlphaOpportunities';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { mixpanelTrack } from '../../../../utils/tracking';

import RaffleListing from '../../chad-components/RaffleListing';
import { useBookmarks } from '../../context/bookmark-context';
import { useChadProvider } from '../../context/chad-exclusives-context';
import { useFilters } from '../../context/filter-context';
import { formatRaffleDate, sortOpportunitiesByDate } from '../../utils';
import AlphaOpportunity from '../AlphaOpportunity';
import { AlphaSkeletonList } from '../AlphaSkeleton';
import EmptyBookmarks from '../EmptyBookmarks';
import { FilterDrawer } from '../FilterDrawer';
import { NoFilterResult } from '../NoResultStates';
import SelectedFilterTags from '../SelectedFilterTags';
import { AlphaTimelineFilters } from './filters';
import { RaffleVisibilityStatus, useRaffleStatusMap } from './use-raffle-status-map';

type TimelineItem = {
  id: string;
  additionDate: string;
  categoryFilter: string[];
  ecosystemFilter: string[];
  type: 'opportunity' | 'raffle';
  data: AlphaOpportunityType | Raffle;
};

export type AlphaOpportunityProps = AlphaOpportunityType & {
  isBookmarked: boolean;
  visibilityStatus?: RaffleVisibilityStatus;
};

export function VirtualizationFooter() {
  return <div style={{ padding: '1rem', textAlign: 'center' }}> </div>;
}

export default observer(function AlphaTimeline() {
  const { opportunities, isLoading: isOpportunitiesLoading } = useAlphaOpportunities();
  const { raffles, isLoading: isRafflesLoading } = useRaffles();
  const { alphaUser } = useChadProvider();

  const memoizedEcosystem = useMemo(() => {
    return [...new Set(opportunities?.flatMap((opp) => opp?.ecosystemFilter ?? []))];
  }, [opportunities]);
  const memoizedCategories = useMemo(() => {
    return [...new Set(opportunities?.flatMap((opp) => opp?.categoryFilter ?? []))];
  }, [opportunities]);

  usePageView(PageName.Alpha, true, {
    isChad: alphaUser?.isChad ?? false,
    ecosystem: memoizedEcosystem,
    categories: memoizedCategories,
  });

  const { raffleWins } = useRaffleWins(alphaUser?.id ?? '');
  const isLoading = isOpportunitiesLoading || isRafflesLoading;

  const [searchedTerm, setSearchedTerm] = useState('');
  const { selectedOpportunities, selectedEcosystems } = useFilters();
  const debouncedSearchTerm = useDebounce(searchedTerm, 1000);
  const { bookmarks } = useBookmarks();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const { raffleStatusMap, updateRaffleStatus } = useRaffleStatusMap();

  // combined alpha listing and raffles:
  const allItems = useMemo<TimelineItem[]>(() => {
    const combined = [
      ...opportunities.map((opp) => ({
        id: opp.id,
        additionDate: opp.additionDate,
        categoryFilter: opp.categoryFilter,
        ecosystemFilter: opp.ecosystemFilter,
        type: 'opportunity' as const,
        data: opp,
      })),
      ...raffles.map((raffle) => ({
        id: raffle.id,
        additionDate: formatRaffleDate(raffle.createdAt),
        categoryFilter: raffle.categories ?? [],
        ecosystemFilter: raffle.ecosystem ?? [],
        type: 'raffle' as const,
        data: raffle,
      })),
    ];
    return sortOpportunitiesByDate(combined);
  }, [opportunities, raffles]);

  const fuse = useMemo(() => {
    return new Fuse(allItems, {
      keys: ['data.homepageDescription', 'data.title', 'data.description', 'categoryFilter', 'ecosystemFilter'],
      threshold: 0.3,
      shouldSort: true,
    });
  }, [allItems]);

  const searchedItems = useMemo(() => {
    if (!searchedTerm) {
      return allItems;
    }

    const results = fuse.search(searchedTerm);
    return sortOpportunitiesByDate(results.map((result) => result.item));
  }, [allItems, searchedTerm, fuse]);

  const filteredItems = useMemo(() => {
    const filtered = searchedItems.filter((item) => {
      if (raffleStatusMap[item.id] === 'hidden' && !selectedOpportunities.includes('hidden')) {
        return false;
      }

      if (selectedOpportunities.length > 0) {
        const hasMatchingCategory = selectedOpportunities.every((category) => {
          if (category.toLowerCase() === 'completed') {
            return raffleStatusMap[item.id] === 'completed';
          }

          if (category.toLowerCase() === 'hidden') {
            return raffleStatusMap[item.id] === 'hidden';
          }

          return item.categoryFilter.includes(category);
        });

        if (!hasMatchingCategory) {
          return false;
        }
      }

      if (selectedEcosystems.length > 0) {
        const hasMatchingEcosystem = selectedEcosystems.every((ecosystem) => item.ecosystemFilter.includes(ecosystem));

        if (!hasMatchingEcosystem) {
          return false;
        }
      }

      return true;
    });

    return filtered.sort((a, b) => {
      const aCompleted = raffleStatusMap[a.id] === 'completed';
      const bCompleted = raffleStatusMap[b.id] === 'completed';

      if (aCompleted === bCompleted) return 0;
      if (aCompleted) return 1;
      return -1;
    });
  }, [selectedOpportunities, selectedEcosystems, searchedItems, raffleStatusMap]);

  /**
   * only having debouncedSearchTerm as dependency is intentional
   * to avoid tracking unecessary changes
   */
  useEffect(() => {
    if (debouncedSearchTerm) {
      mixpanelTrack(EventName.SearchDone, {
        searchTerm: debouncedSearchTerm,
        searchResultsCount: filteredItems.length,
        topResults: filteredItems.slice(0, 5).map((item) => item.id),
        page: PageName.Alpha,
      });
    }
  }, [debouncedSearchTerm, filteredItems]);

  if (allItems.length < 1 && !isLoading) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        style={styles.emptyContainer}
      >
        <EmptyBookmarks
          title='No Alpha Opportunities'
          subTitle='Check back later for new alpha opportunities'
        />
      </MotiView>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <AlphaTimelineFilters
        setSearchedTerm={setSearchedTerm}
        setIsFilterDrawerOpen={setIsFilterDrawerOpen}
      />

      {(selectedOpportunities.length > 0 || selectedEcosystems.length > 0) && (
        <SelectedFilterTags />
      )}

      {(filteredItems.length === 0 && !isLoading) && (
        <NoFilterResult
          style={{ marginTop: 12, marginBottom: 36 }}
          filterType={searchedTerm ? 'search' : 'no-results'}
        />
      )}

      {filteredItems.length > 0 && (
        <FlatList
          data={filteredItems}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item, index }) =>
            item.type === 'opportunity'
              ? (
                <AlphaOpportunity
                  {...item.data}
                  key={`${item.id}-${index}`}
                  pageName='Alpha'
                  isSearched={!!searchedTerm}
                  isBookmarked={bookmarks.has(item.id ?? '')}
                  onMarkRaffle={updateRaffleStatus}
                  visibilityStatus={raffleStatusMap[item.id]}
                />
              )
              : (
                <RaffleListing
                  highlight={true}
                  {...(item.data as Raffle)}
                  key={`${item.id}-${index}`}
                  pageName={PageName.Alpha}
                  isSearched={!!searchedTerm}
                  isBookmarked={bookmarks.has(item.id ?? '')}
                  userWon={!!raffleWins?.find(win => win.id === item.id)}
                />
              )
          }
          ListFooterComponent={<View style={{ padding: 16 }} />}
        />
      )}

      {isLoading && <AlphaSkeletonList />}

      <FilterDrawer
        opportunities={opportunities}
        isShown={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        pageName='Alpha'
      />
    </View>
  );
});

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    padding: 28,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});