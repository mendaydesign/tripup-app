import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

import CalendarIcon from '../assets/Icons/Check-itinerary-icon.svg';
import QuickPollIcon from '../assets/Icons/Quick Poll.svg';

type CalendarCardProps = {
  day: string;
  month: string;
  activityCount: number;
  onPress?: () => void;
};

export function CalendarQuickAction({ day, month, activityCount, onPress }: CalendarCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.tertiaryBlue }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <CalendarIcon width={45} height={50} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {activityCount} Activities scheduled for today.
        </Text>
        <Text style={styles.cardLink}>Check itinerary</Text>
      </View>
    </TouchableOpacity>
  );
}

type PollCardProps = {
  onPress?: () => void;
};

export function PollQuickAction({ onPress }: PollCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.tertiaryPink }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.pollHeader}>
        <QuickPollIcon width={24} height={24} />
        <Text style={styles.pollTitle}>Quick Poll</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          Get everyones say with a poll.
        </Text>
        <Text style={styles.cardLink}>Set up a poll</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 170,
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pollTitle: {
    ...typography.h3,
    color: colors.white,
  },
  cardContent: {
    gap: 6,
  },
  cardTitle: {
    ...typography.bodySmall,
    color: colors.white,
    fontFamily: 'OpenSauceOne-SemiBold',
  },
  cardLink: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.75,
    textDecorationLine: 'underline',
  },
});
