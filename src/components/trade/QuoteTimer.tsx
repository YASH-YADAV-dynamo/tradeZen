import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { COLORS } from '../../theme';

interface QuoteTimerProps {
  expiresAt?: number;
  onExpired: () => void;
}

/** Countdown for RFQ quote expiry; triggers onExpired at zero. */
export const QuoteTimer: React.FC<QuoteTimerProps> = ({ expiresAt, onExpired }) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const left = Math.max(0, Math.floor(expiresAt - Date.now() / 1000));
      setSecondsLeft(left);
      if (left === 0) onExpired();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpired]);

  if (!expiresAt) return null;
  return <Text style={styles.text}>Quote expires in {secondsLeft}s</Text>;
};

const styles = StyleSheet.create({
  text: { color: COLORS.green.primary, marginTop: 8, fontWeight: '700' },
});
