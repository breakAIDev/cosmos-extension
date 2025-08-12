import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';

const AUTO_SWITCH_INTERVAL_SEC = 30;

export const useCarousel = (totalItems: number, autoScrollDuration: number = AUTO_SWITCH_INTERVAL_SEC) => {
  // This ref is for RN ScrollView
  const scrollableContainerRef = useRef<ScrollView>(null);
  const bannerWidth = Dimensions.get('window').width - 32; // adjust if you use padding/margin
  const [timeCounter, setTimeCounter] = useState(0);
  const timerCountRef = useRef(0);
  const [autoSwitchBanner, setAutoSwitchBanner] = useState(true);

  const activeBannerIndex = totalItems > 0 ? (timeCounter % totalItems) : 0;

  // Scroll to banner by index
  const handleContainerScroll = useCallback(
    (newIndex?: number) => {
      if (totalItems < 1) return;
      if (newIndex !== undefined) {
        timerCountRef.current = Math.floor(timerCountRef.current / totalItems) + newIndex;
      } else {
        timerCountRef.current += 1;
      }
      const scrollToIndex = timerCountRef.current % totalItems;
      setTimeCounter(timerCountRef.current);

      // RN ScrollView: x = horizontal offset
      scrollableContainerRef.current?.scrollTo({
        x: bannerWidth * scrollToIndex,
        y: 0,
        animated: true,
      });
    },
    [bannerWidth, totalItems]
  );

  // Auto-scroll timer
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (totalItems > 1 && autoSwitchBanner) {
      intervalId = setInterval(() => handleContainerScroll(), autoScrollDuration * 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [totalItems, handleContainerScroll, autoSwitchBanner, autoScrollDuration]);

  // Manual scroll handler for RN ScrollView
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Only process when user scrolls manually
      if (!autoSwitchBanner) {
        const scrollLeft = e.nativeEvent.contentOffset.x;
        const bannerIndex = Math.round(scrollLeft / bannerWidth);
        timerCountRef.current = bannerIndex;
        setTimeCounter(bannerIndex);
      }
    },
    [autoSwitchBanner, bannerWidth]
  );

  // Pause auto-scroll on touch (optional: you can expose setAutoSwitchBanner for parent to control onTouchStart/onTouchEnd)
  // You can add more logic if needed.

  return {
    scrollableContainerRef,
    activeBannerIndex,
    handleContainerScroll,
    handleScroll,
    setAutoSwitchBanner, // expose for parent touch control if needed
  };
};
