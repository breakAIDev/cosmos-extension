import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { FunnelSimple } from 'phosphor-react-native';
import { MotiView, AnimatePresence } from 'moti';

export default function FilterButton({
  setIsFilterDrawerOpen,
  filterCount,
}: {
  setIsFilterDrawerOpen: (isOpen: boolean) => void;
  filterCount: number;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.button}
      onPress={() => setIsFilterDrawerOpen(true)}
    >
      <View style={styles.iconRow}>
        <FunnelSimple size={20} color="#4B5563" /> {/* text-gray-600 */}
        <AnimatePresence>
          {filterCount > 0 && (
            <MotiView
              from={{ width: 0, opacity: 0, marginLeft: 0 }}
              animate={{ width: 20, opacity: 1, marginLeft: 6 }}
              exit={{ width: 0, opacity: 0, marginLeft: 0 }}
              transition={{
                type: 'timing',
                duration: 200,
              }}
              style={styles.counterContainer}
            >
              <Text style={styles.counterText}>{filterCount}</Text>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 9999,
    padding: 8,
    height: 36,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  counterContainer: {
    overflow: 'hidden',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    color: '#4B5563', // text-gray-600
    fontSize: 12,
  },
});
