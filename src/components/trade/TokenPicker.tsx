import React from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { UIToken } from '../../utils/token';
import { useHaptics } from '../../hooks/useHaptics';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface TokenPickerProps {
  visible: boolean;
  title: string;
  tokens: UIToken[];
  onSelect: (token: UIToken) => void;
  onClose: () => void;
}

/** Bottom-sheet style modal for selecting a trade token. */
export const TokenPicker: React.FC<TokenPickerProps> = ({
  visible,
  title,
  tokens,
  onSelect,
  onClose,
}) => {
  const { onSelect: hapticSelect } = useHaptics();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <FlatList
            data={tokens}
            keyExtractor={(item) => item.address}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  hapticSelect();
                  onSelect(item);
                  onClose();
                }}
              >
                <Image source={{ uri: item.logoURI }} style={styles.logo} />
                <View style={styles.info}>
                  <Text style={styles.symbol}>{item.symbol}</Text>
                  <Text style={styles.name}>{item.name}</Text>
                </View>
              </Pressable>
            )}
          />
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: COLORS.bg.elevated,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.base,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '900',
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border.muted,
  },
  logo: { width: 32, height: 32, borderRadius: 16 },
  info: { flex: 1 },
  symbol: { color: COLORS.text.primary, fontWeight: '800' },
  name: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.xs },
  close: { marginTop: SPACING.sm, alignItems: 'center', paddingVertical: 12 },
  closeText: { color: COLORS.text.muted, fontWeight: '700' },
});
