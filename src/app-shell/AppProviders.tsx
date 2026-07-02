import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '../core/config/queryClient';
import { COLORS } from '../core/theme';
import { useAuthBootstrap } from '../features/auth/hooks';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Every cross-cutting provider the app needs lives here, in one place,
 * instead of being nested inline inside the router's root layout. This is
 * the only file that needs to change when a new global provider is added.
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    JetBrainsMono_600SemiBold,
  });

  useAuthBootstrap();

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor={COLORS.bg.primary} />
          {children}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
