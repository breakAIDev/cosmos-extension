import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Images } from '../../../../assets/images';

type ArrowHeaderProps = {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  limit: number;
};

export function ArrowHeader({ activeIndex, setActiveIndex, limit }: ArrowHeaderProps) {
  const handlePrevClick = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNextClick = () => {
    if (activeIndex < limit - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      {activeIndex > 0 ? (
        <View style={styles.arrows}>
          <TouchableOpacity onPress={() => setActiveIndex(0)}>
            <Image source={{uri: Images.Misc.ArrowDoubleLeft}} style={styles.icon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrevClick}>
            <Image source={{uri: Images.Misc.ArrowSingleLeft}} style={styles.icon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      ) : <View style={styles.arrowSpacer} />}

      <View style={styles.centerText}>
        <Text style={styles.textCurrent}>
          <Text style={{ fontWeight: 'bold' }}>{activeIndex + 1} of {limit}</Text>
        </Text>
        <Text style={styles.textWaiting}>requests waiting to be acknowledged</Text>
      </View>

      {activeIndex < limit - 1 ? (
        <View style={styles.arrows}>
          <TouchableOpacity onPress={handleNextClick}>
            <Image source={{uri: Images.Misc.ArrowSingleRight}} style={styles.icon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveIndex(limit - 1)}>
            <Image source={{uri: Images.Misc.ArrowDoubleRight}} style={styles.icon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      ) : <View style={styles.arrowSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
    width: '100%',
  },
  arrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  icon: {
    width: 22,
    height: 22,
    marginHorizontal: 2,
  },
  arrowSpacer: {
    width: 52, // Space to keep center text centered (2 icons' width + margin)
  },
  centerText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCurrent: {
    color: '#111827', // light; can use dynamic color with useColorScheme()
    fontSize: 12,
  },
  textWaiting: {
    color: '#111827',
    fontSize: 10,
  },
});
