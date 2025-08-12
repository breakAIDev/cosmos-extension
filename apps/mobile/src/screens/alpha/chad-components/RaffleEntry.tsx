import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import dayjs from 'dayjs';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// Card animation variants for moti
const motiCardVariants = {
  from: { opacity: 0, translateY: 10 },
  animate: { opacity: 1, translateY: 0 },
  exit: { opacity: 0, translateY: -10 },
};

const transition = { type: 'timing', duration: 200 };

// ----- Card Wrapper -----
const CardWrapper = ({
  primary = false,
  children,
  style,
}: {
  primary?: boolean;
  children: React.ReactNode;
  style?: any;
}) => (
  <MotiView
    from={motiCardVariants.from}
    animate={motiCardVariants.animate}
    exit={motiCardVariants.exit}
    transition={transition}
    style={[
      styles.card,
      primary ? styles.primaryCard : styles.defaultCard,
      style,
    ]}
  >
    {children}
  </MotiView>
);

// ----- Countdown Item -----
const CountdownItem = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.countdownItem}>
    <View style={styles.countdownValueBox}>
      <Text style={styles.countdownValueText}>
        {String(value).padStart(2, '0')}
      </Text>
    </View>
    <Text style={styles.countdownLabel}>{label}</Text>
  </View>
);

// ----- Countdown -----
interface CountdownProps {
  title: string;
  endDate: string;
  onExpire?: () => void;
}

export function SubscriptionCountdown({ title, endDate, onExpire }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = dayjs();
      const end = dayjs(endDate);
      const diff = end.diff(now, 'second');
      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onExpire?.();
        return;
      }
      const days = Math.floor(diff / (24 * 60 * 60));
      const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      const seconds = Math.floor(diff % 60);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const timerId = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timerId);
  }, [endDate, onExpire]);

  const { days, hours, minutes, seconds } = timeRemaining;

  return (
    <CardWrapper primary>
      <Text style={styles.countdownTitle}>{title}</Text>
      <View style={styles.countdownRow}>
        <CountdownItem label="D" value={days} />
        <CountdownItem label="H" value={hours} />
        <CountdownItem label="M" value={minutes} />
        <CountdownItem label="S" value={seconds} />
      </View>
    </CardWrapper>
  );
}

// ----- Other Info Cards -----
export function IneligibleRaffle() {
  return (
    <CardWrapper>
      <Text style={styles.infoText}>You're not a Leap Chad yet</Text>
      <Text style={styles.infoBoldText}>We'll notify you when you are eligible</Text>
    </CardWrapper>
  );
}

export function ResultSoon() {
  return (
    <CardWrapper>
      <Text style={styles.infoText}>Giveaway has ended</Text>
      <Text style={styles.infoBoldText}>Results will be declared soon</Text>
    </CardWrapper>
  );
}

export function RaffleWinner({ rewardUnit }: { rewardUnit?: string }) {
  return (
    <CardWrapper primary>
      <Text style={styles.infoText}>Congratulations!</Text>
      <Text style={styles.infoBoldText}>You've won {rewardUnit}!</Text>
    </CardWrapper>
  );
}

export function NotRaffleWinner() {
  return (
    <CardWrapper>
      <Text style={styles.infoText}>You did not win</Text>
      <Text style={styles.infoBoldText}>Better luck next time</Text>
    </CardWrapper>
  );
}

export function RaffleClosed() {
  return (
    <CardWrapper>
      <Text style={styles.infoText}>You did not win</Text>
      <Text style={styles.infoBoldText}>Better luck next time</Text>
    </CardWrapper>
  );
}

// ----- Skeleton Loader -----
export function RaffleEntrySkeleton() {
  return (
    <MotiView
      from={motiCardVariants.from}
      animate={motiCardVariants.animate}
      exit={motiCardVariants.exit}
      transition={transition}
      style={{ borderRadius: 20, overflow: 'hidden', marginVertical: 10 }}
    >
      <SkeletonPlaceholder borderRadius={20}>
        <SkeletonPlaceholder.Item width="100%" height={100} borderRadius={20} />
      </SkeletonPlaceholder>
    </MotiView>
  );
}

// ----- Styles -----
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  defaultCard: {
    backgroundColor: '#f7f7f8',
    borderColor: '#ececf1',
  },
  primaryCard: {
    backgroundColor: '#f0fbf5',
    borderColor: '#b1e5c9',
    // You can add gradient backgrounds using 3rd-party libs if needed
  },
  infoText: {
    color: '#4B5563',
    fontSize: 15,
    marginVertical: 2,
    textAlign: 'center',
  },
  infoBoldText: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    marginVertical: 2,
  },
  countdownTitle: {
    color: '#222',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 2,
  },
  countdownItem: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  countdownValueBox: {
    width: 48,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
    borderColor: '#4ade80',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  countdownValueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#036635',
  },
  countdownLabel: {
    fontSize: 11,
    color: '#888',
  },
});

