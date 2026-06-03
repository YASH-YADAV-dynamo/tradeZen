import React from 'react';
import { Tabs } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, TYPOGRAPHY } from '../../src/theme';
import { useHaptics } from '../../src/hooks/useHaptics';

const Icons = {
  markets: (active: boolean) => (
    <View style={styles.iconWrap}>
      <View style={styles.barChart}>
        <View style={[styles.bar, styles.bar1, active && styles.barActive]} />
        <View style={[styles.bar, styles.bar2, active && styles.barActive]} />
        <View style={[styles.bar, styles.bar3, active && styles.barActive]} />
      </View>
    </View>
  ),
  trade: (active: boolean) => (
    <View style={styles.iconWrap}>
      <View style={[styles.crosshair, active && styles.crosshairActive]}>
        <View style={[styles.crossH, active && styles.crossActive]} />
        <View style={[styles.crossV, active && styles.crossActive]} />
        <View style={[styles.crossDot, active && styles.crossDotActive]} />
      </View>
    </View>
  ),
  portfolio: (active: boolean) => (
    <View style={styles.iconWrap}>
      <View style={[styles.wallet, active && styles.walletActive]}>
        <View style={[styles.walletBody, active && styles.walletBodyActive]} />
        <View style={[styles.walletTab, active && styles.walletTabActive]} />
      </View>
    </View>
  ),
  settings: (active: boolean) => (
    <View style={styles.iconWrap}>
      <View style={[styles.gear, active && styles.gearActive]}>
        {[0, 60, 120].map((deg) => (
          <View
            key={deg}
            style={[
              styles.gearTooth,
              { transform: [{ rotate: `${deg}deg` }] },
              active && styles.gearToothActive,
            ]}
          />
        ))}
        <View style={[styles.gearCenter, active && styles.gearCenterActive]} />
      </View>
    </View>
  ),
};

const TABS = [
  { name: 'index', label: 'Markets', icon: Icons.markets },
  // Trading is temporarily hidden from the app shell.
  // { name: 'trade', label: 'Trade', icon: Icons.trade },
  { name: 'portfolio', label: 'Portfolio', icon: Icons.portfolio },
  { name: 'settings', label: 'Settings', icon: Icons.settings },
];

function CustomTabBar({ state, navigation }: any) {
  const { onTap } = useHaptics();
  const { width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const visibleTabs = TABS.map((tab) => ({
    ...tab,
    route: state.routes.find((route: any) => route.name === tab.name),
  })).filter((tab) => tab.route);
  const activeRouteKey = state.routes[state.index]?.key;
  const activeIndex = Math.max(
    0,
    visibleTabs.findIndex((tab) => tab.route.key === activeRouteKey)
  );
  const tabBarWidth = Math.min(width - 36, 430);
  const tabWidth = tabBarWidth / visibleTabs.length;
  const tabBottom = Math.max(bottom + 14, 26);
  const tabHeight = Platform.OS === 'ios' ? 64 : 58;
  const indicatorX = useSharedValue(activeIndex * tabWidth);

  React.useEffect(() => {
    indicatorX.value = withSpring(activeIndex * tabWidth, {
      damping: 20,
      stiffness: 300,
    });
  }, [activeIndex, indicatorX, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          left: (width - tabBarWidth) / 2,
          bottom: tabBottom,
          height: tabHeight,
          width: tabBarWidth,
        },
      ]}
    >
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.borderTop} />
      <Animated.View style={[styles.indicator, { width: tabWidth }, indicatorStyle]} />

      {visibleTabs.map((tab) => {
        return (
          <TabButton
            key={tab.name}
            tab={tab}
            isFocused={tab.route.key === activeRouteKey}
            routeKey={tab.route.key}
            routeName={tab.route.name}
            navigation={navigation}
            onTap={onTap}
          />
        );
      })}
    </View>
  );
}

function TabButton({
  tab,
  isFocused,
  routeKey,
  routeName,
  navigation,
  onTap,
}: any) {
  const scaleAnim = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const onPress = () => {
    onTap();
    scaleAnim.value = withSpring(0.93, { damping: 15 }, () => {
      scaleAnim.value = withSpring(1, { damping: 15 });
    });
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <Animated.View style={[styles.tab, pressStyle]}>
      <TouchableOpacity style={styles.tabInner} onPress={onPress} activeOpacity={1}>
        {tab.icon(isFocused)}
        <Text style={[styles.label, isFocused && styles.labelActive]}>{tab.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

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
      {/* Trading is temporarily hidden from tabs. */}
      <Tabs.Screen name="trade" options={{ href: null }} />
      <Tabs.Screen name="portfolio" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg.secondary,
    position: 'absolute',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    overflow: 'hidden',
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: COLORS.border.default,
  },
  indicator: {
    position: 'absolute',
    top: 1,
    height: 3,
    backgroundColor: COLORS.green.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    shadowColor: COLORS.green.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    height: '100%',
  },
  tabInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.text.muted,
    fontFamily: TYPOGRAPHY.fonts.heading,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: COLORS.green.primary,
  },
  iconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 },
  bar: { width: 4, backgroundColor: COLORS.text.muted, borderRadius: 1 },
  barActive: { backgroundColor: COLORS.green.primary },
  bar1: { height: 8 },
  bar2: { height: 14 },
  bar3: { height: 11 },
  crosshair: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  crossH: {
    position: 'absolute',
    width: 14,
    height: 1.5,
    backgroundColor: COLORS.text.muted,
  },
  crossV: {
    position: 'absolute',
    width: 1.5,
    height: 14,
    backgroundColor: COLORS.text.muted,
  },
  crossDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.text.muted,
  },
  crosshairActive: {},
  crossActive: { backgroundColor: COLORS.green.primary },
  crossDotActive: { backgroundColor: COLORS.green.primary },
  wallet: {
    width: 16,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletBody: {
    position: 'absolute',
    bottom: 0,
    width: 16,
    height: 11,
    borderWidth: 1.5,
    borderColor: COLORS.text.muted,
    borderRadius: 3,
  },
  walletTab: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 4,
    borderWidth: 1.5,
    borderColor: COLORS.text.muted,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: COLORS.bg.secondary,
  },
  walletActive: {},
  walletBodyActive: { borderColor: COLORS.green.primary },
  walletTabActive: { borderColor: COLORS.green.primary },
  gear: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  gearCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text.muted,
    position: 'absolute',
  },
  gearCenterActive: { backgroundColor: COLORS.green.primary },
  gearTooth: {
    position: 'absolute',
    width: 2,
    height: 5,
    borderRadius: 1,
    backgroundColor: COLORS.text.muted,
    top: -1,
  },
  gearToothActive: { backgroundColor: COLORS.green.primary },
  gearActive: {},
});
