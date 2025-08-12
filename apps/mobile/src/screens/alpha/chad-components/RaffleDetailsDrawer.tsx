import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../../../components/text';
import { X, CheckCircle } from 'phosphor-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { MotiView, AnimatePresence } from 'moti';

import { getLeapapiBaseUrl } from '@leapwallet/cosmos-wallet-hooks';
import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { ButtonName, EventName, PageName } from '../../../services/config/analytics';
import { VIEWED_RAFFLE_WINS } from '../../../services/config/storage-keys';
import { usePageView } from '../../../hooks/analytics/usePageView';
import { RaffleStatus, useRaffleWins } from '../../../hooks/useAlphaOpportunities';
import { useRaffleEntry } from '../../../hooks/useRaffleEntry';

import { ChadDescription } from '../components/AlphaDescription';
import Tags from '../components/Tags';
import { useChadProvider } from '../context/chad-exclusives-context';
import { endsInUTC } from '../utils';
import {
  IneligibleRaffle,
  NotRaffleWinner,
  RaffleClosed,
  RaffleEntrySkeleton,
  RaffleWinner,
  ResultSoon,
  SubscriptionCountdown,
} from './RaffleEntry';
import { RaffleListingProps } from './RaffleListing';
import { mixpanelTrack } from '../../../utils/tracking';

type RaffleDetailsDrawerProps = {
  isShown: boolean;
  onClose: () => void;
  raffle: RaffleListingProps | null;
};

const now = dayjs();

export default function RaffleDetailsDrawer({ isShown, onClose, raffle }: RaffleDetailsDrawerProps) {
  const { alphaUser } = useChadProvider();
  usePageView(PageName.ChadExclusivesDetail, isShown, {
    isChad: alphaUser?.isChad ?? false,
    ecosystem: [...new Set(raffle?.ecosystem ?? [])],
    categories: [...new Set(raffle?.categories ?? [])],
  });

  const { raffleWins } = useRaffleWins(alphaUser?.id ?? '');
  const [toast, setToast] = useState('');

  const end = useMemo(() => dayjs(raffle?.endsAt), [raffle?.endsAt]);
  const start = useMemo(() => dayjs(raffle?.startsAt), [raffle?.startsAt]);

  const [isUpcoming, setIsUpcoming] = useState(start.isAfter(now));
  const [diff, setDiff] = useState(raffle?.status === RaffleStatus.COMPLETED ? 0 : end.diff(now, 'second'));

  const isLive = useMemo(
    () =>
      Boolean(
        raffle?.endsAt &&
          diff >= 0 &&
          raffle?.status !== RaffleStatus.COMPLETED &&
          endsInUTC(raffle?.endsAt) !== 'Ended',
      ),
    [diff, raffle?.endsAt, raffle?.status],
  );

  useEffect(() => {
    const updateStates = () => {
      const currentNow = dayjs();
      const isCurrentlyUpcoming = start.isAfter(currentNow);
      const currentDiff = raffle?.status === RaffleStatus.COMPLETED ? 0 : end.diff(currentNow, 'second');
      setIsUpcoming(isCurrentlyUpcoming);
      setDiff(currentDiff);
    };

    updateStates();
    const interval = setInterval(updateStates, 1000);
    return () => clearInterval(interval);
  }, [raffle?.status, start, end]);

  const { hasEntered: raffleEntered, isLoading, refetch } = useRaffleEntry(raffle?.id, alphaUser?.id);

  const isWinner = useMemo(() => {
    return raffleWins.find((win) => win.id === raffle?.id);
  }, [raffleWins, raffle?.id]);

  useEffect(() => {
    if (toast) {
      setTimeout(() => setToast(''), 2000);
    }
  }, [toast]);

  useEffect(() => {
    const markRaffleAsViewed = async () => {
      if (isShown && isWinner && raffle?.id) {
        try {
          const viewedRafflesStr = await AsyncStorage.getItem(VIEWED_RAFFLE_WINS);
          const viewedRaffles = viewedRafflesStr ? JSON.parse(viewedRafflesStr) : [];
          if (!viewedRaffles.includes(raffle.id)) {
            const updatedViewedRaffles = [...viewedRaffles, raffle.id];
            await AsyncStorage.setItem(VIEWED_RAFFLE_WINS, JSON.stringify(updatedViewedRaffles));
          }
        } catch (e) {}
      }
    };
    markRaffleAsViewed();
  }, [isShown, isWinner, raffle?.id]);

  const handleEnterRaffle = useCallback(async () => {
    try {
      const baseUrl = getLeapapiBaseUrl();
      const url = `${baseUrl}/alpha-insights/raffle-entries`;
      await axios.post(url, {
        raffleId: raffle?.id,
        userId: alphaUser?.id,
      });
      mixpanelTrack(EventName.ButtonClick, {
        buttonName: ButtonName.ENTER_RAFFLE,
        ButtonPageName: PageName.ChadExclusivesDetail,
        isChad: alphaUser?.isChad ?? false,
      });
      await refetch();
    } catch (err) {
      // gentle catch
    }
  }, [alphaUser?.id, alphaUser?.isChad, raffle?.id, refetch]);

  return (
    <>
      <BottomModal
        fullScreen
        title='Reward Details'
        isOpen={isShown}
        onClose={onClose}
        style={styles.modal}
        footerComponent={
          isWinner ? (
            <Button style={styles.fullWidth}>Claim now</Button>
          ) : raffleEntered ? (
            <Button style={styles.fullWidth} onPress={handleEnterRaffle} disabled>
              <CheckCircle size={20} weight='bold' />
              <Text style={styles.buttonText}>You have entered!</Text>
            </Button>
          ) : isLive ? (
            <Button style={styles.fullWidth} onPress={handleEnterRaffle}>
              <Text style={styles.buttonText}>Enter giveaway</Text>
            </Button>
          ) : (
            <Button style={styles.fullWidth} onPress={onClose}>
              <Text style={styles.buttonText}>View more exclusives</Text>
            </Button>
          )
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{raffle?.title}</Text>
          <Tags
            style={{ alignSelf: 'center' }}
            ecosystemFilter={raffle?.ecosystem ?? []}
            categoryFilter={raffle?.categories ?? []}
          />
        </View>

        <Image
          source={{ uri: raffle?.bannerImage ?? `https://placehold.co/40x40?text=${raffle?.secondaryTitle}` }}
          style={styles.bannerImage}
        />

        <Separator />

        <AnimatePresence>
          {isLoading ? (
            <MotiView
              key='loading'
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RaffleEntrySkeleton />
            </MotiView>
          ) : isUpcoming ? (
            <MotiView key='subscription-countdown' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SubscriptionCountdown
                title={'Stay tuned, starting in'}
                endDate={raffle?.startsAt ?? ''}
                onExpire={() => setIsUpcoming(false)}
              />
            </MotiView>
          ) : !raffleEntered && alphaUser?.isChad && diff > 0 ? (
            <MotiView key='subscription-countdown' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SubscriptionCountdown
                title={'Giveaway ends in'}
                endDate={raffle?.endsAt ?? ''}
                onExpire={() => setDiff(0)}
              />
            </MotiView>
          ) : raffleEntered && raffle?.status !== RaffleStatus.COMPLETED ? (
            <MotiView key='result-soon' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultSoon />
            </MotiView>
          ) : isWinner ? (
            <MotiView key='raffle-winner' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RaffleWinner rewardUnit={raffle?.rewardUnitName} />
            </MotiView>
          ) : raffleEntered && !isWinner ? (
            <MotiView key='not-winner' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NotRaffleWinner />
            </MotiView>
          ) : !alphaUser?.isChad && diff > 0 ? (
            <MotiView key='ineligible' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <IneligibleRaffle />
            </MotiView>
          ) : diff <= 0 ? (
            <MotiView key='raffle-closed' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RaffleClosed />
            </MotiView>
          ) : null}
        </AnimatePresence>

        <Separator />

        {raffle?.description ? (
          <ChadDescription {...raffle} pageName={raffle.pageName} />
        ) : null}
      </BottomModal>

      {/* Toast using moti for animation */}
      {isShown && (
        <AnimatePresence>
          {toast && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 20 }}
              transition={{ type: 'timing', duration: 200 }}
              style={styles.toastContainer}
            >
              <Text style={styles.toastText}>{toast}</Text>
              <TouchableOpacity onPress={() => setToast('')}>
                <X size={16} color="#fff" weight="bold" />
              </TouchableOpacity>
            </MotiView>
          )}
        </AnimatePresence>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modal: {
    paddingHorizontal: 24,
    paddingTop: 32,
    flex: 1,
    flexDirection: 'column',
    gap: 24,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  bannerImage: {
    width: '100%',
    height: 107,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 15,
  },
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 100,
    backgroundColor: '#22C55E',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  toastText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
