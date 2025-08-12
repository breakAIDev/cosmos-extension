
import { useQueryParams } from '../../hooks/useQuery';
import React from 'react';
import { queryParams } from '../../utils/query-params';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

// Tabs definition
const tabs = [
  {
    label: 'Alpha',
    value: 'all',
  },
  {
    label: 'Chad Exclusives',
    value: 'exclusive',
  },
];

export const TabSwitch = () => {
  const params = useQueryParams();
  const activeTab = params.get(queryParams.alphaTab) || 'all';

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.value}
          style={styles.tabButton}
          onPress={() => params.set(queryParams.alphaTab, tab.value)}
          activeOpacity={0.7}
        >
          <View style={styles.tabInner}>
            <Text style={[
              styles.tabText,
              tab.value === activeTab ? styles.tabTextActive : styles.tabTextInactive
            ]}>
              {tab.label}
            </Text>
            {/* Animated underline */}
            {tab.value === activeTab && (
              <MotiView
                style={styles.activeIndicator}
                layout
                from={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  type: 'timing',
                  duration: 300,
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    position: 'relative',
    paddingVertical: 16,
    paddingHorizontal: 12,
    width: '100%',
    alignItems: 'center',
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#2563eb', // Use your "primary" color
  },
  tabTextInactive: {
    color: '#9ca3af', // text-muted-foreground
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#2563eb', // primary
    borderRadius: 2,
    zIndex: 10,
    marginTop: 2,
    // Optionally animate width if you want a more complex effect
  },
});
