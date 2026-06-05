import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import BrandingLogo from '../assets/Logo/Branding-logo.svg';
import AvatarStack from '../components/AvatarStack';
import SegmentedControl from '../components/SegmentedControl';
import { CalendarQuickAction, PollQuickAction } from '../components/QuickActionCard';
import FeedItem from '../components/FeedItem';
import { mockTrip } from '../data/trips';

export default function GroupHomeScreen() {
  const [activeTab, setActiveTab] = useState('feed');
  const insets = useSafeAreaInsets();
  const trip = mockTrip;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.dark} />
        </TouchableOpacity>

        <BrandingLogo width={80} height={28} />

        <TouchableOpacity style={styles.headerBtn}>
          <View>
            <Ionicons name="notifications-outline" size={24} color={colors.dark} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Trip title + travellers */}
      <View style={styles.tripMeta}>
        <Text style={styles.tripName}>{trip.name}</Text>
        <View style={styles.travellersRow}>
          <Text style={styles.travellersLabel}>Travellers</Text>
          <AvatarStack
            avatars={trip.travellers}
            size={30}
            overlap={10}
            showAdd
          />
        </View>
      </View>

      {/* Segmented control — stays fixed while content scrolls */}
      <SegmentedControl activeKey={activeTab} onChange={setActiveTab} />

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'feed' && (
          <>
            {/* Quick Actions */}
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <CalendarQuickAction
                day={trip.todayDate.day}
                month={trip.todayDate.month}
                activityCount={trip.todayActivityCount}
              />
              <PollQuickAction />
            </View>

            {/* Trip Feed */}
            <Text style={styles.sectionHeader}>Trip Feed</Text>
            <View style={styles.feedList}>
              {trip.feedItems.map((item, i) => (
                <FeedItem
                  key={item.id}
                  item={item}
                  isLast={i === trip.feedItems.length - 1}
                />
              ))}
            </View>
          </>
        )}

        {activeTab !== 'feed' && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} coming soon
            </Text>
          </View>
        )}
      </ScrollView>
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
  badge: {
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
  badgeText: {
    fontSize: 9,
    color: colors.white,
    fontFamily: 'OpenSauceOne-Bold',
  },

  // Trip meta
  tripMeta: {
    paddingHorizontal: spacing.lg,
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

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Sections
  sectionHeader: {
    ...typography.h2,
    color: colors.dark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  feedList: {
    // Items handle their own padding
  },

  // Placeholder for non-feed tabs
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  placeholderText: {
    ...typography.bodyLarge,
    color: colors.dark,
    opacity: 0.35,
  },
});
