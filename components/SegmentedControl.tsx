import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

import FeedActive from '../assets/Icons/Feed=Active.svg';
import FeedInactive from '../assets/Icons/Feed=Inactive.svg';
import ItineraryActive from '../assets/Icons/Itinerary=Active.svg';
import ItineraryInactive from '../assets/Icons/Itinerary=Inactive.svg';
import ChatActive from '../assets/Icons/Chat=Active.svg';
import ChatInactive from '../assets/Icons/Chat=Inactive.svg';
import ExpensesActive from '../assets/Icons/Expenses=Active.svg';
import ExpensesInactive from '../assets/Icons/Expenses=Inactive.svg';

type Tab = {
  key: string;
  label: string;
  Active: React.FC<any>;
  Inactive: React.FC<any>;
};

const TABS: Tab[] = [
  { key: 'feed', label: 'Feed', Active: FeedActive, Inactive: FeedInactive },
  { key: 'itinerary', label: 'Itinerary', Active: ItineraryActive, Inactive: ItineraryInactive },
  { key: 'chat', label: 'Chat', Active: ChatActive, Inactive: ChatInactive },
  { key: 'expenses', label: 'Expenses', Active: ExpensesActive, Inactive: ExpensesInactive },
];

type Props = {
  activeKey: string;
  onChange: (key: string) => void;
};

export default function SegmentedControl({ activeKey, onChange }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const active = tab.key === activeKey;
        const Icon = active ? tab.Active : tab.Inactive;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, active && styles.activeTab]}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.75}
          >
            <Icon width={18} height={18} />
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 3,
    borderRadius: radius.sm,
  },
  activeTab: {
    backgroundColor: colors.brandOrange,
  },
  label: {
    ...typography.label,
    color: colors.dark,
    opacity: 0.45,
    fontFamily: 'OpenSauceOne-SemiBold',
  },
  activeLabel: {
    color: colors.white,
    opacity: 1,
  },
});
