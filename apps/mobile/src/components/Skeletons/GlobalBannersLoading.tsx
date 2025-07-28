import React from 'react';
import { View, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import SkeletonContent from 'react-native-skeleton-content';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(352, width - 32);

export function GlobalBannersLoading() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const baseColor1 = isDark ? '#393939' : '#D6D6D6';
  const highlightColor1 = isDark ? '#2C2C2C' : '#E8E8E8';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#18181B' : '#FFF', width: CARD_WIDTH },
      ]}
    >
      <View style={styles.innerRow}>
        <SkeletonContent
          isLoading={true}
          containerStyle={styles.avatarSkeletonContainer}
          layout={[
            {
              key: 'avatar',
              width: 40,
              height: 40,
              borderRadius: 12,
              marginTop: 4,
            },
          ]}
          boneColor={baseColor1}
          highlightColor={highlightColor1}
        />
        <View style={styles.textContainer}>
          <SkeletonContent
            isLoading={true}
            containerStyle={styles.textSkeletonContainer}
            layout={[
              {
                key: 'text',
                width: 56,
                height: 14,
                borderRadius: 12,
              },
            ]}
            boneColor={baseColor1}
            highlightColor={highlightColor1}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    minHeight: 64,
    justifyContent: 'center',
    marginVertical: 8,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 64,
    justifyContent: 'flex-start',
    gap: 8,
  },
  avatarSkeletonContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    paddingTop: 4,
    marginLeft: 12,
  },
  textSkeletonContainer: {
    width: 56,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
