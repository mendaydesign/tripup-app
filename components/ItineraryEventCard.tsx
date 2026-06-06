import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import { ItineraryEvent } from '../data/trips';
import SurfIcon from '../assets/Icons/Calendar-Icons=Surf Lessons.svg';
import LunchIcon from '../assets/Icons/Calendar-Icons=Lunch.svg';
import BeachIcon from '../assets/Icons/Calendar-Icons=Relax at the beach.svg';
import HotelIcon from '../assets/Icons/Calendar-Icons=Back to the hotel.svg';

const ICON_MAP = {
  surf: SurfIcon,
  lunch: LunchIcon,
  beach: BeachIcon,
  hotel: HotelIcon,
} as const;

// Distance from the top of the row to the top of the dot.
// Dot centre = DOT_OFFSET + 5 = 37 px ≈ card icon's vertical centre (paddingVertical:14 + iconHeight:46/2).
const DOT_OFFSET = 32;
const DOT_SIZE = 10;

type Props = {
  event: ItineraryEvent;
  isFirst: boolean;
  isLast: boolean;
  isPast: boolean;
  isNextPast: boolean;
};

export default function ItineraryEventCard({ event, isFirst, isLast, isPast, isNextPast }: Props) {
  const IconComponent = ICON_MAP[event.iconType];

  return (
    <View style={styles.row}>

      {/* ── Timeline column ─────────────────────────────────────────────
          Structure: [above segment | dot | below segment]
          "above" for row N connects seamlessly to "below" of row N-1
          because adjacent rows share a boundary — no gaps possible.     */}
      <View style={styles.timelineCol}>

        {/* Segment ABOVE the dot (or plain spacer for the first event) */}
        {isFirst
          ? <View style={{ height: DOT_OFFSET }} />
          : <View style={[styles.segment, { height: DOT_OFFSET }, isPast ? styles.solid : styles.dashed]} />
        }

        {/* The dot — sits on top of the line */}
        <View style={[styles.dot, isPast && styles.dotPast]} />

        {/* Segment BELOW the dot — flex:1 fills all remaining row height,
            which includes the card body AND the gap spacer below it     */}
        {!isLast && (
          <View style={[styles.segment, styles.segmentBelow, isNextPast ? styles.solid : styles.dashed]} />
        )}
      </View>

      {/* ── Card column ────────────────────────────────────────────────── */}
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          {event.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New!</Text>
            </View>
          )}
          <IconComponent width={46} height={46} />
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>{event.subtitle}</Text>
          </View>
          <Text style={styles.time}>{event.time}</Text>
        </View>
        {/* Gap spacer — included in the row height so the connector spans through it */}
        {!isLast && <View style={styles.cardGap} />}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch', // timelineCol stretches to match cardWrapper height
  },

  // ── Timeline ─────────────────────────────────────────────────────────
  timelineCol: {
    width: 28,
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#D0D0D0',
    flexShrink: 0,
    zIndex: 1,
  },
  dotPast: {
    backgroundColor: '#999999',
  },
  // Base segment — width/color added by solid/dashed below
  segment: {},
  segmentBelow: {
    flex: 1,
    marginTop: 3,
  },
  solid: {
    width: 2,
    backgroundColor: '#BBBBBB',
  },
  // Border-left trick renders a dashed vertical line on a zero-width view
  dashed: {
    width: 0,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderLeftColor: '#D5D5D5',
  },

  // ── Card ─────────────────────────────────────────────────────────────
  cardWrapper: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    gap: 12,
    overflow: 'visible',
  },
  cardGap: {
    height: spacing.sm, // 10 px — connector spans through this too
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.55,
    lineHeight: 18,
  },
  time: {
    fontSize: 18,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    opacity: 0.3,
    flexShrink: 0,
  },
  newBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.sm,
    backgroundColor: colors.tertiaryGreen,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 1,
  },
  newBadgeText: {
    ...typography.label,
    color: colors.white,
    fontFamily: 'OpenSauceOne-SemiBold',
  },
});
