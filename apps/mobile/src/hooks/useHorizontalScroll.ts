import { useRef, useState } from 'react';
import { PanResponder, ScrollView } from 'react-native';

type ScrollBehavior = 'natural' | 'reverse';

export default function useHorizontalScroll(behavior: ScrollBehavior = 'natural') {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollStartX, setScrollStartX] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (scrollViewRef.current) {
          const deltaX = gestureState.dx;
          scrollViewRef.current.scrollTo({
            x: behavior === 'natural' ? scrollStartX - deltaX : scrollStartX + deltaX,
            animated: false,
          });
        }
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    }),
  ).current;

  const onScroll = (event: any) => {
    setScrollStartX(event.nativeEvent.contentOffset.x);
  };

  return {
    panHandlers: panResponder.panHandlers,
    scrollViewRef,
    isDragging,
    onScroll,
  };
}
