import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import LottieView from 'lottie-react-native';

import { useActiveChain, useActiveWallet, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks';
import {
  allBottomNavItems,
  bottomNavItemsForWatchWallet,
  BottomNavLabel,
  routeToLabelMap,
} from './bottom-nav-items';

type BottomNavProps = {
  label: BottomNavLabel;
  disableLottie?: boolean;
};

const INDICATOR_HEIGHT = 4;

const useShowBottomNav = (routeName: string) => {
  // You can pass route name or use useRoute() hook directly
  return (
    routeToLabelMap[routeName] &&
    !routeName.includes('Onboarding') &&
    !routeName.includes('ForgotPassword')
  );
};

export const BottomNav = ({ label, disableLottie }: BottomNavProps) => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeName = route.name;
  const activeWallet = useActiveWallet();
  const activeChain = useActiveChain();
  const featureFlags = useFeatureFlags();

  const bottomNavItems = activeWallet?.watchWallet ? bottomNavItemsForWatchWallet : allBottomNavItems;

  const isBottomNavVisible = useShowBottomNav(routeName);

  // Lottie visibility state
  const [showLottie, setShowLottie] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowLottie(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Find the selected index for indicator
  const selectedIdx = bottomNavItems.findIndex(item => item.label === label);

  if (!isBottomNavVisible) return null;

  return (
    <View style={styles.navContainer}>
      <View style={styles.navRow}>
        {bottomNavItems.map(({ label: l, route, params, lottie, Icon }, idx) => {
          const isDisabled =
            l === BottomNavLabel.Swap &&
            (featureFlags?.data?.swaps?.extension === 'disabled' ||
              ['nomic', 'seiDevnet'].includes(activeChain));
          const isActive = label === l;

          return (
            <TouchableOpacity
              key={l}
              activeOpacity={isDisabled ? 1 : 0.7}
              disabled={isDisabled}
              style={styles.tabButton}
              onPress={() => {
                if (isDisabled) return;
                if (route) {
                  // You might need to adjust params handling here
                  navigation.dispatch(
                    CommonActions.navigate({ name: route, params })
                  );
                }
              }}
            >
              <LottieWrapper
                showLottie={showLottie}
                disableLottie={disableLottie}
                Icon={Icon}
                active={isActive}
                lottie={lottie}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                  isDisabled && styles.tabLabelDisabled,
                ]}
              >
                {l}
              </Text>
              {isActive ? (
                <View style={styles.indicator} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const LottieWrapper = ({
  showLottie,
  disableLottie,
  Icon,
  active,
  lottie,
}: {
  showLottie: boolean;
  disableLottie?: boolean;
  lottie: { on: any; off: any };
  active: boolean;
  Icon: React.ComponentType<any>;
}) => {
  // If no lottie or disabled, show static icon
  if (!lottie || disableLottie) {
    return <Icon width={20} height={20} />;
  }
  // Hide Lottie until showLottie=true, show static icon meanwhile
  if (!showLottie) {
    return <Icon width={20} height={20} />;
  }
  return (
    <LottieView
      source={active ? lottie.on : lottie.off}
      autoPlay
      loop={false}
      style={styles.lottie}
    />
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: '#F5F7FB', // adjust as needed
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    // iOS blur? use BlurView from expo-blur if desired
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 99,
    overflow: 'hidden',
  },
  navRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#16A34A',
  },
  tabLabelDisabled: {
    color: '#D3D3D3',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: INDICATOR_HEIGHT,
    backgroundColor: '#16A34A',
    borderRadius: INDICATOR_HEIGHT / 2,
  },
  lottie: {
    width: 20,
    height: 20,
  },
});

export default observer(BottomNav);
