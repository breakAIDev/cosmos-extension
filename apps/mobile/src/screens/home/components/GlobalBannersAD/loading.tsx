import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from '../../../../components/ui/skeleton';
import { BannerControls } from './controls'; // You’ll need RN version!
import { useCarousel } from './use-carousel';

const BANNER_LOADING_COUNT = 4;
const loadingBanners = new Array(BANNER_LOADING_COUNT).fill(null);

export const BannersLoading = () => {
  const {
    activeBannerIndex,
    handleContainerScroll,
    handleScroll,
    scrollableContainerRef,
  } = useCarousel(BANNER_LOADING_COUNT);

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerContainer}
        ref={scrollableContainerRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {loadingBanners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.bannerWrapper,
              {
                transform: [
                  { scale: activeBannerIndex === index ? 1 : 0.875 }
                ]
              }
            ]}
          >
            <View style={styles.skeletonWrapper}>
              <Skeleton style={styles.skeleton} />
            </View>
          </View>
        ))}
      </ScrollView>

      <BannerControls
        activeBannerIndex={activeBannerIndex}
        activeBannerId={''}
        totalItems={BANNER_LOADING_COUNT}
        handleContainerScroll={handleContainerScroll}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  bannerWrapper: {
    height: 64, // h-16
    width: Dimensions.get('window').width - 32, // fill parent minus padding
    overflow: 'hidden',
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  skeletonWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeleton: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#E5E7EB', // bg-secondary-200
  },
});

