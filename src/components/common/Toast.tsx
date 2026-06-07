import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, RADIUS, TYPOGRAPHY, SPACING } from '../../theme';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
});

export const useToast = () => useContext(ToastContext);

interface ToastItemProps {
  toast: Toast;
  onHide: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(-80, { duration: 250 }, (done) => {
        if (done) runOnJS(onHide)(toast.id);
      });
    }, toast.duration ?? 3000);

    return () => clearTimeout(timer);
  }, [onHide, opacity, toast.duration, toast.id, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const borderColor =
    toast.type === 'success'
      ? COLORS.green.primary
      : toast.type === 'error'
      ? COLORS.red.primary
      : toast.type === 'warning'
      ? '#F9A825'
      : COLORS.border.accent;

  const iconName =
    toast.type === 'success'
      ? 'checkmark-circle'
      : toast.type === 'error'
        ? 'close-circle'
        : toast.type === 'warning'
          ? 'warning'
          : 'information-circle';

  return (
    <Animated.View style={[styles.toast, { borderLeftColor: borderColor }, animStyle]}>
      <Ionicons name={iconName} size={18} color={borderColor} style={styles.icon} />
      <Text style={styles.message} numberOfLines={2}>
        {toast.message}
      </Text>
    </Animated.View>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { top } = useSafeAreaInsets();

  const show = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = `toast_${Date.now()}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, type, duration }]);
    },
    []
  );

  const hide = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        show,
        success: (m) => show(m, 'success'),
        error: (m) => show(m, 'error'),
        warning: (m) => show(m, 'warning'),
      }}
    >
      {children}
      <View style={[styles.container, { top: top + 8 }]} pointerEvents="none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onHide={hide} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    backgroundColor: COLORS.bg.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderLeftWidth: 3,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: { width: 20 },
  message: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fonts.body,
    lineHeight: 18,
  },
});
