import { useDebounce } from '@leapwallet/cosmos-wallet-hooks';
import { X } from 'phosphor-react-native';
import Text from '../../../../components/text';
import { Separator } from '../../../../components/ui/separator';
import { EventName, PageName } from '../../../../services/config/analytics';
import dayjs from 'dayjs';
import { AnimatePresence, MotiView } from 'moti';
import Fuse from 'fuse.js';
import { usePageView } from '../../../../hooks/analytics/usePageView';
import {
  AlphaOpportunity as AlphaOpportunityType,
  RaffleStatus,
  useRaffles,
  useRaffleWins,
} from '../../../../hooks/useAlphaOpportunities';
import { useQueryParams } from '../../../../hooks/useQuery';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { queryParams } from '../../../../utils/query-params';
import { mixpanelTrack } from '../../../../utils/tracking';

import { AlphaSkeletonList } from '../../components/AlphaSkeleton';
import EmptyBookmarks from '../../components/EmptyBookmarks';
import { NoFilterResult } from '../../components/NoResultStates';
import { SelectedChadFilterTags } from '../../components/SelectedFilterTags';
import { useBookmarks } from '../../context/bookmark-context';
import { useChadProvider } from '../../context/chad-exclusives-context';
import { endsInUTC, sortRafflesByStatus } from '../../utils';
import { YouAreNotChadBanner } from '../Banners';
import ChadFilterDrawer from '../ChadFilterDrawer';
import RaffleListing from '../RaffleListing';
import { ChadExclusivesFilters, StatusFilter } from './filters';
import { ChadExclusivesHeader } from './header';

export type AlphaOpportunityProps = AlphaOpportunityType & {
  isBookmarked: boolean;
};

function VirtualizationFooter() {
  return <View style={{ padding: 32, alignItems: 'center' }} />;
}

export default observer(function ChadTimeline() {
  const { raffles, isLoading } = useRaffles();
  const { selectedOpportunities, selectedEcosystems, alphaUser, openDetails } = useChadProvider();
  const { bookmarks } = useBookmarks();
  const { raffleWins } = useRaffleWins(alphaUser?.id ?? '');
  const params = useQueryParams();

  const status = params.get(queryParams.alphaDateStatus) as StatusFilter | null;

  const [searchedTerm, setSearchedTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchedTerm, 1000);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [toast, setToast] = useState('');

  const memoizedEcosystem = useMemo(
    () => [...new Set(raffles?.flatMap((r) => r?.ecosystem ?? []))],
    [raffles]
  );
  const memoizedCategories = useMemo(
    () => [...new Set(raffles?.flatMap((r) => r?.categories ?? []))],
    [raffles]
  );

  usePageView(PageName.ChadExclusives, true, {
    isChad: alphaUser?.isChad ?? false,
    ecosystem: memoizedEcosystem,
    categories: memoizedCategories,
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Deeplink support for Raffle Listing
  useEffect(() => {
    const listingId = params.get('listingId');
    if (listingId && raffles.length > 0) {
      const raffle = raffles.find((r) => r.id === listingId);
      if (raffle) {
        openDetails({
          ...raffle,
          isBookmarked: bookmarks.has(raffle.id),
          pageName: PageName.ChadExclusives,
          userWon: !!raffleWins?.find((win) => win.id === raffle.id),
        });
      }
    }
  }, [params, openDetails, raffles, isFilterDrawerOpen, bookmarks, raffleWins]);

  const fuse = useMemo(
    () =>
      new Fuse(raffles, {
        keys: ['title', 'secondaryTitle', 'ecosystem', 'categories'],
        threshold: 0.3,
        shouldSort: true,
      }),
    [raffles]
  );

  const searchedOpportunities = useMemo(() => {
    if (!searchedTerm) {
      return sortRafflesByStatus(raffles);
    }
    const results = fuse.search(searchedTerm);
    return sortRafflesByStatus(results.map((result) => result.item));
  }, [raffles, searchedTerm, fuse]);

  const filteredOpportunities = useMemo(() => {
    if (!selectedOpportunities?.length && !selectedEcosystems?.length && !status) {
      return searchedOpportunities;
    }

    const dateFilteredOpportunities = status
      ? searchedOpportunities.filter((opportunity) => {
          const startDate = dayjs(opportunity.startsAt);
          const endDate = dayjs(opportunity.endsAt);
          const now = dayjs();
          const diff = now.diff(startDate, 'second');

          if (status === StatusFilter.Live) {
            return (
              opportunity.endsAt &&
              diff >= 0 &&
              opportunity.status !== RaffleStatus.COMPLETED &&
              endsInUTC(opportunity.endsAt) !== 'Ended'
            );
          }
          if (status === StatusFilter.Upcoming) {
            return startDate.isAfter(now);
          }
          if (status === StatusFilter.Ended) {
            return endDate.isBefore(now);
          }
        })
      : searchedOpportunities;

    return dateFilteredOpportunities.filter((opportunity) => {
      return (
        (!selectedOpportunities?.length ||
          selectedOpportunities.every((category) => opportunity?.categories?.includes(category))) &&
        (!selectedEcosystems?.length ||
          selectedEcosystems.every((ecosystem) => opportunity?.ecosystem?.includes(ecosystem)))
      );
    });
  }, [selectedOpportunities, selectedEcosystems, status, searchedOpportunities]);

  // Analytics: track search
  useEffect(() => {
    if (debouncedSearchTerm) {
      mixpanelTrack(EventName.SearchDone, {
        searchTerm: debouncedSearchTerm,
        searchResultsCount: filteredOpportunities.length,
        topResults: filteredOpportunities.slice(0, 5).map((opportunity) => opportunity.id),
        page: PageName.ChadExclusives,
        isChad: alphaUser?.isChad ?? false,
      });
    }
  }, [alphaUser?.isChad, debouncedSearchTerm, filteredOpportunities]);

  const noResultsType = useMemo(() => {
    if (searchedTerm) return 'search';
    if (status) return status;
    return 'no-results';
  }, [searchedTerm, status]);

  // No opportunities found state
  if (raffles.length < 1 && !isLoading) {
    return (
      <AnimatePresence>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={{ padding: 28 }}
        >
          <EmptyBookmarks title="No Opportunities" subTitle="Check back later for new exclusive opportunities" />
        </MotiView>
      </AnimatePresence>
    );
  }

  return (
    <View style={styles.container}>
      {!alphaUser?.isChad && <YouAreNotChadBanner />}
      <ChadExclusivesHeader isChad={alphaUser?.isChad ?? false} style={alphaUser?.isChad ? {} : styles.headerMargin} />
      <Separator style={styles.separator} />
      <ChadExclusivesFilters setSearch={setSearchedTerm} setIsFilterDrawerOpen={setIsFilterDrawerOpen} style={{marginBottom: 28}}/>
      <AnimatePresence>
        {(selectedOpportunities.length > 0 || selectedEcosystems.length > 0) && <SelectedChadFilterTags />}
        {filteredOpportunities.length === 0 && !isLoading && (
          <NoFilterResult filterType={noResultsType} style={{ marginBottom: 36 }} />
        )}
        {filteredOpportunities.length > 0 && (
          <FlatList
            data={filteredOpportunities}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item, index }) => (
              <RaffleListing
                key={`${item.id}-${index}`}
                {...item}
                pageName={PageName.ChadExclusives}
                isSearched={searchedTerm !== ''}
                isBookmarked={bookmarks.has(item.id ?? '')}
                userWon={!!raffleWins?.find((win) => win.id === item.id)}
              />
            )}
            ListFooterComponent={VirtualizationFooter}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        )}
        {isLoading && <AlphaSkeletonList />}
        <ChadFilterDrawer
          isChad={alphaUser?.isChad ?? false}
          raffles={raffles}
          isShown={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          pageName={PageName.ChadExclusives}
        />
      </AnimatePresence>
      <AnimatePresence>
        {toast ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 20 }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.toast}
          >
            <Text style={styles.toastText}>{toast}</Text>
            <TouchableOpacity onPress={() => setToast('')}>
              <X size={16} color="#fff" />
            </TouchableOpacity>
          </MotiView>
        ) : null}
      </AnimatePresence>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    backgroundColor: '#fff', // or theme color
  },
  headerMargin: {
    marginTop: 32,
  },
  separator: {
    marginVertical: 28,
  },
  toast: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    backgroundColor: '#22c55e', // green-600
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 50,
    shadowColor: '#222',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  toastText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
