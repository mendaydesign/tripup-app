import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const TAB_ORDER = ['feed', 'itinerary', 'chat', 'expenses'];
// Fallback height for the collapsing header (tripMeta + SegmentedControl).
// Actual height is measured via onLayout on first render and replaces this.
const COLLAPSE_HEIGHT_ESTIMATE = 150;
// Extra bottom padding added to every tab's scroll content so the user can
// always scroll far enough to fully collapse the header even on short pages.
const SCROLL_EXTRA_BOTTOM = 180;
const TAB_TITLES: Record<string, string> = {
  feed: 'Feed',
  itinerary: 'Itinerary',
  chat: 'Chat',
  expenses: 'Expenses',
};

function parseTimeToHour(timeStr: string): number {
  const pm = timeStr.toLowerCase().includes('pm');
  const h = parseInt(timeStr, 10);
  if (pm && h !== 12) return h + 12;
  if (!pm && h === 12) return 0;
  return h;
}
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import BrandingLogo from '../assets/Logo/Branding-logo.svg';
import ExpenseRequestIcon from '../assets/Icons/Feed-Item-Icon=Expense-Request.svg';
import AvatarStack from '../components/AvatarStack';
import SegmentedControl from '../components/SegmentedControl';
import { CalendarQuickAction, PollQuickAction } from '../components/QuickActionCard';
import FeedItem from '../components/FeedItem';
import CreatePollSheet from '../components/CreatePollSheet';
import ItineraryView from './ItineraryView';
import ChatView from './ChatView';
import ExpenseRequestScreen1, { InputMethod } from './CreateExpenseRequest/Screen1';
import ScanReceiptScreen from './CreateExpenseRequest/ScanReceiptScreen';
import ParticipantSelectionScreen from './CreateExpenseRequest/Screen3';
import ExpenseDetailScreen from './CreateExpenseRequest/Screen4';
import Toast from '../components/Toast';
import ConfettiOverlay from '../components/ConfettiOverlay';
import NotificationsSheet, { AppNotification } from '../components/NotificationsSheet';
import ParticipantSheet, { InviteEntry } from '../components/ParticipantSheet';
import { mockTrip, Traveller, ActivePoll, ItineraryEvent, IncomingExpense, FeedItemData } from '../data/trips';

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

type Props = {
  onBack?: () => void;
};

export default function GroupHomeScreen({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState('feed');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [pollSheetVisible, setPollSheetVisible] = useState(false);
  const [expenseFlowStep, setExpenseFlowStep] = useState(0);
  const [expenseInputMethod, setExpenseInputMethod] = useState<InputMethod>('scan');
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [submittedExpenses, setSubmittedExpenses] = useState<SubmittedExpense[]>([]);
  const [paidIncomingIds, setPaidIncomingIds] = useState<string[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastExpenseName, setToastExpenseName] = useState('');
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 0, y: 0 });
  const [settledToastVisible, setSettledToastVisible] = useState(false);
  const payBtnRef = useRef<View>(null);

  // Dynamic travellers — grows as invites are confirmed
  const [dynamicTravellers, setDynamicTravellers] = useState<Traveller[]>(mockTrip.travellers);

  // Poll + dynamic itinerary state
  const [activePolls, setActivePolls] = useState<ActivePoll[]>([]);
  const [dynamicEvents, setDynamicEvents] = useState<ItineraryEvent[]>(mockTrip.itineraryEvents);
  const [dynamicTripDates, setDynamicTripDates] = useState(mockTrip.tripDates);
  const [pollWinnerToastVisible, setPollWinnerToastVisible] = useState(false);
  const [pollWinnerText, setPollWinnerText] = useState('');
  // Day the winning event was placed — used to jump to the right date in the itinerary
  const pollWinnerEventDateRef = useRef('');
  // Day to show when navigating to itinerary via toast
  const [itineraryTargetDay, setItineraryTargetDay] = useState<string | undefined>(undefined);

  // Shared scroll position — drives collapsing header + logo↔title crossfade
  const scrollY = useRef(new Animated.Value(0)).current;
  // Actual height measured on first render so the Animated.View never clips its content
  const [collapseHeight, setCollapseHeight] = useState(COLLAPSE_HEIGHT_ESTIMATE);
  const collapseHeightMeasured = useRef(false);
  const CH = collapseHeight; // driven by measurement, falls back to estimate

  const collapsingHeightAnim = scrollY.interpolate({
    inputRange: [0, CH],
    outputRange: [CH, 0],
    extrapolate: 'clamp',
  });
  const collapsingOpacity = scrollY.interpolate({
    inputRange: [0, CH * 0.7],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const logoOpacity = scrollY.interpolate({
    inputRange: [CH * 0.3, CH * 0.85],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: [CH * 0.3, CH * 0.85],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  // useNativeDriver: false required because height is a layout property
  const onScrollEvent = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Tab slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  function handleTabChange(newTab: string) {
    scrollY.setValue(0);
    const prevIdx = TAB_ORDER.indexOf(activeTab);
    const nextIdx = TAB_ORDER.indexOf(newTab);
    const dir = nextIdx >= prevIdx ? 1 : -1;
    slideAnim.setValue(dir * SCREEN_WIDTH);
    setActiveTab(newTab);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  // Dynamic feed + notifications
  const [feedItems, setFeedItems] = useState<FeedItemData[]>(mockTrip.feedItems);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  function addEvent(feedItem: FeedItemData, notif: Omit<AppNotification, 'id'>) {
    setFeedItems((prev) => [feedItem, ...prev]);
    setNotifications((prev) => [...prev, { ...notif, id: String(Date.now()) }]);
    setUnreadCount((prev) => prev + 1);
  }

  function handleBellPress() {
    setNotificationsVisible(true);
    setUnreadCount(0);
  }

  function handleInvitesConfirmed(invites: InviteEntry[]) {
    const newTravellers: Traveller[] = invites.map((inv, i) => ({
      id: `invited-${Date.now()}-${i}`,
      initials: inv.initials,
      color: inv.color,
      name: inv.name,
    }));
    setDynamicTravellers((prev) => [...prev, ...newTravellers]);
  }

  const insets = useSafeAreaInsets();
  const trip = mockTrip;
  const tripWithDynamic = { ...trip, itineraryEvents: dynamicEvents, travellers: dynamicTravellers, tripDates: dynamicTripDates };
  const youId = dynamicTravellers[0]?.id;
  const youOwe = trip.incomingExpenses
    .filter((e) => !paidIncomingIds.includes(e.id))
    .reduce((sum, e) => sum + e.yourShare, 0);

  // Amount owed to you from submitted expenses (total minus your equal share)
  const youAreOwed = submittedExpenses.reduce((sum, exp) => {
    const n = exp.travellers.length;
    if (n <= 1) return sum;
    return sum + Math.round(exp.total * (n - 1) / n);
  }, 0);

  function handleVote(pollId: string, optionId: string) {
    setActivePolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId || poll.resolved) return poll;

        const withVotes = simulateAllVotes(poll.options, optionId, dynamicTravellers, youId);
        const totalVotes = withVotes.reduce((sum, o) => sum + o.votes.length, 0);
        const allVoted = totalVotes >= dynamicTravellers.length;

        if (allVoted) {
          const winner = withVotes.reduce((a, b) =>
            a.votes.length >= b.votes.length ? a : b
          );

          if (poll.addToItinerary && poll.itineraryTime) {
            const eventDate = poll.itineraryDate || trip.todayDate.day;
            const newEvent: ItineraryEvent = {
              id: `poll-${pollId}`,
              date: eventDate,
              title: winner.text,
              subtitle: `Added by group vote · ${winner.votes.length} votes`,
              time: poll.itineraryTime,
              iconType: 'lunch',
              isNew: true,
            };
            // Insert in chronological order within the day
            setDynamicEvents((prev) =>
              [...prev, newEvent].sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                return parseTimeToHour(a.time) - parseTimeToHour(b.time);
              })
            );
            // Add notification dot to this date strip
            setDynamicTripDates((prev) =>
              prev.map((d) =>
                d.day === eventDate
                  ? { ...d, notificationCount: (d.notificationCount ?? 0) + 1 }
                  : d
              )
            );
            // Remember the date so the toast can jump to it
            pollWinnerEventDateRef.current = eventDate;
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
        travellers={dynamicTravellers}
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
    const selectedTravellers = dynamicTravellers.filter((t) =>
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
          const sel = dynamicTravellers.filter((t) =>
            selectedParticipantIds.includes(t.id)
          );
          const expenseName = name || 'Expense';
          const expenseId = String(Date.now());
          setSubmittedExpenses((prev) => [
            ...prev,
            { id: expenseId, name: expenseName, total: 100, travellers: sel },
          ]);
          setToastExpenseName(expenseName);
          setToastVisible(true);
          setExpenseFlowStep(0);
          handleTabChange('expenses');
          addEvent(
            { id: expenseId + 'f', type: 'expense', title: `Expense Request: ${expenseName}`, subtitle: `Paid 0/${sel.length}`, timestamp: 'Just now', paidAvatars: sel },
            { title: 'Expense Request Created', subtitle: `You requested "${expenseName}" split across ${sel.length} travellers`, timestamp: 'Just now', type: 'expense' }
          );
        }}
      />
    );
  }

  // ── Main shell — all tabs rendered below the shared header ─────────────────
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Animated.View style={[styles.headerCenterItem, { opacity: logoOpacity }]}>
            <BrandingLogo width={80} height={28} />
          </Animated.View>
          <Animated.Text style={[styles.headerTitle, { opacity: titleOpacity }]}>
            {trip.name}: {TAB_TITLES[activeTab]}
          </Animated.Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={handleBellPress}>
          <View>
            <Ionicons name="notifications-outline" size={24} color={colors.dark} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Collapsing header: tripMeta + tabs — shrinks to 0 height as user scrolls */}
      <Animated.View style={{ height: collapsingHeightAnim, overflow: 'hidden', opacity: collapsingOpacity }}>
        {/* Inner wrapper measures the natural height so the Animated.View is never too short */}
        <View
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height);
            if (!collapseHeightMeasured.current && h > 0) {
              collapseHeightMeasured.current = true;
              setCollapseHeight(h);
            }
          }}
        >
          <View style={styles.tripMeta}>
            <Text style={styles.tripName}>{trip.name}</Text>
            <View style={styles.travellersRow}>
              <Text style={styles.travellersLabel}>Travellers</Text>
              <AvatarStack
                avatars={dynamicTravellers}
                size={30}
                overlap={10}
                showAdd
                onAdd={() => setSheetVisible(true)}
              />
            </View>
          </View>
          <SegmentedControl activeKey={activeTab} onChange={handleTabChange} />
        </View>
      </Animated.View>

      <ParticipantSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        travellers={dynamicTravellers}
        onInviteSent={(name) => addEvent(
          { id: String(Date.now()), type: 'participant', title: 'Traveller Invited', subtitle: `${name} has been invited to join ${trip.name}`, timestamp: 'Just now' },
          { title: 'Traveller Invited', subtitle: `${name} has been invited to join the trip`, timestamp: 'Just now', type: 'participant' }
        )}
        onInvitesConfirmed={handleInvitesConfirmed}
      />

      <CreatePollSheet
        visible={pollSheetVisible}
        tripDates={trip.tripDates}
        todayDay={trip.todayDate.day}
        onSubmit={(data) => {
          const pollId = String(Date.now());
          const newPoll: ActivePoll = {
            id: pollId,
            question: data.question,
            options: data.options.map((text, i) => ({ id: String(i), text, votes: [] })),
            itineraryDate: data.date,
            itineraryTime: data.time,
            addToItinerary: data.addToItinerary,
            resolved: false,
          };
          setActivePolls((prev) => [...prev, newPoll]);
          addEvent(
            { id: pollId, type: 'poll', title: 'Poll Created', subtitle: `"${data.question}"`, timestamp: 'Just now' },
            { title: 'Poll Created', subtitle: `Tap to view the poll in Chat`, timestamp: 'Just now', type: 'poll' }
          );
        }}
        onClose={() => setPollSheetVisible(false)}
      />

      <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>

        {/* Feed */}
        {activeTab === 'feed' && (
          <Animated.ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { minHeight: SCREEN_HEIGHT + COLLAPSE_HEIGHT_ESTIMATE }]} showsVerticalScrollIndicator={false} onScroll={onScrollEvent} scrollEventThrottle={16}>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <CalendarQuickAction day={trip.todayDate.day} month={trip.todayDate.month} activityCount={trip.todayActivityCount} />
              <PollQuickAction onPress={() => setPollSheetVisible(true)} />
            </View>
            <Text style={styles.sectionHeader}>Trip Feed</Text>
            <View style={styles.feedList}>
              {feedItems.map((item, i) => (
                <FeedItem
                  key={item.id}
                  item={item}
                  isLast={i === feedItems.length - 1}
                  onPress={() => {
                    if (item.type === 'expense') handleTabChange('expenses');
                    else if (item.type === 'poll') handleTabChange('chat');
                  }}
                />
              ))}
            </View>
          </Animated.ScrollView>
        )}

        {/* Itinerary */}
        {activeTab === 'itinerary' && (
          <ItineraryView
            trip={tripWithDynamic}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAddParticipant={() => setSheetVisible(true)}
            unreadCount={unreadCount}
            onBellPress={handleBellPress}
            noHeader
            initialDay={itineraryTargetDay}
            onScrollEvent={onScrollEvent}
          />
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <ChatView
            trip={tripWithDynamic}
            youId={youId}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAddParticipant={() => setSheetVisible(true)}
            activePolls={activePolls}
            onVote={handleVote}
            unreadCount={unreadCount}
            onBellPress={handleBellPress}
            noHeader
            onScrollEvent={onScrollEvent}
          />
        )}

        {/* Expenses */}
        {activeTab === 'expenses' && (
          <Animated.ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { minHeight: SCREEN_HEIGHT + COLLAPSE_HEIGHT_ESTIMATE }]} showsVerticalScrollIndicator={false} onScroll={onScrollEvent} scrollEventThrottle={16}>
            <Text style={styles.sectionHeader}>Overview</Text>
            <View style={styles.expenseOverview}>
              <View style={styles.summaryCard}>
                <Text style={[styles.expenseSubheader, styles.summaryCardLabel]}>You Owe:</Text>
                <Text style={styles.summaryAmount}>£{youOwe}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.expenseSubheader, styles.summaryCardLabel]}>You're Owed:</Text>
                <Text style={styles.summaryAmount}>£{youAreOwed}</Text>
              </View>
            </View>
            <Text style={[styles.expenseSubheader, { marginTop: spacing.lg }]}>Requested by Others</Text>
            <View style={styles.expenseList}>
              {trip.incomingExpenses.map((expense) => {
                const isPaid = paidIncomingIds.includes(expense.id);
                return (
                  <View key={expense.id} style={styles.expenseCard}>
                    <View style={[styles.incomingCreator, { backgroundColor: expense.paidBy.color + '25' }]}>
                      <Text style={[styles.incomingCreatorInitials, { color: expense.paidBy.color }]}>
                        {expense.paidBy.initials}
                      </Text>
                    </View>
                    <View style={styles.expenseCardLeft}>
                      <Text style={styles.expenseCardName} numberOfLines={1}>{expense.name}</Text>
                      <View style={styles.expenseCardMeta}>
                        <Text style={styles.expenseCardPaid}>Paid by {expense.paidBy.name?.split(' ')[0]}</Text>
                        <AvatarStack avatars={expense.travellers} size={22} overlap={7} />
                      </View>
                    </View>
                    {isPaid ? (
                      <View style={styles.paidBadge}>
                        <Text style={styles.paidBadgeText}>Paid</Text>
                      </View>
                    ) : (
                      <View ref={payBtnRef}>
                        <TouchableOpacity
                          style={styles.payBtn}
                          activeOpacity={0.8}
                          onPress={() => {
                            payBtnRef.current?.measureInWindow((x, y, w, h) => {
                              setConfettiOrigin({ x: x + w / 2, y: y + h / 2 });
                              setConfettiVisible(true);
                            });
                            setPaidIncomingIds((prev) => [...prev, expense.id]);
                            setSettledToastVisible(true);
                          }}
                        >
                          <Text style={styles.payBtnText}>Pay £{expense.yourShare}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            <Text style={[styles.expenseSubheader, { marginTop: spacing.lg }]}>Requested by You</Text>
            {submittedExpenses.length === 0 ? (
              <View style={styles.expenseEmptyState}>
                <ExpenseRequestIcon width={72} height={72} />
                <Text style={styles.expenseEmptyText}>{"There are currently no\nexpense requests"}</Text>
              </View>
            ) : (
              <View style={styles.expenseList}>
                {submittedExpenses.map((expense) => (
                  <View key={expense.id} style={styles.expenseCard}>
                    <View style={styles.expenseCardLeft}>
                      <Text style={styles.expenseCardName} numberOfLines={1}>{expense.name}</Text>
                      <View style={styles.expenseCardMeta}>
                        <Text style={styles.expenseCardPaid}>Paid 0/{expense.travellers.length}</Text>
                        <AvatarStack avatars={expense.travellers} size={22} overlap={7} />
                      </View>
                    </View>
                    <Text style={styles.expenseCardAmount}>£0 / £{expense.total}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.expenseCTAWrap}>
              <TouchableOpacity style={styles.expenseEmptyCTA} activeOpacity={0.85} onPress={() => setExpenseFlowStep(1)}>
                <Text style={styles.expenseEmptyCTAText}>Create Expense Request</Text>
              </TouchableOpacity>
            </View>
          </Animated.ScrollView>
        )}

      </Animated.View>

      <NotificationsSheet
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
        notifications={notifications}
        onPressNotification={(notif) => {
          setNotificationsVisible(false);
          if (notif.type === 'poll') handleTabChange('chat');
          else if (notif.type === 'expense') handleTabChange('expenses');
        }}
      />

      <ConfettiOverlay
        visible={confettiVisible}
        origin={confettiOrigin}
        onDone={() => setConfettiVisible(false)}
      />

      <Toast
        visible={toastVisible}
        expenseName={toastExpenseName}
        onClose={() => setToastVisible(false)}
      />

      <Toast
        visible={settledToastVisible}
        onClose={() => setSettledToastVisible(false)}
        title="All Settled!"
        subtitle="Surfing Lessons settled by all travellers"
        iconName="checkmark-circle-outline"
        iconColor={colors.tertiaryGreen}
        iconBgColor={`${colors.tertiaryGreen}20`}
        borderColor={colors.tertiaryGreen}
      />

      <Toast
        visible={pollWinnerToastVisible}
        onClose={() => setPollWinnerToastVisible(false)}
        title="Winner!"
        subtitle={`${pollWinnerText} — tap to view in itinerary`}
        iconName="trophy-outline"
        iconColor={colors.tertiaryPurple}
        iconBgColor={`${colors.tertiaryPurple}20`}
        borderColor={colors.tertiaryPurple}
        onPress={() => {
          setItineraryTargetDay(pollWinnerEventDateRef.current || trip.todayDate.day);
          handleTabChange('itinerary');
        }}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  headerCenterItem: {
    position: 'absolute',
  },
  headerTitle: {
    ...typography.h3,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    textAlign: 'center',
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
    paddingTop: spacing.sm,
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
    paddingBottom: SCROLL_EXTRA_BOTTOM,
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
    minHeight: 90,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.55,
    textAlign: 'left',
  },
  summaryCardLabel: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
  },
  summaryAmount: {
    fontSize: 28,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.dark,
    textAlign: 'right',
  },
  expenseSubheader: {
    ...typography.label,
    color: colors.dark,
    opacity: 0.45,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 6,
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
  incomingCreator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  incomingCreatorInitials: {
    fontSize: 10,
    fontFamily: 'OpenSauceOne-Bold',
  },
  payBtn: {
    backgroundColor: colors.tertiaryGreen,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexShrink: 0,
  },
  payBtnText: {
    ...typography.label,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.white,
  },
  paidBadge: {
    backgroundColor: `${colors.tertiaryGreen}20`,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexShrink: 0,
  },
  paidBadgeText: {
    ...typography.label,
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
