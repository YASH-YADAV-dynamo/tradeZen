import React from 'react';
import { Stack } from 'expo-router';

import { AppProviders } from '../src/app-shell';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  );
}
