import React, { useRef, useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, Animated, StyleSheet, LayoutChangeEvent } from 'react-native';

type TabButtonProps = {
  children: string | React.ReactNode;
  onPress: () => void;
  active?: boolean;
  style?: any;
};

export function TabButton({ children, onPress, active, style }: TabButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        active ? styles.activeTab : styles.inactiveTab,
        style,
      ]}
      activeOpacity={0.8}
    >
      {React.isValidElement(children) ? children : typeof children === 'string' ?
        <Text style={[styles.tabButtonText, active ? styles.activeTabText : styles.inactiveTabText]}>
          {children}
        </Text>
        : null
      }
    </TouchableOpacity>
  );
}

type Tab = {
  label: string;
  id?: string;
};

export function TabSelectors<T extends Tab>({
  setSelectedTab,
  selectedIndex,
  buttons,
  buttonStyle,
  containerStyle,
}: {
  setSelectedTab: (tab: T) => void;
  selectedIndex: number;
  buttons: T[];
  buttonStyle?: any;
  containerStyle?: any;
}) {
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (tabLayouts[selectedIndex]) {
      Animated.spring(indicatorX, {
        toValue: tabLayouts[selectedIndex].x,
        useNativeDriver: false,
      }).start();
      Animated.spring(indicatorWidth, {
        toValue: tabLayouts[selectedIndex].width,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedIndex, tabLayouts]);

  const onLayoutTab = (e: LayoutChangeEvent, index: number) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts((layouts) => {
      const next = [...layouts];
      next[index] = { x, width };
      return next;
    });
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {buttons.map((button, i) => (
        <View
          key={button.id ?? button.label}
          onLayout={(e) => onLayoutTab(e, i)}
          style={{ flexShrink: 1 }}
        >
          <TabButton
            onPress={() => setSelectedTab(button)}
            active={i === selectedIndex}
            style={buttonStyle}
          >
            {button.label}
          </TabButton>
        </View>
      ))}
      <Animated.View
        style={[
          styles.indicator,
          {
            left: indicatorX,
            width: indicatorWidth,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    paddingBottom: 14,
    paddingHorizontal: 12,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  activeTab: {},
  inactiveTab: {},
  tabButtonText: {
    fontSize: 15,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  activeTabText: {
    color: '#22c55e', // green-500, replace with your accent color
  },
  inactiveTabText: {
    color: '#64748b', // slate-500, replace with your secondary color
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    gap: 28,
    marginBottom: 8,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#22c55e', // green-500, replace with your accent
    zIndex: 10,
  },
});
