import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import { ArrowsLeftRight, CurrencyDollar, Pulse, Wallet } from 'phosphor-react-native';
import { useActiveChain } from '../../hooks/settings/useActiveChain';
import { observer } from 'mobx-react-lite';
import BottomNavIcon from '../../screens/alpha/components/BottomNavIcon';
import { useChainsStore, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks';

export enum BottomNavLabel {
  Home = 'Home',
  NFTs = 'NFTs',
  Stake = 'Stake',
  Activity = 'Activity',
  Governance = 'Governance',
  Earn = 'Earn',
  Airdrops = 'Airdrops', // deprecated
  Rewards = 'Rewards',   // current successor to airdrops
  Swap = 'Swap',
  Search = 'Search',
}

type BottomNavProps = {
  label: BottomNavLabel;
  disabled?: boolean;
};

const BottomNav = observer(({ label, disabled: disabledAll }: BottomNavProps) => {
  const [selected, setSelected] = useState(label);
  const navigation = useNavigation();
  const activeChain = useActiveChain();
  const { chains } = useChainsStore();
  const activeChainInfo = chains[activeChain];
  const { data: featureFlags } = useFeatureFlags();
  const { theme } = useTheme();
  const isDark = theme === ThemeName.DARK;

  const alphaRedirectHandler = useCallback(() => {
    const redirectUrl = 'https://leapboard.app/airdrops';
    // On mobile, open in browser
    if (Platform.OS === 'web') {
      window.open(redirectUrl, '_blank');
    } else {
      // Use expo-linking or similar
    }
  }, []);

  const stakeRedirectForInitiaHandler = useCallback(() => {
    const redirectUrl = 'https://app.testnet.initia.xyz/stake';
    if (Platform.OS === 'web') {
      window.open(redirectUrl, '_blank');
    } else {
      // Use expo-linking or similar
    }
  }, []);

  const bottomNavItems = useMemo(() => {
    const isSwapDisabled =
      featureFlags?.swaps?.extension === 'disabled' || ['nomic', 'seiDevnet'].includes(activeChain);

    return [
      {
        label: BottomNavLabel.Home,
        icon: <Wallet size={22} weight="fill" />,
        route: 'Home', // should match your navigator route name
        show: true,
      },
      {
        label: BottomNavLabel.Stake,
        icon: <CurrencyDollar size={22} weight="fill" />,
        route: 'Stake',
        show: true,
        disabled: activeChainInfo?.disableStaking || activeChainInfo?.evmOnlyChain,
        redirectHandler: stakeRedirectForInitiaHandler,
      },
      {
        label: BottomNavLabel.Swap,
        icon: <ArrowsLeftRight size={22} weight="bold" />,
        route: 'Swap',
        show: true,
        disabled: isSwapDisabled,
      },
      {
        label: BottomNavLabel.Rewards,
        icon: <BottomNavIcon />,
        route: 'Alpha',
        show: featureFlags?.airdrops?.extension !== 'disabled',
        shouldRedirect: featureFlags?.airdrops?.extension === 'redirect',
        redirectHandler: alphaRedirectHandler,
      },
      {
        label: BottomNavLabel.Activity,
        icon: <Pulse size={22} weight="fill" />,
        route: 'Activity',
        show: true,
      },
    ];
  }, [
    featureFlags?.swaps?.extension,
    featureFlags?.airdrops?.extension,
    activeChain,
    activeChainInfo?.disableStaking,
    activeChainInfo?.evmOnlyChain,
    stakeRedirectForInitiaHandler,
    alphaRedirectHandler,
  ]);

  return (
    <View style={[
      styles.navContainer,
      { backgroundColor: isDark ? '#0A0A0A' : '#fff' }
    ]}>
      {/* {Images.Nav.BottomNav ...} // For background shape, adapt as RN SVG or Image if needed */}
      <View style={styles.navRow}>
        {bottomNavItems
          .filter(({ show }) => show)
          .map(({ label: navLabel, icon, route, shouldRedirect, redirectHandler, disabled }, idx) => {
            const isDisabled = disabledAll || disabled;
            const isSelected = selected === navLabel;
            return (
              <TouchableOpacity
                key={`${navLabel}_${idx}`}
                style={styles.navButton}
                activeOpacity={isDisabled ? 1 : 0.7}
                onPress={() => {
                  if (isDisabled) return;
                  if (shouldRedirect === true && redirectHandler) {
                    redirectHandler();
                    return;
                  }
                  setSelected(navLabel);
                  // For navigation, adapt as needed for your stack/tab navigator
                  // @ts-ignore
                  navigation.navigate(route);
                }}
                disabled={isDisabled}
              >
                {isSelected ? <View style={styles.selectedIndicator} /> : null}
                <View style={styles.iconLabelContainer}>
                  {navLabel === BottomNavLabel.Swap ? (
                    <View style={[
                      styles.swapIcon,
                      !isDisabled
                        ? { backgroundColor: '#22C55E' } // green-600
                        : { backgroundColor: isDark ? '#111827' : '#F3F4F6' }
                    ]}>
                      {icon}
                    </View>
                  ) : (
                    <View>
                      {React.cloneElement(
                        icon as React.ReactElement<any>,
                        {
                          color: isSelected
                            ? (isDark ? '#fff' : '#111827')
                            : (isDark ? '#6B7280' : '#9CA3AF')
                        }
                      )}
                    </View>
                  )}
                  <Text style={[
                    styles.label,
                    isDisabled
                      ? { color: isDark ? '#2C2C2C' : '#D3D3D3' }
                      : isSelected
                        ? { color: isDark ? '#fff' : '#111827' }
                        : { color: isDark ? '#6B7280' : '#9CA3AF' }
                  ]}>
                    {navLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 65,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 0,
    // If you want darker shadow in dark mode, adjust in JS
  },
  navRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    paddingVertical: 7,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#22C55E',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    zIndex: 2,
  },
  iconLabelContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapIcon: {
    fontSize: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
  },
});

export default BottomNav;
