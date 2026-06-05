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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Traveller } from '../data/trips';

type InviteEntry = { id: string; name: string; initials: string; color: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  travellers: Traveller[];
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// Height of the fixed header: safe area + header row (~64px)
const HEADER_OFFSET = 64;
// Extra height hanging below the screen so the bottom never gaps during bounce overshoot
const BOUNCE_BUFFER = 120;

const INVITE_COLORS = [
  colors.tertiaryBlue,
  colors.tertiaryPink,
  colors.tertiaryPurple,
  colors.brandOrange,
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ParticipantSheet({ visible, onClose, travellers }: Props) {
  const insets = useSafeAreaInsets();
  const sheetHeight = SCREEN_HEIGHT - insets.top - HEADER_OFFSET;

  // slideAnim: 0 = open (natural position), sheetHeight = off screen below
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // dragOffset: tracks finger drag distance on top of slideAnim
  const dragOffset = useRef(new Animated.Value(0)).current;

  const [inputValue, setInputValue] = useState('');
  const [invites, setInvites] = useState<InviteEntry[]>([]);
  const colorIndex = useRef(0);

  // Backdrop opacity is derived from slide position so it tracks swipe gestures too
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

  function handleSend() {
    const name = inputValue.trim();
    if (!name) return;
    const color = INVITE_COLORS[colorIndex.current % INVITE_COLORS.length];
    colorIndex.current += 1;
    setInvites((prev) => [
      ...prev,
      { id: String(Date.now()), name, initials: getInitials(name), color },
    ]);
    setInputValue('');
  }

  const combinedTranslate = Animated.add(slideAnim, dragOffset);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={dismiss}>
      <View style={styles.wrapper}>
        {/* Backdrop — tap to close */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={dismiss} activeOpacity={1} />
        </Animated.View>

        {/* Sheet — absolutely pinned to bottom/left/right; extra BOUNCE_BUFFER height
            hangs below the screen so the bottom stays white during overshoot */}
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight + BOUNCE_BUFFER,
              transform: [{ translateY: combinedTranslate }],
            },
          ]}
        >
          {/* Drag zone — PanResponder lives here so it doesn't fight ScrollView */}
          <View style={styles.dragZone} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <Text style={styles.title}>Invite fellow travellers!</Text>

            {/* Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone number or username</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Input Text"
                  placeholderTextColor={`${colors.dark}40`}
                  value={inputValue}
                  onChangeText={setInputValue}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={handleSend} style={styles.sendBtn} activeOpacity={0.7}>
                  <Ionicons name="send" size={18} color={colors.dark} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.helperText}>
              Send an invite via phone number if the traveller does not have an active TripUp
              account and we can help get them onboard with your Trip!
            </Text>

            {/* Current Travellers */}
            <Text style={styles.sectionHeader}>Current Travellers</Text>
            {travellers.map((t) => (
              <View key={t.id} style={styles.personRow}>
                <View style={[styles.avatar, { backgroundColor: t.color }]}>
                  <Text style={styles.avatarInitials}>{t.initials}</Text>
                </View>
                <Text style={styles.personName}>{t.name ?? t.initials}</Text>
              </View>
            ))}

            {/* Invites */}
            <Text style={styles.sectionHeader}>Invites</Text>
            {invites.map((inv) => (
              <View key={inv.id} style={styles.personRow}>
                <View style={[styles.avatar, { backgroundColor: inv.color }]}>
                  <Text style={styles.avatarInitials}>{inv.initials}</Text>
                </View>
                <Text style={styles.personName}>{inv.name}</Text>
                <View style={styles.acceptedTag}>
                  <Text style={styles.acceptedText}>Accepted</Text>
                </View>
              </View>
            ))}
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // Drag zone: handle sits 20px from sheet top
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
  // paddingTop 16 → total top-of-sheet to title = 20 + 4 + 10 + 16 = 50px
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.dark,
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: `${colors.dark}30`,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingTop: 6,
    paddingBottom: 4,
    marginBottom: spacing.sm,
  },
  inputLabel: {
    ...typography.label,
    color: `${colors.dark}60`,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    ...typography.bodyLarge,
    color: colors.dark,
    paddingVertical: 4,
  },
  sendBtn: {
    padding: 4,
  },
  helperText: {
    ...typography.bodySmall,
    color: `${colors.dark}70`,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  sectionHeader: {
    ...typography.h2,
    color: colors.dark,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
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
  avatarInitials: {
    ...typography.label,
    color: colors.white,
    fontFamily: 'OpenSauceOne-Bold',
  },
  personName: {
    ...typography.bodyLarge,
    color: colors.dark,
    flex: 1,
  },
  acceptedTag: {
    backgroundColor: colors.tertiaryGreen,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  acceptedText: {
    ...typography.label,
    color: colors.white,
    fontFamily: 'OpenSauceOne-SemiBold',
  },
});
