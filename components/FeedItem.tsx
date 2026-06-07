import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import AvatarStack from './AvatarStack';
import { FeedItemData } from '../data/trips';

import PollIcon from '../assets/Icons/Feed-Item-Icon=Poll-Created.svg';
import ExpenseIcon from '../assets/Icons/Feed-Item-Icon=Expense-Request.svg';

type Props = {
  item: FeedItemData;
  isLast?: boolean;
  onPress?: () => void;
};

function PhotoThumb() {
  return <View style={[styles.iconBubble, styles.photoThumb]} />;
}

export default function FeedItem({ item, isLast, onPress }: Props) {
  const renderIcon = () => {
    if (item.type === 'poll') {
      return <PollIcon width={44} height={44} />;
    }
    if (item.type === 'expense') {
      return <ExpenseIcon width={44} height={44} />;
    }
    if (item.type === 'participant') {
      return (
        <View style={[styles.iconBubble, { backgroundColor: `${colors.brandOrange}20` }]}>
          <Ionicons name="person-add" size={22} color={colors.brandOrange} />
        </View>
      );
    }
    return <PhotoThumb />;
  };

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.gap]}
      onPress={onPress}
      activeOpacity={onPress ? 0.72 : 1}
      disabled={!onPress}
    >
      {renderIcon()}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
          {item.type === 'expense' && (
            <AvatarStack avatars={item.paidAvatars} size={22} overlap={7} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    gap: 14,
    backgroundColor: '#F7F7F7',
    borderRadius: radius.sm,
  },
  gap: {
    marginBottom: spacing.sm,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  photoThumb: {
    backgroundColor: colors.tertiaryBlue,
    borderRadius: radius.sm,
    width: 52,
    height: 44,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    flex: 1,
  },
  timestamp: {
    ...typography.label,
    color: colors.dark,
    opacity: 0.4,
    marginLeft: spacing.sm,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.55,
    flex: 1,
  },
});
