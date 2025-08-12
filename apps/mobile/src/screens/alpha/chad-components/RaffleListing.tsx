import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MotiView } from 'moti';
import { BookmarkSimple, SealCheck } from 'phosphor-react-native';
import dayjs from 'dayjs';

import { Raffle as RaffleType, RaffleStatus } from '../../../hooks/useAlphaOpportunities';
import { useQueryParams } from '../../../hooks/useQuery';
import { Button } from '../../../components/ui/button';
import { queryParams } from '../../../utils/query-params';
import Tags from '../components/Tags';
import { useChadBookmarks } from '../context/bookmark-context';
import { useChadProvider } from '../context/chad-exclusives-context';
import { useFilters } from '../context/filter-context';
import { mixpanelTrack } from '../../../utils/tracking';
import { EventName, PageName } from '../../../services/config/analytics';
import { endsInUTC, startsInUTC } from '../utils';
import ChadListingImage from './ChadListingImage';
import { StatusFilter } from './ChadTimeline/filters';

export type RaffleListingProps = RaffleType & {
  isBookmarked: boolean;
  pageName: PageName;
  isSearched?: boolean;
  highlight?: boolean;
  userWon?: boolean;
  bannerImage?: string;
};

export default function RaffleListing(props: RaffleListingProps) {
  const {
    title,
    startsAt,
    endsAt,
    status,
    ecosystem,
    categories,
    image,
    id,
    isSearched,
    highlight,
    userWon,
    redirectUrl,
  } = props;

  const params = useQueryParams();
  const { toggleBookmark, isBookmarked } = useChadBookmarks();
  const { setOpportunities, setEcosystems, selectedOpportunities, selectedEcosystems, openDetails, alphaUser } =
    useChadProvider();

  const {
    setOpportunities: setAllOpportunities,
    setEcosystems: setAllEcosystems,
    selectedOpportunities: selectedAllOpportunities,
    selectedEcosystems: selectedAllEcosystems,
  } = useFilters();

  const handleEcosystemClick = useCallback(
    (ecosystem: string) => {
      if (highlight) {
        setAllEcosystems([...(selectedAllEcosystems || []), ecosystem]);
      } else {
        setEcosystems([...(selectedEcosystems || []), ecosystem]);
      }
    },
    [selectedEcosystems, setEcosystems, selectedAllEcosystems, setAllEcosystems, highlight],
  );

  const handleCategoryClick = useCallback(
    (category: string) => {
      if (highlight) {
        setAllOpportunities([...(selectedAllOpportunities || []), category]);
      } else {
        setOpportunities([...(selectedOpportunities || []), category]);
      }
    },
    [selectedOpportunities, setOpportunities, selectedAllOpportunities, setAllOpportunities, highlight],
  );

  const handleLiveClick = useCallback(() => {
    const status = params.get(queryParams.alphaDateStatus) as StatusFilter | null;
    if (status === StatusFilter.Live) {
      params.remove(queryParams.alphaDateStatus);
    } else {
      params.set(queryParams.alphaDateStatus, StatusFilter.Live);
    }
  }, [params]);

  // Calculate time
  const diff = useMemo(() => {
    const daysjsStart = dayjs(startsAt);
    const now = dayjs();
    return now.diff(daysjsStart, 'second');
  }, [startsAt]);

  const dateLabel = useMemo(() => {
    if (diff < 0) {
      return `Starts in ${startsInUTC(startsAt)}`;
    }
    
    const endIn = endsInUTC(endsAt);
    if (status === RaffleStatus.COMPLETED || endIn === 'Ended') {
      return `Ended on ${dayjs(endsAt).format('MMM D, YYYY')}`;
    }

    return endIn;
  }, [diff, endsAt, status, startsAt]);

  const isLive = useMemo(
    () => Boolean(endsAt && diff >= 0 && status !== RaffleStatus.COMPLETED && endsInUTC(endsAt) !== 'Ended'),
    [diff, endsAt, status],
  );

  const isEnded = useMemo(
    () => status === RaffleStatus.COMPLETED || endsInUTC(endsAt) === 'Ended',
    [endsAt, status],
  );

  // Bookmark logic
  const handleBookmarkPress = () => {
    toggleBookmark(id);
    mixpanelTrack(EventName.Bookmark, {
      [!isBookmarked(id) ? 'bookmarkAdded' : 'bookmarkRemoved']: id,
      name: title,
      page: highlight ? PageName.Alpha : PageName.ChadExclusives,
      isChad: alphaUser?.isChad ?? false,
    });
  };

  // Card click
  const handleCardPress = () => {
    if (redirectUrl) {
      mixpanelTrack(EventName.PageView, {
        pageName: highlight ? PageName.Alpha : PageName.ChadExclusives,
        RaffleSelectSource: isSearched ? 'Search Results' : 'Default List',
        id: id,
        ChadEligibility: alphaUser?.isChad ? alphaUser.id : 'No',
        ecosystem: [...(ecosystem ?? [])],
        categories: [...(categories ?? [])],
        raffleExternalURL: redirectUrl,
        isChad: alphaUser?.isChad ?? false,
      });
      Linking.openURL(redirectUrl);
      return;
    }
    openDetails(props);
    mixpanelTrack(EventName.PageView, {
      pageName: highlight ? PageName.Alpha : PageName.ChadExclusives,
      RaffleSelectSource: isSearched ? 'Search Results' : 'Default List',
      id: id,
      ChadEligibility: alphaUser?.isChad ? alphaUser.id : 'No',
      ecosystem: [...(ecosystem ?? [])],
      categories: [...(categories ?? [])],
      isChad: alphaUser?.isChad ?? false,
    });
  };

  // Styles for win/lose badge
  const winBadge = (
    <View style={styles.winBadge}>
      <SealCheck weight='fill' size={16} color="#22c55e" />
      <Text style={styles.winBadgeText}>You won</Text>
    </View>
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      style={[
        styles.card,
        isEnded ? styles.endedCard : styles.activeCard
      ]}
    >
      <TouchableOpacity style={{ flex: 1 }} onPress={handleCardPress} activeOpacity={0.93}>
        <Tags
          isLive={isLive}
          ecosystemFilter={ecosystem ?? []}
          categoryFilter={categories ?? []}
          handleEcosystemClick={handleEcosystemClick}
          handleCategoryClick={handleCategoryClick}
          handleLiveClick={handleLiveClick}
        />

        <View style={styles.row}>
          <View style={styles.infoColumn}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.dateLabel}>{dateLabel}</Text>
          </View>
          <View style={styles.imageContainer}>
            <ChadListingImage image={image} alt={title} />
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Button
            size={'sm'}
            style={styles.actionButton}
            variant={'mono'}
            onPress={handleCardPress}
          >
            <Text style={styles.actionButtonText}>{isLive ? 'Enter now' : 'Check details'}</Text>
            {/* Example: <ExternalLinkIcon width={12} height={12} /> */}
          </Button>

          {userWon ? winBadge : (
            <TouchableOpacity onPress={handleBookmarkPress} style={styles.bookmarkButton} hitSlop={10}>
              <BookmarkSimple
                weight={isBookmarked(id) ? 'fill' : 'regular'}
                size={24}
                color={isBookmarked(id) ? '#22c55e' : '#bbb'}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    gap: 16,
    backgroundColor: '#fff',
    borderColor: '#e3e4e6',
  },
  endedCard: {
    backgroundColor: '#f4f4f6',
  },
  activeCard: {
    // You can implement gradients with react-native-linear-gradient if needed
    backgroundColor: '#f7fafc',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
    width: '100%',
  },
  infoColumn: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#18181b',
  },
  dateLabel: {
    color: '#475569',
    fontSize: 13,
  },
  imageContainer: {
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    width: 60,
    height: 60,
    overflow: 'hidden',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
    marginTop: 6,
  },
  actionButton: {
    minHeight: 32,
    minWidth: 150,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  bookmarkButton: {
    marginLeft: 14,
    padding: 6,
  },
  winBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e7faed',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  winBadgeText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
