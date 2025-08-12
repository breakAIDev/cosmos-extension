import { CaretLeft, CaretRight } from 'phosphor-react-native';
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';

import { NftCard, NftCardProps } from './index';

type NftCardCarouselProps = NftCardProps & {
  images: string[];
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function NftCardCarousel({ images, ...nftCardProps }: NftCardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const handleArrowClick = (direction: 'left' | 'right') => {
    let newIndex = activeIndex;
    if (direction === 'left') {
      newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    } else {
      newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    }
    setActiveIndex(newIndex);
    Animated.spring(translateX, {
      toValue: -newIndex * SCREEN_WIDTH,
      useNativeDriver: true,
    }).start();
  };

  // When activeIndex changes from outside, animate to the new index
  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: -activeIndex * SCREEN_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, translateX]);

  return (
    <View style={[styles.container, nftCardProps.style && { /* handle custom styles here */ }]}>
      <View style={styles.carouselContainer}>
        <Animated.View
          style={[
            styles.animatedRow,
            { width: images.length * SCREEN_WIDTH, transform: [{ translateX }] },
          ]}
        >
          {images.map((image, index) => (
            <View key={`${image}-${index}`} style={{ width: SCREEN_WIDTH }}>
              <NftCard {...nftCardProps} imgSrc={image} />
            </View>
          ))}
        </Animated.View>
      </View>

      {images.length > 1 && (
        <>
          <TouchableOpacity
            style={styles.arrowLeft}
            onPress={() => handleArrowClick('left')}
            activeOpacity={0.7}
          >
            <CaretLeft size={16} color="#18181b" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowRight}
            onPress={() => handleArrowClick('right')}
            activeOpacity={0.7}
          >
            <CaretRight size={16} color="#18181b" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH, // Keep square, adjust as needed for aspect
  },
  carouselContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  animatedRow: {
    flexDirection: 'row',
    height: '100%',
  },
  arrowLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -12.5,
    width: 25,
    height: 25,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  arrowRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12.5,
    width: 25,
    height: 25,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
