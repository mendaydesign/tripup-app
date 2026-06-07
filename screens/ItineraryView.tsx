import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import BrandingLogo from '../assets/Logo/Branding-logo.svg';
import AddNewEventIcon from '../assets/Icons/Calendar-Icons=Add New Event.svg';
import AvatarStack from '../components/AvatarStack';
import SegmentedControl from '../components/SegmentedControl';
import DateStrip from '../components/DateStrip';
import ItineraryEventCard from '../components/ItineraryEventCard';
import { Trip } from '../data/trips';

// Scroll range over which the header crossfades
const FADE_START = 110;
const FADE_END = 150;

// Demo "current time" in 24h so the timeline shows past (solid) vs future (dashed)
const DEMO_CURRENT_HOUR = 15; // 3pm — sits between the 2pm and 5pm events

function parseEventHour(timeStr: string): number {
  const pm = timeStr.toLowerCase().includes('pm');
  const h = parseInt(timeStr, 10);
  if (pm && h !== 12) return h + 12;
  if (!pm && h === 12) return 0;
  return h;
}

type Props = {
  trip: Trip;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddParticipant: () => void;
  unreadCount?: number;
  onBellPress?: () => void;
  noHeader?: boolean;
  initialDay?: string;
  onScrollEvent?: (event: any) => void;
};

export default function ItineraryView({ trip, activeTab, onTabChange, onAddParticipant, unreadCount = 0, onBellPress, noHeader = false, initialDay, onScrollEvent }: Props) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedDay, setSelectedDay] = useState(initialDay ?? trip.todayDate.day);

  const logoOpacity = scrollY.interpolate({
    inputRange: [FADE_START, FADE_END],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: [FADE_START, FADE_END],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const events = trip.itineraryEvents.filter((e) => e.date === selectedDay);

  return (
    <View style={[styles.screen, !noHeader && { paddingTop: insets.top }]}>

      {/* ── Fixed header (hidden when embedded in GroupHomeScreen shell) ── */}
      {!noHeader && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn}>
            <Animated.View style={{ opacity: logoOpacity }}>
              <Ionicons name="chevron-back" size={24} color={colors.dark} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, styles.headerBtnInner, { opacity: titleOpacity }]}>
              <Ionicons name="chevron-back" size={24} color={colors.brandOrange} />
            </Animated.View>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Animated.View style={[styles.headerCenterItem, { opacity: logoOpacity }]}>
              <BrandingLogo width={80} height={28} />
            </Animated.View>
            <Animated.Text style={[styles.headerTitle, { opacity: titleOpacity }]}>
              {trip.name}: Itinerary
            </Animated.Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={onBellPress}>
            <View>
              <Ionicons name="notifications-outline" size={24} color={colors.dark} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Scrollable body ── */}
      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        // noHeader: DateStrip is index 0; standalone: DateStrip is index 2 (after tripMeta + segmented)
        stickyHeaderIndices={noHeader ? [0] : [2]}
        onScroll={noHeader && onScrollEvent
          ? onScrollEvent
          : Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Trip meta + segmented control — only in standalone mode */}
        {!noHeader && (
          <>
            <View style={styles.tripMeta}>
              <Text style={styles.tripName}>{trip.name}</Text>
              <View style={styles.travellersRow}>
                <Text style={styles.travellersLabel}>Travellers</Text>
                <AvatarStack avatars={trip.travellers} size={30} overlap={10} showAdd onAdd={onAddParticipant} />
              </View>
            </View>
            <SegmentedControl activeKey={activeTab} onChange={onTabChange} />
          </>
        )}

        {/* Date strip — STICKY (index shifts based on noHeader) */}
        <View style={styles.dateStripWrapper}>
          <DateStrip
            dates={trip.tripDates}
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
          />
        </View>

        {/* Content: Add event + timeline */}
        <View style={styles.content}>

          {/* Add New Event card */}
          <TouchableOpacity style={styles.addCard} activeOpacity={0.75}>
            <AddNewEventIcon width={46} height={46} />
            <View style={styles.addText}>
              <Text style={styles.addTitle}>Add New Event</Text>
              <Text style={styles.addSubtitle}>
                Add a new event to the itinerary. We will notify the others.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Timeline events */}
          <View style={styles.timeline}>
            {events.map((event, i) => {
              const isPast = parseEventHour(event.time) < DEMO_CURRENT_HOUR;
              const nextEvent = events[i + 1];
              const isNextPast = nextEvent
                ? parseEventHour(nextEvent.time) < DEMO_CURRENT_HOUR
                : false;
              return (
                <ItineraryEventCard
                  key={event.id}
                  event={event}
                  isFirst={i === 0}
                  isLast={i === events.length - 1}
                  isPast={isPast}
                  isNextPast={isNextPast}
                />
              );
            })}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  headerCenterItem: {
    position: 'absolute',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.dark,
    textAlign: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.tertiaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontSize: 9,
    color: colors.white,
    fontFamily: 'OpenSauceOne-Bold',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 200, minHeight: SCREEN_HEIGHT + 200 },

  // Trip meta
  tripMeta: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: 6,
  },
  tripName: {
    ...typography.h1,
    color: colors.dark,
    fontFamily: 'OpenSauceOne-Bold',
  },
  travellersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  travellersLabel: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.5,
  },

  // Date strip sticky wrapper
  dateStripWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.dark}10`,
  },

  // Content
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Add New Event card
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  addText: {
    flex: 1,
    gap: 3,
  },
  addTitle: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
  },
  addSubtitle: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.55,
    lineHeight: 18,
  },

  // Timeline wrapper
  timeline: {
    paddingLeft: 4,
  },
});
