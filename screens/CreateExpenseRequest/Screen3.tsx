import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';
import { Traveller } from '../../data/trips';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 2;

type Props = {
  tripName: string;
  travellers: Traveller[];
  youId: string;
  onBack: () => void;
  onContinue: (selectedIds: string[]) => void;
};

export default function ParticipantSelectionScreen({
  tripName,
  travellers,
  youId,
  onBack,
  onContinue,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(travellers.map((t) => t.id));
  const insets = useSafeAreaInsets();

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{tripName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(CURRENT_STEP / TOTAL_STEPS) * 100}%` }]} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>New Expense</Text>
        <Text style={styles.question}>Who's chipping in?</Text>
        <Text style={styles.subtext}>
          If people aren't paying equally, you can make edits in the next stage
        </Text>

        {/* Avatar grid — 3 columns */}
        <View style={styles.grid}>
          {travellers.map((traveller) => {
            const isSelected = selectedIds.includes(traveller.id);
            const isYou = traveller.id === youId;
            const displayName = isYou ? 'You' : (traveller.name?.split(' ')[0] ?? traveller.initials);
            return (
              <TouchableOpacity
                key={traveller.id}
                style={styles.cell}
                onPress={() => toggle(traveller.id)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.circle,
                    { backgroundColor: isSelected ? traveller.color : `${colors.dark}12` },
                  ]}
                >
                  <Text
                    style={[
                      styles.initials,
                      { color: isSelected ? colors.white : `${colors.dark}40` },
                    ]}
                  >
                    {traveller.initials}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={17} color={colors.white} />
                    </View>
                  )}
                </View>
                <Text style={[styles.name, !isSelected && styles.nameInactive]}>
                  {displayName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}>
        <TouchableOpacity
          style={[styles.continueBtn, selectedIds.length === 0 && styles.continueBtnDisabled]}
          onPress={() => selectedIds.length > 0 && onContinue(selectedIds)}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    ...typography.h3,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  progressTrack: {
    height: 4,
    backgroundColor: `${colors.dark}12`,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brandOrange,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 16,
  },
  sectionLabel: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.5,
    marginBottom: spacing.sm,
  },
  question: {
    ...typography.h1,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.dark,
    marginBottom: 8,
  },
  subtext: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.5,
    lineHeight: 20,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  cell: {
    width: '28%',
    alignItems: 'center',
    gap: spacing.sm,
    flexGrow: 1,
  },
  circle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 22,
    fontFamily: 'OpenSauceOne-Bold',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.tertiaryGreen,
    borderWidth: 2.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.bodySmall,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    textAlign: 'center',
  },
  nameInactive: {
    opacity: 0.4,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
  },
  continueBtn: {
    backgroundColor: colors.brandOrange,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueBtnText: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.white,
  },
});
