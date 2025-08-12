import { BOOKMARKED_ALPHAS, BOOKMARKED_CHAD_LISTINGS } from '../../../services/config/storage-keys';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- React Native storage
import { Raffle } from '../../../hooks/useAlphaOpportunities';

// ---- Bookmarking Alphas ----
export const getBookmarkedAlphas = async () => {
  try {
    const stored = await AsyncStorage.getItem(BOOKMARKED_ALPHAS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    await AsyncStorage.removeItem(BOOKMARKED_ALPHAS);
    return [];
  }
};

export const getBookmarkedChadListings = async () => {
  try {
    const stored = await AsyncStorage.getItem(BOOKMARKED_CHAD_LISTINGS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    await AsyncStorage.removeItem(BOOKMARKED_CHAD_LISTINGS);
    return [];
  }
};

export const isAlphaBookmarked = async (id) => {
  const bookmarks = await getBookmarkedAlphas();
  return bookmarks.includes(id);
};

export const toggleAlphaBookmark = async (id) => {
  const bookmarks = await getBookmarkedAlphas();
  const newBookmarks = bookmarks.includes(id)
    ? bookmarks.filter((bookmarkId: number) => bookmarkId !== id)
    : [...bookmarks, id];
  await AsyncStorage.setItem(BOOKMARKED_ALPHAS, JSON.stringify(newBookmarks));
};

export const toggleChadListingBookmark = async (id) => {
  const bookmarks = await getBookmarkedChadListings();
  const newBookmarks = bookmarks.includes(id)
    ? bookmarks.filter((bookmarkId: number) => bookmarkId !== id)
    : [...bookmarks, id];
  await AsyncStorage.setItem(BOOKMARKED_CHAD_LISTINGS, JSON.stringify(newBookmarks));
};

// ---- Sorting and Formatting (No changes needed) ----
export const sortRafflesByStatus = (raffles: Raffle[]) => {
  return [...raffles].sort((a, b) => {
    const now = dayjs();
    const aStartsAt = dayjs(a.startsAt);
    const aEndsAt = dayjs(a.endsAt);
    const bStartsAt = dayjs(b.startsAt);
    const bEndsAt = dayjs(b.endsAt);

    const getStatusPriority = (raffle: Raffle, startsAt: dayjs.Dayjs, endsAt: dayjs.Dayjs) => {
      if (raffle.status === 'COMPLETED') return 3;
      if (startsAt.isBefore(now) && now.isBefore(endsAt)) return 1;
      if (startsAt.isAfter(now)) return 2;
      return 3;
    };

    const aPriority = getStatusPriority(a, aStartsAt, aEndsAt);
    const bPriority = getStatusPriority(b, bStartsAt, bEndsAt);

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    if (aPriority === 3) {
      return bEndsAt.unix() - aEndsAt.unix();
    } else if (aPriority === 2) {
      return aStartsAt.unix() - bStartsAt.unix();
    } else {
      return aEndsAt.unix() - bEndsAt.unix();
    }
  });
};

export const sortOpportunitiesByDate = <T extends { additionDate: string }>(opportunities: T[]): T[] => {
  return opportunities.sort((a, b) => {
    const [monthA, dayA, yearA] = a.additionDate.split('/').map(Number);
    const [monthB, dayB, yearB] = b.additionDate.split('/').map(Number);

    const dateA = new Date(yearA, monthA - 1, dayA).getTime();
    const dateB = new Date(yearB, monthB - 1, dayB).getTime();

    return dateB - dateA;
  });
};

export const formatRaffleDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

export const getHostname = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split('.').slice(-2).join('.');
  } catch {
    return url;
  }
};

export const parseDate = (dateStr: string) => {
  const [month, day, year] = dateStr.split('/').map((num) => parseInt(num, 10));
  return new Date(year, month - 1, day);
};

export const formatTimeDiff = (timeDiff: number, pastSuffix = false) => {
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
  if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  return 'Today';
};

export const endsIn = (endDate: string) => {
  const parsedDate = parseDate(endDate);
  const now = new Date();

  parsedDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  if (now.getTime() === parsedDate.getTime()) {
    return 'Ends today';
  }
  if (now.getTime() > parsedDate.getTime()) {
    return 'Ended';
  }

  const timeDiff = parsedDate.getTime() - now.getTime();
  const timeLeft = formatTimeDiff(timeDiff);
  return timeLeft === 'Today' ? 'Ends today' : `Ends in ${timeLeft}`;
};

export const addedAt = (additionDate: string) => {
  const parsedDate = parseDate(additionDate);
  if (new Date().toDateString() === parsedDate.toDateString()) {
    return 'Today';
  }
  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString('en-US', { month: 'short' });
  return `${day} ${month}`;
};

export const formatDateTime = (dateTimeString: string, includeTime = true) => {
  const date = new Date(`${dateTimeString.replace(' ', 'T')}Z`);
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  if (includeTime) {
    Object.assign(dateOptions, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  return date.toLocaleString(undefined, dateOptions);
};

export const RaffleEndsIn = (endDate: string) => {
  const parsedDate = parseDate(endDate);
  const timeDiff = parsedDate.getTime() - new Date().getTime();

  if (timeDiff <= 0) return 'Ended';
  if (new Date().toDateString() === parsedDate.toDateString()) {
    return 'Ends today';
  }

  const timeLeft = formatTimeDiff(timeDiff);
  return timeLeft === 'Today' ? 'Ends today' : `Ends in ${timeLeft}`;
};

export const endsInUTC = (endDateUTC: string): string => {
  const endDate = new Date(endDateUTC);
  const nowUTC = new Date();
  const timeDiff = endDate.getTime() - nowUTC.getTime();

  if (timeDiff <= 0) return 'Ended';

  const isSameUTCDate =
    endDate.getUTCFullYear() === nowUTC.getUTCFullYear() &&
    endDate.getUTCMonth() === nowUTC.getUTCMonth() &&
    endDate.getUTCDate() === nowUTC.getUTCDate();

  if (isSameUTCDate) return 'Ends today';

  const timeLeft = formatTimeDiff(timeDiff);
  return timeLeft === 'Today' ? 'Ends today' : `Ends in ${timeLeft}`;
};

export const startsInUTC = (startDateUTC: string): string => {
  const startDate = new Date(startDateUTC);
  const nowUTC = new Date();
  const timeDiff = startDate.getTime() - nowUTC.getTime();

  if (timeDiff <= 0) return 'Started';

  const isSameUTCDate =
    startDate.getUTCFullYear() === nowUTC.getUTCFullYear() &&
    startDate.getUTCMonth() === nowUTC.getUTCMonth() &&
    startDate.getUTCDate() === nowUTC.getUTCDate();

  if (isSameUTCDate) return 'Starts today';

  const timeLeft = formatTimeDiff(timeDiff);
  return timeLeft === 'Today' ? 'Starts today' : `Starts in ${timeLeft}`;
};
