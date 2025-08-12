import { Images } from '../../../../assets/images';
import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

export function CollectionCardLoading() {
  // Animated spinning
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View
            key={index}
            style={styles.cell}
          >
            <Animated.Image
              source={{uri: Images.Misc.NFTImageLoading}}
              style={[styles.img, { transform: [{ rotate: spin }] }]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#0a0a0a',
    marginBottom: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16, // Only supported on RN 0.72+. Otherwise use margin.
    padding: 16,
    justifyContent: 'space-between',
  },
  cell: {
    backgroundColor: '#e5e7eb', // bg-gray-200
    borderRadius: 12,
    aspectRatio: 1,
    flexBasis: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    // dark mode: override backgroundColor dynamically if using theme
  },
  img: {
    width: 32,
    height: 32,
  },
});
