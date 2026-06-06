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
import ExpenseRequestIcon from '../assets/Icons/Feed-Item-Icon=Expense-Request.svg';
import AvatarStack from '../components/AvatarStack';
import SegmentedControl from '../components/SegmentedControl';
import { CalendarQuickAction, PollQuickAction } from '../components/QuickActionCard';
import FeedItem from '../components/FeedItem';
import ParticipantSheet from '../components/ParticipantSheet';
import CreatePollSheet from '../components/CreatePollSheet';
import ItineraryView from './ItineraryView';
import ExpenseRequestScreen1, { InputMethod } from './CreateExpenseRequest/Screen1';
import ScanReceiptScreen from './CreateExpenseRequest/ScanReceiptScreen';
import ParticipantSelectionScreen from './CreateExpenseRequest/Screen3';
import ExpenseDetailScreen from './CreateExpenseRequest/Screen4';
import Toast from '../components/Toast';
import { mockTrip, Traveller } from '../data/trips';

type SubmittedExpense = {
  id: string;
  name: string;
  total: number;
  travellers: Traveller[];
};

export default function GroupHomeScreen() {
  const [activeTab, setActiveTab] = useState('feed');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [pollSheetVisible, setPollSheetVisible] = useState(false);
  const [expenseFlowStep, setExpenseFlowStep] = useState(0);
  const [expenseInputMethod, setExpenseInputMethod] = useState<InputMethod>('scan');
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [submittedExpenses, setSubmittedExpenses] = useState<SubmittedExpense[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastExpenseName, setToastExpenseName] = useState('');
  const insets = useSafeAreaInsets();
  const trip = mockTrip;
  const youId = trip.travellers[0]?.id;

  // Expense request flow — full-screen takeover
  if (expenseFlowStep === 1) {
    return (
      <ExpenseRequestScreen1
        tripName={trip.name}
        onBack={() => setExpenseFlowStep(0)}
        onContinue={(method) => {
          setExpenseInputMethod(method);
          // Manual skips camera, goes straight to participant selection
          setExpenseFlowStep(method === 'manual' ? 3 : 2);
        }}
      />
    );
  }

  if (expenseFlowStep === 2) {
    return (
      <ScanReceiptScreen
        tripName={trip.name}
        onBack={() => setExpenseFlowStep(1)}
        onImageCaptured={(uri) => {
          setScannedImageUri(uri);
          setExpenseFlowStep(3);
        }}
      />
    );
  }

  if (expenseFlowStep === 3) {
    return (
      <ParticipantSelectionScreen
        tripName={trip.name}
        travellers={trip.travellers}
        youId={youId}
        onBack={() => setExpenseFlowStep(expenseInputMethod === 'manual' ? 1 : 2)}
        onContinue={(ids) => {
          setSelectedParticipantIds(ids);
          setExpenseFlowStep(4);
        }}
      />
    );
  }

  if (expenseFlowStep === 4) {
    const selectedTravellers = trip.travellers.filter((t) =>
      selectedParticipantIds.includes(t.id)
    );
    return (
      <ExpenseDetailScreen
        tripName={trip.name}
        travellers={selectedTravellers}
        youId={youId}
        scannedImageUri={scannedImageUri}
        onBack={() => setExpenseFlowStep(3)}
        onSend={(name) => {
          const selectedTravellers = trip.travellers.filter((t) =>
            selectedParticipantIds.includes(t.id)
          );
          setSubmittedExpenses((prev) => [
            ...prev,
            {
              id: String(Date.now()),
              name: name || 'Expense',
              total: 100,
              travellers: selectedTravellers,
            },
          ]);
          setToastExpenseName(name || 'Expense');
          setToastVisible(true);
          setExpenseFlowStep(0);
          setActiveTab('expenses');
        }}
      />
    );
  }

  // Itinerary takes over the full screen (header + sticky date strip + scroll)
  if (activeTab === 'itinerary') {
    return (
      <>
        <ItineraryView
          trip={trip}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddParticipant={() => setSheetVisible(true)}
        />
        <ParticipantSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          travellers={trip.travellers}
        />
      </>
    );
  }

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
            onAdd={() => setSheetVisible(true)}
          />
        </View>
      </View>

      {/* Segmented control — stays fixed while content scrolls */}
      <SegmentedControl activeKey={activeTab} onChange={setActiveTab} />

      <ParticipantSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        travellers={trip.travellers}
      />

      <CreatePollSheet
        visible={pollSheetVisible}
        onClose={() => setPollSheetVisible(false)}
        tripDates={trip.tripDates}
        todayDay={trip.todayDate.day}
      />

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
              <PollQuickAction onPress={() => setPollSheetVisible(true)} />
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

        {activeTab === 'expenses' && (
          <>
            {/* Overview */}
            <Text style={styles.sectionHeader}>Overview</Text>
            <View style={styles.expenseOverview}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>You Owe:</Text>
                <Text style={styles.summaryAmount}>$0</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>You're Owed:</Text>
                <Text style={styles.summaryAmount}>$0</Text>
              </View>
            </View>

            {/* Expense Requests */}
            <Text style={styles.sectionHeader}>Expense Requests</Text>

            {submittedExpenses.length === 0 ? (
              <View style={styles.expenseEmptyState}>
                <ExpenseRequestIcon width={72} height={72} />
                <Text style={styles.expenseEmptyText}>
                  {"There are currently no\nexpense requests"}
                </Text>
              </View>
            ) : (
              <View style={styles.expenseList}>
                {submittedExpenses.map((expense) => (
                  <View key={expense.id} style={styles.expenseCard}>
                    <View style={styles.expenseCardLeft}>
                      <Text style={styles.expenseCardName} numberOfLines={1}>
                        {expense.name}
                      </Text>
                      <View style={styles.expenseCardMeta}>
                        <Text style={styles.expenseCardPaid}>
                          Paid 0/{expense.travellers.length}
                        </Text>
                        <AvatarStack
                          avatars={expense.travellers}
                          size={22}
                          overlap={7}
                        />
                      </View>
                    </View>
                    <Text style={styles.expenseCardAmount}>
                      $0 / ${expense.total}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* CTA always visible */}
            <View style={styles.expenseCTAWrap}>
              <TouchableOpacity
                style={styles.expenseEmptyCTA}
                activeOpacity={0.85}
                onPress={() => setExpenseFlowStep(1)}
              >
                <Text style={styles.expenseEmptyCTAText}>Create Expense Request</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab !== 'feed' && activeTab !== 'itinerary' && activeTab !== 'expenses' && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} coming soon
            </Text>
          </View>
        )}
      </ScrollView>

      <Toast
        visible={toastVisible}
        expenseName={toastExpenseName}
        onClose={() => setToastVisible(false)}
      />
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

  // Expenses tab
  expenseOverview: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: radius.sm,       // 10px per tweak 4
    padding: spacing.sm,           // matches QuickActionCard
    minHeight: 170,                // matches QuickActionCard
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.55,
    textAlign: 'left',
  },
  summaryAmount: {
    fontSize: 40,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.dark,
    textAlign: 'right',
  },
  expenseEmptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  expenseEmptyText: {
    ...typography.bodyLarge,
    color: colors.dark,
    opacity: 0.4,
    textAlign: 'center',
  },
  expenseList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  expenseCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expenseCardLeft: {
    flex: 1,
    gap: 6,
    marginRight: spacing.sm,
  },
  expenseCardName: {
    ...typography.h3,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
  },
  expenseCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expenseCardPaid: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.45,
  },
  expenseCardAmount: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.tertiaryGreen,
  },
  expenseCTAWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  expenseEmptyCTA: {
    backgroundColor: colors.brandOrange,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  expenseEmptyCTAText: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.white,
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
