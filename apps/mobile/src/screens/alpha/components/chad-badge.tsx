import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@leapwallet/leap-ui';
import { CrownIcon } from '../../../../assets/icons/crown';

const gradients = {
  active: {
    dark: ['#29A874', '#10422E'],
    light: ['#4BCB8F', '#1A6B4A'],
  },
  inactive: {
    dark: ['#101113', '#424242'],
    light: ['#717171a8', '#9E9E9E'],
  },
};

export const ChadBadge = () => {
  const { theme } = useTheme();
  const colors = theme === 'light' ? gradients.active.light : gradients.active.dark;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.badge}
    >
      <CrownIcon width={16} height={16} />
      <Text style={styles.text}>Chad</Text>
    </LinearGradient>
  );
};

export const ChadBadgeInactive = () => {
  const { theme } = useTheme();
  const colors = theme === 'light' ? gradients.inactive.light : gradients.inactive.dark;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.badge}
    >
      <CrownIcon width={16} height={16} />
      <Text style={styles.text}>Chad Inactive</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // If you get a warning, use marginRight on the icon instead
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
});
