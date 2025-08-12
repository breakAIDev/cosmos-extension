import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Linking } from 'react-native';
import { PanGestureHandler, PanGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';
import { MotiView, AnimatePresence } from 'moti';
import { BookmarkSimple, CheckCircle, EyeSlash } from 'phosphor-react-native';
import { AlphaOpportunity as AlphaOpportunityType } from '../../../hooks/useAlphaOpportunities';

import Tags from './Tags';
import ListingFooter from './ListingFooter';
import ListingImage from './ListingImage';
import { useBookmarks } from '../context/bookmark-context';
import { useFilters } from '../context/filter-context';
import { getHostname } from '../utils';
import { RaffleVisibilityStatus } from './alpha-timeline/use-raffle-status-map';
import { EventName, PageName } from '../../../services/config/analytics';
import { mixpanelTrack } from '../../../utils/tracking';

const SWIPE_THRESHOLD = 100;
const SCREEN_WIDTH = Dimensions.get('window').width;

export type AlphaOpportunityProps = AlphaOpportunityType & {
  isBookmarked: boolean;
  pageName: PageName;
  isSearched?: boolean;
  onMarkRaffle?: (id: string, status: RaffleVisibilityStatus) => void;
  visibilityStatus?: RaffleVisibilityStatus;
};
export default function AlphaOpportunity(props: AlphaOpportunityProps) {
  const {
    additionDate,
    homepageDescription,
    ecosystemFilter,
    categoryFilter,
    descriptionActions,
    relevantLinks,
    endDate,
    image,
    id,
    isSearched,
    pageName,
    onMarkRaffle,
    visibilityStatus,
  } = props;

  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { setOpportunities, setEcosystems, selectedOpportunities, selectedEcosystems, openDetails } = useFilters();

  // Swipe state
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null); // 'left' | 'right' | null
  const [isExiting, setIsExiting] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  // Handle bookmark toggle
  const handleBookmarkClick = () => {
    const prevBookMarked = isBookmarked(id);
    toggleBookmark(id);
    mixpanelTrack('Bookmark', {
      [!prevBookMarked ? 'bookmarkAdded' : 'bookmarkRemoved']: id,
      name: homepageDescription,
      page: PageName.Alpha,
    });
  };

  // Card tap logic
  const handlePress = () => {
    if (descriptionActions && descriptionActions !== 'NA') {
      openDetails(props);
      return;
    }
    if (relevantLinks?.[0]) {
      mixpanelTrack(EventName.PageView, {
        pageName: pageName,
        name: homepageDescription,
        alphaSelectSource: isSearched ? 'Search Results' : 'Default List',
        id: id,
        alphaExternalURL: getHostname(relevantLinks[0]),
        ecosystem: [...(ecosystemFilter || [])],
        categories: [...(categoryFilter || [])],
      });

      Linking.openURL(relevantLinks[0]);

      return;
    }

    // else just register the click for the opportunity:
    mixpanelTrack(EventName.PageView, {
      pageName: pageName,
      name: homepageDescription,
      alphaSelectSource: isSearched ? 'Search Results' : 'Default List',
      id: id,
      ecosystem: [...(ecosystemFilter || [])],
      categories: [...(categoryFilter || [])],
    });
  };

  // Pan gesture logic
  const onGestureEvent = Animated.event([{ nativeEvent: { translationX: translateX } }], {
    useNativeDriver: false,
  });

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    const nativeEvent = event.nativeEvent;
    if (nativeEvent.state === State.END) { // 5 === END
      if (nativeEvent.translationX > SWIPE_THRESHOLD && onMarkRaffle) {
        setSwipeDirection('right');
        setIsExiting(true);
        setTimeout(() => {
          onMarkRaffle(id, 'hidden');
          setIsExiting(false);
          setSwipeDirection(null);
          translateX.setValue(0);
        }, 350);
      } else if (nativeEvent.translationX < -SWIPE_THRESHOLD && onMarkRaffle) {
        setSwipeDirection('left');
        setIsExiting(true);
        setTimeout(() => {
          onMarkRaffle(id, 'completed');
          setIsExiting(false);
          setSwipeDirection(null);
          translateX.setValue(0);
        }, 350);
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
        setSwipeDirection(null);
      }
    }
  };

  // Render swipe background
  const renderSwipeBackground = () => {
    if (swipeDirection === 'right') {
      return (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={[styles.swipeBackground, styles.swipeRight]}
        >
          <EyeSlash size={40} color="#fff" />
        </MotiView>
      );
    }
    if (swipeDirection === 'left') {
      return (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={[styles.swipeBackground, styles.swipeLeft]}
        >
          <CheckCircle size={40} color="#fff" />
        </MotiView>
      );
    }
    return null;
  };

  return (
    <View style={styles.root}>
      <AnimatePresence>
        {renderSwipeBackground()}
      </AnimatePresence>
      <PanGestureHandler
        enabled={!!onMarkRaffle && !visibilityStatus}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.card,
            visibilityStatus ? styles.cardInactive : styles.cardActive,
            { transform: [{ translateX }] },
          ]}
        >
          <TouchableOpacity onPress={handlePress} activeOpacity={0.92}>
            {/* Top bar with tags and bookmark */}
            <View style={styles.topBar}>
              <Tags
                visibilityStatus={visibilityStatus}
                ecosystemFilter={ecosystemFilter}
                categoryFilter={categoryFilter}
                handleEcosystemClick={eco => setEcosystems([...(selectedEcosystems || []), eco])}
                handleCategoryClick={cat => setOpportunities([...(selectedOpportunities || []), cat])}
              />
              <TouchableOpacity onPress={handleBookmarkClick} hitSlop={8}>
                <BookmarkSimple
                  weight={isBookmarked(id) ? 'fill' : 'regular'}
                  size={24}
                  color={isBookmarked(id) ? '#22c55e' : '#222'}
                />
              </TouchableOpacity>
            </View>
            {/* Middle: description and image */}
            <View style={styles.middleRow}>
              <View style={styles.middleText}>
                <Text style={styles.homepageDescription}>{homepageDescription}</Text>
                <ListingFooter endDate={endDate} additionDate={additionDate} relevantLinks={relevantLinks} />
              </View>
              <View style={styles.imageContainer}>
                <ListingImage
                  ecosystemFilter={ecosystemFilter?.[0]}
                  categoryFilter={categoryFilter?.[0]}
                  image={image}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: 18,
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 18,
    padding: 20,
    backgroundColor: '#fff',
    borderColor: '#e3e4e6',
    borderWidth: 1,
    elevation: 2,
    zIndex: 2,
  },
  cardActive: {
    backgroundColor: '#f7fafc',
  },
  cardInactive: {
    backgroundColor: '#f4f4f6',
    opacity: 0.7,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 2,
    gap: 12,
  },
  middleText: {
    flex: 1,
    marginRight: 12,
  },
  homepageDescription: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
    color: '#18181b',
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: SCREEN_WIDTH - 36,
    borderRadius: 18,
    justifyContent: 'center',
    zIndex: 1,
    paddingHorizontal: 32,
  },
  swipeLeft: {
    backgroundColor: '#22c55e',
    right: 0,
    alignItems: 'flex-end',
  },
  swipeRight: {
    backgroundColor: '#dc2626',
    left: 0,
    alignItems: 'flex-start',
  },
});
