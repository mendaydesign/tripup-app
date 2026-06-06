import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';
import { Traveller } from '../../data/trips';
import ItemBreakdownSheet, { ExpenseItem } from '../../components/ItemBreakdownSheet';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 3;

const MOCK_SUBTOTAL = 90;
const MOCK_TAX = 10;
const MOCK_TOTAL = 100;
const MOCK_ITEMS: ExpenseItem[] = [
  { id: '1', name: 'Wine', price: 30 },
  { id: '2', name: 'Cheese Burger', price: 30 },
  { id: '3', name: 'Penne Arribiatta', price: 30 },
];

type Props = {
  tripName: string;
  travellers: Traveller[];
  youId: string;
  scannedImageUri: string | null;
  onBack: () => void;
  onSend: (expenseName: string) => void;
};

// Tiny overlapping avatar circles for the "Shared by" row
function MiniAvatarStack({ travellers }: { travellers: Traveller[] }) {
  const size = 22;
  const overlap = 8;
  return (
    <View style={{ flexDirection: 'row', height: size }}>
      {travellers.map((t, i) => (
        <View
          key={t.id}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: t.color,
            marginLeft: i === 0 ? 0 : -overlap,
            borderWidth: 1.5,
            borderColor: colors.white,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: travellers.length - i,
          }}
        >
          <Text style={{ fontSize: 8, fontFamily: 'OpenSauceOne-Bold', color: colors.white }}>
            {t.initials}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Build initial map: every item includes every traveller
function buildInitialItemParticipants(
  items: ExpenseItem[],
  travellers: Traveller[]
): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const item of items) {
    map[item.id] = travellers.map((t) => t.id);
  }
  return map;
}

// Each traveller's total = sum of their share across all items they're included in
function computePersonTotals(
  items: ExpenseItem[],
  travellers: Traveller[],
  itemParticipants: Record<string, string[]>
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const t of travellers) totals[t.id] = 0;

  // Sum item shares first, then scale up to the full total (subtotal + tax)
  const taxMultiplier = MOCK_SUBTOTAL > 0 ? MOCK_TOTAL / MOCK_SUBTOTAL : 1;

  for (const item of items) {
    const included = itemParticipants[item.id] ?? [];
    if (included.length === 0) continue;
    const share = item.price / included.length;
    for (const id of included) {
      if (id in totals) totals[id] += share;
    }
  }

  for (const id in totals) {
    totals[id] = Math.round(totals[id] * taxMultiplier * 100) / 100;
  }

  return totals;
}

export default function ExpenseDetailScreen({
  tripName,
  travellers,
  youId,
  scannedImageUri,
  onBack,
  onSend,
}: Props) {
  const insets = useSafeAreaInsets();
  const [expenseName, setExpenseName] = useState('');
  const nameInputRef = useRef<TextInput>(null);

  const [itemParticipants, setItemParticipants] = useState<Record<string, string[]>>(
    () => buildInitialItemParticipants(MOCK_ITEMS, travellers)
  );
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const personTotals = computePersonTotals(MOCK_ITEMS, travellers, itemParticipants);

  function handleItemConfirm(itemId: string, updatedIds: string[]) {
    setItemParticipants((prev) => ({ ...prev, [itemId]: updatedIds }));
  }

  const activeItem = activeItemId ? MOCK_ITEMS.find((i) => i.id === activeItemId) ?? null : null;
  const activeIncludedIds = activeItemId ? (itemParticipants[activeItemId] ?? []) : [];

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
        {/* Section label */}
        <Text style={styles.sectionLabel}>New Expense</Text>

        {/* Editable expense name */}
        <View style={styles.nameRow}>
          <TextInput
            ref={nameInputRef}
            style={styles.nameInput}
            value={expenseName}
            onChangeText={setExpenseName}
            placeholder="Expense Name"
            placeholderTextColor={`${colors.dark}40`}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={() => nameInputRef.current?.focus()}
            activeOpacity={0.6}
            style={styles.editIconBtn}
          >
            <Ionicons name="pencil-outline" size={20} color={`${colors.dark}50`} />
          </TouchableOpacity>
        </View>

        {/* Receipt image + breakdown side-by-side */}
        <View style={styles.receiptRow}>
          <View style={styles.imagePlaceholder}>
            {scannedImageUri ? (
              <Image
                source={{ uri: scannedImageUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="receipt-outline" size={40} color={`${colors.dark}20`} />
            )}
          </View>

          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal</Text>
              <Text style={styles.breakdownValue}>${MOCK_SUBTOTAL}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>TAX</Text>
              <Text style={styles.breakdownValue}>${MOCK_TAX}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${MOCK_TOTAL}</Text>
            </View>
          </View>
        </View>

        {/* Travellers Split — amounts now reflect per-item assignments */}
        <Text style={styles.sectionHeader}>Travellers Split</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.splitList}
        >
          {travellers.map((traveller) => {
            const isYou = traveller.id === youId;
            const displayName = isYou ? 'You' : (traveller.name?.split(' ')[0] ?? traveller.initials);
            const amount = personTotals[traveller.id] ?? 0;
            return (
              <View key={traveller.id} style={styles.splitCard}>
                <View style={styles.splitCardTop}>
                  <View style={[styles.splitAvatar, { backgroundColor: traveller.color }]}>
                    <Text style={styles.splitAvatarInitials}>{traveller.initials}</Text>
                  </View>
                  <Text style={styles.splitName}>{displayName}</Text>
                </View>
                <Text style={styles.splitAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>${amount}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Item Breakdown — tap each card to open the sheet */}
        <Text style={styles.sectionHeader}>Item Breakdown</Text>
        {MOCK_ITEMS.map((item, i) => {
          const includedIds = itemParticipants[item.id] ?? [];
          const includedTravellers = travellers.filter((t) => includedIds.includes(t.id));
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, i < MOCK_ITEMS.length - 1 && styles.itemCardGap]}
              onPress={() => setActiveItemId(item.id)}
              activeOpacity={0.75}
            >
              <View style={styles.itemTop}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price}</Text>
              </View>
              <View style={styles.itemShared}>
                <Text style={styles.sharedLabel}>Shared by: </Text>
                <MiniAvatarStack travellers={includedTravellers} />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <TouchableOpacity style={styles.sendBtn} onPress={() => onSend(expenseName)} activeOpacity={0.85}>
          <Text style={styles.sendBtnText}>Send Request</Text>
        </TouchableOpacity>
      </View>

      {/* Item breakdown management sheet */}
      <ItemBreakdownSheet
        visible={activeItemId !== null}
        onClose={() => setActiveItemId(null)}
        tripName={tripName}
        item={activeItem}
        travellers={travellers}
        youId={youId}
        includedIds={activeIncludedIds}
        onConfirm={handleItemConfirm}
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
  },
  sectionLabel: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.5,
    marginBottom: 6,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 8,
  },
  nameInput: {
    flex: 1,
    ...typography.h1,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.dark,
    padding: 0,
  },
  editIconBtn: {
    padding: 4,
  },

  receiptRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  imagePlaceholder: {
    width: 140,
    aspectRatio: 3 / 4,
    backgroundColor: `${colors.dark}08`,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  breakdown: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.55,
  },
  breakdownValue: {
    ...typography.bodySmall,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: `${colors.dark}12`,
  },
  totalLabel: {
    ...typography.bodyLarge,
    color: colors.dark,
    opacity: 0.55,
  },
  totalValue: {
    fontSize: 28,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.dark,
  },

  sectionHeader: {
    ...typography.h3,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    marginBottom: spacing.sm,
  },

  splitList: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  splitCard: {
    width: 110,
    backgroundColor: `${colors.dark}07`,
    borderRadius: radius.sm,
    padding: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  splitCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  splitAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitAvatarInitials: {
    fontSize: 10,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.white,
  },
  splitName: {
    ...typography.label,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    opacity: 0.7,
    flexShrink: 1,
  },
  splitAmount: {
    fontSize: 28,
    fontFamily: 'OpenSauceOne-Bold',
    color: colors.dark,
    textAlign: 'right',
  },

  itemCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    gap: 6,
  },
  itemCardGap: {
    marginBottom: spacing.sm,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
  },
  itemPrice: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
  },
  itemShared: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sharedLabel: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.45,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
  },
  sendBtn: {
    backgroundColor: colors.brandOrange,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  sendBtnText: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.white,
  },
});
