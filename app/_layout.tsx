import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '../src/api/queryClient';
import { ArticleViewerProvider, NewsBoot } from '../src/components/news';
import { ToastProvider } from '../src/components/common/Toast';
import { initSounds } from '../src/platform/sounds';
import { COLORS } from '../src/theme';
import { PrivyRoot, PrivyWalletBridge, WalletProvider } from '../src/wallet';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initSounds();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.bootstrap}>
        <ActivityIndicator color={COLORS.green.primary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PrivyRoot>
          <QueryClientProvider client={queryClient}>
            <WalletProvider>
              <PrivyWalletBridge />
              <ToastProvider>
                <ArticleViewerProvider>
                  <NewsBoot />
                  <StatusBar style="light" backgroundColor={COLORS.bg.primary} />
                  <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="token/[symbol]" />
                    <Stack.Screen name="confirm" />
                    <Stack.Screen name="order-status" />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </ArticleViewerProvider>
              </ToastProvider>
            </WalletProvider>
          </QueryClientProvider>
        </PrivyRoot>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = {
  root: { flex: 1 } as const,
  bootstrap: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
};
