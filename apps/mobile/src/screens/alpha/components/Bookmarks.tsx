import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import BottomModal from '../../../components/new-bottom-modal';
import { PageName } from '../../../services/config/analytics';
import Fuse from 'fuse.js';
import { usePageView } from '../../../hooks/analytics/usePageView';
import {
  AlphaOpportunity as AlphaOpportunityType,
  Raffle,
  useAlphaOpportunities,
  useRaffles,
  useRaffleWins,
} from '../../../hooks/useAlphaOpportunities';

import RaffleListing from '../chad-components/RaffleListing';
import { useBookmarks, useChadBookmarks } from '../context/bookmark-context';
import { useChadProvider } from '../context/chad-exclusives-context';
import { useFilters } from '../context/filter-context';
import { formatRaffleDate, sortOpportunitiesByDate } from '../utils';
import AlphaOpportunity from './AlphaOpportunity';
import EmptyBookmarks from './EmptyBookmarks';
import { FilterDrawer } from './FilterDrawer';
import { NoFilterResult } from './NoResultStates';
import SelectedFilterTags from './SelectedFilterTags';
import { AlphaTimelineFilters } from './alpha-timeline/filters';

type BookmarkedAlphaProps = {
  isOpen: boolean;
  toggler: () => void;
};

type TimelineItem = {
  id: string;
  additionDate: string;
  categoryFilter: string[];
  ecosystemFilter: string[];
  type: 'opportunity' | 'raffle';
  data: AlphaOpportunityType | Raffle;
};

export const BookmarkedAlpha: React.FC<BookmarkedAlphaProps> = ({ isOpen, toggler }) => {
  const { opportunities, isLoading: isOpportunitiesLoading } = useAlphaOpportunities();
  const { raffles, isLoading: isRafflesLoading } = useRaffles();
  const { alphaUser } = useChadProvider();
  usePageView(PageName.Bookmark, isOpen, {
    isChad: alphaUser?.isChad ?? false,
  });
  const { raffleWins } = useRaffleWins(alphaUser?.id ?? '');
  const isLoading = isOpportunitiesLoading || isRafflesLoading;
  const { bookmarks: alphaBookmarks } = useBookmarks();
  const { bookmarks: chadBookmarks } = useChadBookmarks();

  const bookmarks = useMemo(() => new Set([...alphaBookmarks, ...chadBookmarks]), [alphaBookmarks, chadBookmarks]);

  const { selectedOpportunities, selectedEcosystems } = useFilters();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState('');

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

  // Search
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

  // Filtering
  const filteredItems = useMemo(() => {
    const filteredList = searchedItems.filter((item) => bookmarks.has(item.id ?? ''));
    if (!selectedOpportunities?.length && !selectedEcosystems?.length) return filteredList;
    return filteredList.filter((item) => {
      return (
        (!selectedOpportunities?.length ||
          selectedOpportunities.every((category) => item.categoryFilter.includes(category))) &&
        (!selectedEcosystems?.length ||
          selectedEcosystems.every((ecosystem) => item.ecosystemFilter.includes(ecosystem)))
      );
    });
  }, [searchedItems, selectedOpportunities, selectedEcosystems, bookmarks]);

  const filterCount = selectedEcosystems?.length + selectedOpportunities?.length;

  // ----------- RENDER -----------

  return (
    <BottomModal fullScreen isOpen={isOpen} onClose={toggler} title="Bookmarks" style={styles.modal}>
      {filteredItems.length === 0 && filterCount === 0 && !isLoading && !searchedTerm ? (
        <EmptyBookmarks
          title="No Bookmarks Found"
          subTitle="Try looking at some listings and saving them"
          style={{ flex: 1 }}
        />
      ) : (
        <View style={styles.container}>
          <AlphaTimelineFilters setSearchedTerm={setSearchedTerm} setIsFilterDrawerOpen={setIsFilterDrawerOpen} />

          {(selectedOpportunities.length > 0 || selectedEcosystems.length > 0) && (
            <SelectedFilterTags />
          )}

          {(filteredItems.length === 0 && !isLoading) && (
            <NoFilterResult
              style={{ marginTop: 12, flex: 1 }}
              filterType={searchedTerm ? 'search' : 'no-results'}
            />
          )}

          {filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              keyExtractor={(item, idx) => `${item.id}-${idx}`}
              renderItem={({ item, index }) => {
                if (item.type === 'opportunity') {
                  return (
                    <AlphaOpportunity
                      key={`${item.id}-${index}`}
                      {...(item.data as AlphaOpportunityType)}
                      pageName={PageName.Bookmark}
                      isBookmarked={bookmarks.has(item.id ?? '')}
                    />
                  );
                } else {
                  return (
                    <RaffleListing
                      highlight={true}
                      key={`${item.id}-${index}`}
                      {...(item.data as Raffle)}
                      pageName={PageName.Bookmark}
                      isBookmarked={bookmarks.has(item.id ?? '')}
                      userWon={!!raffleWins?.find((win) => win.id === item.id)}
                    />
                  );
                }
              }}
              contentContainerStyle={{ flexGrow: 1 }}
              ListFooterComponent={<View style={{ height: 32 }} />}
            />
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#222" />
            </View>
          ) : null}

          <FilterDrawer
            opportunities={opportunities}
            isShown={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
            pageName={PageName.Bookmark}
          />
        </View>
      )}
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
});
