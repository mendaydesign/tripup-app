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

const TAB_BAR_HEIGHT = 49;

type Props = {
  visible: boolean;
  onClose: () => void;
  // Content — provide either the generic props OR the legacy expenseName shorthand
  title?: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  borderColor?: string;
  // Legacy shorthand (expense toast)
  expenseName?: string;
};

export default function Toast({
  visible,
  onClose,
  title,
  subtitle,
  iconName,
  iconColor,
  iconBgColor,
  borderColor,
  expenseName,
}: Props) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(140)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolve content — generic props take priority; fall back to expense defaults
  const resolvedTitle = title ?? 'Sent!';
  const resolvedSubtitle = subtitle ?? (expenseName ? `${expenseName} request sent` : 'Expense request sent');
  const resolvedIcon: keyof typeof Ionicons.glyphMap = iconName ?? 'cash-outline';
  const resolvedIconColor = iconColor ?? colors.tertiaryGreen;
  const resolvedIconBg = iconBgColor ?? `${colors.tertiaryGreen}20`;
  const resolvedBorder = borderColor ?? colors.tertiaryBlue;

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
              borderColor: resolvedBorder,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: resolvedIconBg }]}>
            <Ionicons name={resolvedIcon} size={20} color={resolvedIconColor} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>{resolvedTitle}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{resolvedSubtitle}</Text>
          </View>
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
