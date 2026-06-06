import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { TripDate } from '../data/trips';
import DateNotifBadge from '../assets/Icons/Date-Notification-New-Event.svg';

type Props = {
  dates: TripDate[];
  selectedDay: string;
  onSelect: (day: string) => void;
};

export default function DateStrip({ dates, selectedDay, onSelect }: Props) {
  return (
    <ScrollView
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
