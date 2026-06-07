import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

import FeedInactive from '../assets/Icons/Feed=Inactive.svg';
import ItineraryInactive from '../assets/Icons/Itinerary=Inactive.svg';
import ChatInactive from '../assets/Icons/Chat=Inactive.svg';
import ExpensesInactive from '../assets/Icons/Expenses=Inactive.svg';

type Tab = {
  key: string;
  label: string;
  Icon: React.FC<any>;
};

const TABS: Tab[] = [
  { key: 'feed', label: 'Feed', Icon: FeedInactive },
  { key: 'itinerary', label: 'Itinerary', Icon: ItineraryInactive },
  { key: 'chat', label: 'Chat', Icon: ChatInactive },
  { key: 'expenses', label: 'Expenses', Icon: ExpensesInactive },
];

const INACTIVE_COLOR = `${colors.dark}99`; // ~60% opacity equivalent

type Props = {
  activeKey: string;
  onChange: (key: string) => void;
};

export default function SegmentedControl({ activeKey, onChange }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.75}
          >
            <tab.Icon
              width={18}
              height={18}
              color={active ? colors.brandOrange : INACTIVE_COLOR}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
            {active && <View style={styles.activeIndicator} />}
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
  label: {
    ...typography.label,
    color: `${colors.dark}99`,
    fontFamily: 'OpenSauceOne-SemiBold',
  },
  activeLabel: {
    color: colors.brandOrange,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: colors.brandOrange,
    borderRadius: 1,
  },
});
