import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type TabButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  active?: boolean;
  style?: any;
};

const TabButton = ({ children, onPress, active, style }: TabButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.tabButton,
      active && styles.tabButtonActive,
      style,
    ]}
    activeOpacity={0.7}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{children}</Text>
  </TouchableOpacity>
);

type TabSelectorsProps = {
  selectedIndex: number;
  buttons: { label: string; onClick: () => void }[];
};

export const TabSelectors = ({ selectedIndex, buttons }: TabSelectorsProps) => {
  const [tabsLayout, setTabsLayout] = useState<{ x: number; width: number }[]>([]);
  const highlightX = useSharedValue(0);
  const highlightWidth = useSharedValue(0);

  // Set position/width on tab layout
  const onTabLayout = (idx: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabsLayout((prev) => {
      const copy = [...prev];
      copy[idx] = { x, width };
      return copy;
    });
    // If it's the selected tab, animate the highlight
    if (idx === selectedIndex) {
      highlightX.value = withTiming(x, { duration: 200 });
      highlightWidth.value = withTiming(width, { duration: 200 });
    }
  };

  // Update highlight on selectedIndex change
  React.useEffect(() => {
    if (tabsLayout[selectedIndex]) {
      highlightX.value = withTiming(tabsLayout[selectedIndex].x, { duration: 200 });
      highlightWidth.value = withTiming(tabsLayout[selectedIndex].width, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, tabsLayout.length]);

  const highlightStyle = useAnimatedStyle(() => ({
    left: highlightX.value,
    width: highlightWidth.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {/* Animated highlight */}
        {tabsLayout[selectedIndex] && (
          <Animated.View
            style={[
              styles.highlight,
              highlightStyle,
            ]}
          />
        )}

        {buttons.map((button, idx) => (
          <View key={button.label} onLayout={onTabLayout(idx)} style={{ flex: 1 }}>
            <TabButton
              onPress={button.onClick}
              active={idx === selectedIndex}
            >
              {button.label}
            </TabButton>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 2,
    borderRadius: 999,
    backgroundColor: '#E6EAEF', // bg-secondary-300
    position: 'relative',
    overflow: 'visible',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    position: 'relative',
    minHeight: 36,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 64,
    zIndex: 1,
  },
  tabButtonActive: {
    // Text color change only, highlight is animated View behind
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#232323',
  },
  tabTextActive: {
    color: '#26c06f', // accent color for active tab
  },
  highlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: '#F3F7F6', // bg-secondary
    zIndex: 0,
    marginVertical: 2,
    // Will animate left/width
  },
});
