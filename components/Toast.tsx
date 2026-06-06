import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';

// Approximate tab bar height — covers most iOS/Android devices
const TAB_BAR_HEIGHT = 49;

type Props = {
  visible: boolean;
  expenseName: string;
  onClose: () => void;
};

export default function Toast({ visible, expenseName, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(140)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      if (timerRef.current) clearTimeout(timerRef.current);

      slideAnim.setValue(140);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 11,
      }).start();

      timerRef.current = setTimeout(dismiss, 3500);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  function dismiss() {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(slideAnim, {
      toValue: 140,
      duration: 260,
      useNativeDriver: true,
    }).start(() => onClose());
  }

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.toast,
            {
              bottom: insets.bottom + TAB_BAR_HEIGHT + spacing.lg,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="cash-outline" size={20} color={colors.tertiaryGreen} />
          </View>

          {/* Text */}
          <View style={styles.textWrap}>
            <Text style={styles.title}>Sent!</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {expenseName ? `${expenseName} request sent` : 'Expense request sent'}
            </Text>
          </View>

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={dismiss} activeOpacity={0.7}>
            <Ionicons name="close" size={14} color={colors.dark} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.tertiaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    gap: spacing.sm,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${colors.tertiaryGreen}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.dark,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.5,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: `${colors.dark}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
