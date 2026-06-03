import { Redirect } from 'expo-router';

// Trading is temporarily disabled from the app experience.
// Restore the order ticket here when the trading flow is ready again.
export default function TradeScreen() {
  return <Redirect href="/(tabs)" />;
}
