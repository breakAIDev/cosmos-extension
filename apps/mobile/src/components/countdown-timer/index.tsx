import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

interface ICountdown {
  minutes: number;
  seconds: number;
  setRevealed: Dispatch<SetStateAction<boolean>>;
  setPassword: Dispatch<SetStateAction<string>>;
}

export default function CountDownTimer({
  minutes = 0,
  seconds = 0,
  setRevealed,
  setPassword,
}: ICountdown) {
  const [time, setTime] = useState({ minutes, seconds });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Set up the interval only once
    intervalRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime.minutes === 0 && prevTime.seconds === 0) {
          // Timer reached 00:00
          setRevealed(false);
          setPassword('');
          clearInterval(intervalRef.current as NodeJS.Timeout);
          return prevTime; // stop at 0
        } else if (prevTime.seconds === 0) {
          return { minutes: prevTime.minutes - 1, seconds: 59 };
        } else {
          return { minutes: prevTime.minutes, seconds: prevTime.seconds - 1 };
        }
      });
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [setRevealed, setPassword]);

  // Optionally, if minutes/seconds props change, reset timer
  useEffect(() => {
    setTime({ minutes, seconds });
  }, [minutes, seconds]);

  return (
    <Text style={styles.countdownText}>
      {`${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`}
    </Text>
  );
}

const styles = StyleSheet.create({
  countdownText: {
    color: '#A3A3A3', // gray-200
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});
