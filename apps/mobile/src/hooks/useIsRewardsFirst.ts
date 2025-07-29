import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks';
import { LEAP_CHAD_FIRST_VISIT } from '../services/config/storage-keys';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useIsRewardsFirst = () => {
  const activeWallet = useActiveWallet();
  const [isRewardsFirst, setIsRewardsFirstVisit] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const cosmosAddress = activeWallet?.addresses?.cosmos ?? '';
      if (!cosmosAddress) return;

      const key = `${LEAP_CHAD_FIRST_VISIT}-${cosmosAddress}`;

      try {
        const stored = await AsyncStorage.getItem(key);
        const isFirstVisit = stored === 'false' ? false : true;
        setIsRewardsFirstVisit(isFirstVisit);
      } catch (err) {
        console.error('Error reading visit state:', err);
        setIsRewardsFirstVisit(true);
      }
    };

    initialize();
  }, [activeWallet?.addresses?.cosmos]);

  const markAsVisited = async () => {
    const cosmosAddress = activeWallet?.addresses?.cosmos ?? '';
    if (!cosmosAddress) return;

    const key = `${LEAP_CHAD_FIRST_VISIT}-${cosmosAddress}`;

    try {
      await AsyncStorage.setItem(key, 'false');
      setIsRewardsFirstVisit(false);
    } catch (err) {
      console.error('Error setting visit state:', err);
    }
  };

  return { isRewardsFirst, markAsVisited };
};
