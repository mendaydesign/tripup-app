import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { Traveller } from '../data/trips';

export type ExpenseItem = {
  id: string;
  name: string;
  price: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  tripName: string;
  item: ExpenseItem | null;
  travellers: Traveller[];
  youId: string;
  includedIds: string[];
  onConfirm: (itemId: string, updatedIds: string[]) => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_OFFSET = 64;
const BOUNCE_BUFFER = 120;

export default function ItemBreakdownSheet({
  visible,
  onClose,
  tripName,
  item,
  travellers,
  youId,
  includedIds,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const sheetHeight = SCREEN_HEIGHT - insets.top - HEADER_OFFSET;

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragOffset = useRef(new Animated.Value(0)).current;

  // Internal copy of included IDs — only committed on Confirm
  const [localIncluded, setLocalIncluded] = useState<string[]>(includedIds);

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, sheetHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Sync local state when the sheet opens for a (possibly different) item
  useEffect(() => {
    if (visible) {
      setLocalIncluded(includedIds);
      dragOffset.setValue(0);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.bezier(0.7, -0.4, 0.4, 1.4),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: sheetHeight,
        duration: 280,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, includedIds]);

  function dismiss() {
    Animated.timing(slideAnim, {
      toValue: sheetHeight,
      duration: 280,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      dragOffset.setValue(0);
      onClose();
    });
  }

  function handleConfirm() {
    if (item) onConfirm(item.id, localIncluded);
    dismiss();
  }

  function removeParticipant(id: string) {
    setLocalIncluded((prev) => prev.filter((x) => x !== id));
  }

  function addParticipant(id: string) {
    setLocalIncluded((prev) => [...prev, id]);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) dragOffset.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 100 || vy > 0.5) {
          dismiss();
        } else {
          Animated.spring(dragOffset, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  const combinedTranslate = Animated.add(slideAnim, dragOffset);

  if (!item) return null;

  const includedTravellers = travellers.filter((t) => localIncluded.includes(t.id));
  const excludedTravellers = travellers.filter((t) => !localIncluded.includes(t.id));
  const perPerson =
    includedTravellers.length > 0
      ? Math.round((item.price / includedTravellers.length) * 100) / 100
      : 0;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={dismiss}>
      <View style={styles.wrapper}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={dismiss} activeOpacity={1} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight + BOUNCE_BUFFER,
              transform: [{ translateY: combinedTranslate }],
            },
          ]}
        >
          {/* Drag handle */}
          <View style={styles.dragZone} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              { paddingBottom: insets.bottom + 80 + spacing.lg },
            ]}
          >
            {/* Item name + total */}
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.total}>Total: ${item.price}</Text>

            {/* Travellers Chipping In */}
            <Text style={styles.sectionHeader}>Travellers Chipping In</Text>
            {includedTravellers.map((t) => {
              const displayName = t.id === youId ? 'You' : (t.name?.split(' ')[0] ?? t.initials);
              return (
                <View key={t.id} style={styles.personRow}>
                  <View style={[styles.avatar, { backgroundColor: t.color }]}>
                    <Text style={styles.avatarInitials}>{t.initials}</Text>
                  </View>
                  <Text style={styles.personName}>
                    {displayName}: ${perPerson}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeParticipant(t.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Excluded */}
            <Text style={styles.sectionHeader}>Excluded</Text>
            {excludedTravellers.length === 0 ? (
              <Text style={styles.emptyNote}>No one excluded yet</Text>
            ) : (
              excludedTravellers.map((t) => {
                const displayName = t.id === youId ? 'You' : (t.name?.split(' ')[0] ?? t.initials);
                return (
                  <View key={t.id} style={styles.personRow}>
                    <View style={[styles.avatar, styles.avatarExcluded]}>
                      <Text style={[styles.avatarInitials, styles.avatarInitialsExcluded]}>
                        {t.initials}
                      </Text>
                    </View>
                    <Text style={[styles.personName, styles.personNameExcluded]}>
                      {displayName}
                    </Text>
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => addParticipant(t.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.addBtnText}>Add back</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Sticky Confirm button inside the sheet */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, spacing.lg) },
            ]}
          >
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Confirm Changes</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${colors.dark}60`,
  },
  sheet: {
    position: 'absolute',
    bottom: -BOUNCE_BUFFER,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  dragZone: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${colors.dark}25`,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
  },
  itemName: {
    ...typography.h1,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.dark,
    marginBottom: 4,
  },
  total: {
    ...typography.h2,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.h3,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    marginBottom: spacing.sm,
    marginTop: 4,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarExcluded: {
    backgroundColor: `${colors.dark}12`,
  },
  avatarInitials: {
    ...typography.label,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.white,
  },
  avatarInitialsExcluded: {
    color: `${colors.dark}40`,
  },
  personName: {
    ...typography.bodyLarge,
    color: colors.dark,
    flex: 1,
  },
  personNameExcluded: {
    opacity: 0.4,
  },
  removeBtn: {
    backgroundColor: `${colors.tertiaryPink}35`,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  removeBtnText: {
    ...typography.label,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.tertiaryPink,
  },
  addBtn: {
    backgroundColor: `${colors.tertiaryGreen}20`,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  addBtnText: {
    ...typography.label,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.tertiaryGreen,
  },
  emptyNote: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.35,
    paddingVertical: 8,
  },
  footer: {
    position: 'absolute',
    bottom: BOUNCE_BUFFER,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
  },
  confirmBtn: {
    backgroundColor: colors.brandOrange,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  confirmBtnText: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.white,
  },
});
