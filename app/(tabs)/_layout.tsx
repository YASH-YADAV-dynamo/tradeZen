import React from 'react';
import { Tabs } from 'expo-router';

import { COLORS } from '../../src/core/theme';
import { CustomTabBar } from '../../src/app-shell';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.bg.primary },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="portfolio" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
