import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';

export type InputMethod = 'scan' | 'manual';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 1;

type Props = {
  tripName: string;
  onBack: () => void;
  onContinue: (method: InputMethod) => void;
};

export default function ExpenseRequestScreen1({ tripName, onBack, onContinue }: Props) {
  const [selected, setSelected] = useState<InputMethod>('scan');
  const insets = useSafeAreaInsets();

  const options: { key: InputMethod; label: string }[] = [
    { key: 'scan', label: 'Scan Receipt' },
    { key: 'manual', label: 'Manually Input' },
  ];

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

      {/* Scrollable content area */}
      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Expense Requests</Text>
        <Text style={styles.question}>
          How would you like to input items & overall total?
        </Text>

        <View style={styles.optionsList}>
          {options.map((opt) => {
            const isSelected = selected === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={styles.optionCard}
                onPress={() => setSelected(opt.key)}
                activeOpacity={0.75}
              >
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Sticky footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => onContinue(selected)}
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

  // Header
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

  // Progress
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

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
    lineHeight: 32,
    marginBottom: 40,
  },

  // Options
  optionsList: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${colors.dark}07`,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 18,
  },
  optionLabel: {
    ...typography.bodyLarge,
    color: colors.dark,
  },

  // Radio button
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: `${colors.dark}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.tertiaryBlue,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.tertiaryBlue,
  },

  // Footer
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
  continueBtnText: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.white,
  },
});
