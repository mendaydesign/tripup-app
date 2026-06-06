import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../theme';
import { TripDate } from '../data/trips';

type Props = {
  visible: boolean;
  onClose: () => void;
  tripDates: TripDate[];
  todayDay: string;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_OFFSET = 64;
const BOUNCE_BUFFER = 120;
const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MINUTE_LABELS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const WHEEL_ITEM_H = 76;

function WheelSlot({
  items,
  initialIndex,
  onIndexChange,
  textStyle,
}: {
  items: string[];
  initialIndex: number;
  onIndexChange: (i: number) => void;
  textStyle?: object;
}) {
  const ref = useRef<ScrollView>(null);
  const lastTickIdx = useRef(initialIndex);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: initialIndex * WHEEL_ITEM_H, animated: false });
    }, 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <ScrollView
      ref={ref}
      style={{ height: WHEEL_ITEM_H }}
      showsVerticalScrollIndicator={false}
      snapToInterval={WHEEL_ITEM_H}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={(e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_H);
        if (idx !== lastTickIdx.current && idx >= 0 && idx < items.length) {
          lastTickIdx.current = idx;
          Haptics.selectionAsync();
        }
      }}
      onMomentumScrollEnd={(e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_H);
        onIndexChange(Math.max(0, Math.min(idx, items.length - 1)));
      }}
    >
      {items.map((item, i) => (
        <View key={i} style={{ height: WHEEL_ITEM_H, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={textStyle}>{item}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export default function CreatePollSheet({ visible, onClose, tripDates, todayDay }: Props) {
  const insets = useSafeAreaInsets();
  const sheetHeight = SCREEN_HEIGHT - insets.top - HEADER_OFFSET;

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragOffset = useRef(new Animated.Value(0)).current;

  // Form state
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [hideVoters, setHideVoters] = useState(false);
  const [addToItinerary, setAddToItinerary] = useState(true);
  const [selectedDay, setSelectedDay] = useState(todayDay);
  const [hour, setHour] = useState(7);
  const [minuteIdx, setMinuteIdx] = useState(0);
  const [isPM, setIsPM] = useState(true);
  const [activeSlot, setActiveSlot] = useState<'hour' | 'minute'>('hour');
  const dateScrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

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

  useEffect(() => {
    if (!containerWidth) return;
    const idx = tripDates.findIndex((d) => d.day === selectedDay);
    if (idx < 0) return;
    const ITEM_W = 52 + 8; // pill width + gap
    const offset = Math.max(0, idx * ITEM_W - (containerWidth / 2 - 26));
    dateScrollRef.current?.scrollTo({ x: offset, animated: true });
  }, [selectedDay, containerWidth]);

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

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, '']);
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={dismiss}>
      <View style={styles.wrapper}>

        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={dismiss} activeOpacity={1} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight + BOUNCE_BUFFER,
              transform: [{ translateY: combinedTranslate }],
            },
          ]}
        >
          {/* Inner container constrained to visible height — BOUNCE_BUFFER is pure white fill below */}
          <View style={[styles.inner, { maxHeight: sheetHeight }]}>

          {/* Drag handle — 20px from sheet top */}
          <View style={styles.dragZone} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {/* Title — 50px total from sheet top */}
            <Text style={styles.title}>Create Poll</Text>

            {/* ── Question ─────────────────────────────────── */}
            <Text style={styles.fieldLabel}>What are we deciding on today?</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.questionInput}
                placeholder="Ask Question"
                placeholderTextColor={`${colors.dark}40`}
                value={question}
                onChangeText={setQuestion}
                autoCorrect={false}
              />
            </View>

            {/* ── Options ──────────────────────────────────── */}
            <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Options</Text>
            <View style={styles.listBox}>
              {options.map((opt, i) => (
                <View
                  key={i}
                  style={[
                    styles.listRow,
                    i < options.length - 1 && styles.listRowBorder,
                  ]}
                >
                  <TextInput
                    style={styles.optionInput}
                    placeholder={`Option ${i + 1}`}
                    placeholderTextColor={`${colors.dark}35`}
                    value={opt}
                    onChangeText={(v) => updateOption(i, v)}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={styles.addRow}
                onPress={addOption}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={18} color={`${colors.dark}55`} />
                <Text style={styles.addRowText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* ── Toggles ──────────────────────────────────── */}
            <View style={[styles.listBox, { marginTop: spacing.lg }]}>
              <View style={[styles.toggleRow, styles.listRowBorder]}>
                <Text style={styles.toggleLabel}>Allow multiple answers</Text>
                <Switch
                  value={allowMultiple}
                  onValueChange={setAllowMultiple}
                  trackColor={{ false: `${colors.dark}20`, true: colors.tertiaryBlue }}
                  thumbColor={colors.white}
                  ios_backgroundColor={`${colors.dark}20`}
                />
              </View>
              <View style={[styles.toggleRow, styles.listRowBorder]}>
                <Text style={styles.toggleLabel}>Hide voters names</Text>
                <Switch
                  value={hideVoters}
                  onValueChange={setHideVoters}
                  trackColor={{ false: `${colors.dark}20`, true: colors.tertiaryBlue }}
                  thumbColor={colors.white}
                  ios_backgroundColor={`${colors.dark}20`}
                />
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Add to itinerary</Text>
                <Switch
                  value={addToItinerary}
                  onValueChange={setAddToItinerary}
                  trackColor={{ false: `${colors.dark}20`, true: colors.tertiaryBlue }}
                  thumbColor={colors.white}
                  ios_backgroundColor={`${colors.dark}20`}
                />
              </View>
            </View>

            {/* ── Select time (visible only when Add to Itinerary is on) ── */}
            {addToItinerary && (
              <>
                <Text style={styles.sectionHeader}>Select time</Text>

                {/* Date pills — active pill scrolls to centre */}
                <ScrollView
                  ref={dateScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dateStrip}
                  onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                >
                  {tripDates.map((d) => {
                    const active = d.day === selectedDay;
                    return (
                      <TouchableOpacity
                        key={d.day}
                        style={[styles.datePill, active && styles.datePillActive]}
                        onPress={() => setSelectedDay(d.day)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.dateDay, active && styles.dateDayActive]}>{d.day}</Text>
                        <Text style={[styles.dateMonth, active && styles.dateMonthActive]}>{d.month}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Time picker — hour and minute are drag-scroll wheels */}
                <View style={styles.timePicker}>
                  {/* Hour wheel — highlight follows activeSlot */}
                  <View
                    style={[styles.timeSlot, activeSlot === 'hour' ? styles.slotActive : styles.slotInactive]}
                    onTouchStart={() => setActiveSlot('hour')}
                  >
                    <WheelSlot
                      items={HOURS}
                      initialIndex={hour - 1}
                      onIndexChange={(i) => setHour(i + 1)}
                      textStyle={[styles.timeNum, activeSlot === 'hour' ? styles.numActive : styles.numInactive]}
                    />
                  </View>

                  <Text style={styles.timeColon}>:</Text>

                  {/* Minute wheel */}
                  <View
                    style={[styles.timeSlot, activeSlot === 'minute' ? styles.slotActive : styles.slotInactive]}
                    onTouchStart={() => setActiveSlot('minute')}
                  >
                    <WheelSlot
                      items={MINUTE_LABELS}
                      initialIndex={minuteIdx}
                      onIndexChange={setMinuteIdx}
                      textStyle={[styles.timeNum, activeSlot === 'minute' ? styles.numActive : styles.numInactive]}
                    />
                  </View>

                  {/* AM / PM — tap toggle */}
                  <View style={styles.ampm}>
                    <TouchableOpacity
                      style={[styles.ampmBtn, !isPM && styles.ampmBtnActive]}
                      onPress={() => setIsPM(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.ampmText, !isPM && styles.ampmTextActive]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.ampmBtn, isPM && styles.ampmBtnActive]}
                      onPress={() => setIsPM(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.ampmText, isPM && styles.ampmTextActive]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

          </ScrollView>

          {/* Sticky submit CTA */}
          <View style={styles.stickyFooter}>
            <TouchableOpacity style={styles.submitBtn} onPress={dismiss} activeOpacity={0.85}>
              <Text style={styles.submitText}>Submit Poll</Text>
            </TouchableOpacity>
          </View>

          </View>{/* end inner */}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
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
  inner: {
    flex: 1,
  },
  // paddingTop 16 → total sheet-top to title = 50px
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // Title
  title: {
    ...typography.h1,
    color: colors.dark,
    marginBottom: spacing.lg,
  },

  // Field label (grey, small)
  fieldLabel: {
    ...typography.label,
    color: `${colors.dark}60`,
    marginBottom: 8,
  },

  // Single-field input box
  inputBox: {
    borderWidth: 1,
    borderColor: `${colors.dark}20`,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
  },
  questionInput: {
    ...typography.bodyLarge,
    color: colors.dark,
    padding: 0,
  },

  // Bordered list container (options + toggles)
  listBox: {
    borderWidth: 1,
    borderColor: `${colors.dark}20`,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  listRow: {
    paddingHorizontal: spacing.sm,
  },
  listRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.dark}20`,
  },

  // Options
  optionInput: {
    ...typography.bodyLarge,
    color: colors.dark,
    paddingVertical: 14,
    padding: 0,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
  },
  addRowText: {
    ...typography.bodyLarge,
    color: `${colors.dark}60`,
  },

  // Toggles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
  },
  toggleLabel: {
    ...typography.bodyLarge,
    color: colors.dark,
  },

  // Select time section
  sectionHeader: {
    ...typography.h2,
    color: colors.dark,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Date strip
  dateStrip: {
    gap: 8,
    paddingVertical: spacing.sm,
  },
  datePill: {
    width: 52,
    height: 62,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  datePillActive: {
    backgroundColor: colors.tertiaryBlue,
  },
  dateDay: {
    fontSize: 20,
    fontFamily: 'OpenSauceOne-Bold',
    color: `${colors.dark}55`,
  },
  dateDayActive: {
    color: colors.white,
  },
  dateMonth: {
    ...typography.label,
    color: `${colors.dark}55`,
  },
  dateMonthActive: {
    color: colors.white,
  },

  // Time picker row
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  timeSlot: {
    flex: 1,
    height: 76,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slotActive: {
    backgroundColor: `${colors.brandOrange}20`,
  },
  slotInactive: {
    backgroundColor: `${colors.dark}08`,
  },
  timeNum: {
    fontSize: 40,
    fontFamily: 'OpenSauceOne-Bold',
    lineHeight: 48,
  },
  numActive: {
    color: colors.brandOrange,
  },
  numInactive: {
    color: `${colors.dark}35`,
  },
  timeColon: {
    fontSize: 40,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.dark,
    lineHeight: 48,
  },
  ampm: {
    width: 68,
    height: 76,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: `${colors.dark}20`,
    overflow: 'hidden',
  },
  ampmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmBtnActive: {
    backgroundColor: colors.brandOrange,
  },
  ampmText: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: `${colors.dark}50`,
  },
  ampmTextActive: {
    color: colors.white,
  },

  // Sticky footer + submit button
  stickyFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 50,
    backgroundColor: colors.white,
  },
  submitBtn: {
    backgroundColor: colors.brandOrange,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitText: {
    ...typography.h3,
    color: colors.white,
    fontFamily: 'OpenSauceOne-SemiBold',
  },
});
