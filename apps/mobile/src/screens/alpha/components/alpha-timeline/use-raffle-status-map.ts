import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RAFFLE_STATUS_KEY = 'RAFFLE_STATUS_MAP';

export type RaffleVisibilityStatus = 'hidden' | 'completed';
type RaffleStatusMap = Record<string, RaffleVisibilityStatus>;

const getRaffleStatusMap = async (): Promise<RaffleStatusMap> => {
  try {
    const stored = await AsyncStorage.getItem(RAFFLE_STATUS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    await AsyncStorage.removeItem(RAFFLE_STATUS_KEY);
    return {};
  }
};

const setRaffleStatus = async (id: string, status: RaffleVisibilityStatus) => {
  const map = await getRaffleStatusMap();
  map[id] = status;
  await AsyncStorage.setItem(RAFFLE_STATUS_KEY, JSON.stringify(map));
};

export const useRaffleStatusMap = () => {
  const [raffleStatusMap, setRaffleStatusMap] = useState<RaffleStatusMap>({});

  useEffect(() => {
    getRaffleStatusMap().then(setRaffleStatusMap);
  }, []);

  const updateRaffleStatus = useCallback(async (id: string, status: RaffleVisibilityStatus) => {
    await setRaffleStatus(id, status);
    setRaffleStatusMap((prev) => ({ ...prev, [id]: status }));
  }, []);

  return { raffleStatusMap, updateRaffleStatus };
};
