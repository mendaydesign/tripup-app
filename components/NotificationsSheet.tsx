import React, { useEffect, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';

export type AppNotification = {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  type: 'poll' | 'expense' | 'participant';
};

type Props = {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onPressNotification?: (notif: AppNotification) => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_OFFSET = 64;
const BOUNCE_BUFFER = 120;

function getIconConfig(type: AppNotification['type']) {
  switch (type) {
    case 'poll':
      return { name: 'bar-chart-outline' as const, color: colors.tertiaryPurple, bg: `${colors.tertiaryPurple}20` };
    case 'expense':
      return { name: 'receipt-outline' as const, color: colors.tertiaryGreen, bg: `${colors.tertiaryGreen}20` };
    case 'participant':
      return { name: 'person-add-outline' as const, color: colors.brandOrange, bg: `${colors.brandOrange}20` };
  }
}

export default function NotificationsSheet({ visible, onClose, notifications, onPressNotification }: Props) {
  const insets = useSafeAreaInsets();
  const sheetHeight = SCREEN_HEIGHT - insets.top - HEADER_OFFSET;

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragOffset = useRef(new Animated.Value(0)).current;

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, sheetHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (visible) {
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
  }, [visible]);

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

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={dismiss}>
      <View style={styles.wrapper}>
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
          <View style={styles.dragZone} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.title}>Notifications</Text>

            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={48} color={`${colors.dark}30`} />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            ) : (
              [...notifications].reverse().map((notif) => {
                const icon = getIconConfig(notif.type);
                const tappable = !!onPressNotification;
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={styles.notifRow}
                    activeOpacity={tappable ? 0.7 : 1}
                    disabled={!tappable}
                    onPress={tappable ? () => { dismiss(); onPressNotification!(notif); } : undefined}
                  >
                    <View style={[styles.notifIcon, { backgroundColor: icon.bg }]}>
                      <Ionicons name={icon.name} size={20} color={icon.color} />
                    </View>
                    <View style={styles.notifContent}>
                      <View style={styles.notifTitleRow}>
                        <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                        <Text style={styles.notifTimestamp}>{notif.timestamp}</Text>
                      </View>
                      <Text style={styles.notifSubtitle} numberOfLines={2}>{notif.subtitle}</Text>
                    </View>
                    {tappable && (
                      <Ionicons name="chevron-forward" size={16} color={`${colors.dark}30`} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
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
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    gap: spacing.lg,
  },
  emptyText: {
    ...typography.bodyLarge,
    color: colors.dark,
    opacity: 0.35,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#F7F7F7',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 3,
  },
  notifTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  notifTitle: {
    ...typography.bodySmall,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    flex: 1,
  },
  notifTimestamp: {
    ...typography.label,
    color: colors.dark,
    opacity: 0.4,
  },
  notifSubtitle: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.55,
    lineHeight: 18,
  },
});
