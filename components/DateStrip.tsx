import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { TripDate } from '../data/trips';
import DateNotifBadge from '../assets/Icons/Date-Notification-New-Event.svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = 52;
const ITEM_GAP = 8;
const STRIP_PADDING = spacing.lg; // 20

type Props = {
  dates: TripDate[];
  selectedDay: string;
  onSelect: (day: string) => void;
};

export default function DateStrip({ dates, selectedDay, onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const index = dates.findIndex((d) => d.day === selectedDay);
    if (index === -1) return;
    const itemCentre = STRIP_PADDING + index * (ITEM_WIDTH + ITEM_GAP) + ITEM_WIDTH / 2;
    const scrollX = Math.max(0, itemCentre - SCREEN_WIDTH / 2);
    scrollRef.current?.scrollTo({ x: scrollX, animated: hasInitialized.current });
    hasInitialized.current = true;
  }, [selectedDay, dates]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {dates.map((date) => {
        const isSelected = date.day === selectedDay;
        return (
          <TouchableOpacity
            key={date.day}
            style={[styles.item, isSelected && styles.itemActive]}
            onPress={() => onSelect(date.day)}
            activeOpacity={0.75}
          >
            {date.notificationCount !== undefined && (
              <View style={styles.notifBadge}>
                <DateNotifBadge width={20} height={20} />
              </View>
            )}
            <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>
              {date.day}
            </Text>
            <Text style={[styles.month, isSelected && styles.monthActive]}>
              {date.month}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 8,
  },
  item: {
    width: 52,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    gap: 2,
    overflow: 'visible',
  },
  itemActive: {
    backgroundColor: colors.tertiaryBlue,
  },
  notifBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  dayNum: {
    fontSize: 20,
    fontFamily: 'OpenSauceOne-Bold',
    color: `${colors.dark}55`,
  },
  dayNumActive: {
    color: colors.white,
  },
  month: {
    ...typography.label,
    color: `${colors.dark}55`,
  },
  monthActive: {
    color: colors.white,
  },
});
