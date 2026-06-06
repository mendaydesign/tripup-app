import React, { useRef, useState } from 'react';
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
import ChatView from './ChatView';
import ExpenseRequestScreen1, { InputMethod } from './CreateExpenseRequest/Screen1';
import ScanReceiptScreen from './CreateExpenseRequest/ScanReceiptScreen';
import ParticipantSelectionScreen from './CreateExpenseRequest/Screen3';
import ExpenseDetailScreen from './CreateExpenseRequest/Screen4';
import Toast from '../components/Toast';
import { mockTrip, Traveller, ActivePoll, ItineraryEvent } from '../data/trips';

type SubmittedExpense = {
  id: string;
  name: string;
  total: number;
  travellers: Traveller[];
};

// Make the user's chosen option win — they get 3 votes (user + 2 others),
// remaining others spread across the other options 1 each.
function simulateAllVotes(
  options: ActivePoll['options'],
  userOptionId: string,
  travellers: Traveller[],
  youId: string
): ActivePoll['options'] {
  const others = travellers.filter((t) => t.id !== youId);
  const userIdx = options.findIndex((o) => o.id === userOptionId);

  const updated = options.map((o) => ({
    ...o,
    votes: o.id === userOptionId ? [youId] : ([] as string[]),
  }));

  // First 2 others vote alongside the user
  updated[userIdx].votes.push(others[0].id, others[1].id);

  // Remaining others spread to non-winning options (1 each)
  const loserIdxs = options.map((_, i) => i).filter((i) => i !== userIdx);
  others.slice(2).forEach((t, i) => {
    const targetIdx = loserIdxs[i % loserIdxs.length];
    if (targetIdx !== undefined) updated[targetIdx].votes.push(t.id);
  });

  return updated;
}

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

  // Poll + dynamic itinerary state
  const [activePolls, setActivePolls] = useState<ActivePoll[]>([]);
  const [dynamicEvents, setDynamicEvents] = useState<ItineraryEvent[]>(mockTrip.itineraryEvents);
  const [pollWinnerToastVisible, setPollWinnerToastVisible] = useState(false);
  const [pollWinnerText, setPollWinnerText] = useState('');
  // Flag so onClose knows whether the sheet closed via a submission
  const pollSubmittedRef = useRef(false);

  const insets = useSafeAreaInsets();
  const trip = mockTrip;
  const tripWithDynamic = { ...trip, itineraryEvents: dynamicEvents };
  const youId = trip.travellers[0]?.id;

  function handleVote(pollId: string, optionId: string) {
    setActivePolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId || poll.resolved) return poll;

        const withVotes = simulateAllVotes(poll.options, optionId, trip.travellers, youId);
        const totalVotes = withVotes.reduce((sum, o) => sum + o.votes.length, 0);
        const allVoted = totalVotes >= trip.travellers.length;

        if (allVoted) {
          const winner = withVotes.reduce((a, b) =>
            a.votes.length >= b.votes.length ? a : b
          );

          if (poll.addToItinerary && poll.itineraryTime) {
            const newEvent: ItineraryEvent = {
              id: `poll-${pollId}`,
              date: poll.itineraryDate || trip.todayDate.day,
              title: winner.text,
              subtitle: `Added by group vote · ${winner.votes.length} votes`,
              time: poll.itineraryTime,
              iconType: 'lunch',
              isNew: true,
            };
            setDynamicEvents((prev) => [...prev, newEvent]);
          }

          setPollWinnerText(winner.text);
          setPollWinnerToastVisible(true);

          return { ...poll, options: withVotes, resolved: true, winnerId: winner.id };
        }

        return { ...poll, options: withVotes };
      })
    );
  }

  // ── Expense request flow — full-screen takeover ──────────────────────────
  if (expenseFlowStep === 1) {
    return (
      <ExpenseRequestScreen1
        tripName={trip.name}
        onBack={() => setExpenseFlowStep(0)}
        onContinue={(method) => {
          setExpenseInputMethod(method);
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
          const sel = trip.travellers.filter((t) =>
            selectedParticipantIds.includes(t.id)
          );
          setSubmittedExpenses((prev) => [
            ...prev,
            { id: String(Date.now()), name: name || 'Expense', total: 100, travellers: sel },
          ]);
          setToastExpenseName(name || 'Expense');
          setToastVisible(true);
          setExpenseFlowStep(0);
          setActiveTab('expenses');
        }}
      />
    );
  }

  // ── Chat takes over (fixed header + scrollable messages + input bar) ──────
  if (activeTab === 'chat') {
    return (
      <>
        <ChatView
          trip={trip}
          youId={youId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddParticipant={() => setSheetVisible(true)}
          activePolls={activePolls}
          onVote={handleVote}
        />
        <ParticipantSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          travellers={trip.travellers}
        />
        <Toast
          visible={pollWinnerToastVisible}
          onClose={() => setPollWinnerToastVisible(false)}
          title="Winner!"
          subtitle={`${pollWinnerText} added to the itinerary 🎉`}
          iconName="trophy-outline"
          iconColor={colors.tertiaryPurple}
          iconBgColor={`${colors.tertiaryPurple}20`}
          borderColor={colors.tertiaryPurple}
        />
      </>
    );
  }

  // ── Itinerary takes over (header crossfade + sticky date strip + scroll) ──
  if (activeTab === 'itinerary') {
    return (
      <>
        <ItineraryView
          trip={tripWithDynamic}
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

  // ── Main shell (Feed + Expenses) ─────────────────────────────────────────
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

      <SegmentedControl activeKey={activeTab} onChange={setActiveTab} />

      <ParticipantSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        travellers={trip.travellers}
      />

      <CreatePollSheet
        visible={pollSheetVisible}
        tripDates={trip.tripDates}
        todayDay={trip.todayDate.day}
        onSubmit={(data) => {
          const newPoll: ActivePoll = {
            id: String(Date.now()),
            question: data.question,
            options: data.options.map((text, i) => ({ id: String(i), text, votes: [] })),
            itineraryDate: data.date,
            itineraryTime: data.time,
            addToItinerary: data.addToItinerary,
            resolved: false,
          };
          setActivePolls((prev) => [...prev, newPoll]);
          pollSubmittedRef.current = true;
        }}
        onClose={() => {
          setPollSheetVisible(false);
          if (pollSubmittedRef.current) {
            pollSubmittedRef.current = false;
            setActiveTab('chat');
          }
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'feed' && (
          <>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <CalendarQuickAction
                day={trip.todayDate.day}
                month={trip.todayDate.month}
                activityCount={trip.todayActivityCount}
              />
              <PollQuickAction onPress={() => setPollSheetVisible(true)} />
            </View>
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
                        <AvatarStack avatars={expense.travellers} size={22} overlap={7} />
                      </View>
                    </View>
                    <Text style={styles.expenseCardAmount}>
                      $0 / ${expense.total}
                    </Text>
                  </View>
                ))}
              </View>
            )}

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

        {activeTab !== 'feed' && activeTab !== 'itinerary' && activeTab !== 'chat' && activeTab !== 'expenses' && (
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

      <Toast
        visible={pollWinnerToastVisible}
        onClose={() => setPollWinnerToastVisible(false)}
        title="Winner!"
        subtitle={`${pollWinnerText} added to the itinerary 🎉`}
        iconName="trophy-outline"
        iconColor={colors.tertiaryPurple}
        iconBgColor={`${colors.tertiaryPurple}20`}
        borderColor={colors.tertiaryPurple}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
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
  feedList: {},
  expenseOverview: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: radius.sm,
    padding: spacing.sm,
    minHeight: 170,
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
