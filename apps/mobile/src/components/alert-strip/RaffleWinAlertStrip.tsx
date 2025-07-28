import React, { useEffect, useMemo, useState } from 'react';
import { AlertStrip } from './AlertStrip';
import { TestnetAlertStrip } from './TestnetAlertStrip';
import { useAlphaUser } from '../../hooks/useAlphaUser';
import { useRaffleWins } from '../../hooks/useAlphaOpportunities';
import { useIsRewardsFirst } from '../../hooks/useIsRewardsFirst';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks';
import { VIEWED_RAFFLE_WINS } from '../../services/config/storage-keys';

const RaffleAndTestnetAlertStrip = React.memo(() => {
  const navigation = useNavigation<any>();
  const activeWallet = useActiveWallet();
  const { alphaUser, isAlphaUserLoading } = useAlphaUser(activeWallet?.addresses?.cosmos ?? '');
  const { raffleWins } = useRaffleWins(alphaUser?.id ?? '');
  const { isRewardsFirst, markAsVisited } = useIsRewardsFirst();
  const [isVisible, setIsVisible] = useState(false);
  const [viewedRaffles, setViewedRaffles] = useState<string[]>([]);

  useEffect(() => {
    const initializeViewedRaffles = async () => {
      let viewed: string[] = [];
      try {
        const result = await AsyncStorage.getItem(VIEWED_RAFFLE_WINS);
        viewed = result ? JSON.parse(result) : [];
      } catch (err) {}

      if (raffleWins.length > 0) {
        const unviewedWins = raffleWins.filter((win) => !viewed.includes(win.id));
        if (unviewedWins.length > 1) {
          // Get all win IDs except the most recent one
          const olderWinIds = unviewedWins.slice(1).map((win) => win.id);
          viewed = [...viewed, ...olderWinIds];
          await AsyncStorage.setItem(VIEWED_RAFFLE_WINS, JSON.stringify(viewed));
        }
        setIsVisible(unviewedWins.length > 0);
      }
      setViewedRaffles(viewed);
    };
    initializeViewedRaffles();
  }, [raffleWins]);

  useEffect(() => {
    if (alphaUser?.isChad && isRewardsFirst) {
      // You could set some global param/context for eligibility here
      markAsVisited();
    }
  }, [isAlphaUserLoading, isRewardsFirst]);

  const latestWin = useMemo(() => {
    if (!raffleWins?.length) return null;
    return raffleWins.find((win) => !viewedRaffles.includes(win.id));
  }, [raffleWins, viewedRaffles]);

  if (!latestWin || !isVisible) {
    return <TestnetAlertStrip />;
  }

  const handleClick = async () => {
    const updatedViewedRaffles = [...viewedRaffles, latestWin.id];
    await AsyncStorage.setItem(VIEWED_RAFFLE_WINS, JSON.stringify(updatedViewedRaffles));
    setViewedRaffles(updatedViewedRaffles);
    navigation.navigate('Alpha', { page: 'exclusive', listingId: latestWin.id });
  };

  const handleClose = async () => {
    const updatedViewedRaffles = [...viewedRaffles, latestWin.id];
    await AsyncStorage.setItem(VIEWED_RAFFLE_WINS, JSON.stringify(updatedViewedRaffles));
    setViewedRaffles(updatedViewedRaffles);
    setIsVisible(false);
  };

  return (
    <AlertStrip
      message={`You've won a Raffle 🎉, check now`}
      bgColor='#10B981'
      alwaysShow={true}
      onClick={handleClick}
      showCloseButton={true}
      onClose={handleClose}
    />
  );
});

RaffleAndTestnetAlertStrip.displayName = 'RaffleAndTestnetAlertStrip';
export { RaffleAndTestnetAlertStrip };
