import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, ArrowRight } from 'phosphor-react-native';

type BannerControlsProps = {
  activeBannerIndex: number;
  activeBannerId: string;
  totalItems: number;
  handleContainerScroll: (index: number) => void;
};

export const BannerControls = ({
  activeBannerIndex,
  totalItems,
  handleContainerScroll,
}: BannerControlsProps) => {
  return (
    <View style={styles.controlsRow}>
      <TouchableOpacity
        disabled={activeBannerIndex === 0}
        onPress={() => handleContainerScroll(activeBannerIndex - 1)}
        style={[
          styles.arrowBtn,
          activeBannerIndex === 0 && styles.arrowBtnDisabled,
        ]}
      >
        <ArrowLeft
          size={17}
          color={activeBannerIndex === 0 ? '#C0C5CB' : '#222'} // muted-foreground vs foreground
        />
      </TouchableOpacity>

      <View style={styles.dotsRow}>
        {Array.from({ length: totalItems }).map((_, i) => {
          const isActive = activeBannerIndex === i;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
              onPress={() => handleContainerScroll(i)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Go to banner ${i + 1}`}
            />
          );
        })}
      </View>

      <TouchableOpacity
        disabled={activeBannerIndex === totalItems - 1}
        onPress={() => handleContainerScroll(activeBannerIndex + 1)}
        style={[
          styles.arrowBtn,
          activeBannerIndex === totalItems - 1 && styles.arrowBtnDisabled,
        ]}
      >
        <ArrowRight
          size={17}
          color={activeBannerIndex === totalItems - 1 ? '#C0C5CB' : '#222'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  arrowBtn: {
    padding: 8,
    opacity: 1,
  },
  arrowBtnDisabled: {
    opacity: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // if your React Native version supports gap; otherwise use margin
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#222', // foreground
  },
  dotInactive: {
    width: 5,
    backgroundColor: '#C0C5CB', // muted-foreground
  },
});
