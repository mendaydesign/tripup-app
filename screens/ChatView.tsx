import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import BrandingLogo from '../assets/Logo/Branding-logo.svg';
import AvatarStack from '../components/AvatarStack';
import SegmentedControl from '../components/SegmentedControl';
import { Trip, ActivePoll } from '../data/trips';

type Props = {
  trip: Trip;
  youId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddParticipant: () => void;
  activePolls: ActivePoll[];
  onVote: (pollId: string, optionId: string) => void;
};

export default function ChatView({
  trip,
  youId,
  activeTab,
  onTabChange,
  onAddParticipant,
  activePolls,
  onVote,
}: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Track which option the user voted for per poll
  const [myVotes, setMyVotes] = useState<Record<string, string>>({});

  const senderMap = Object.fromEntries(trip.travellers.map((t) => [t.id, t]));

  function handleVotePress(pollId: string, optionId: string) {
    if (myVotes[pollId]) return; // already voted
    setMyVotes((prev) => ({ ...prev, [pollId]: optionId }));
    onVote(pollId, optionId);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* Fixed header — stays visible while content scrolls */}
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

      {/* Scrollable body — trip meta + segmented control scroll away (same as Itinerary) */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {/* Trip meta — scrolls away */}
        <View style={styles.tripMeta}>
          <Text style={styles.tripName}>{trip.name}</Text>
          <View style={styles.travellersRow}>
            <Text style={styles.travellersLabel}>Travellers</Text>
            <AvatarStack
              avatars={trip.travellers}
              size={30}
              overlap={10}
              showAdd
              onAdd={onAddParticipant}
            />
          </View>
        </View>

        {/* Segmented control — scrolls away */}
        <SegmentedControl activeKey={activeTab} onChange={onTabChange} />

        {/* Date separator */}
        <Text style={styles.dateSeparator}>Today</Text>

        {/* Regular chat messages */}
        {trip.chatMessages.map((msg) => {
          const isMe = msg.senderId === youId;
          const sender = senderMap[msg.senderId];
          if (!sender) return null;
          const displayName = sender.name?.split(' ')[0] ?? sender.initials;

          return (
            <View
              key={msg.id}
              style={[styles.msgRow, isMe ? styles.msgRowOut : styles.msgRowIn]}
            >
              {!isMe && (
                <View style={[styles.avatar, { backgroundColor: sender.color }]}>
                  <Text style={styles.avatarInitials}>{sender.initials}</Text>
                </View>
              )}

              <View style={[styles.bubble, isMe ? styles.bubbleOut : styles.bubbleIn]}>
                {!isMe && (
                  <Text style={[styles.senderName, { color: sender.color }]}>
                    {displayName}
                  </Text>
                )}
                <Text style={styles.bubbleText}>{msg.text}</Text>
              </View>

              {isMe && (
                <View style={[styles.avatar, { backgroundColor: sender.color }]}>
                  <Text style={styles.avatarInitials}>{sender.initials}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Poll cards — appear after messages, created by Harry (youId) */}
        {activePolls.map((poll) => {
          const creator = senderMap[youId];
          const hasVoted = poll.id in myVotes;
          const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);

          return (
            <View key={poll.id} style={styles.pollContainer}>
              <View style={styles.pollCard}>
                <Text style={styles.pollQuestion}>{poll.question}</Text>

                {poll.options.map((option) => {
                  const isSelected = myVotes[poll.id] === option.id;
                  const pct = totalVotes > 0 ? option.votes.length / totalVotes : 0;

                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.pollOption}
                      onPress={() => handleVotePress(poll.id, option.id)}
                      activeOpacity={hasVoted ? 1 : 0.7}
                    >
                      {/* Radio */}
                      <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>

                      <View style={styles.pollOptionRight}>
                        <View style={styles.pollOptionRow}>
                          <Text style={styles.pollOptionText}>{option.text}</Text>
                          {hasVoted && (
                            <Text style={styles.pollVoteCount}>{option.votes.length}</Text>
                          )}
                        </View>
                        {hasVoted && (
                          <View style={styles.progressTrack}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${Math.round(pct * 100)}%`,
                                  backgroundColor: isSelected
                                    ? colors.brandOrange
                                    : `${colors.dark}25`,
                                },
                              ]}
                            />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.pollDivider} />
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.pollDetailsLink}>Option details &amp; Votes</Text>
                </TouchableOpacity>
                <View style={styles.pollDivider} />
                <Text style={styles.pollNotAttending}>Not attending</Text>
              </View>

              {/* Creator avatar — bottom right, like an outgoing message */}
              {creator && (
                <View style={styles.pollAvatarRow}>
                  <View style={[styles.avatar, { backgroundColor: creator.color }]}>
                    <Text style={styles.avatarInitials}>{creator.initials}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Fixed input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="add" size={26} color={colors.dark} />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Message..."
            placeholderTextColor={`${colors.dark}40`}
            returnKeyType="send"
          />
          <TouchableOpacity activeOpacity={0.7} style={styles.inputInlineBtn}>
            <Ionicons name="happy-outline" size={20} color={`${colors.dark}35`} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="camera-outline" size={24} color={colors.dark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="mic-outline" size={24} color={colors.dark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Fixed header
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

  // Scroll (trip meta + segmented control + messages all scroll together)
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    gap: 10,
  },

  // Trip meta — scrolls away (same as Itinerary)
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

  // Date separator
  dateSeparator: {
    ...typography.label,
    color: colors.dark,
    opacity: 0.35,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },

  // Message rows
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: spacing.lg,
  },
  msgRowIn: {
    justifyContent: 'flex-start',
  },
  msgRowOut: {
    justifyContent: 'flex-end',
  },

  // Avatar (used in messages and poll)
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitials: {
    fontSize: 9,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.white,
  },

  // Message bubble
  bubble: {
    maxWidth: '72%',
    backgroundColor: '#F7F7F7',
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 3,
  },
  bubbleIn: {
    borderBottomLeftRadius: radius.sm,
  },
  bubbleOut: {
    borderBottomRightRadius: radius.sm,
  },
  senderName: {
    fontSize: 11,
    fontFamily: 'OpenSauceOne-SemiBold',
  },
  bubbleText: {
    ...typography.bodySmall,
    color: colors.dark,
    lineHeight: 20,
  },

  // Poll card
  pollContainer: {
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  pollCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: 4,
  },
  pollQuestion: {
    ...typography.h3,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  pollOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: `${colors.dark}35`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: colors.brandOrange,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brandOrange,
  },
  pollOptionRight: {
    flex: 1,
    gap: 5,
  },
  pollOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollOptionText: {
    ...typography.bodyLarge,
    color: colors.dark,
    flex: 1,
  },
  pollVoteCount: {
    ...typography.bodySmall,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    opacity: 0.55,
  },
  progressTrack: {
    height: 4,
    backgroundColor: `${colors.dark}15`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  pollDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: `${colors.dark}20`,
    marginVertical: 6,
  },
  pollDetailsLink: {
    ...typography.bodySmall,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.tertiaryBlue,
    textAlign: 'center',
    paddingVertical: 4,
  },
  pollNotAttending: {
    ...typography.bodySmall,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.tertiaryPink,
    textAlign: 'center',
    paddingVertical: 4,
  },
  pollAvatarRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  // Fixed input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: `${colors.dark}10`,
    backgroundColor: colors.white,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 22,
    paddingLeft: 16,
    paddingRight: 8,
    height: 42,
  },
  textInput: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.dark,
    padding: 0,
  },
  inputInlineBtn: {
    padding: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
