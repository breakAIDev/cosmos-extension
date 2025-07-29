import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

type NavItem = { label: string };

type IndicatorPosition = {
  left: number;
  width: number;
};

export const useTabIndicatorPosition = <TNavItem extends NavItem>(config: {
  navItems: TNavItem[];
  activeLabel: string;
  widthScale?: number;
}) => {
  const [indicatorPos, setIndicatorPos] = useState<IndicatorPosition>({ left: 0, width: 0 });
  const containerRef = useRef<View>(null);
  // Use array of refs for children
  const childLayouts = useRef<{ left: number; width: number }[]>([]);

  const onContainerLayout = (e: any) => {
    // Container position is not needed unless you want scroll (see scrollX logic)
    // Can be extended for horizontal scroll views
  };

  // Create a callback ref for each tab item
  const onTabLayout = (idx: number) => (e: any) => {
    const { x, width } = e.nativeEvent.layout;
    childLayouts.current[idx] = { left: x, width };
    // Find the active tab and update indicator position
    const activeIdx = config.navItems.findIndex((item) => item.label === config.activeLabel);
    if (activeIdx === idx) {
      const widthScale = config.widthScale ?? 1;
      const btnWidth = width * widthScale;
      const translateX = x + width * (1 - widthScale) / 2;
      setIndicatorPos({ left: translateX, width: btnWidth });
    }
  };

  // Update indicator when activeLabel changes
  useEffect(() => {
    const activeIdx = config.navItems.findIndex((item) => item.label === config.activeLabel);
    if (childLayouts.current[activeIdx]) {
      const { left, width } = childLayouts.current[activeIdx];
      const widthScale = config.widthScale ?? 1;
      const btnWidth = width * widthScale;
      const translateX = left + width * (1 - widthScale) / 2;
      setIndicatorPos({ left: translateX, width: btnWidth });
    }
  }, [config.activeLabel, config.navItems, config.widthScale]);

  return {
    containerRef,
    onContainerLayout,
    onTabLayout,    // Pass this to each tab: onLayout={onTabLayout(idx)}
    indicatorPos,   // { left, width }
  };
};
