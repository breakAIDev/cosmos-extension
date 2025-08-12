import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useQueryParams } from '../../../../hooks/useQuery';
import { queryParams } from '../../../../utils/query-params';
import { ChadBadge, ChadBadgeInactive } from '../../../../screens/alpha/components/chad-badge';

export const ChadExclusivesHeader = ({ isChad, style }: { isChad?: boolean, style?: ViewStyle }) => {
  const params = useQueryParams();

  const handleBadgePress = () => {
    params.set(queryParams.chadEligibility, 'true');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Text style={styles.title}>Chad exclusives</Text>
        <TouchableOpacity onPress={handleBadgePress} style={styles.badgeBtn}>
          {isChad ? <ChadBadge /> : <ChadBadgeInactive />}
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        Handpicked rewards for Leap Chad users only
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginBottom: 12, // gap-2
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // gap-3
  },
  title: {
    fontSize: 28,        // 1.75rem
    lineHeight: 38,      // 2.375rem
    fontWeight: 'bold',
    color: '#111',       // or your theme color
    marginRight: 12,
  },
  badgeBtn: {
    // Optional: to add hit area
  },
  subtitle: {
    fontSize: 14, // text-sm
    color: '#334155', // text-secondary-800
  },
});
