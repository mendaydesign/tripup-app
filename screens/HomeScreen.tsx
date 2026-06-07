import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import BrandingLogo from '../assets/Logo/Branding-logo.svg';
import AvatarStack from '../components/AvatarStack';
import { mockTrip, Traveller } from '../data/trips';

type TripCard = {
  id: string;
  name: string;
  dateRange: string;
  imageUri: string;
  travellers: Traveller[];
  isCurrent: boolean;
};

const TRIP_CARDS: TripCard[] = [
  {
    id: '1',
    name: 'Lisbon Madness',
    dateRange: 'Jun 02 – 09',
    imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    travellers: mockTrip.travellers,
    isCurrent: true,
  },
  {
    id: '2',
    name: 'Globe Trotters',
    dateRange: 'Nov 16 – Jun 16',
    imageUri: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    travellers: [
      { id: 'g1', initials: 'AM', color: colors.tertiaryBlue },
      { id: 'g2', initials: 'SC', color: colors.tertiaryPink },
      { id: 'g3', initials: 'TW', color: colors.tertiaryPurple },
      { id: 'g4', initials: 'RK', color: colors.tertiaryGreen },
    ],
    isCurrent: false,
  },
  {
    id: '3',
    name: 'Tokyo Nights',
    dateRange: 'Mar 10 – 18',
    imageUri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    travellers: [
      { id: 't1', initials: 'JP', color: colors.tertiaryPurple },
      { id: 't2', initials: 'MK', color: colors.brandOrange },
      { id: 't3', initials: 'HS', color: colors.tertiaryBlue },
    ],
    isCurrent: false,
  },
];

const currentTrips = TRIP_CARDS.filter((t) => t.isCurrent);
const upcomingTrips = TRIP_CARDS.filter((t) => !t.isCurrent);

type Props = {
  onTripPress: (tripId: string) => void;
};

function TripCard({ card, onPress }: { card: TripCard; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <ImageBackground
        source={{ uri: card.imageUri }}
        style={styles.cardImage}
        imageStyle={{ borderRadius: radius.lg }}
        resizeMode="cover"
      >
        {/* Travellers badge top-right */}
        <View style={styles.travellersBadge}>
          <Text style={styles.travellersLabel}>Travellers</Text>
          <AvatarStack avatars={card.travellers} size={26} overlap={8} />
        </View>

        {/* Dark overlay + title + date — height driven by content */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardTitle}>{card.name}</Text>
          <Text style={styles.cardDate}>Date: {card.dateRange}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ onTripPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header — matches GroupHomeScreen layout exactly */}
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <BrandingLogo width={80} height={28} />
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.dark} />
        </TouchableOpacity>
      </View>

      {/* User greeting row */}
      <View style={styles.greetingRow}>
        <Ionicons name="person-circle" size={58} color={`${colors.dark}20`} />
        <View style={styles.greetingText}>
          <Text style={styles.greetingLine}>Welcome Back,</Text>
          <Text style={styles.greetingName}>Ari</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Trips */}
        <Text style={styles.sectionHeader}>Current Trips</Text>
        {currentTrips.map((card) => (
          <TripCard
            key={card.id}
            card={card}
            onPress={() => onTripPress(card.id)}
          />
        ))}

        {/* Upcoming Trips */}
        <Text style={styles.sectionHeader}>Upcoming Trips</Text>
        {upcomingTrips.map((card) => (
          <TripCard
            key={card.id}
            card={card}
            onPress={() => {}}
          />
        ))}
      </ScrollView>
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
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 12,
  },
  greetingText: {
    flex: 1,
  },
  greetingLine: {
    ...typography.bodyLarge,
    color: colors.dark,
  },
  greetingName: {
    ...typography.h1,
    color: colors.dark,
    fontFamily: 'OpenSauceOne-Bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
  },
  sectionHeader: {
    ...typography.h2,
    color: colors.dark,
    fontFamily: 'OpenSauceOne-Bold',
    marginBottom: spacing.sm,
    marginTop: 4,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    // Shadow
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImage: {
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  travellersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: `${colors.white}CC`,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  travellersLabel: {
    ...typography.label,
    color: colors.dark,
    fontFamily: 'OpenSauceOne-SemiBold',
  },
  cardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.brandOrange,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    paddingTop: 10,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.white,
    fontFamily: 'OpenSauceOne-Bold',
  },
  cardDate: {
    ...typography.bodySmall,
    color: colors.white,
  },
});
