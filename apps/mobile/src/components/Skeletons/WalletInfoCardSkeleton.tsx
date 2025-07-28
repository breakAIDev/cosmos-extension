import React from 'react';
import { View, StyleSheet, FlatList, useColorScheme } from 'react-native';
import SkeletonContent from 'react-native-skeleton-content';

export function WalletInfoCardSkeleton() {
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#23232A' : '#fff';
  const dividerColor = isDark ? '#454554' : '#f3f3f3';

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.row}>
        <SkeletonContent
          isLoading={true}
          containerStyle={styles.avatar}
          layout={[{ key: 'avatar', width: 40, height: 40, borderRadius: 20 }]}
        />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <SkeletonContent
            isLoading={true}
            layout={[
              { key: 'line1', width: 120, height: 14, borderRadius: 4, marginBottom: 8 },
              { key: 'line2', width: 80, height: 12, borderRadius: 4 }
            ]}
          />
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />
      <View style={styles.bottomRow}>
        <SkeletonContent
          isLoading={true}
          layout={[{ key: 'bottomLine', width: 220, height: 14, borderRadius: 4 }]}
        />
      </View>
    </View>
  );
}

export function WalletInfoCardSkeletons() {
  // 2 skeletons
  return (
    <FlatList
      data={[1, 2]}
      renderItem={() => <WalletInfoCardSkeleton />}
      keyExtractor={(_, idx) => idx.toString()}
      contentContainerStyle={{ gap: 12 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    borderRadius: 16,
    marginVertical: 8,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  bottomRow: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: 360,
  },
});
